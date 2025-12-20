<template>
  <div class="p3-card w-full">
    <!-- 🔍 搜尋列 -->
    <div class="p3-search-row">
      <div class="p3-search-label">查詢課程</div>

      <input
        v-model.trim="searchText"
        class="p3-input"
        placeholder="請輸入課程名稱 / 系所 / 教師"
        @keydown.enter="search"
      />

      <button class="p3-btn p3-btn-primary" @click="search" :disabled="isLoading">
        搜尋
      </button>

      <button
        class="p3-btn p3-btn-ghost"
        @click="refresh"
        :disabled="isLoading"
        title="重新抓取資料"
      >
        重新取得
      </button>
    </div>

    <!-- ➕ 新增 -->
    <div class="p3-actions-center">
      <button class="p3-btn p3-btn-ghost" @click="addCourse">
        ➕ 新增課程
      </button>
    </div>

    <!-- ❗狀態列 -->
    <div v-if="errorMsg" class="p3-alert">{{ errorMsg }}</div>

    <!-- 📄 表格 -->
    <div class="p3-table-wrap">
      <table class="p3-table">
        <thead>
          <tr>
            <th>系所</th>
            <th>課程名稱</th>
            <th>人數</th>
            <th>教師</th>
            <th>課別</th>
            <th>學分</th>
            <th>星期</th>
            <th>節次</th>
            <th class="center">修改</th>
            <th class="center">刪除</th>
          </tr>
        </thead>

        <tbody>
          <!-- ✅ 只渲染「分頁後」資料 -->
          <tr v-for="c in coursesPage" :key="c.id">
            <td>{{ c.dept }}</td>
            <td class="strong">{{ c.name }}</td>
            <td>{{ c.people }}</td>
            <td>{{ c.teacher }}</td>
            <td>{{ c.category }}</td>
            <td>{{ c.credit }}</td>
            <td>{{ c.day }}</td>
            <td>{{ c.section }}</td>

            <td class="center action" @click="editCourse(c)">✎</td>
            <td class="center action danger" @click="deleteCourse(c)">⊖</td>
          </tr>

          <tr v-if="isLoading">
            <td class="center empty" colspan="10">讀取中…</td>
          </tr>

          <tr v-if="!isLoading && coursesView.length === 0">
            <td class="center empty" colspan="10">
              沒有資料（可嘗試清空查詢或重新取得）
            </td>
          </tr>
        </tbody>
      </table>
    </div>

<!-- ✅ 分頁區（只改這一塊 UI，不動其他區塊） -->
<div class="p3-pagination-bar">
  <div class="p3-pagination-left">
    <label class="p3-pg-field">
      <span class="p3-pg-label">每頁顯示</span>

      <select v-model.number="pageSize" class="p3-pg-select">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="30">30</option>
        <option :value="50">50</option>
      </select>

      <span class="p3-pg-label">筆</span>
    </label>

    <div class="p3-pg-pages">
      <button class="p3-pg-btn" @click="prevPage" :disabled="currentPage <= 1">
        ← 上一頁
      </button>

      <span class="p3-pg-text">第 <b>{{ currentPage }}</b> / <b>{{ totalPages }}</b> 頁</span>

      <button class="p3-pg-btn" @click="nextPage" :disabled="currentPage >= totalPages">
        下一頁 →
      </button>
    </div>
  </div>

  <div class="p3-pagination-right">
    <label class="p3-pg-field">
      <span class="p3-pg-label">跳到</span>

      <input
        v-model.number="jumpPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="p3-pg-jump"
        @keydown.enter="goToPage(jumpPage)"
      />

      <button class="p3-pg-go" @click="goToPage(jumpPage)">GO</button>
    </label>

    <div class="p3-pg-summary">
      ✅ 目前顯示 <b>{{ coursesPage.length }}</b> / <b>{{ coursesView.length }}</b> 筆
      <span v-if="coursesAll.length">（總共 {{ coursesAll.length }} 筆）</span>
    </div>
  </div>
</div>


    <p class="p3-hint">
       已串：GET <b>/api/courses</b> + <b>/api/departments</b> + <b>/api/teachers</b> + <b>/api/courseteacher</b>
      ｜🧪 查詢先用前端篩選｜🧠 後續再補：keyword 查詢 / 新增 / 修改 / 刪除 / 人數統計
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";

/**
 * ✅ API Base
 * - 有 Vite proxy：用相對路徑 "/api/xxx"
 * - 沒 proxy：在 .env 設 VITE_API_BASE_URL=http://127.0.0.1:5000
 */
const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "";

/* ========= state ========= */
const isLoading = ref(false);
const errorMsg = ref("");

const searchText = ref("");
const coursesAll = ref([]);

/* ✅ pagination state */
const pageSize = ref(20);          // 你想更順可改 10
const currentPage = ref(1);
const jumpPage = ref(1);

/* ========= helpers ========= */
function mapWeek(v) {
  const map = {
    "0": "日",
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
    "7": "日",
    日: "日",
    一: "一",
    二: "二",
    三: "三",
    四: "四",
    五: "五",
    六: "六",
  };
  const key = String(v ?? "").trim();
  return map[key] || (key ? key : "—");
}

function mapSection(v) {
  // timesSlot: "6,7" → "6-7"
  if (v == null) return "—";
  const s = String(v).trim();
  if (!s) return "—";
  return s.includes(",") ? s.split(",").join("-") : s;
}

async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  return await res.json();
}

/**
 * ✅ 把「4 張表」合併成前端要顯示的資料
 */
function buildJoinedCourses({ courses, departments, courseteacher, teachers }) {
  // dept map
  const deptMap = new Map();
  for (const d of departments || []) {
    const id = d.departmentID ?? d.departmentId ?? d.id;
    const name = d.departmentName ?? d.name;
    if (id != null) deptMap.set(String(id), String(name ?? ""));
  }

  // teacher map
  const teacherMap = new Map();
  for (const t of teachers || []) {
    const id = t.teacherID ?? t.teacherId ?? t.id;
    const name = t.teacherName ?? t.name;
    if (id != null) teacherMap.set(String(id), String(name ?? ""));
  }

  // courseID -> [teacherID...]
  const courseToTeacherIds = new Map();
  for (const ct of courseteacher || []) {
    const courseId = ct.courseID ?? ct.courseId ?? ct.cid;
    const teacherId = ct.teacherID ?? ct.teacherId ?? ct.tid;
    if (courseId == null || teacherId == null) continue;

    const key = String(courseId);
    if (!courseToTeacherIds.has(key)) courseToTeacherIds.set(key, []);
    courseToTeacherIds.get(key).push(String(teacherId));
  }

  // normalize + join
  return (courses || [])
    .map((row) => {
      const id = String(row.courseID ?? row.courseId ?? row.id ?? "");
      const name = String(row.courseName ?? row.name ?? "");
      const deptId = String(row.departmentID ?? row.departmentId ?? row.dept ?? "");
      const deptName = deptMap.get(deptId);
      const dept = deptName && deptName.trim() ? deptName : deptId || "—";

      const teacherIds = courseToTeacherIds.get(id) || [];
      const teacherNames = teacherIds
        .map((tid) => teacherMap.get(String(tid)) || "")
        .filter((x) => x && x.trim());

      // ✅ 教師顯示：超過 2 位就 ...
      const teacherList = teacherNames;
      let teacherDisplay = "—";
      if (teacherList.length > 0) {
        teacherDisplay =
          teacherList.length <= 2
            ? teacherList.join("、")
            : `${teacherList.slice(0, 2).join("、")}…`;
      }

      const credit = row.credits ?? row.credit ?? "—";
      const category = row.courseType ?? row.category ?? "—";
      const day = mapWeek(row.DayOfWeek ?? row.day);
      const section = mapSection(row.timesSlot ?? row.section);

      // ⚠️ 人數：目前後端沒提供（通常要 COUNT(userAndCourseEnrollments)）
      const people = row.people ?? row.capacity ?? "—";

      return {
        id,
        dept,
        name,
        people: String(people ?? "—"),

        teacherList, // 搜尋用（完整）
        teacher: teacherDisplay, // 顯示用（最多 2 位）

        category: String(category ?? "—"),
        credit: String(credit ?? "—"),
        day,
        section,
      };
    })
    .filter((c) => c.id || c.name);
}

/* ========= API ========= */
async function fetchCoursesWithJoins() {
  errorMsg.value = "";
  isLoading.value = true;

  try {
    const [courses, departments, teachers, courseteacher] = await Promise.all([
      getJson("/api/courses"),
      getJson("/api/departments"),
      getJson("/api/teachers"),
      getJson("/api/courseteacher"),
    ]);

    if (!Array.isArray(courses)) throw new Error("/api/courses 回傳不是陣列");
    if (!Array.isArray(departments)) throw new Error("/api/departments 回傳不是陣列");
    if (!Array.isArray(teachers)) throw new Error("/api/teachers 回傳不是陣列");
    if (!Array.isArray(courseteacher)) throw new Error("/api/courseteacher 回傳不是陣列");

    coursesAll.value = buildJoinedCourses({ courses, departments, courseteacher, teachers });

    // ✅ 抓完資料回到第 1 頁
    currentPage.value = 1;
    jumpPage.value = 1;
  } catch (e) {
    errorMsg.value = `取得資料失敗：${e?.message || "unknown error"}`;
  } finally {
    isLoading.value = false;
  }
}

/* ========= view ========= */
const coursesView = computed(() => {
  const q = searchText.value?.trim();
  if (!q) return coursesAll.value;

  const lower = q.toLowerCase();
  return coursesAll.value.filter((c) => {
    const teacherAll = (c.teacherList || []).join("、").toLowerCase();
    return (
      String(c.name || "").toLowerCase().includes(lower) ||
      String(c.dept || "").toLowerCase().includes(lower) ||
      teacherAll.includes(lower)
    );
  });
});

/* ✅ pagination computed */
const totalPages = computed(() => {
  const total = coursesView.value.length;
  const size = Math.max(1, Number(pageSize.value) || 20);
  return Math.max(1, Math.ceil(total / size));
});

const coursesPage = computed(() => {
  const size = Math.max(1, Number(pageSize.value) || 20);
  const page = Math.min(Math.max(1, Number(currentPage.value) || 1), totalPages.value);
  const start = (page - 1) * size;
  return coursesView.value.slice(start, start + size);
});

/* ✅ 分頁控制 */
function clampPage(p) {
  const n = Number(p) || 1;
  return Math.min(Math.max(1, n), totalPages.value);
}

function prevPage() {
  currentPage.value = clampPage(currentPage.value - 1);
  jumpPage.value = currentPage.value;
}

function nextPage() {
  currentPage.value = clampPage(currentPage.value + 1);
  jumpPage.value = currentPage.value;
}

function goToPage(p) {
  currentPage.value = clampPage(p);
  jumpPage.value = currentPage.value;
}

/* ✅ 當你改 pageSize 或搜尋結果變少，要自動修正頁碼 */
watch(pageSize, () => {
  currentPage.value = clampPage(currentPage.value);
  jumpPage.value = currentPage.value;
});

watch(coursesView, () => {
  currentPage.value = clampPage(currentPage.value);
  jumpPage.value = currentPage.value;
});

/* ========= actions ========= */
async function search() {
  // ✅ 目前後端沒有 keyword 查詢，所以不需要再打 API
  // 只靠 computed 篩選即可
  currentPage.value = 1;
  jumpPage.value = 1;

  // 🧠 TODO：後端補 query 後，可改成打 /api/courses?keyword=...
}

async function refresh() {
  await fetchCoursesWithJoins();
}

function addCourse() {
  alert("TODO：新增課程（後端需提供 POST /api/courses 或 /api/admin/courses）");
}

function editCourse(course) {
  alert(`TODO：修改課程（id=${course.id}）後端需提供 PUT /api/courses/${course.id}`);
}

function deleteCourse(course) {
  const ok = confirm(`確認刪除課程「${course.name}」？`);
  if (!ok) return;

  // ✅ 目前後端沒有 DELETE，所以先做本地刪除（假動作）
  coursesAll.value = coursesAll.value.filter((c) => c.id !== course.id);

  // 🧠 TODO（後端補上後打開）：
  // await fetch(`${API_BASE}/api/courses/${encodeURIComponent(course.id)}`, { method: "DELETE" })
  // await fetchCoursesWithJoins()
}

onMounted(async () => {
  await fetchCoursesWithJoins();
});
</script>

<style scoped>
/* ===== 搜尋列 ===== */
.p3-search-row {
  display: grid;
  grid-template-columns: 140px 1fr 120px 120px;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.p3-search-label {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

@media (max-width: 860px) {
  .p3-search-row {
    grid-template-columns: 1fr;
  }
}

/* ===== 中央操作 ===== */
.p3-actions-center {
  text-align: center;
  margin-bottom: 18px;
}

/* ===== 表格 ===== */
.p3-table-wrap {
  margin-top: 12px;
  background: rgba(12, 26, 44, 0.6);
  border-radius: 16px;
  overflow-x: auto;
}

.p3-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 980px;
}

.p3-table th {
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(234, 242, 255, 0.9);
  font-weight: 900;
  white-space: nowrap;
}

.p3-table td {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.p3-table tbody tr:hover {
  background: rgba(47, 230, 255, 0.08);
}

.strong {
  font-weight: 900;
}

.center {
  text-align: center;
}

.empty {
  padding: 18px;
  color: rgba(180, 200, 230, 0.8);
}

/* ===== 操作 ===== */
.action {
  cursor: pointer;
  font-weight: 900;
  color: var(--p3-lime);
}

.action:hover {
  text-decoration: underline;
}

.danger {
  color: #ff6b6b;
}

/* ===== 結果 ===== */
.p3-result {
  text-align: center;
  margin-top: 18px;
  font-size: 16px;
  opacity: 0.9;
}

/* alert */
.p3-alert {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 76, 76, 0.12);
  border: 1px solid rgba(255, 76, 76, 0.22);
  color: rgba(255, 210, 210, 0.95);
  font-weight: 700;
}

/* hint */
.p3-hint {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: rgba(180, 200, 230, 0.75);
}
/* =========================
   ✅ ONLY 分頁區專用樣式
   不影響其他元件
========================= */

.p3-pagination-bar{
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* 左右兩區 */
.p3-pagination-left,
.p3-pagination-right{
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* 小欄位組合（每頁顯示 / 跳到） */
.p3-pg-field{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(0,0,0,0.16);
  border: 1px solid rgba(255,255,255,0.10);
}

.p3-pg-label{
  font-size: 12px;
  font-weight: 800;
  color: rgba(180,200,230,0.8);
}

/* select */
.p3-pg-select{
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(0,0,0,0.18);
  color: rgba(234,242,255,0.92);
  font-weight: 900;
  outline: none;
}

/* 上/下頁區 */
.p3-pg-pages{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(0,0,0,0.16);
  border: 1px solid rgba(255,255,255,0.10);
}

.p3-pg-btn{
  height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.86);
  font-weight: 900;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .18s ease, border-color .18s ease;
}

.p3-pg-btn:hover:not(:disabled){
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0,0,0,0.25);
  border-color: rgba(47,230,255,0.28);
}

.p3-pg-btn:disabled{
  opacity: .45;
  cursor: not-allowed;
}

.p3-pg-text{
  font-size: 13px;
  color: rgba(234,242,255,0.86);
}

/* 跳頁 input + GO */
.p3-pg-jump{
  width: 92px;
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(0,0,0,0.18);
  color: rgba(234,242,255,0.92);
  font-weight: 900;
  outline: none;
}

.p3-pg-go{
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  border: 0;
  background: linear-gradient(135deg, rgba(47,230,255,0.95), rgba(148,123,255,0.55));
  color: #061224;
  font-weight: 1000;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .18s ease;
}

.p3-pg-go:hover{
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(47,230,255,0.18);
}

/* summary */
.p3-pg-summary{
  font-size: 12px;
  color: rgba(180,200,230,0.78);
  font-weight: 800;
}

</style>
