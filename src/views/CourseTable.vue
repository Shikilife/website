<template>
  <main class="ct-root">
    <section class="ct-card">
      <!-- 標題 & 操作 -->
      <header class="ct-head">
        <div class="ct-head-left">
          <h1 class="ct-title">我的課表</h1>
          <p class="ct-sub">
            顯示「預選課程」排入課表（僅顯示課程名稱與教室）。
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
                  <div class="ct-course" :style="courseStyle(course)" :title="courseTitle(course)">
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
  </main>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const user = useUserStore();

onMounted(() => {
  // ✅ 進課表就同步載入預選（避免刷新後空）
  if (user.isLoggedIn) user.loadCollections?.();
});

const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

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
];

function safeStr(v) {
  return v == null ? "" : String(v);
}

/**
 * ✅ 關鍵：只吃「明確欄位」(day/start/span)
 * 不再從字串猜，避免 span 爆掉造成跑版
 *
 * 你可以在加入預選時，把課程轉成：
 * { day: 1~7, start: 0~8, span?: 1~4, name, room, ... }
 */
function parseTimesSlotToStartSpan(timesSlot) {
  // timesSlot 可能是: "6,7" / "1,2,3" / "6" / "" / null
  const s = String(timesSlot ?? "").trim();
  if (!s) return null;

  // 取出所有數字節次
  const nums = s
    .split(/[,\s]+/g)
    .map((x) => Number(String(x).trim()))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= periods.length);

  if (!nums.length) return null;

  nums.sort((a, b) => a - b);

  // ✅ start: 用最小節次 - 1 -> 0-based rowIndex
  const start = nums[0] - 1;

  // ✅ span: 節次數量（通常是連續的，像 6,7）
  // 這裡不要用 max-min+1，避免 "1,3" 這種不連續變成跨兩格
  let span = nums.length;

  // ✅ span 防呆：1~4（避免資料怪掉又變柱子）
  span = Math.max(1, Math.min(4, Math.floor(span)));

  return { start, span };
}

function dayToNumber(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;

  // 1~7
  if (/^[1-7]$/.test(s)) return Number(s);

  // "一二三四五六日/天"
  const mapZh = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7, 天: 7 };
  if (mapZh[s] != null) return mapZh[s];

  // "星期二"
  if (s.startsWith("星期")) {
    const c = s.replace("星期", "");
    if (mapZh[c] != null) return mapZh[c];
  }

  return null;
}

function normalizeToSlot(rawCourse, idx) {
  // ✅ 關鍵：你 preselects 存的是 viewCourse（day/section/...）
  // 但也可能帶 __raw（若你 toViewCourse 有塞 __raw）
  const c = rawCourse?.__raw ?? rawCourse;

  const name =
    c.courseName ??
    c.name ??
    c.courseENName ??
    c.title ??
    rawCourse?.name ??
    "未命名課程";

  const room =
    c.classroom ??
    c.room ??
    c.location ??
    rawCourse?.room ??
    "—";

  // ✅ 先抓 DayOfWeek（API raw），抓不到就用 viewCourse.day（"二"）
  const day =
    dayToNumber(c.DayOfWeek) ??
    dayToNumber(c.day) ??
    dayToNumber(rawCourse?.day);

  const okDay = typeof day === "number" && day >= 1 && day <= 7;
  if (!okDay) return null;

  // ✅ timesSlot 在 API raw 叫 timesSlot
  // ✅ viewCourse 叫 section
  const slotStr =
    c.timesSlot ??
    c.section ??
    rawCourse?.section ??
    rawCourse?.timesSlot;

  const slot = parseTimesSlotToStartSpan(slotStr);
  if (!slot) return null;

  const { start, span } = slot;

  const tones = ["cyan", "violet", "lime"];
  const tone = c.tone || tones[(day + start) % tones.length];

  return {
    _slotId: String(c.courseID ?? c.id ?? rawCourse?.courseID ?? idx),
    day,
    start,
    span,
    name,
    room,
    tone,
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
  };
}

function courseTitle(course) {
  return `${course.name}\n教室：${course.room}`;
}

function goHome() {
  router.push("/courses");
}
</script>

<style scoped>
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
  min-width: 980px;          /* ✅ 不硬縮，避免你截圖那種擠爆 */
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;

  --ct-row-h: 54px;          /* ✅ 統一格子高度 */
  table-layout: fixed;       /* ✅ 欄寬固定 */
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

/* ✅ 精簡卡片（只顯示 名稱 + 教室） */
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
</style>
