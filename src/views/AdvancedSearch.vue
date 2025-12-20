<!-- src/views/AdvancedSearch.vue -->
<template>
  <main class="adv-root">
    <section class="adv-card">
      <!-- 標題區 -->
      <header class="adv-head">
        <div>
          <h1 class="adv-title">進階課程搜尋</h1>
          <p class="adv-sub">
            透過學年期、系所、節次與課程類型做條件篩選，搭配關鍵字找到最適合的課程。
          </p>
        </div>

        <button class="adv-back-btn" @click="goHome">回課程查詢</button>
      </header>

      <!-- ✅ Loading / Error -->
      <div v-if="loading" class="adv-hint">資料載入中…</div>
      <div v-else-if="errorMsg" class="adv-hint error">載入失敗：{{ errorMsg }}</div>

      <!-- 表單本體 -->
      <div class="adv-form" v-else>
        <!-- 第一排：學年期 -->
        <div class="adv-row">
          <label class="adv-label">學年期</label>
          <div class="adv-field">
            <div class="p3-dd" :class="{ open: dd.semester }">
              <button type="button" class="p3-dd-btn" @click="toggleDD('semester')" :aria-expanded="dd.semester">
                <span class="p3-dd-text">{{ semester || "-- 全部學期 --" }}</span>
                <span class="p3-dd-caret">▼</span>
              </button>

              <transition name="p3-dd-fade">
                <div v-if="dd.semester" class="p3-dd-menu" role="listbox">
                  <button type="button" class="p3-dd-item" :class="{ active: semester === '' }"
                    @click="pick('semester', '')">
                    -- 全部學期 --
                  </button>

                  <button v-for="s in semesterList" :key="s" type="button" class="p3-dd-item"
                    :class="{ active: s === semester }" @click="pick('semester', s)">
                    {{ s }}
                  </button>

                  <div v-if="!semesterList.length" class="p3-dd-empty">目前沒有可選學期</div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- 第二排：系所 + 年級 -->
        <div class="adv-row adv-row-2col">
          <div class="adv-col">
            <label class="adv-label">系所</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.dept }">
                <button type="button" class="p3-dd-btn" @click="toggleDD('dept')" :aria-expanded="dd.dept">
                  <span class="p3-dd-text">{{ dept || "-- 全部系所 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>

                <transition name="p3-dd-fade">
                  <div v-if="dd.dept" class="p3-dd-menu" role="listbox">
                    <button type="button" class="p3-dd-item" :class="{ active: dept === '' }" @click="pick('dept', '')">
                      -- 全部系所 --
                    </button>

                    <button v-for="d in deptList" :key="d" type="button" class="p3-dd-item"
                      :class="{ active: d === dept }" @click="pick('dept', d)">
                      {{ d }}
                    </button>

                    <div v-if="!deptList.length" class="p3-dd-empty">目前沒有可選系所</div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <div class="adv-col">
            <label class="adv-label">年級</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.grade }">
                <button type="button" class="p3-dd-btn" @click="toggleDD('grade')" :aria-expanded="dd.grade">
                  <span class="p3-dd-text">{{ grade || "-- 全部年級 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>

                <transition name="p3-dd-fade">
                  <div v-if="dd.grade" class="p3-dd-menu" role="listbox">
                    <button type="button" class="p3-dd-item" :class="{ active: grade === '' }"
                      @click="pick('grade', '')">
                      -- 全部年級 --
                    </button>

                    <button v-for="g in gradeList" :key="g" type="button" class="p3-dd-item"
                      :class="{ active: g === grade }" @click="pick('grade', g)">
                      {{ g }}
                    </button>

                    <div v-if="!gradeList.length" class="p3-dd-empty">目前沒有可選年級</div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <!-- 第三排：課別 + 節次 -->
        <div class="adv-row adv-row-2col">
          <div class="adv-col">
            <label class="adv-label">課別</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.category }">
                <button type="button" class="p3-dd-btn" @click="toggleDD('category')" :aria-expanded="dd.category">
                  <span class="p3-dd-text">{{ category || "-- 全部課別 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>

                <transition name="p3-dd-fade">
                  <div v-if="dd.category" class="p3-dd-menu" role="listbox">
                    <button type="button" class="p3-dd-item" :class="{ active: category === '' }"
                      @click="pick('category', '')">
                      -- 全部課別 --
                    </button>

                    <button v-for="c in categoryList" :key="c" type="button" class="p3-dd-item"
                      :class="{ active: c === category }" @click="pick('category', c)">
                      {{ c }}
                    </button>

                    <div v-if="!categoryList.length" class="p3-dd-empty">目前沒有可選課別</div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <div class="adv-col">
            <label class="adv-label">節次</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.section }">
                <button type="button" class="p3-dd-btn" @click="toggleDD('section')" :aria-expanded="dd.section">
                  <span class="p3-dd-text">{{ section || "-- 全部節次 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>

                <transition name="p3-dd-fade">
                  <div v-if="dd.section" class="p3-dd-menu" role="listbox">
                    <button type="button" class="p3-dd-item" :class="{ active: section === '' }"
                      @click="pick('section', '')">
                      -- 全部節次 --
                    </button>

                    <button v-for="s in sectionList" :key="s" type="button" class="p3-dd-item"
                      :class="{ active: s === section }" @click="pick('section', s)">
                      {{ s }}
                    </button>

                    <div v-if="!sectionList.length" class="p3-dd-empty">目前沒有可選節次</div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <!-- 第四排：星期 -->
        <div class="adv-row">
          <label class="adv-label">星期</label>
          <div class="adv-field">
            <div class="p3-dd" :class="{ open: dd.weekday }">
              <button type="button" class="p3-dd-btn" @click="toggleDD('weekday')" :aria-expanded="dd.weekday">
                <span class="p3-dd-text">{{ weekday || "-- 全部星期 --" }}</span>
                <span class="p3-dd-caret">▼</span>
              </button>

              <transition name="p3-dd-fade">
                <div v-if="dd.weekday" class="p3-dd-menu" role="listbox">
                  <button type="button" class="p3-dd-item" :class="{ active: weekday === '' }"
                    @click="pick('weekday', '')">
                    -- 全部星期 --
                  </button>

                  <button v-for="w in weekdayList" :key="w" type="button" class="p3-dd-item"
                    :class="{ active: w === weekday }" @click="pick('weekday', w)">
                    {{ w }}
                  </button>

                  <div v-if="!weekdayList.length" class="p3-dd-empty">目前沒有可選星期</div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- 課程內容分類（保留狀態，暫不做篩選） -->
        <div class="adv-row adv-row-full">
          <label class="adv-label">課程內容分類</label>
          <div class="adv-field">
            <div class="adv-checkbox-group">
              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.distance" />
                <span>遠距教學課程</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.hybrid" />
                <span>混合式遠距教學</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.sync" />
                <span>同步遠距教學</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.assist" />
                <span>遠距輔助課程</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.async" />
                <span>非同步遠距教學</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.cross" />
                <span>跨校及跨域</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.english" />
                <span>全英語授課</span>
              </label>

              <button type="button" class="adv-info-btn" @click="showTagHint">ℹ</button>
            </div>
          </div>
        </div>

        <!-- 關鍵字查詢種類 -->
        <div class="adv-row adv-row-full">
          <label class="adv-label">關鍵字查詢</label>
          <div class="adv-field adv-radio-group">
            <label class="adv-radio">
              <input type="radio" v-model="keywordType" value="course" />
              <span>課程名稱</span>
            </label>

            <label class="adv-radio">
              <input type="radio" v-model="keywordType" value="teacher" />
              <span>教師名稱</span>
            </label>
          </div>
        </div>

        <!-- 關鍵字輸入 -->
        <div class="adv-row adv-row-full">
          <label class="adv-label">關鍵字</label>
          <div class="adv-field">
            <input v-model="keyword" class="adv-input" placeholder="請輸入課程名稱或教師姓名"
              @keydown.enter.prevent="startSearch" />
          </div>
        </div>

        <!-- 按鈕列 -->
        <div class="adv-actions">
          <button class="adv-btn adv-btn-primary" @click="startSearch">開始查詢</button>
          <button class="adv-btn adv-btn-ghost" @click="resetFilters">清除條件</button>
          <button class="adv-btn adv-btn-ghost" @click="goHome">回課程查詢</button>
        </div>
      </div>

      <!-- ✅ 查詢結果區 -->
      <div class="adv-results-wrap">
        <div class="adv-results-head">
          <div class="adv-results-title">查詢結果</div>
          <div class="adv-results-sub">
            <template v-if="!hasSearched">尚未查詢</template>
            <template v-else>共 <b>{{ results.length }}</b> 筆</template>
          </div>
        </div>

        <div v-if="hasSearched && results.length === 0" class="adv-empty">
          找不到符合條件的課程
        </div>

        <div v-else-if="results.length > 0" class="adv-table-wrap">
          <div class="adv-table-scroll">
            <table class="adv-table">
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
                <tr v-for="(c, idx) in pagedResults" :key="c.courseID ?? idx">
                  <td>{{ c.dept }}</td>
                  <td class="strong">{{ c.name }}</td>
                  <td>{{ c.grade }}</td>
                  <td>{{ c.teacher }}</td>
                  <td>{{ c.category }}</td>
                  <td>{{ c.room }}</td>
                  <td>{{ c.day }}</td>
                  <td>{{ c.section }}</td>
                  <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                    <button class="adv-mini-btn" :class="{ active: user.isPreselected(c.courseID) }"
                      @click="user.togglePreselect(c)">
                      {{ user.isPreselected(c.courseID) ? "已加入" : "加入" }}
                    </button>
                  </td>

                  <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                    <button class="adv-mini-btn ghost" :class="{ active: user.isFavorite(c.courseID) }"
                      @click="user.toggleFavorite(c)">
                      {{ user.isFavorite(c.courseID) ? "已收藏" : "收藏" }}
                    </button>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
          <div class="adv-pagination">
            <div class="adv-page-left">
              <span class="adv-page-label">每頁</span>

              <select v-model.number="pageSize" class="adv-page-size">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>

              <span class="adv-page-label">筆</span>
            </div>

            <div class="adv-page-right">
              <button class="adv-page-btn" @click="prevPage" :disabled="page <= 1">←</button>

              <span class="adv-page-info">
                第 <b>{{ page }}</b> / <b>{{ totalPages }}</b> 頁
              </span>

              <button class="adv-page-btn" @click="nextPage" :disabled="page >= totalPages">→</button>
            </div>
          </div>

        </div>
      </div>

    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { apiGet } from "@/api";

import { useUserStore } from "@/stores/user";
import { computed, watch } from "vue";

const user = useUserStore();

const router = useRouter();

// ======================
// ✅ 表單 state
// ======================
const semester = ref("");
const dept = ref("");
const grade = ref("");
const category = ref("");
const section = ref("");
const weekday = ref("");

const keywordType = ref("course"); // course | teacher
const keyword = ref("");

// checkbox tags（先保留狀態）
const tags = ref({
  distance: false,
  hybrid: false,
  sync: false,
  assist: false,
  async: false,
  cross: false,
  english: false,
});

// ======================
// ✅ 下拉資料（由 API 推導/整理）
// ======================
const semesterList = ref([]);
const deptList = ref([]);
const gradeList = ref(["一年級", "二年級", "三年級", "四年級"]);
const categoryList = ref([]);
const sectionList = ref(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "A", "B"]);
const weekdayList = ref(["一", "二", "三", "四", "五", "六", "日"]);

// ======================
// ✅ 結果區狀態
// ======================
const results = ref([]);
const hasSearched = ref(false);
const loading = ref(false);
const errorMsg = ref("");
// ======================
// ✅ 分頁（前端切分）
// ======================
const pageSize = ref(10);     // 每頁幾筆：10/20/50
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
function goPage(p) {
  page.value = Math.min(totalPages.value, Math.max(1, p));
}


// ======================
// ✅ cache：一次載入
// ======================
const rawCourses = ref([]);
const deptMap = ref(new Map());            // departmentID -> departmentName
const teacherMap = ref(new Map());         // teacherID -> teacherName
const courseTeachersMap = ref(new Map());  // courseID -> [teacherName...]

// ======================
// ✅ dropdown 開關（全部跟 CourseSearch 一樣的 class：p3-dd）
// ======================
const dd = ref({
  semester: false,
  dept: false,
  grade: false,
  category: false,
  section: false,
  weekday: false,
});

function closeAll() {
  Object.keys(dd.value).forEach((k) => (dd.value[k] = false));
}

function toggleDD(key) {
  const next = !dd.value[key];
  closeAll();
  dd.value[key] = next;
}

function pick(key, value) {
  if (key === "semester") semester.value = value;
  if (key === "dept") dept.value = value;
  if (key === "grade") grade.value = value;
  if (key === "category") category.value = value;
  if (key === "section") section.value = value;
  if (key === "weekday") weekday.value = value;
  dd.value[key] = false;
}

function onDocClick(e) {
  const el = e.target.closest?.(".p3-dd");
  if (!el) closeAll();
}

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));

// ======================
// ✅ 資料處理 helper
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

// "113-2" -> 1132 跟 course.semester(int) 對齊
function semesterMatch(courseSemester, selectedSemester) {
  if (!selectedSemester) return true;
  if (courseSemester == null) return false;

  const selNum = Number(String(selectedSemester).replace("-", ""));
  const csNum = Number(courseSemester);
  return csNum === selNum;
}

// 節次判斷：course.timesSlot 可能是 "2~4" / "2-4" / "2,3,4" / "5~7" / "A"...
function sectionMatch(timesSlot, picked) {
  if (!picked) return true;
  const t = String(timesSlot ?? "").trim();
  if (!t) return false;

  // 直接包含（最保守）
  if (t.includes(picked)) return true;

  // 嘗試抓 range：2~4 / 2-4
  const m = t.match(/(\d+)\s*[-~到]\s*(\d+)/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const p = Number(picked);
    if (!Number.isNaN(p) && !Number.isNaN(a) && !Number.isNaN(b)) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      return p >= lo && p <= hi;
    }
  }

  // 逗號分隔：2,3,4
  const parts = t.split(/[,，\s]+/).map((x) => x.trim()).filter(Boolean);
  return parts.includes(picked);
}

function toViewCourse(row) {
  const courseID = row.courseID;
  const deptName = deptMap.value.get(String(row.departmentID)) || "";

  const teacherNames = courseTeachersMap.value.get(String(courseID)) || [];

  // ✅ 完整：搜尋用
  const teacherFull = teacherNames.length ? teacherNames.join(" / ") : "";

  // ✅ 顯示：超過兩位用 ...
  const teacherDisplay =
    teacherNames.length <= 2
      ? teacherFull
      : `${teacherNames[0]} / ${teacherNames[1]} ...`;

  return {
    courseID,
    dept: deptName,
    name: row.courseName || "",
    grade: row.grade || row.class || "",
    teacher: teacherDisplay,   // ✅ 表格顯示用
    teacherFull: teacherFull,  // ✅ 搜尋用

    category: row.courseType || "",
    room: row.classroom || "",
    day: normalizeDay(row.DayOfWeek),
    section: row.timesSlot || "",
    __raw: row,
    people: row.people ?? "",
    credit: row.credit ?? row.credits ?? "",

  };
}

// ======================
// ✅ 只載入一次：拉 API + 建下拉清單
// ======================
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

    // departments -> Map + deptList
    const dMap = new Map();
    const dSet = new Set();
    for (const d of departments || []) {
      const name = d.departmentName || "";
      dMap.set(String(d.departmentID), name);
      if (name) dSet.add(name);
    }
    deptMap.value = dMap;
    deptList.value = Array.from(dSet).sort((a, b) => a.localeCompare(b, "zh-Hant"));

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

    // semesterList：從 courses.semester 推出
    const semSet = new Set();
    for (const c of rawCourses.value) {
      const s = c.semester;
      if (s == null) continue;
      const num = Number(s);
      if (!Number.isNaN(num) && num >= 1000) {
        const year = Math.floor(num / 10);
        const term = num % 10;
        if (term === 1 || term === 2) semSet.add(`${year}-${term}`);
      }
    }
    semesterList.value = Array.from(semSet).sort((a, b) => b.localeCompare(a));

    // categoryList：從 courses.courseType 推出
    const catSet = new Set();
    for (const c of rawCourses.value) {
      const ct = String(c.courseType ?? "").trim();
      if (ct) catSet.add(ct);
    }
    categoryList.value = Array.from(catSet).sort((a, b) => a.localeCompare(b, "zh-Hant"));
  } catch (e) {
    errorMsg.value = e?.message || "API 連線失敗：請確認 Flask(5000) 與 Vite proxy";
    rawCourses.value = [];
    deptMap.value = new Map();
    teacherMap.value = new Map();
    courseTeachersMap.value = new Map();
    semesterList.value = [];
    deptList.value = [];
    categoryList.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  ensureLoaded();
});

// ======================
// ✅ 查詢：直接在本頁篩出 results
// ======================
async function startSearch() {
  hasSearched.value = true;

  await ensureLoaded();
  if (!rawCourses.value.length) {
    results.value = [];
    return;
  }

  const kw = keyword.value.trim().toLowerCase();

  let list = rawCourses.value
    .filter((c) => semesterMatch(c.semester, semester.value))
    .map(toViewCourse);

  // dept（用 dept 名稱篩）
  if (dept.value) list = list.filter((c) => String(c.dept || "").trim() === dept.value);

  // grade（最保守：包含即可）
  if (grade.value) list = list.filter((c) => String(c.grade || "").includes(grade.value));

  // category
  if (category.value) list = list.filter((c) => String(c.category || "").trim() === category.value);

  // weekday
  if (weekday.value) list = list.filter((c) => String(c.day || "").trim() === weekday.value);

  // section
  if (section.value) list = list.filter((c) => sectionMatch(c.section, section.value));

  // keyword
  if (kw) {
    if (keywordType.value === "teacher") {
      list = list.filter((c) =>
        String(c.teacherFull || c.teacher || "").toLowerCase().includes(kw)
      );
    } else {
      list = list.filter((c) => String(c.name || "").toLowerCase().includes(kw));
    }
  }


  results.value = list;
}

function resetFilters() {
  semester.value = "";
  dept.value = "";
  grade.value = "";
  category.value = "";
  section.value = "";
  weekday.value = "";
  keywordType.value = "course";
  keyword.value = "";
  Object.keys(tags.value).forEach((k) => (tags.value[k] = false));
  results.value = [];
  hasSearched.value = false;
}

function showTagHint() {
  alert("這排分類需要後端提供對應欄位才可精準篩選。你把 /api/courses 回傳欄位貼我，我就幫你接上 ✅");
}

function goHome() {
  router.push("/courses");
}
</script>

<style scoped>
.adv-root {
  min-height: calc(100vh - 72px);
  padding: clamp(18px, 3.2vw, 42px) clamp(14px, 2.8vw, 34px) clamp(28px, 4vw, 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #eaf2ff;
}

.adv-card {
  width: 100%;
  max-width: 1180px;
  background: rgba(10, 24, 44, 0.8);
  border-radius: 18px;
  border: 1px solid rgba(47, 230, 255, 0.22);
  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.42),
    0 0 40px rgba(47, 230, 255, 0.08),
    0 0 26px rgba(124, 92, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 22px 22px 18px;
  position: relative;
}

.adv-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

.adv-title {
  font-size: clamp(22px, 2.4vw, 26px);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.adv-sub {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(159, 179, 204, 0.9);
}

.adv-back-btn {
  padding: 10px 16px;
  border-radius: 14px;
  font-weight: 800;
  letter-spacing: 0.06em;
  font-size: 14px;
  color: rgba(234, 242, 255, 0.92);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(124, 92, 255, 0.22);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.adv-back-btn:hover {
  background: rgba(124, 92, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 0 22px rgba(124, 92, 255, 0.18);
}

.adv-hint {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(47, 230, 255, 0.14);
  color: rgba(180, 210, 255, 0.88);
  font-size: 13px;
}

.adv-hint.error {
  border-color: rgba(255, 120, 120, 0.25);
  color: rgba(255, 210, 210, 0.95);
}

.adv-form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.adv-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.adv-row-2col {
  align-items: flex-start;
}

.adv-row-full {
  align-items: flex-start;
}

.adv-col {
  flex: 1;
}

.adv-label {
  width: 110px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(234, 242, 255, 0.9);
}

.adv-field {
  flex: 1;
}

.adv-input {
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #eaf2ff;
  outline: none;
  font-size: 14px;
}

.adv-input:focus {
  border-color: rgba(63, 169, 245, 0.6);
  box-shadow: 0 0 0 4px rgba(63, 169, 245, 0.18);
}

.adv-input::placeholder {
  color: rgba(159, 179, 204, 0.9);
}

.adv-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
}

.adv-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  cursor: pointer;
}

.adv-checkbox input {
  width: 16px;
  height: 16px;
  accent-color: #3fa9f5;
}

.adv-checkbox span {
  color: rgba(234, 242, 255, 0.9);
}

.adv-info-btn {
  margin-left: 4px;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(124, 92, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.9);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.adv-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.adv-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  font-size: 13px;
}

.adv-radio input {
  width: 16px;
  height: 16px;
  accent-color: #3fa9f5;
}

.adv-radio span {
  color: rgba(234, 242, 255, 0.9);
}

.adv-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.adv-btn {
  min-width: 132px;
  padding: 11px 18px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.adv-btn:active {
  transform: translateY(1px);
}

.adv-btn-primary {
  background: linear-gradient(135deg, rgba(47, 230, 255, 0.95), rgba(51, 183, 255, 0.65));
  color: #07111e;
  border-color: rgba(47, 230, 255, 0.4);
  box-shadow:
    0 18px 40px rgba(47, 230, 255, 0.18),
    0 0 0 1px rgba(124, 92, 255, 0.12);
}

.adv-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 22px 54px rgba(47, 230, 255, 0.28),
    0 0 26px rgba(47, 230, 255, 0.18);
}

.adv-btn-ghost {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.92);
  border-color: rgba(124, 92, 255, 0.28);
}

.adv-btn-ghost:hover {
  background: rgba(124, 92, 255, 0.12);
  box-shadow: 0 0 22px rgba(124, 92, 255, 0.18);
  transform: translateY(-1px);
}

/* ✅ Results */
.adv-results-wrap {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.adv-results-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 12px;
}

.adv-results-title {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.adv-results-sub {
  color: rgba(180, 210, 255, 0.7);
  font-size: 13px;
}

.adv-empty {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(234, 242, 255, 0.88);
  font-size: 13px;
}

.adv-table-wrap {
  border-radius: 16px;
  overflow: hidden; /* ✅ 圓角裁切用 */
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(25, 40, 70, 0.55);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22);
}

/* ✅ 只有 table 橫向滑動 */
.adv-table-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  width: 100%;
}

/* ✅ 表格要夠寬才會出現橫滑 */
.adv-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px; /* ✅ 建議比你現在 860px 更保守 */
  font-size: 14px;
}


.adv-table thead tr {
  background: rgba(255, 255, 255, 0.08);
}

.adv-table th {
  text-align: left;
  padding: 14px 16px;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: rgba(234, 242, 255, 0.88);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
}

.adv-table td {
  padding: 14px 16px;
  color: rgba(234, 242, 255, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.adv-table tbody tr:hover {
  background: rgba(47, 230, 255, 0.10);
}

.strong {
  font-weight: 900;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

/* ✅ RWD */
@media (max-width: 720px) {

  .adv-row,
  .adv-row-2col {
    flex-direction: column;
    align-items: flex-start;
  }

  .adv-label {
    width: auto;
  }

  .adv-actions {
    justify-content: flex-start;
  }
}

/* =========================
   ✅ p3 Dropdown（跟 CourseSearch 一樣）
   ========================= */
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

.center {
  text-align: center;
}

.adv-mini-btn {
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid rgba(47, 230, 255, 0.30);
  background: rgba(47, 230, 255, 0.10);
  color: rgba(234, 242, 255, 0.92);
  font-weight: 900;
  cursor: pointer;
  transition: transform .1s ease, box-shadow .15s ease, background .15s ease;
}

.adv-mini-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(47, 230, 255, 0.14);
}

.adv-mini-btn.ghost {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
}

.adv-mini-btn.active {
  background: var(--p3-neon);
  color: #061224;
  box-shadow: 0 0 16px rgba(47, 230, 255, 0.35);
  border-color: rgba(47, 230, 255, 0.45);
}

.adv-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(10, 20, 38, 0.35);
}

.adv-page-left,
.adv-page-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.adv-page-label {
  color: rgba(180, 210, 255, 0.75);
  font-size: 13px;
  font-weight: 800;
}

.adv-page-size {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.92);
  outline: none;
  font-weight: 900;
}

.adv-page-btn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.92);
  cursor: pointer;
  font-weight: 900;
}

.adv-page-btn:disabled {
  opacity: .35;
  cursor: default;
}

.adv-page-info {
  color: rgba(234, 242, 255, 0.88);
  font-size: 13px;
  font-weight: 800;
}
</style>
