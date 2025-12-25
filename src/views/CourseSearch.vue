<!-- src/views/CourseSearch.vue -->
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
          先選學期，再用課名或教室快速查詢。想要更精準？用「進階搜尋」一次篩到位。
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

        <!-- ✅ 學期 Dropdown（Teleport） -->
        <div class="p3-field">
          <label class="p3-label">學年期</label>

          <div class="p3-dd" :class="{ open: ddOpen }" ref="semesterDDRef">
            <button
              ref="semesterBtnRef"
              type="button"
              class="p3-dd-btn"
              @click="toggleSemesterDD"
              :aria-expanded="ddOpen"
            >
              <span class="p3-dd-text">{{ semester || "-- 請選擇學期 --" }}</span>
              <span class="p3-dd-caret">▼</span>
            </button>
          </div>

          <!-- ✅ Teleport Dropdown Menu -->
          <teleport to="body">
            <transition name="p3-dd-fade">
              <div
                v-if="ddOpen"
                class="p3-dd-menu p3-dd-menu-tele"
                :style="semesterMenuStyle"
                role="listbox"
                @mousedown.stop
              >
                <button
                  v-for="s in semesterList"
                  :key="s"
                  type="button"
                  class="p3-dd-item"
                  :class="{ active: s === semester }"
                  @click="selectSemester(s)"
                >
                  {{ s }}
                </button>

                <div v-if="!semesterList.length && !loading" class="p3-dd-empty">
                  目前沒有可選學期
                </div>
              </div>
            </transition>
          </teleport>
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

            <label class="p3-radio" :class="{ active: type === 'room' }">
              <input type="radio" v-model="type" value="room" />
              <div class="radio-indicator"></div>
              <span>教室名稱</span>
            </label>
          </div>
        </div>

        <div class="p3-field">
          <label class="p3-label">關鍵字</label>
          <input
            v-model="keyword"
            type="text"
            class="p3-input"
            placeholder="輸入課名或教室，例如：資料庫 / B101"
            @keydown.enter="search"
          />
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
        <div class="p3-results-sub">共 <b>{{ results.length }}</b> 筆</div>
      </div>

      <div class="p3-table-wrap">
        <div class="p3-table-scroll">
          <table class="p3-table">
            <thead>
              <tr>
                <th>系所</th>
                <th>課程名稱</th>
                <th>年級</th>
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
                <td>{{ c.teacher }}</td>
                <td>{{ c.category }}</td>

                <!-- ✅ 教室 tooltip（防閃爍） -->
                <td class="room-cell">
                  <div
                    class="room-wrap"
                    @mouseenter="openRoomTip(c, $event, false)"
                    @mouseleave="scheduleCloseRoomTip"
                  >
                    <button
                      type="button"
                      class="room-btn"
                      :title="roomTitle(c)"
                      @click.stop="toggleRoomPinned(c, $event)"
                    >
                      <span class="room-code">{{ c.room || "—" }}</span>
                    </button>
                  </div>
                </td>

                <td>{{ c.day }}</td>
                <td>{{ c.section }}</td>

                <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                  <button
                    class="p3-mini-btn"
                    :class="{ active: user.isPreselected(c.courseID) }"
                    title="加入預選"
                    @click="user.togglePreselect(c)"
                  >
                    <span>{{ user.isPreselected(c.courseID) ? "已加入" : "加入" }}</span>
                  </button>
                </td>

                <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                  
                  <button
                    class="p3-mini-btn ghost"
                    :class="{ active: user.isFavorite(c.courseID) }"
                    title="加入收藏"
                    @click="user.toggleFavorite(c)"
                  >
                    <span>{{ user.isFavorite(c.courseID) ? "已收藏" : "收藏" }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ✅ Pagination：每頁 dropdown（Teleport） -->
        <div class="p3-pagination">
          <div class="p3-page-left">
            <span class="p3-page-label">每頁</span>

            <div class="p3-dd p3-dd-sm" :class="{ open: pageSizeOpen }" ref="pageSizeDDRef">
              <button
                ref="pageSizeBtnRef"
                type="button"
                class="p3-dd-btn p3-dd-btn-sm"
                @click="togglePageSizeDD"
                :aria-expanded="pageSizeOpen"
              >
                <span class="p3-dd-text">{{ pageSize }}</span>
                <span class="p3-dd-caret">▼</span>
              </button>
            </div>

            <teleport to="body">
              <transition name="p3-dd-fade">
                <div
                  v-if="pageSizeOpen"
                  class="p3-dd-menu p3-dd-menu-sm p3-dd-menu-tele"
                  :style="pageSizeMenuStyle"
                  role="listbox"
                  @mousedown.stop
                >
                  <button
                    v-for="n in pageSizeList"
                    :key="n"
                    type="button"
                    class="p3-dd-item"
                    :class="{ active: n === pageSize }"
                    @click="pickPageSize(n)"
                  >
                    {{ n }}
                  </button>
                </div>
              </transition>
            </teleport>

            <span class="p3-page-label">筆</span>
          </div>

          <div class="p3-page-right">
            <button class="p3-page-btn" @click="prevPage" :disabled="page <= 1">←</button>
            <span class="p3-page-info">第 <b>{{ page }}</b> / <b>{{ totalPages }}</b> 頁</span>
            <button class="p3-page-btn" @click="nextPage" :disabled="page >= totalPages">→</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ 教室 tooltip Teleport（防閃爍：tooltip 自己可 hover） -->
    <teleport to="body">
      <transition name="p3-dd-fade">
        <div
          v-if="roomTipOpen && activeRoomCourse"
          class="room-tip"
          ref="roomTipEl"
          :style="roomTipStyle"
          @mouseenter="roomTipHover = true; cancelCloseRoomTip()"
          @mouseleave="roomTipHover = false; scheduleCloseRoomTip()"
          @click.stop
        >
          <div class="room-tip-head">
            <div class="room-tip-title">{{ activeRoomCourse.buildingName || "—" }}</div>
            <div class="room-tip-sub">
              {{ activeRoomCourse.room || "" }}
              <span v-if="roomPinned" class="pin">（已固定）</span>
            </div>
          </div>

          <div v-if="activeRoomCourse.roomImage" class="room-tip-img">
            <img :src="activeRoomCourse.roomImage" alt="教室位置" loading="eager" decoding="async" />
          </div>
          <div v-else class="room-tip-empty">沒有位置圖片</div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { apiGet } from "@/api.js";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "";
const user = useUserStore();
const router = useRouter();

const semester = ref("");
const type = ref("all"); // all | course | room
const keyword = ref("");
const semesterList = ref([]);

const results = ref([]);
const loading = ref(false);
const errorMsg = ref("");
const hasSearched = ref(false);

// ✅ cache
const rawCourses = ref([]);
const deptMap = ref(new Map());
const teacherMap = ref(new Map());
const courseTeachersMap = ref(new Map());

// ✅ 教室 join maps
const courseRoomMap = ref(new Map());
const buildingNameMap = ref(new Map());
const buildingImgMap = ref(new Map());

// ======================
// ✅ Teleport Dropdown：學期
// ======================
const ddOpen = ref(false);
const semesterBtnRef = ref(null);

const semesterMenuStyle = ref({});
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function placeDropdown(btnEl, styleRef, widthMode = "btn") {
  if (!btnEl) return;
  const r = btnEl.getBoundingClientRect();
  const pad = 10;
  const gap = 8;

  const width =
    typeof widthMode === "number"
      ? widthMode
      : widthMode === "btn"
        ? r.width
        : 260;

  let left = r.left;
  let top = r.bottom + gap;

  left = clamp(left, pad, window.innerWidth - pad - width);

  const maxHBelow = window.innerHeight - pad - top;

  const PREFER_H = 145;
  if (maxHBelow < 160) {
    const preferTop = r.top - gap - PREFER_H;
    top = clamp(preferTop, pad, window.innerHeight - pad - 160);
  }

  const maxH = window.innerHeight - pad - top;

  styleRef.value = {
    position: "fixed",
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    maxHeight: `${maxH}px`,
    overflowY: "auto",
    zIndex: 60000,
  };
}


function toggleSemesterDD() {
  ddOpen.value = !ddOpen.value;
  if (ddOpen.value) {
    nextTick(() => placeDropdown(semesterBtnRef.value, semesterMenuStyle, "btn"));
    pageSizeOpen.value = false;
  }
}
function selectSemester(s) {
  semester.value = s;
  ddOpen.value = false;
}
function closeAllDD() {
  ddOpen.value = false;
  pageSizeOpen.value = false;
}

// ======================
// ✅ Teleport Dropdown：每頁
// ======================
const pageSizeList = [10, 20, 50];
const pageSize = ref(10);
const pageSizeOpen = ref(false);
const pageSizeBtnRef = ref(null);
const pageSizeMenuStyle = ref({});

function togglePageSizeDD() {
  pageSizeOpen.value = !pageSizeOpen.value;
  if (pageSizeOpen.value) {
    nextTick(() => placeDropdown(pageSizeBtnRef.value, pageSizeMenuStyle, 220));
    ddOpen.value = false;
  }
}
function pickPageSize(n) {
  pageSize.value = n;
  pageSizeOpen.value = false;
}

// ✅ 點外面關閉
function onDocClick(e) {
  const inDD = e.target.closest?.(".p3-dd");
  const inTeleMenu = e.target.closest?.(".p3-dd-menu-tele");
  if (!inDD && !inTeleMenu) closeAllDD();
}

// ======================
// ✅ 教室 tooltip（防閃爍）
// ======================
const roomTipOpen = ref(false);
const roomPinned = ref(false);
const activeRoomId = ref("");
const activeRoomCourse = ref(null);

const roomTipEl = ref(null);
const roomTipStyle = ref({});
let lastRoomAnchorEl = null;

const roomTipHover = ref(false);
let closeTimer = null;

function roomTitle(c) {
  const b = c?.buildingName ? `${c.buildingName}` : "";
  const r = c?.room ? `${c.room}` : "";
  return [b, r].filter(Boolean).join(" · ") || "—";
}

async function placeRoomTip() {
  await nextTick();
  const tip = roomTipEl.value;
  const anchorEl = lastRoomAnchorEl;
  if (!tip || !anchorEl) return;

  const anchorRect = anchorEl.getBoundingClientRect();
  const pad = 10;
  const gap = 10;
  const tipRect = tip.getBoundingClientRect();

  let left = anchorRect.left + anchorRect.width / 2 - tipRect.width / 2;
  let top = anchorRect.bottom + gap;

  left = clamp(left, pad, window.innerWidth - pad - tipRect.width);

  if (top + tipRect.height > window.innerHeight - pad) {
    top = anchorRect.top - gap - tipRect.height;
  }
  top = clamp(top, pad, window.innerHeight - pad - tipRect.height);

  roomTipStyle.value = { position: "fixed", left: `${left}px`, top: `${top}px` };
}

function cancelCloseRoomTip() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function scheduleCloseRoomTip() {
  if (roomPinned.value) return;
  cancelCloseRoomTip();
  closeTimer = setTimeout(() => {
    if (roomPinned.value) return;
    if (roomTipHover.value) return;
    roomTipOpen.value = false;
    activeRoomId.value = "";
    activeRoomCourse.value = null;
    lastRoomAnchorEl = null;
  }, 120);
}

function openRoomTip(course, evt, byClick) {
  const id = course?.courseID;
  if (!id) return;

  if (!byClick && roomPinned.value) return;

  cancelCloseRoomTip();

  activeRoomId.value = String(id);
  activeRoomCourse.value = course;
  roomTipOpen.value = true;

  if (byClick) roomPinned.value = true;

  lastRoomAnchorEl = evt?.currentTarget || evt?.target || null;
  placeRoomTip();
}

function toggleRoomPinned(course, evt) {
  const id = course?.courseID;
  if (!id) return;

  if (roomTipOpen.value && activeRoomId.value === String(id) && roomPinned.value) {
    roomPinned.value = false;
    scheduleCloseRoomTip();
    return;
  }
  openRoomTip(course, evt, true);
}

function onDocClickRoom(e) {
  if (!roomTipOpen.value) return;
  const inRoom = e.target.closest?.(".room-wrap");
  const inTip = e.target.closest?.(".room-tip");
  if (!inRoom && !inTip) {
    roomPinned.value = false;
    roomTipOpen.value = false;
    activeRoomId.value = "";
    activeRoomCourse.value = null;
    lastRoomAnchorEl = null;
  }
}

const onReflow = () => {
  if (ddOpen.value) placeDropdown(semesterBtnRef.value, semesterMenuStyle, "btn");
  if (pageSizeOpen.value) placeDropdown(pageSizeBtnRef.value, pageSizeMenuStyle, 220);
  if (roomTipOpen.value) placeRoomTip();
};

// ======================
// ✅ 分頁
// ======================
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
  page.value = 1;
});

function prevPage() {
  page.value = Math.max(1, page.value - 1);
}
function nextPage() {
  page.value = Math.min(totalPages.value, page.value + 1);
}

// ======================
// ✅ helper
// ======================
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
  const csNum = Number(courseSemester);
  return csNum === selNum;
}

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

async function fetchRoomMapsOnce() {
  if (courseRoomMap.value.size || buildingNameMap.value.size || buildingImgMap.value.size) return;

  const [classroom, buildings, buildingMaps] = await Promise.all([
    apiGet("/classroom"),
    apiGet("/buildings"),
    apiGet("/buildingMaps"),
  ]);

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

  const bnm = new Map();
  for (const b of buildings || []) {
    const code = String(b.buildingCode ?? "").trim();
    if (!code) continue;
    bnm.set(code, String(b.buildingName ?? "").trim());
  }
  buildingNameMap.value = bnm;

  const bim = new Map();
  for (const m of buildingMaps || []) {
    const code = String(m.buildingCode ?? "").trim();
    if (!code) continue;
    bim.set(code, normalizeImagePath(m.imagePath));
  }
  buildingImgMap.value = bim;
}

function toViewCourse(row) {
  const courseID = String(row.courseID ?? "").trim();

  const deptName = deptMap.value.get(String(row.departmentID)) || "";

  const teacherNames = courseTeachersMap.value.get(String(courseID)) || [];
  const teacherFull = teacherNames.length ? teacherNames.join(" / ") : "";
  const teacherDisplay = teacherNames.length <= 2 ? teacherFull : `${teacherNames[0]} / ${teacherNames[1]} ...`;

  const r = courseRoomMap.value.get(String(courseID)) || null;
  const buildingCode = r?.buildingCode ? String(r.buildingCode).trim() : "";
  const roomNumber = r?.roomNumber ? String(r.roomNumber).trim() : "";
  const roomCode = buildingCode && roomNumber ? `${buildingCode}${roomNumber}` : "";

  const buildingName = buildingCode ? (buildingNameMap.value.get(buildingCode) || `${buildingCode}棟`) : "";
  const roomImage = buildingCode ? (buildingImgMap.value.get(buildingCode) || "") : "";
  const roomDisplay = roomCode || String(row.classroom || "").trim() || "—";

  return {
    courseID,
    dept: deptName,
    name: row.courseName || "",
    grade: row.grade || row.class || "",
    teacher: teacherDisplay,
    teacherFull,
    category: row.courseType || "",
    room: roomDisplay,
    roomCode,
    buildingName,
    roomImage,
    day: normalizeDay(row.DayOfWeek),
    section: row.timesSlot || "",
    __raw: row,
    credit: row.credit ?? row.credits ?? "",
  };
}

// ======================
// ✅ 只載入一次
// ======================
async function ensureLoaded() {
  if (rawCourses.value.length) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    await fetchRoomMapsOnce();

    const [courses, departments, teachers, courseteacher] = await Promise.all([
      apiGet("/courses"),
      apiGet("/departments"),
      apiGet("/teachers"),
      apiGet("/courseteacher"),
    ]);

    rawCourses.value = Array.isArray(courses) ? courses : [];

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

    const dMap = new Map();
    for (const d of departments || []) {
      dMap.set(String(d.departmentID), d.departmentName || "");
    }
    deptMap.value = dMap;

    const tMap = new Map();
    for (const t of teachers || []) {
      tMap.set(String(t.teacherID), t.teacherName || "");
    }
    teacherMap.value = tMap;

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
    semesterList.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("click", onDocClickRoom);
  window.addEventListener("resize", onReflow);
  window.addEventListener("scroll", onReflow, true);
  ensureLoaded();
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("click", onDocClickRoom);
  window.removeEventListener("resize", onReflow);
  window.removeEventListener("scroll", onReflow, true);
  cancelCloseRoomTip();
});

// ======================
// ✅ 查詢
// ======================
async function search() {
  hasSearched.value = true;
  errorMsg.value = "";

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

  let list = rawCourses.value.filter((c) => semesterMatch(c.semester, s)).map(toViewCourse);

  if (!kw) {
    results.value = list;
    return;
  }

  const kwLower = kw.toLowerCase();

  const hitCourse = (c) => String(c.name || "").toLowerCase().includes(kwLower);
  const hitRoom = (c) =>
    String(c.room || "").toLowerCase().includes(kwLower) ||
    String(c.roomCode || "").toLowerCase().includes(kwLower) ||
    String(c.buildingName || "").toLowerCase().includes(kwLower);

  const hitAll = (c) =>
    hitCourse(c) ||
    hitRoom(c) ||
    String(c.dept || "").toLowerCase().includes(kwLower) ||
    String(c.teacherFull || c.teacher || "").toLowerCase().includes(kwLower);

  if (type.value === "course") list = list.filter(hitCourse);
  else if (type.value === "room") list = list.filter(hitRoom);
  else list = list.filter(hitAll);

  results.value = list;
}

function advancedSearch() {
  router.push("/advanced-search");
}
</script>


<style scoped>

  .p3-dd-menu-tele {}

/* ✅ Teleport dropdown 不會被裁切，且跟按鈕同寬 */
.p3-dd-menu-tele{
  position: fixed;
}

/* ✅ room tooltip 防閃爍：tooltip 自己要能吃到 hover */
.room-tip { pointer-events: auto; }


/* ✅ 你的原本 CSS 我保留，只新增/調整必要修正區 */

/* --- 原本 p3-mini-btn.active 等保留 --- */
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

/* 基本容器設定 */
.p3-root {
  position: relative;
  width: 100%;
  padding: clamp(18px, 3.2vw, 42px) clamp(14px, 2.8vw, 34px) clamp(28px, 4vw, 60px);
  color: #eaf2ff;
  background: transparent;
}
.p3-bg-wrapper { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 0; }
.p3-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 52px 52px;
  opacity: 0.35;
  animation: gridMove 18s linear infinite;
}
@keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 52px 52px; } }
.p3-bg-slash { position: absolute; width: min(1200px, 140vw); height: min(1200px, 140vw); right: -40vw; top: -35vw; max-width: 1200px; max-height: 1200px; }

.p3-container { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 32px; position: relative; z-index: 1; }
@media (max-width: 980px) { .p3-container { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .p3-actions { flex-direction: column; } .p3-btn { width: 100%; } }

.p3-hero { padding: 18px 8px; }
.p3-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(30, 50, 80, 0.8);
  border: 1px solid rgba(47, 230, 255, 0.4);
  box-shadow: 0 0 20px rgba(47, 230, 255, 0.15);
  padding: 6px 12px; border-radius: 6px; font-size: 13px;
  color: #fff; font-weight: 600; backdrop-filter: blur(8px);
}
.p3-badge-icon { color: var(--p3-neon); font-size: 14px; }
.p3-title { margin-top: 22px; font-size: clamp(28px, 4vw, 40px); line-height: 1.1; font-weight: 800; letter-spacing: 0.02em; text-shadow: 0 0 25px rgba(47, 230, 255, 0.2); }
.p3-title-sub { display: block; margin-top: 10px; font-size: 14px; font-weight: 600; color: rgba(180, 210, 255, 0.9); letter-spacing: 0.16em; text-transform: uppercase; }
.p3-desc { margin-top: 16px; max-width: 520px; color: rgba(220, 235, 255, 0.9); line-height: 1.7; font-size: clamp(13px, 1.4vw, 16px); }
.p3-meta { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px; }
.p3-chip { display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 12px; background: rgba(30, 50, 80, 0.6); border: 1px solid rgba(255, 255, 255, 0.15); color: rgba(234, 242, 255, 0.9); font-size: 13px; }
.dot { background: var(--p3-neon); box-shadow: 0 0 12px rgba(47, 230, 255, 0.8); width: 6px; height: 6px; border-radius: 50%; }
.dot2 { background: var(--p3-lime); box-shadow: 0 0 12px rgba(106, 255, 212, 0.6); width: 6px; height: 6px; border-radius: 50%; }

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
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--p3-neon), var(--p3-neon2));
  box-shadow: 0 0 25px rgba(47, 230, 255, 0.5);
}
.p3-panel-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 12px; }
.p3-panel-title { font-size: 18px; font-weight: 800; letter-spacing: 0.03em; color: #fff; }
.p3-panel-sub { font-size: 11px; letter-spacing: 0.2em; color: rgba(180, 210, 255, 0.7); text-transform: uppercase; }

.p3-field { margin-top: 18px; }
.p3-label { display: block; font-size: 13px; margin-bottom: 8px; color: rgba(234, 242, 255, 0.8); letter-spacing: 0.05em; font-weight: 600; }

/* Radio */
.p3-radio-row { display: flex; gap: 12px; }
.p3-radio {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer; user-select: none;
  transition: all 0.2s ease;
  flex: 1;
}
.p3-radio input { display: none; }
.radio-indicator { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.3); position: relative; }
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
.p3-radio.active { background: rgba(47, 230, 255, 0.15); border-color: rgba(47, 230, 255, 0.5); }
.p3-radio.active .radio-indicator { border-color: var(--p3-neon); }
.p3-radio.active .radio-indicator::after { opacity: 1; transform: scale(1); }
.p3-radio span { color: #fff; font-size: 14px; font-weight: 500; }

.p3-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .07);
  color: rgba(234, 242, 255, .92);
  outline: none;
}
.p3-input:focus { border-color: rgba(47, 230, 255, .6); box-shadow: 0 0 18px rgba(47, 230, 255, .14); }
.p3-hint { margin-top: 8px; font-size: 12px; color: rgba(180, 210, 255, 0.7); }

/* Buttons */
.p3-actions { margin-top: 28px; display: flex; gap: 16px; }
.p3-btn {
  flex: 1; position: relative;
  padding: 14px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transform: skewX(-12deg);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}
.btn-content {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transform: skewX(12deg);
  font-weight: 800;
  letter-spacing: 0.1em;
  font-size: 15px;
  position: relative;
  z-index: 2;
}
.p3-btn-primary { background: var(--p3-neon); color: #061224; box-shadow: 0 0 20px rgba(47, 230, 255, 0.25); }
.p3-btn-primary:hover {
  transform: skewX(-12deg) translateY(-2px) scale(1.02);
  box-shadow: 0 0 30px rgba(47, 230, 255, 0.5), -4px 4px 0 rgba(124, 92, 255, 0.8);
  background: #fff;
}
.btn-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: skewX(-20deg);
  pointer-events: none;
  z-index: 1;
}
.p3-btn-primary:hover .btn-shine { animation: shineSwipe 0.6s ease; }
@keyframes shineSwipe { 0% { left: -100%; } 100% { left: 200%; } }
.p3-btn-ghost { background: transparent; color: rgba(234, 242, 255, 0.8); border: 2px solid rgba(255, 255, 255, 0.15); }
.p3-btn-ghost:hover { border-color: var(--p3-neon2); color: #fff; box-shadow: inset 0 0 20px rgba(124, 92, 255, 0.2); text-shadow: 0 0 8px rgba(124, 92, 255, 0.8); }
.p3-btn-arrow { transition: transform 0.3s; }
.p3-btn-ghost:hover .p3-btn-arrow { transform: translateX(5px); }

/* Results */
.p3-results-wrap { max-width: 1180px; margin: 48px auto 0; position: relative; z-index: 1; }
.p3-results-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 16px; padding: 0 4px; }
.p3-results-title { font-size: 20px; font-weight: 800; letter-spacing: 0.04em; }
.p3-results-sub { color: rgba(180, 210, 255, 0.7); font-size: 13px; }

.p3-table-wrap {
  background: rgba(25, 40, 70, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.p3-table-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  width: 100%;
}
.p3-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 1100px; }
.p3-table thead tr { background: rgba(255, 255, 255, 0.08); }
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
.p3-table tbody tr:hover { background: rgba(47, 230, 255, 0.1); }
.strong { font-weight: 700; color: #fff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
.center { text-align: center; }

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
.p3-mini-btn span { display: block; transform: skewX(12deg); }
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
.p3-dd { position: relative; width: 100%; }
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
.p3-dd-btn:hover { border-color: rgba(255, 255, 255, 0.35); background: rgba(255, 255, 255, 0.12); }
.p3-dd.open .p3-dd-btn { border-color: rgba(47, 230, 255, 0.6); box-shadow: 0 0 18px rgba(47, 230, 255, 0.18); }
.p3-dd-text { font-size: 14px; font-weight: 700; letter-spacing: 0.03em; }
.p3-dd-caret { font-size: 10px; color: var(--p3-neon); transition: transform 0.2s ease; }
.p3-dd.open .p3-dd-caret { transform: rotate(180deg); }
.p3-dd-menu {
  position: absolute;
  left: 0; right: 0;
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
.p3-dd-item:hover { background: rgba(47, 230, 255, 0.12); border-color: rgba(47, 230, 255, 0.22); }
.p3-dd-item.active {
  background: rgba(47, 230, 255, 0.18);
  border-color: rgba(47, 230, 255, 0.35);
  box-shadow: 0 0 18px rgba(47, 230, 255, 0.12);
}
.p3-dd-empty { padding: 10px 12px; color: rgba(180, 210, 255, 0.7); font-size: 12px; }
.p3-dd-fade-enter-active, .p3-dd-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.p3-dd-fade-enter-from, .p3-dd-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ✅ Pagination */
.p3-pagination{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  border-top: 1px solid rgba(255,255,255,0.10);
  background: rgba(10, 20, 38, 0.35);
}
.p3-page-left, .p3-page-right{ display:flex; align-items:center; gap: 10px; }
.p3-page-label{ color: rgba(180,210,255,0.75); font-size: 13px; font-weight: 800; }
.p3-page-btn{
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.92);
  cursor:pointer;
  font-weight: 900;
}
.p3-page-btn:disabled{ opacity: .35; cursor: default; }
.p3-page-info{ color: rgba(234,242,255,0.88); font-size: 13px; font-weight: 800; }

/* ✅ 小尺寸 dropdown（每頁用） */
.p3-dd-sm{ width: 92px; }
.p3-dd-btn-sm{ padding: 9px 12px; border-radius: 12px; }
.p3-dd-menu-sm{ top: calc(100% + 8px); padding: 8px; border-radius: 12px; }
.p3-dd-menu-sm .p3-dd-item{ padding: 9px 10px; }

/* =========================
   ✅ 教室 tooltip（Teleport + fixed，不裁切）
========================= */
.room-cell { position: relative; }
.room-wrap { position: relative; display: inline-block; }

/* ✅ 避免教室欄位被硬切：ellipsis + title */
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
  max-width: 220px;
}
.room-code{
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.room-btn:hover {
  border-color: rgba(47, 230, 255, 0.28);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}

.room-tip {
  z-index: 30000;
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
</style>
