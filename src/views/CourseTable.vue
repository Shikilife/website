<template>
  <main class="ct-root">
    <section class="ct-card">
      <!-- 標題 & 操作 -->
      <header class="ct-head">
        <div class="ct-head-left">
          <h1 class="ct-title">我的課表</h1>
          <p class="ct-sub">
            顯示「預選課程」排入課表（僅顯示課程名稱與教室）。點擊課程可查看完整資訊並刪除。
          </p>
        </div>

        <div class="ct-head-actions">
          <button class="ct-btn ct-btn-ghost" @click="goHome">回課程查詢</button>
        </div>
      </header>

      <!-- 狀態提示 -->
      <div class="ct-info">
        <span class="ct-pill"><span class="dot"></span> 本週模式</span>
        <span class="ct-pill soft">
          預選共 {{ totalCount }} 門｜已排入 {{ placedCount }} 門
        </span>
        <span v-if="unplacedCount > 0" class="ct-pill warn">
          有 {{ unplacedCount }} 門缺少上課時間（day/start），暫時不顯示
        </span>
      </div>

      <!-- 課表 -->
      <div class="ct-table-wrap">
        <table class="ct-table">
          <thead>
            <tr>
              <th class="ct-col-period">節次</th>
              <th class="ct-col-time">時間</th>
              <th v-for="(d, i) in weekdays" :key="i" class="ct-col-day">
                {{ d }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(p, rowIndex) in periods" :key="rowIndex">
              <td class="ct-cell-time ct-sticky">
                <div class="ct-period">{{ p.name }}</div>
              </td>
              <td class="ct-cell-time ct-sticky2">
                <div class="ct-time">{{ p.time }}</div>
              </td>

              <!-- 7 天 -->
              <td v-for="dayIndex in 7" :key="dayIndex" class="ct-cell-slot">
                <template
                  v-for="course in getCoursesAt(dayIndex, rowIndex)"
                  :key="course._slotId"
                >
                  <div
                    class="ct-course"
                    :style="courseStyle(course)"
                    :title="courseTitle(course)"
                    role="button"
                    tabindex="0"
                    @click.stop="openCourse(course)"
                    @keydown.enter.stop="openCourse(course)"
                  >
                    <div class="ct-course-name">{{ course.name }}</div>
                    <div class="ct-course-room">{{ course.room }}</div>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版底部按鈕 -->
      <div class="ct-bottom">
        <button class="ct-btn ct-btn-ghost w-full" @click="goHome">
          回課程查詢
        </button>
      </div>
    </section>

    <!-- ✅ 詳細資訊 Modal -->
    <div v-if="modalOpen" class="ct-modal-mask" @click.self="closeModal">
      <div class="ct-modal-card">
        <div class="ct-modal-head">
          <div class="ct-modal-title">
            <div class="ct-modal-name">{{ selected?.name }}</div>
            <div class="ct-modal-sub">
              {{ dayLabel(selected?.day) }}｜節次：{{ selected?.slotStr || "—" }}｜教室：{{ selected?.room || "—" }}
            </div>
          </div>

          <button class="ct-x" @click="closeModal" aria-label="close">✕</button>
        </div>

        <div class="ct-modal-body">
          <div class="ct-kv">
            <div class="k">課程 ID</div>
            <div class="v">{{ selected?.raw?.courseID ?? "—" }}</div>
          </div>
          <div class="ct-kv">
            <div class="k">系所</div>
            <div class="v">{{ selected?.raw?.departmentID ?? "—" }}</div>
          </div>
          <div class="ct-kv">
            <div class="k">年級</div>
            <div class="v">{{ selected?.raw?.grade ?? "—" }}</div>
          </div>
          <div class="ct-kv">
            <div class="k">備註</div>
            <div class="v">{{ selected?.raw?.courseNote ?? "—" }}</div>
          </div>

          <div class="ct-desc">
            <div class="ct-desc-title">課程介紹</div>
            <div class="ct-desc-text">
              {{ selected?.raw?.courseIntroduction || selected?.raw?.courseENIntroduction || "—" }}
            </div>
          </div>
        </div>

        <div class="ct-modal-actions">
          <button class="ct-btn ct-btn-danger" @click="deleteSelected" :disabled="deleting">
            {{ deleting ? "刪除中…" : "刪除預選" }}
          </button>
          <button class="ct-btn" @click="closeModal">關閉</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const user = useUserStore();

onMounted(async () => {
  if (user.isLoggedIn) {
    // ✅ 如果這裡有打 API 抓預選，才算「真的」
    if (typeof user.afterLoginBootstrap === "function") {
      await user.afterLoginBootstrap();
    }
  }
});

const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

// ✅ 到第 15 節（時間你可自行依校方節次表調整）
const periods = [
  { name: "一", time: "08:10~09:00" },
  { name: "二", time: "09:10~10:00" },
  { name: "三", time: "10:10~11:00" },
  { name: "四", time: "11:10~12:00" },
  { name: "五", time: "12:40~13:30" },
  { name: "六", time: "13:40~14:30" },
  { name: "七", time: "14:40~15:30" },
  { name: "八", time: "15:40~16:30" },
  { name: "九", time: "16:40~17:30" },
  { name: "十", time: "17:40~18:30" },
  { name: "十一", time: "18:40~19:30" },
  { name: "十二", time: "19:40~20:30" },
  { name: "十三", time: "20:40~21:30" },
  { name: "十四", time: "21:40~22:30" },
  { name: "十五", time: "22:40~23:30" },
];

function parseTimesSlotToStartSpan(timesSlot) {
  const s = String(timesSlot ?? "").trim();
  if (!s) return null;

  const nums = s
    .split(/[,\s]+/g)
    .map((x) => Number(String(x).trim()))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= periods.length);

  if (!nums.length) return null;

  nums.sort((a, b) => a - b);
  const start = nums[0] - 1;

  let span = nums.length;
  span = Math.max(1, Math.min(6, Math.floor(span))); // ✅ 晚上課可能 3~4，小加寬到 6 防呆

  return { start, span, slotStr: nums.join(",") };
}

function dayToNumber(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;

  if (/^[1-7]$/.test(s)) return Number(s);

  const mapZh = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7, 天: 7 };
  if (mapZh[s] != null) return mapZh[s];

  if (s.startsWith("星期")) {
    const c = s.replace("星期", "");
    if (mapZh[c] != null) return mapZh[c];
  }
  return null;
}

function normalizeToSlot(rawCourse, idx) {
  const c = rawCourse?.__raw ?? rawCourse;

  const name =
    c.courseName ?? c.name ?? c.courseENName ?? c.title ?? rawCourse?.name ?? "未命名課程";

  const room =
    c.classroom ?? c.room ?? c.location ?? rawCourse?.room ?? "—";

  const day =
    dayToNumber(c.DayOfWeek) ??
    dayToNumber(c.day) ??
    dayToNumber(rawCourse?.day);

  const okDay = typeof day === "number" && day >= 1 && day <= 7;
  if (!okDay) return null;

  const slotStr =
    c.timesSlot ?? c.section ?? rawCourse?.section ?? rawCourse?.timesSlot;

  const slot = parseTimesSlotToStartSpan(slotStr);
  if (!slot) return null;

  const tones = ["cyan", "violet", "lime"];
  const tone = c.tone || tones[(day + slot.start) % tones.length];

  return {
    _slotId: String(c.courseID ?? c.id ?? rawCourse?.courseID ?? idx),
    day,
    start: slot.start,
    span: slot.span,
    slotStr: slot.slotStr,
    name,
    room,
    tone,
    raw: c, // ✅ 保留 raw，modal 才能顯示完整資訊
  };
}

const rawPreselects = computed(() => user.preselects || []);

const normalizedCourses = computed(() => {
  const src = rawPreselects.value;
  const list = [];
  for (let i = 0; i < src.length; i++) {
    const slot = normalizeToSlot(src[i], i);
    if (slot) list.push(slot);
  }
  return list;
});

const totalCount = computed(() => rawPreselects.value.length);
const placedCount = computed(() => normalizedCourses.value.length);
const unplacedCount = computed(() => Math.max(0, totalCount.value - placedCount.value));

function getCoursesAt(dayIndex, rowIndex) {
  return normalizedCourses.value.filter((c) => c.day === dayIndex && c.start === rowIndex);
}

function courseStyle(course) {
  const toneMap = {
    cyan: { a: "var(--p3-neon)", b: "rgba(47,230,255,0.22)" },
    violet: { a: "var(--p3-neon2)", b: "rgba(148,123,255,0.20)" },
    lime: { a: "var(--p3-lime)", b: "rgba(106,255,212,0.16)" },
  };
  const tone = toneMap[course.tone] || toneMap.cyan;

  return {
    "--ct-accent": tone.a,
    "--ct-glow": tone.b,
    height: `calc(var(--ct-row-h) * ${course.span})`,
    cursor: "pointer",
  };
}

function courseTitle(course) {
  return `${course.name}\n教室：${course.room}\n節次：${course.slotStr || "—"}`;
}

function dayLabel(dayNum) {
  if (!dayNum) return "—";
  return weekdays[dayNum - 1] || "—";
}

// ✅ modal
const modalOpen = ref(false);
const selected = ref(null);
const deleting = ref(false);

function openCourse(course) {
  selected.value = course;
  modalOpen.value = true;
}
function closeModal() {
  modalOpen.value = false;
  selected.value = null;
}

async function deleteSelected() {
  if (!selected.value) return;
  deleting.value = true;

  try {
    const courseID = selected.value.raw?.courseID ?? selected.value._slotId;

    // ✅ 如果 store 有「真的刪除預選（打 API）」就用
    if (typeof user.removePreselect === "function") {
      await user.removePreselect(courseID);
    } else {
      // 🟡 沒有 action 就先做「前端刪除」（代表你後端還沒接上）
      const before = user.preselects || [];
      user.preselects = before.filter((x) => {
        const c = x?.__raw ?? x;
        const id = c?.courseID ?? c?.id;
        return String(id) !== String(courseID);
      });
    }

    closeModal();
  } finally {
    deleting.value = false;
  }
}

function goHome() {
  router.push("/courses");
}
</script>

<style scoped>
/* 你原本的樣式 그대로保留 */
.ct-root{
  padding: clamp(16px, 2.4vw, 28px);
  width: 100%;
}

.ct-card{
  background: rgba(30, 50, 80, 0.70);
  border: 1px solid rgba(47, 230, 255, 0.25);
  border-radius: 18px;
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 60px rgba(0,0,0,0.30);
  padding: clamp(14px, 2.2vw, 22px);
  overflow: hidden;
  position: relative;
}

.ct-card::before{
  content:"";
  position:absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg,
    rgba(47,230,255,0),
    rgba(47,230,255,0.95),
    rgba(148,123,255,0.85),
    rgba(47,230,255,0)
  );
  opacity: .85;
}

.ct-head{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  gap: 16px;
  padding-top: 8px;
}

.ct-head-left{ min-width: 0; }

.ct-title{
  font-size: clamp(18px, 2.4vw, 26px);
  font-weight: 900;
  letter-spacing: .06em;
  margin: 0;
}

.ct-sub{
  margin: 8px 0 0;
  color: rgba(210, 230, 255, 0.85);
  line-height: 1.6;
  font-size: 13px;
  max-width: 760px;
}

.ct-head-actions{ flex: 0 0 auto; }

.ct-info{
  margin-top: 14px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ct-pill{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(234,242,255,0.88);
  font-size: 12px;
  font-weight: 800;
}

.ct-pill.soft{
  background: rgba(47,230,255,0.06);
  border-color: rgba(47,230,255,0.18);
}

.ct-pill.warn{
  background: rgba(255,190,80,0.08);
  border-color: rgba(255,190,80,0.22);
}

.dot{
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--p3-neon);
  box-shadow: 0 0 12px rgba(47,230,255,0.8);
}

/* buttons */
.ct-btn{
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 900;
  letter-spacing: .08em;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.92);
  transition: transform .12s ease, box-shadow .18s ease, background .18s ease;
  white-space: nowrap;
}
.ct-btn:hover{
  transform: translateY(-1px);
  background: rgba(255,255,255,0.10);
  box-shadow: 0 0 18px rgba(47,230,255,0.10);
}
.ct-btn-ghost{
  border-color: rgba(148,123,255,0.25);
}
.ct-btn-danger{
  border-color: rgba(255,120,120,0.35);
  background: rgba(255,120,120,0.10);
}
.ct-btn-danger:hover{
  background: rgba(255,120,120,0.16);
}

/* table wrapper */
.ct-table-wrap{
  margin-top: 16px;
  border-radius: 16px;
  overflow: auto;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(12, 26, 44, 0.45);
}

/* table */
.ct-table{
  width: 100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;

  --ct-row-h: 54px;
  table-layout: fixed;
}

.ct-table thead th{
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(255,255,255,0.08);
  color: rgba(234,242,255,0.90);
  font-weight: 900;
  letter-spacing: .05em;
  padding: 12px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
  white-space: nowrap;
}

.ct-col-period{ width: 70px; }
.ct-col-time{ width: 160px; }
.ct-col-day{ width: 150px; }

/* time cells */
.ct-cell-time{
  padding: 10px 10px;
  background: rgba(12, 26, 44, 0.70);
  color: rgba(234,242,255,0.88);
  font-weight: 800;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.ct-sticky{
  position: sticky;
  left: 0;
  z-index: 6;
  backdrop-filter: blur(10px);
  box-shadow: 12px 0 18px rgba(0,0,0,0.18);
}
.ct-sticky2{
  position: sticky;
  left: 70px;
  z-index: 6;
  backdrop-filter: blur(10px);
  box-shadow: 12px 0 18px rgba(0,0,0,0.14);
}

.ct-cell-slot{
  position: relative;
  padding: 10px;
  height: var(--ct-row-h);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background:
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 100% 100%, 36px 36px;
  overflow: visible;
}

/* card */
.ct-course{
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;

  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(25, 45, 75, 0.78);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(16px);

  box-shadow:
    0 12px 26px rgba(0,0,0,0.28),
    0 0 0 1px rgba(255,255,255,0.06),
    0 0 18px var(--ct-glow);

  overflow: hidden;
  z-index: 4;
}
.ct-course:hover{
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.ct-course::before{
  content:"";
  position:absolute;
  left:0; top:0; bottom:0;
  width: 4px;
  background: linear-gradient(180deg, var(--ct-accent), rgba(255,255,255,0));
  opacity: .95;
}

.ct-course-name{
  font-weight: 900;
  color: rgba(234,242,255,0.95);
  line-height: 1.25;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ct-course-room{
  margin-top: 6px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(190,210,255,0.86);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* bottom */
.ct-bottom{
  margin-top: 14px;
  display:none;
}
@media (max-width: 768px){
  .ct-head-actions{ display:none; }
  .ct-bottom{ display:block; }
}

/* ✅ modal */
.ct-modal-mask{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 50;
}
.ct-modal-card{
  width: min(720px, 96vw);
  border-radius: 18px;
  background: rgba(20, 34, 56, 0.92);
  border: 1px solid rgba(47,230,255,0.18);
  box-shadow: 0 18px 70px rgba(0,0,0,0.45);
  overflow: hidden;
}
.ct-modal-head{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  gap: 12px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.ct-modal-name{
  font-size: 18px;
  font-weight: 950;
  color: rgba(234,242,255,0.96);
}
.ct-modal-sub{
  margin-top: 6px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(200,220,255,0.78);
}
.ct-x{
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.9);
  width: 36px;
  height: 36px;
  border-radius: 12px;
  cursor: pointer;
}
.ct-modal-body{
  padding: 14px 16px 6px;
}
.ct-kv{
  display:grid;
  grid-template-columns: 90px 1fr;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.10);
}
.ct-kv .k{
  font-size: 12px;
  font-weight: 900;
  color: rgba(190,210,255,0.80);
}
.ct-kv .v{
  font-size: 13px;
  font-weight: 800;
  color: rgba(234,242,255,0.92);
  word-break: break-word;
}
.ct-desc{
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
}
.ct-desc-title{
  font-size: 12px;
  font-weight: 950;
  color: rgba(234,242,255,0.92);
  margin-bottom: 8px;
}
.ct-desc-text{
  font-size: 13px;
  line-height: 1.7;
  color: rgba(220,235,255,0.86);
  white-space: pre-wrap;
}
.ct-modal-actions{
  display:flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px 16px;
}
</style>
