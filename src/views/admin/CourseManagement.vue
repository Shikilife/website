<template>
  <div class="p3-card w-full">
    <!-- 🔍 搜尋列 -->
    <div class="p3-search-row">
      <div class="p3-search-label">查詢課程</div>

      <input v-model.trim="searchText" class="p3-input" placeholder="請輸入課程名稱 / 系所 / 教師 / 教室" @keydown.enter="search" />

      <button class="p3-btn p3-btn-primary" @click="search" :disabled="isLoading">
        搜尋
      </button>

      <button class="p3-btn p3-btn-ghost" @click="refresh" :disabled="isLoading" title="重新抓取資料">
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
            <th>教師</th>
            <th>教室</th>
            <th>課別</th>
            <th>學分</th>
            <th>星期</th>
            <th>節次</th>
            <th class="center">修改</th>
            <th class="center">刪除</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in coursesPage" :key="c.id">
            <td>{{ c.dept }}</td>
            <td class="strong">{{ c.name }}</td>
            <td>{{ c.teacher }}</td>

            <td class="room-cell">
              <div class="room-wrap" @mouseenter="openRoomTip(c, false)" @mouseleave="closeRoomTipIfNotPinned">
                <button type="button" class="room-btn" @click.stop="toggleRoomPinned(c)">
                  <span class="room-code">{{ c.roomCode || "—" }}</span>
                </button>

                <transition name="p3-dd-fade">
                  <div v-if="roomTipOpen && activeRoomId === c.id" class="room-tip" @click.stop>
                    <div class="room-tip-head">
                      <div class="room-tip-title">{{ c.buildingName || "—" }}</div>
                      <div class="room-tip-sub">
                        {{ c.roomCode || "" }}
                        <span v-if="roomPinned" class="pin">（已固定）</span>
                      </div>
                    </div>

                    <div v-if="c.roomImage" class="room-tip-img">
                      <img :src="c.roomImage" alt="教室位置" />
                    </div>
                    <div v-else class="room-tip-empty">沒有位置圖片</div>
                  </div>
                </transition>
              </div>
            </td>

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

    <!-- ✅ 分頁區 -->
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
          目前顯示 <b>{{ coursesPage.length }}</b> / <b>{{ coursesView.length }}</b> 筆
          <span v-if="coursesAll.length">（總共 {{ coursesAll.length }} 筆）</span>
        </div>
      </div>
    </div>

    <p class="p3-hint">
      ✅ 已串：GET /api/courses + /api/departments + /api/teachers + /api/courseteacher + /api/classroom + /api/buildings + /api/buildingMaps
      ｜✅ 已補：新增 / 修改 / 刪除（courses CRUD）
    </p>

    <!-- ✅ 新增/修改 Modal -->
    <CourseFormModal
      v-model="modalOpen"
      :mode="modalMode"
      :initial="modalInitial"
      :departments="departmentsOptions"
      @save="onModalSave"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CourseFormModal from "./CourseFormModal.vue";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "";

/* ========= state ========= */
const isLoading = ref(false);
const errorMsg = ref("");

const searchText = ref("");
const coursesAll = ref([]);

/* ✅ raw cache (給 edit 用) */
const coursesRawMap = ref(new Map()); // courseID -> raw course row
const departmentsOptions = ref([]);   // [{departmentID, departmentName}]

/* ✅ maps */
const courseRoomMap = ref(new Map());     // courseID -> { buildingCode, roomNumber }
const buildingNameMap = ref(new Map());   // buildingCode -> buildingName
const buildingImgMap = ref(new Map());    // buildingCode -> imageUrl

/* ✅ tooltip state */
const roomTipOpen = ref(false);
const roomPinned = ref(false);
const activeRoomId = ref("");

/* ✅ pagination state */
const pageSize = ref(20);
const currentPage = ref(1);
const jumpPage = ref(1);

/* ✅ modal state */
const modalOpen = ref(false);
const modalMode = ref("create");  // create | edit
const modalInitial = ref(null);   // raw course row

/* ========= helpers ========= */
function mapWeek(v) {
  const map = {
    "0": "日", "1": "一", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "日",
    日: "日", 一: "一", 二: "二", 三: "三", 四: "四", 五: "五", 六: "六"
  };
  const key = String(v ?? "").trim();
  return map[key] || (key ? key : "—");
}

function mapSection(v) {
  if (v == null) return "—";
  const s = String(v).trim();
  if (!s) return "—";
  return s.includes(",") ? s.split(",").join("-") : s;
}

/** ✅ buildingMaps 的 imagePath -> img src */
function normalizeImagePath(p) {
  const raw = String(p || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const cleaned = raw.replace(/\\/g, "/");

  if (cleaned.startsWith("./pubilc/")) return "/" + cleaned.replace("./pubilc/", "");
  if (cleaned.startsWith("./public/")) return "/" + cleaned.replace("./public/", "");

  if (cleaned.startsWith("/")) return `${API_BASE}${cleaned}`;
  return `${API_BASE}/${cleaned.replace(/^\.\//, "")}`;
}

async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  return await res.json();
}

async function apiJson(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${method} ${path} HTTP ${res.status} ${t}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  return null;
}

/* ========= join builders ========= */
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

  return (courses || [])
    .map((row) => {
      const id = String(row.courseID ?? row.courseId ?? row.id ?? "");
      const name = String(row.courseName ?? row.name ?? "");
      const deptId = String(row.departmentID ?? row.departmentId ?? row.dept ?? "");
      const deptName = deptMap.get(deptId);
      const dept = deptName && deptName.trim() ? deptName : (deptId || "—");

      const teacherIds = courseToTeacherIds.get(id) || [];
      const teacherNames = teacherIds
        .map((tid) => teacherMap.get(String(tid)) || "")
        .filter((x) => x && x.trim());

      const teacherList = teacherNames;
      const teacher =
        teacherList.length === 0 ? "—"
          : teacherList.length <= 2 ? teacherList.join("、")
            : `${teacherList.slice(0, 2).join("、")}…`;

      const credit = row.credits ?? row.credit ?? "—";
      const category = row.courseType ?? row.category ?? "—";
      const day = mapWeek(row.DayOfWeek ?? row.day);
      const section = mapSection(row.timesSlot ?? row.section);

      // ✅ 教室 join
      const r = courseRoomMap.value.get(id) || null;
      const buildingCode = r?.buildingCode ? String(r.buildingCode).trim() : "";
      const roomNumber = r?.roomNumber ? String(r.roomNumber).trim() : "";
      const roomCode = (buildingCode && roomNumber) ? `${buildingCode}${roomNumber}` : "";

      const buildingName = buildingCode
        ? (buildingNameMap.value.get(buildingCode) || `${buildingCode}棟`)
        : "";

      const roomImage = buildingCode
        ? (buildingImgMap.value.get(buildingCode) || "")
        : "";

      return {
        id,
        dept,
        name,
        teacherList,
        teacher,
        category: String(category ?? "—"),
        credit: String(credit ?? "—"),
        day,
        section,

        roomCode,
        buildingCode,
        buildingName,
        roomImage,

        // ✅ 保留 raw（edit modal 直接用）
        _raw: row,
      };
    })
    .filter((c) => c.id || c.name);
}

/* ========= API fetch ========= */
async function fetchMaps() {
  const [classroom, buildings, buildingMaps] = await Promise.all([
    getJson("/api/classroom"),
    getJson("/api/buildings"),
    getJson("/api/buildingMaps"),
  ]);

  // courseID -> buildingCode/roomNumber
  const crm = new Map();
  for (const x of classroom || []) {
    const cid = String(x.courseID ?? x.courseId ?? "").trim();
    if (!cid) continue;
    crm.set(cid, {
      buildingCode: x.buildingCode ?? "",
      roomNumber: x.roomNumber ?? "",
    });
  }
  courseRoomMap.value = crm;

  // buildingCode -> buildingName
  const bnm = new Map();
  for (const b of buildings || []) {
    const code = String(b.buildingCode ?? "").trim();
    if (!code) continue;
    bnm.set(code, String(b.buildingName ?? "").trim());
  }
  buildingNameMap.value = bnm;

  // buildingCode -> image url
  const bim = new Map();
  for (const m of buildingMaps || []) {
    const code = String(m.buildingCode ?? "").trim();
    if (!code) continue;
    bim.set(code, normalizeImagePath(m.imagePath));
  }
  buildingImgMap.value = bim;
}

async function fetchCoursesWithJoins() {
  errorMsg.value = "";
  isLoading.value = true;

  try {
    await fetchMaps();

    const [courses, departments, teachers, courseteacher] = await Promise.all([
      getJson("/api/courses"),
      getJson("/api/departments"),
      getJson("/api/teachers"),
      getJson("/api/courseteacher"),
    ]);

    // ✅ departments options 給 modal 用
    departmentsOptions.value = (departments || []).map((d) => ({
      departmentID: String(d.departmentID ?? ""),
      departmentName: String(d.departmentName ?? ""),
    }));

    // ✅ raw map 給 edit 用
    const rm = new Map();
    for (const c of courses || []) {
      const id = String(c.courseID ?? "").trim();
      if (!id) continue;
      rm.set(id, c);
    }
    coursesRawMap.value = rm;

    coursesAll.value = buildJoinedCourses({ courses, departments, courseteacher, teachers });
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
      teacherAll.includes(lower) ||
      String(c.roomCode || "").toLowerCase().includes(lower) ||
      String(c.buildingName || "").toLowerCase().includes(lower)
    );
  });
});

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

function clampPage(p) {
  const n = Number(p) || 1;
  return Math.min(Math.max(1, n), totalPages.value);
}
function prevPage() { currentPage.value = clampPage(currentPage.value - 1); jumpPage.value = currentPage.value; }
function nextPage() { currentPage.value = clampPage(currentPage.value + 1); jumpPage.value = currentPage.value; }
function goToPage(p) { currentPage.value = clampPage(p); jumpPage.value = currentPage.value; }

watch(pageSize, () => { currentPage.value = clampPage(currentPage.value); jumpPage.value = currentPage.value; });
watch(coursesView, () => { currentPage.value = clampPage(currentPage.value); jumpPage.value = currentPage.value; });

/* ========= tooltip ========= */
function openRoomTip(course, byClick) {
  if (!course?.id) return;
  if (!byClick && roomPinned.value) return;
  activeRoomId.value = course.id;
  roomTipOpen.value = true;
  if (byClick) roomPinned.value = true;
}
function closeRoomTipIfNotPinned() {
  if (roomPinned.value) return;
  roomTipOpen.value = false;
  activeRoomId.value = "";
}
function toggleRoomPinned(course) {
  if (!course?.id) return;
  if (roomTipOpen.value && activeRoomId.value === course.id && roomPinned.value) {
    roomPinned.value = false;
    roomTipOpen.value = false;
    activeRoomId.value = "";
    return;
  }
  openRoomTip(course, true);
}
function onDocClick(e) {
  if (!roomTipOpen.value) return;
  const el = e.target.closest?.(".room-wrap");
  if (!el) {
    roomPinned.value = false;
    roomTipOpen.value = false;
    activeRoomId.value = "";
  }
}

/* ========= actions ========= */
async function search() {
  currentPage.value = 1;
  jumpPage.value = 1;
}
async function refresh() {
  await fetchCoursesWithJoins();
}

/* ✅ 新增/修改/刪除（真的打 API） */
function addCourse() {
  modalMode.value = "create";
  modalInitial.value = {
    courseID: "",
    courseName: "",
    credits: 0,
    semester: "",
    departmentID: "",
    courseType: "",
    DayOfWeek: "",
    timesSlot: "",
  };
  modalOpen.value = true;
}

function editCourse(course) {
  const id = String(course?.id ?? "").trim();
  if (!id) return;

  modalMode.value = "edit";

  // ✅ 用 raw map 為準（避免 view 欄位缺失）
  const raw = coursesRawMap.value.get(id) || course._raw || {};
  modalInitial.value = { ...raw };
  modalOpen.value = true;
}

async function onModalSave(payload) {
  try {
    errorMsg.value = "";

    if (modalMode.value === "create") {
      // POST /api/courses
      await apiJson("/api/courses", "POST", payload);
    } else {
      // PUT /api/courses/<courseID>
      const courseID = encodeURIComponent(String(payload.courseID).trim());
      const body = { ...payload };
      delete body.courseID; // ✅ PUT 通常不改主鍵
      await apiJson(`/api/courses/${courseID}`, "PUT", body);
    }

    modalOpen.value = false;
    await refresh();
  } catch (e) {
    errorMsg.value = `操作失敗：${e?.message || "unknown error"}`;
  }
}

async function deleteCourse(course) {
  const id = String(course?.id ?? "").trim();
  if (!id) return;

  const ok = confirm(`確認刪除課程「${course.name}」？（courseID=${id}）`);
  if (!ok) return;

  try {
    errorMsg.value = "";
    await apiJson(`/api/courses/${encodeURIComponent(id)}`, "DELETE");
    await refresh();
  } catch (e) {
    errorMsg.value = `刪除失敗：${e?.message || "unknown error"}`;
  }
}

onMounted(async () => {
  document.addEventListener("click", onDocClick);
  await fetchCoursesWithJoins();
});
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<style scoped>
/* ===== 搜尋列 ===== */
.p3-search-row {
  display: grid;
  grid-template-columns: 140px minmax(0,1fr) auto auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}
.p3-search-row .p3-btn{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  line-height: 1;
  padding: 0 18px;
  box-sizing: border-box;
}
.p3-search-row .p3-btn:active{ transform: none !important; }

.p3-search-row .p3-input,
.p3-search-row .p3-btn { height: 44px; }

.p3-search-label {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.08em;
}
@media (max-width:860px) {
  .p3-search-row { grid-template-columns: 1fr; }
}

/* ===== 中央操作 ===== */
.p3-actions-center { text-align: center; margin-bottom: 18px; }
.p3-actions-center .p3-btn:active{ transform: none !important; }

/* ✅ tooltip 不被卡 */
.p3-card { overflow: visible; }

.p3-table-wrap {
  margin-top: 12px;
  background: rgba(12, 26, 44, 0.6);
  border-radius: 16px;
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
}

.p3-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 1100px;
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

.p3-table tbody tr:hover { background: rgba(47, 230, 255, 0.08); }

.strong { font-weight: 900; }
.center { text-align: center; }
.empty { padding: 18px; color: rgba(180, 200, 230, 0.8); }

.action { cursor: pointer; font-weight: 900; color: var(--p3-lime); }
.action:hover { text-decoration: underline; }
.danger { color: #ff6b6b; }

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
   ✅ 教室 tooltip
========================= */
.room-cell { position: relative; }
.room-wrap { position: relative; display: inline-block; }

.room-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.16);
  color: rgba(234, 242, 255, 0.92);
  cursor: pointer;
  font-weight: 900;
}

.room-btn:hover {
  border-color: rgba(47, 230, 255, 0.28);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}

.room-tip {
  position: absolute;
  left: 50%;
  top: calc(100% + 10px);
  transform: translateX(-50%);
  z-index: 999;
  width: min(420px, 80vw);
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(47, 230, 255, 0.22);
  background: rgba(10, 20, 38, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), 0 0 30px rgba(47, 230, 255, 0.12);
}

.room-tip-head { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.room-tip-title { font-weight: 1000; letter-spacing: .04em; }
.room-tip-sub { font-size: 12px; color: rgba(180, 210, 255, 0.75); font-weight: 800; }
.pin { color: rgba(47, 230, 255, 0.9); }

.room-tip-img { max-height: 320px; overflow: auto; border-radius: 12px; }
.room-tip-img img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.room-tip-empty {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: rgba(180, 210, 255, 0.75);
  font-size: 12px;
  font-weight: 800;
}

/* transition */
.p3-dd-fade-enter-active,
.p3-dd-fade-leave-active { transition: opacity .15s ease, transform .15s ease; }
.p3-dd-fade-enter-from,
.p3-dd-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ===== 分頁 ===== */
.p3-pagination-bar {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.p3-pagination-left,
.p3-pagination-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.p3-pg-field {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.p3-pg-label { font-size: 12px; font-weight: 800; color: rgba(180, 200, 230, 0.8); }

.p3-pg-select {
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.18);
  color: rgba(234, 242, 255, 0.92);
  font-weight: 900;
  outline: none;
}

.p3-pg-pages {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.p3-pg-btn {
  height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.86);
  font-weight: 900;
  cursor: pointer;
}

.p3-pg-btn:disabled { opacity: .45; cursor: not-allowed; }

.p3-pg-text { font-size: 13px; color: rgba(234, 242, 255, 0.86); }

.p3-pg-jump {
  width: 92px;
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.18);
  color: rgba(234, 242, 255, 0.92);
  font-weight: 900;
  outline: none;
}

.p3-pg-go {
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  border: 0;
  background: linear-gradient(135deg, rgba(47, 230, 255, 0.95), rgba(148, 123, 255, 0.55));
  color: #061224;
  font-weight: 1000;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.p3-pg-summary { font-size: 12px; color: rgba(180, 200, 230, 0.78); font-weight: 800; }
</style>
