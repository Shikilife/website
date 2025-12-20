<template>
  <div class="p3-root">
    <div class="p3-bg-wrapper" aria-hidden="true">
      <div class="p3-bg-grid"></div>
      <div class="p3-bg-slash"></div>
    </div>

    <div class="p3-container">
      <section class="p3-hero">
        <div class="p3-badge">
          <span class="p3-badge-icon">❖</span>
          NTUNHS · Course Inquiry
        </div>

        <h1 class="p3-title">
          課程查詢系統
          <span class="p3-title-sub">Search · Filter · Plan</span>
        </h1>

        <p class="p3-desc">
          先選學期，再用課名或教師快速查詢。想要更精準？用「進階搜尋」一次篩到位。
        </p>

        <div class="p3-meta">
          <div class="p3-chip">
            <span class="dot"></span>
            資料來源：系統資料（Demo）
          </div>
          <div class="p3-chip">
            <span class="dot dot2"></span>
            狀態：{{ user.isLoggedIn ? "已登入" : "訪客模式" }}
          </div>
        </div>
      </section>

      <section class="p3-panel">
        <div class="p3-panel-head">
          <div class="p3-panel-title">快速查詢</div>
          <div class="p3-panel-sub">FAST LOOKUP</div>
        </div>

        <!-- ✅ 學期 Dropdown -->
        <div class="p3-field">
          <label class="p3-label">學年期</label>

          <div class="p3-dd" :class="{ open: ddOpen }">
            <button type="button" class="p3-dd-btn" @click="ddOpen = !ddOpen" :aria-expanded="ddOpen">
              <span class="p3-dd-text">
                {{ semester || "-- 請選擇學期 --" }}
              </span>
              <span class="p3-dd-caret">▼</span>
            </button>

            <transition name="p3-dd-fade">
              <div v-if="ddOpen" class="p3-dd-menu" role="listbox">
                <button v-for="s in semesterList" :key="s" type="button" class="p3-dd-item"
                  :class="{ active: s === semester }" @click="selectSemester(s)">
                  {{ s }}
                </button>

                <div v-if="!semesterList.length && !loading" class="p3-dd-empty">
                  目前沒有可選學期
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- ✅ 查詢模式 -->
        <div class="p3-field">
          <label class="p3-label">關鍵字查詢</label>

          <div class="p3-radio-row">
            <label class="p3-radio" :class="{ active: type === 'all' }">
              <input type="radio" v-model="type" value="all" />
              <div class="radio-indicator"></div>
              <span>全部</span>
            </label>

            <label class="p3-radio" :class="{ active: type === 'course' }">
              <input type="radio" v-model="type" value="course" />
              <div class="radio-indicator"></div>
              <span>課程名稱</span>
            </label>

            <label class="p3-radio" :class="{ active: type === 'teacher' }">
              <input type="radio" v-model="type" value="teacher" />
              <div class="radio-indicator"></div>
              <span>教師名稱</span>
            </label>
          </div>
        </div>

        <div class="p3-field">
          <label class="p3-label">關鍵字</label>
          <input v-model="keyword" type="text" class="p3-input" placeholder="輸入課名或老師，例如：資料庫 / 連中岳"
            @keydown.enter="search" />
          <div class="p3-hint">Tip：按 Enter 也可以直接查詢</div>
        </div>

        <div class="p3-actions">
          <button @click="search" class="p3-btn p3-btn-primary">
            <div class="btn-content">
              <span class="p3-btn-icon">▶</span>
              <span>開始查詢</span>
            </div>
            <div class="btn-shine"></div>
          </button>

          <button @click="advancedSearch" class="p3-btn p3-btn-ghost">
            <div class="btn-content">
              <span>進階搜尋</span>
              <span class="p3-btn-arrow">→</span>
            </div>
          </button>
        </div>
      </section>
    </div>

    <!-- ✅ Loading -->
    <div v-if="loading" class="p3-results-wrap">
      <div class="p3-results-head">
        <div class="p3-results-title">查詢結果</div>
        <div class="p3-results-sub">資料載入中…</div>
      </div>
    </div>

    <!-- ✅ Error -->
    <div v-else-if="errorMsg" class="p3-results-wrap">
      <div class="p3-results-head">
        <div class="p3-results-title">載入失敗</div>
        <div class="p3-results-sub">{{ errorMsg }}</div>
      </div>
    </div>

    <!-- ✅ Empty -->
    <div v-else-if="hasSearched && results.length === 0" class="p3-results-wrap">
      <div class="p3-results-head">
        <div class="p3-results-title">查詢結果</div>
        <div class="p3-results-sub">找不到符合條件的課程</div>
      </div>
    </div>

    <!-- ✅ Results -->
    <div v-else-if="results.length > 0" class="p3-results-wrap">
      <div class="p3-results-head">
        <div class="p3-results-title">查詢結果</div>
        <div class="p3-results-sub">
          共 <b>{{ results.length }}</b> 筆
        </div>
      </div>

      <div class="p3-table-wrap">
        <div class="p3-table-scroll">
        <table class="p3-table">
          <thead>
            <tr>
              <th>系所</th>
              <th>課程名稱</th>
              <th>年級</th>
              <th>人數</th>
              <th>教師</th>
              <th>課別</th>
              <th>地點</th>
              <th>星期</th>
              <th>節次</th>
              <th v-if="user.isLoggedIn && !user.isAdmin" class="center">預選</th>
              <th v-if="user.isLoggedIn && !user.isAdmin" class="center">收藏</th>

            </tr>
          </thead>

          <tbody>
             <tr v-for="c in pagedResults" :key="c.courseID">
              <td>{{ c.dept }}</td>
              <td class="strong">{{ c.name }}</td>
              <td>{{ c.grade }}</td>
              <td>{{ c.people }}</td>
              <td>{{ c.teacher }}</td>
              <td>{{ c.category }}</td>
              <td>{{ c.room }}</td>
              <td>{{ c.day }}</td>
              <td>{{ c.section }}</td>

              <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                <button class="p3-mini-btn" :class="{ active: user.isPreselected(c.courseID) }" title="加入預選"
                  @click="user.togglePreselect(c)">
                  <span>{{ user.isPreselected(c.courseID) ? "已加入" : "加入" }}</span>
                </button>
              </td>

              <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                <button class="p3-mini-btn ghost" :class="{ active: user.isFavorite(c.courseID) }" title="加入收藏"
                  @click="user.toggleFavorite(c)">
                  <span>{{ user.isFavorite(c.courseID) ? "已收藏" : "收藏" }}</span>
                </button>
              </td>

            </tr>
          </tbody>
        </table>
        </div>
        <!-- ✅ Pagination（整合在同一張卡內） -->
  <div class="p3-pagination">
    <div class="p3-page-left">
      <span class="p3-page-label">每頁</span>

      <select v-model.number="pageSize" class="p3-page-size">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>

      <span class="p3-page-label">筆</span>
    </div>

    <div class="p3-page-right">
      <button class="p3-page-btn" @click="prevPage" :disabled="page <= 1">←</button>

      <span class="p3-page-info">
        第 <b>{{ page }}</b> / <b>{{ totalPages }}</b> 頁
      </span>

      <button class="p3-page-btn" @click="nextPage" :disabled="page >= totalPages">→</button>
    </div>
  </div>
      </div>


    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { apiGet } from "@/api";




const user = useUserStore();
const router = useRouter();

const semester = ref("");
const type = ref("all");
const keyword = ref("");
const semesterList = ref([]);

const results = ref([]);
const loading = ref(false);
const errorMsg = ref("");
const hasSearched = ref(false);

// ✅ cache：第一次查詢載入一次就好
const rawCourses = ref([]);
const deptMap = ref(new Map());         // departmentID -> departmentName
const teacherMap = ref(new Map());      // teacherID -> teacherName
const courseTeachersMap = ref(new Map()); // courseID -> [teacherName...]

// ✅ dropdown
const ddOpen = ref(false);

function selectSemester(s) {
  semester.value = s;
  ddOpen.value = false;
}

// ✅ 點外面關閉 dropdown
function onDocClick(e) {
  const el = e.target.closest?.(".p3-dd");
  if (!el) ddOpen.value = false;
}


// ======================
// ✅ 分頁（前端切分）
// ======================
const pageSize = ref(10); // 10/20/50
const page = ref(1);

const totalPages = computed(() => {
  const n = results.value.length;
  return Math.max(1, Math.ceil(n / pageSize.value));
});

const pagedResults = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return results.value.slice(start, start + pageSize.value);
});

watch([results, pageSize], () => {
  page.value = 1; // 查詢結果更新 or 每頁筆數改變 → 回到第1頁
});

function prevPage() {
  page.value = Math.max(1, page.value - 1);
}
function nextPage() {
  page.value = Math.min(totalPages.value, page.value + 1);
}


onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));

onMounted(() => {
  ensureLoaded(); // 進頁先拉資料，semesterList 才有值
});

function normalizeDay(v) {
  const s = String(v ?? "").trim();
  if (!s) return "";

  if (/^[1-7]$/.test(s)) return ["一", "二", "三", "四", "五", "六", "日"][Number(s) - 1];

  const map = { 一: "一", 二: "二", 三: "三", 四: "四", 五: "五", 六: "六", 日: "日", 天: "日" };
  if (map[s]) return map[s];

  const map2 = { Mon: "一", Tue: "二", Wed: "三", Thu: "四", Fri: "五", Sat: "六", Sun: "日" };
  if (map2[s]) return map2[s];

  return s;
}

function semesterMatch(courseSemester, selectedSemester) {
  if (!selectedSemester) return true;
  if (courseSemester == null) return false;

  const selNum = Number(String(selectedSemester).replace("-", "")); // "113-2" -> 1132
  const csNum = Number(courseSemester); // 1132
  return csNum === selNum;
}

async function ensureLoaded() {
  if (rawCourses.value.length) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    const [courses, departments, teachers, courseteacher] = await Promise.all([
      apiGet("/api/courses"),
      apiGet("/api/departments"),
      apiGet("/api/teachers"),
      apiGet("/api/courseteacher"),
    ]);

    rawCourses.value = Array.isArray(courses) ? courses : [];

    // ✅ semesterList 由 courses.semester 生成（1132 -> "113-2"）
    const set = new Set();
    for (const c of rawCourses.value) {
      const s = c.semester;
      if (s == null) continue;

      const num = Number(s);
      if (!Number.isNaN(num) && num >= 1000) {
        const year = Math.floor(num / 10);
        const term = num % 10;
        if (term === 1 || term === 2) set.add(`${year}-${term}`);
      }
    }
    semesterList.value = Array.from(set).sort((a, b) => b.localeCompare(a));

    // departments -> Map
    const dMap = new Map();
    for (const d of departments || []) {
      dMap.set(String(d.departmentID), d.departmentName || "");
    }
    deptMap.value = dMap;

    // teachers -> Map
    const tMap = new Map();
    for (const t of teachers || []) {
      tMap.set(String(t.teacherID), t.teacherName || "");
    }
    teacherMap.value = tMap;

    // courseteacher -> courseID -> teacherName[]
    const ctMap = new Map();
    for (const ct of courseteacher || []) {
      const cid = String(ct.courseID);
      const tid = String(ct.teacherID);
      const tname = tMap.get(tid) || "";

      if (!ctMap.has(cid)) ctMap.set(cid, []);
      if (tname) ctMap.get(cid).push(tname);
    }
    courseTeachersMap.value = ctMap;
  } catch (e) {
    errorMsg.value = e?.message || "API 連線失敗：請確認 Flask(5000) 與 Vite proxy";
    rawCourses.value = [];
    deptMap.value = new Map();
    teacherMap.value = new Map();
    courseTeachersMap.value = new Map();
  } finally {
    loading.value = false;
  }
}

function toViewCourse(row) {
  const courseID = row.courseID;
  const deptName = deptMap.value.get(String(row.departmentID)) || "";

 const teacherNames = courseTeachersMap.value.get(String(courseID)) || [];

// ✅ 完整教師字串：用於搜尋
const teacherFull = teacherNames.length ? teacherNames.join(" / ") : "";

// ✅ 顯示：超過兩位用 ...
const teacherDisplay =
  teacherNames.length <= 2
    ? teacherFull
    : `${teacherNames[0]} / ${teacherNames[1]} ...`;


  return {
    courseID: row.courseID, // ✅ 用於 v-for key
    dept: deptName,
    name: row.courseName || "",
    grade: row.grade || row.class || "",
    people: row.people ?? "", // DB沒有就空字串
    teacher: teacherDisplay,     // ✅ 表格顯示用（含 ...）
teacherFull: teacherFull,    // ✅ 搜尋用（完整）

    category: row.courseType || "",
    room: row.classroom || "",
    day: normalizeDay(row.DayOfWeek),
    section: row.timesSlot || "",
    __raw: row,
    credit: row.credit ?? row.credits ?? "",
  };
}

async function search() {
  hasSearched.value = true;
  errorMsg.value = "";

  // ✅ 至少要有一個條件（學期 or 關鍵字）
  const s = semester.value.trim();
  const kw = keyword.value.trim();

  if (!s && !kw) {
    alert("請至少選擇學期或輸入關鍵字");
    return;
  }

  await ensureLoaded();

  if (!rawCourses.value.length) {
    results.value = [];
    return;
  }

  const kwLower = kw.toLowerCase();

  // 先篩學期，再做映射
  let list = rawCourses.value
    .filter((c) => semesterMatch(c.semester, s))
    .map(toViewCourse);

  // 沒輸入 keyword：就只用學期篩
  if (!kw) {
    results.value = list;
    return;
  }

  const hitCourse = (c) => String(c.name || "").toLowerCase().includes(kwLower);
  const hitTeacher = (c) => String(c.teacherFull || c.teacher || "").toLowerCase().includes(kwLower);
  const hitDept = (c) => String(c.dept || "").toLowerCase().includes(kwLower);

  if (type.value === "course") {
    list = list.filter(hitCourse);
  } else if (type.value === "teacher") {
    list = list.filter(hitTeacher);
  } else {
    list = list.filter((c) => hitCourse(c) || hitTeacher(c) || hitDept(c));
  }

  results.value = list;
}

function advancedSearch() {
  router.push("/advanced-search");
}
</script>

<style scoped>


.p3-mini-btn.active{
  background: var(--p3-neon);
  color: #000;
  box-shadow: 0 0 15px var(--p3-neon);
}
.p3-mini-btn.ghost.active{
  background: rgba(255,255,255,0.12);
  color: #fff;
  box-shadow: 0 0 10px rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.35);
}

/* ✅ 你原本 CSS 幾乎原封不動，我只保留必要整段（避免你漏貼造成編譯壞） */

/* 基本容器設定 */
.p3-root {
  position: relative;
  width: 100%;
  padding: clamp(18px, 3.2vw, 42px) clamp(14px, 2.8vw, 34px) clamp(28px, 4vw, 60px);
  color: #eaf2ff;
  background: transparent;
}

/* 背景裁切容器 */
.p3-bg-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.p3-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 52px 52px;
  opacity: 0.35;
  animation: gridMove 18s linear infinite;
}

@keyframes gridMove {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 52px 52px;
  }
}

.p3-bg-slash {
  position: absolute;
  width: min(1200px, 140vw);
  height: min(1200px, 140vw);
  right: -40vw;
  top: -35vw;
  max-width: 1200px;
  max-height: 1200px;
}

/* 佈局 Grid */
.p3-container {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 32px;
  position: relative;
  z-index: 1;
}

@media (max-width: 980px) {
  .p3-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .p3-actions {
    flex-direction: column;
  }

  .p3-btn {
    width: 100%;
  }
}

/* Hero 區域 */
.p3-hero {
  padding: 18px 8px;
}

.p3-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 50, 80, 0.8);
  border: 1px solid rgba(47, 230, 255, 0.4);
  box-shadow: 0 0 20px rgba(47, 230, 255, 0.15);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #fff;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.p3-badge-icon {
  color: var(--p3-neon);
  font-size: 14px;
}

.p3-title {
  margin-top: 22px;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-shadow: 0 0 25px rgba(47, 230, 255, 0.2);
}

.p3-title-sub {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(180, 210, 255, 0.9);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.p3-desc {
  margin-top: 16px;
  max-width: 520px;
  color: rgba(220, 235, 255, 0.9);
  line-height: 1.7;
  font-size: clamp(13px, 1.4vw, 16px);
}

.p3-meta {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.p3-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  background: rgba(30, 50, 80, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(234, 242, 255, 0.9);
  font-size: 13px;
}

.dot {
  background: var(--p3-neon);
  box-shadow: 0 0 12px rgba(47, 230, 255, 0.8);
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot2 {
  background: var(--p3-lime);
  box-shadow: 0 0 12px rgba(106, 255, 212, 0.6);
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* Panel 區域 */
.p3-panel {
  background: rgba(25, 40, 70, 0.75);
  border: 1px solid rgba(47, 230, 255, 0.25);
  border-radius: 20px;
  padding: 24px 28px;
  position: relative;
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.p3-panel::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--p3-neon), var(--p3-neon2));
  box-shadow: 0 0 25px rgba(47, 230, 255, 0.5);
}

.p3-panel-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 12px;
}

.p3-panel-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #fff;
}

.p3-panel-sub {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(180, 210, 255, 0.7);
  text-transform: uppercase;
}

.p3-field {
  margin-top: 18px;
}

.p3-label {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  color: rgba(234, 242, 255, 0.8);
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* Radio */
.p3-radio-row {
  display: flex;
  gap: 12px;
}

.p3-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  flex: 1;
}

.p3-radio input {
  display: none;
}

.radio-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  position: relative;
}

.radio-indicator::after {
  content: "";
  position: absolute;
  inset: 2px;
  background: var(--p3-neon);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.p3-radio.active {
  background: rgba(47, 230, 255, 0.15);
  border-color: rgba(47, 230, 255, 0.5);
}

.p3-radio.active .radio-indicator {
  border-color: var(--p3-neon);
}

.p3-radio.active .radio-indicator::after {
  opacity: 1;
  transform: scale(1);
}

.p3-radio span {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.p3-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .07);
  color: rgba(234, 242, 255, .92);
  outline: none;
}

.p3-input:focus {
  border-color: rgba(47, 230, 255, .6);
  box-shadow: 0 0 18px rgba(47, 230, 255, .14);
}

.p3-hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(180, 210, 255, 0.7);
}

/* Buttons */
.p3-actions {
  margin-top: 28px;
  display: flex;
  gap: 16px;
}

.p3-btn {
  flex: 1;
  position: relative;
  padding: 14px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transform: skewX(-12deg);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transform: skewX(12deg);
  font-weight: 800;
  letter-spacing: 0.1em;
  font-size: 15px;
  position: relative;
  z-index: 2;
}

.p3-btn-primary {
  background: var(--p3-neon);
  color: #061224;
  box-shadow: 0 0 20px rgba(47, 230, 255, 0.25);
}

.p3-btn-primary:hover {
  transform: skewX(-12deg) translateY(-2px) scale(1.02);
  box-shadow: 0 0 30px rgba(47, 230, 255, 0.5), -4px 4px 0 rgba(124, 92, 255, 0.8);
  background: #fff;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: skewX(-20deg);
  pointer-events: none;
  z-index: 1;
}

.p3-btn-primary:hover .btn-shine {
  animation: shineSwipe 0.6s ease;
}

@keyframes shineSwipe {
  0% {
    left: -100%;
  }

  100% {
    left: 200%;
  }
}

.p3-btn-ghost {
  background: transparent;
  color: rgba(234, 242, 255, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.p3-btn-ghost:hover {
  border-color: var(--p3-neon2);
  color: #fff;
  box-shadow: inset 0 0 20px rgba(124, 92, 255, 0.2);
  text-shadow: 0 0 8px rgba(124, 92, 255, 0.8);
}

.p3-btn-arrow {
  transition: transform 0.3s;
}

.p3-btn-ghost:hover .p3-btn-arrow {
  transform: translateX(5px);
}

/* Results */
.p3-results-wrap {
  max-width: 1180px;
  margin: 48px auto 0;
  position: relative;
  z-index: 1;
}

.p3-results-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.p3-results-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.p3-results-sub {
  color: rgba(180, 210, 255, 0.7);
  font-size: 13px;
}

.p3-table-wrap {
  background: rgba(25, 40, 70, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.25);

  /* ✅ 不要 hidden，不然永遠不能橫滑 */
  overflow: hidden;
}

/* ✅ 真正負責橫向捲動的容器 */
.p3-table-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  /* ✅ 讓手機手勢更穩 */
  touch-action: pan-x;

  /* ✅ 重要：避免 iOS/某些瀏覽器誤判不能滑 */
  width: 100%;
}

/* ✅ 表格至少要有寬度，不然不會出現可滑動區 */
.p3-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  /* ✅ 關鍵：桌面/手機都能橫滑看到右邊欄位 */
  min-width: 1100px;
}


.p3-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.p3-table thead tr {
  background: rgba(255, 255, 255, 0.08);
}

.p3-table th {
  text-align: left;
  padding: 14px 16px;
  color: rgba(234, 242, 255, 0.8);
  letter-spacing: 0.05em;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.p3-table td {
  padding: 14px 16px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.p3-table tbody tr:hover {
  background: rgba(47, 230, 255, 0.1);
}

.strong {
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.center {
  text-align: center;
}

/* mini buttons */
.p3-mini-btn {
  padding: 6px 14px;
  border-radius: 4px;
  border: none;
  background: rgba(47, 230, 255, 0.15);
  color: var(--p3-neon);
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
  transform: skewX(-12deg);
  transition: all 0.2s;
  box-shadow: 0 0 0 1px rgba(47, 230, 255, 0.3);
}

.p3-mini-btn span {
  display: block;
  transform: skewX(12deg);
}

.p3-mini-btn:hover {
  background: var(--p3-neon);
  color: #000;
  box-shadow: 0 0 15px var(--p3-neon);
  transform: skewX(-12deg) translateY(-1px);
}

.p3-mini-btn.ghost {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
}

.p3-mini-btn.ghost:hover {
  box-shadow: 0 0 0 1px #fff, 0 0 10px rgba(255, 255, 255, 0.5);
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* Dropdown */
.p3-dd {
  position: relative;
  width: 100%;
}

.p3-dd-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(234, 242, 255, 0.92);
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
}

.p3-dd-btn:hover {
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
}

.p3-dd.open .p3-dd-btn {
  border-color: rgba(47, 230, 255, 0.6);
  box-shadow: 0 0 18px rgba(47, 230, 255, 0.18);
}

.p3-dd-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.p3-dd-caret {
  font-size: 10px;
  color: var(--p3-neon);
  transition: transform 0.2s ease;
}

.p3-dd.open .p3-dd-caret {
  transform: rotate(180deg);
}

.p3-dd-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 10px);
  z-index: 50;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(47, 230, 255, 0.22);
  background: rgba(10, 20, 38, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), 0 0 30px rgba(47, 230, 255, 0.12);
  max-height: 260px;
  overflow: auto;
}

.p3-dd-item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(234, 242, 255, 0.9);
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: all 0.18s ease;
}

.p3-dd-item:hover {
  background: rgba(47, 230, 255, 0.12);
  border-color: rgba(47, 230, 255, 0.22);
}

.p3-dd-item.active {
  background: rgba(47, 230, 255, 0.18);
  border-color: rgba(47, 230, 255, 0.35);
  box-shadow: 0 0 18px rgba(47, 230, 255, 0.12);
}

.p3-dd-empty {
  padding: 10px 12px;
  color: rgba(180, 210, 255, 0.7);
  font-size: 12px;
}

.p3-dd-fade-enter-active,
.p3-dd-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.p3-dd-fade-enter-from,
.p3-dd-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
/* ✅ Pagination（CourseSearch 版，風格跟 AdvancedSearch 對齊） */
.p3-pagination{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  border-top: 1px solid rgba(255,255,255,0.10);
  background: rgba(10, 20, 38, 0.35);
}

.p3-page-left,
.p3-page-right{
  display:flex;
  align-items:center;
  gap: 10px;
}

.p3-page-label{
  color: rgba(180,210,255,0.75);
  font-size: 13px;
  font-weight: 800;
}

.p3-page-size{
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.92);
  outline: none;
  font-weight: 900;
}

.p3-page-btn{
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.92);
  cursor:pointer;
  font-weight: 900;
}
.p3-page-btn:disabled{
  opacity: .35;
  cursor: default;
}

.p3-page-info{
  color: rgba(234,242,255,0.88);
  font-size: 13px;
  font-weight: 800;
}

</style>
