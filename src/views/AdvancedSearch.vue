<!-- src/views/AdvancedSearch.vue -->
<template>
  <main class="adv-root">
    <section class="adv-card">
      <header class="adv-head">
        <div>
          <h1 class="adv-title">進階課程搜尋</h1>
          <p class="adv-sub">
            透過學年期、系所、節次與課程類型做條件篩選，搭配關鍵字找到最適合的課程。
          </p>
        </div>

        <button class="adv-back-btn" @click="goHome">回課程查詢</button>
      </header>

      <div v-if="loading" class="adv-hint">資料載入中…</div>
      <div v-else-if="errorMsg" class="adv-hint error">載入失敗：{{ errorMsg }}</div>

      <div class="adv-form" v-else>
        <!-- 學年期 -->
        <div class="adv-row">
          <label class="adv-label">學年期</label>
          <div class="adv-field">
            <div class="p3-dd" :class="{ open: dd.semester }">
              <button
                ref="semBtn"
                type="button"
                class="p3-dd-btn"
                @click="openDD('semester', semBtn)"
                :aria-expanded="dd.semester"
              >
                <span class="p3-dd-text">{{ semester || "-- 全部學期 --" }}</span>
                <span class="p3-dd-caret">▼</span>
              </button>
            </div>

            <teleport to="body">
              <transition name="p3-dd-fade">
                <div
                  v-if="dd.semester"
                  class="p3-dd-menu p3-dd-menu-tele"
                  :style="ddStyle.semester"
                  role="listbox"
                  @mousedown.stop
                >
                  <button type="button" class="p3-dd-item" :class="{ active: semester === '' }" @click="pick('semester', '')">
                    -- 全部學期 --
                  </button>
                  <button
                    v-for="s in semesterList"
                    :key="s"
                    type="button"
                    class="p3-dd-item"
                    :class="{ active: s === semester }"
                    @click="pick('semester', s)"
                  >
                    {{ s }}
                  </button>
                  <div v-if="!semesterList.length" class="p3-dd-empty">目前沒有可選學期</div>
                </div>
              </transition>
            </teleport>
          </div>
        </div>

        <!-- 系所 + 年級 -->
        <div class="adv-row adv-row-2col">
          <div class="adv-col">
            <label class="adv-label">系所</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.dept }">
                <button
                  ref="deptBtn"
                  type="button"
                  class="p3-dd-btn"
                  @click="openDD('dept', deptBtn)"
                  :aria-expanded="dd.dept"
                >
                  <span class="p3-dd-text">{{ dept || "-- 全部系所 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>
              </div>

              <teleport to="body">
                <transition name="p3-dd-fade">
                  <div
                    v-if="dd.dept"
                    class="p3-dd-menu p3-dd-menu-tele"
                    :style="ddStyle.dept"
                    role="listbox"
                    @mousedown.stop
                  >
                    <button type="button" class="p3-dd-item" :class="{ active: dept === '' }" @click="pick('dept', '')">
                      -- 全部系所 --
                    </button>
                    <button
                      v-for="d in deptList"
                      :key="d"
                      type="button"
                      class="p3-dd-item"
                      :class="{ active: d === dept }"
                      @click="pick('dept', d)"
                    >
                      {{ d }}
                    </button>
                    <div v-if="!deptList.length" class="p3-dd-empty">目前沒有可選系所</div>
                  </div>
                </transition>
              </teleport>
            </div>
          </div>

          <div class="adv-col">
            <label class="adv-label">年級</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.grade }">
                <button
                  ref="gradeBtn"
                  type="button"
                  class="p3-dd-btn"
                  @click="openDD('grade', gradeBtn)"
                  :aria-expanded="dd.grade"
                >
                  <span class="p3-dd-text">{{ grade || "-- 全部年級 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>
              </div>

              <teleport to="body">
                <transition name="p3-dd-fade">
                  <div
                    v-if="dd.grade"
                    class="p3-dd-menu p3-dd-menu-tele"
                    :style="ddStyle.grade"
                    role="listbox"
                    @mousedown.stop
                  >
                    <button type="button" class="p3-dd-item" :class="{ active: grade === '' }" @click="pick('grade', '')">
                      -- 全部年級 --
                    </button>
                    <button
                      v-for="g in gradeList"
                      :key="g"
                      type="button"
                      class="p3-dd-item"
                      :class="{ active: g === grade }"
                      @click="pick('grade', g)"
                    >
                      {{ g }}
                    </button>
                  </div>
                </transition>
              </teleport>
            </div>
          </div>
        </div>

        <!-- 課別 + 節次 -->
        <div class="adv-row adv-row-2col">
          <div class="adv-col">
            <label class="adv-label">課別</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.category }">
                <button
                  ref="catBtn"
                  type="button"
                  class="p3-dd-btn"
                  @click="openDD('category', catBtn)"
                  :aria-expanded="dd.category"
                >
                  <span class="p3-dd-text">{{ category || "-- 全部課別 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>
              </div>

              <teleport to="body">
                <transition name="p3-dd-fade">
                  <div
                    v-if="dd.category"
                    class="p3-dd-menu p3-dd-menu-tele"
                    :style="ddStyle.category"
                    role="listbox"
                    @mousedown.stop
                  >
                    <button type="button" class="p3-dd-item" :class="{ active: category === '' }" @click="pick('category', '')">
                      -- 全部課別 --
                    </button>
                    <button
                      v-for="c in categoryList"
                      :key="c"
                      type="button"
                      class="p3-dd-item"
                      :class="{ active: c === category }"
                      @click="pick('category', c)"
                    >
                      {{ c }}
                    </button>
                  </div>
                </transition>
              </teleport>
            </div>
          </div>

          <div class="adv-col">
            <label class="adv-label">節次</label>
            <div class="adv-field">
              <div class="p3-dd" :class="{ open: dd.section }">
                <button
                  ref="secBtn"
                  type="button"
                  class="p3-dd-btn"
                  @click="openDD('section', secBtn)"
                  :aria-expanded="dd.section"
                >
                  <span class="p3-dd-text">{{ section || "-- 全部節次 --" }}</span>
                  <span class="p3-dd-caret">▼</span>
                </button>
              </div>

              <teleport to="body">
                <transition name="p3-dd-fade">
                  <div
                    v-if="dd.section"
                    class="p3-dd-menu p3-dd-menu-tele"
                    :style="ddStyle.section"
                    role="listbox"
                    @mousedown.stop
                  >
                    <button type="button" class="p3-dd-item" :class="{ active: section === '' }" @click="pick('section', '')">
                      -- 全部節次 --
                    </button>
                    <button
                      v-for="s in sectionList"
                      :key="s"
                      type="button"
                      class="p3-dd-item"
                      :class="{ active: s === section }"
                      @click="pick('section', s)"
                    >
                      {{ s }}
                    </button>
                  </div>
                </transition>
              </teleport>
            </div>
          </div>
        </div>

        <!-- 星期 -->
        <div class="adv-row">
          <label class="adv-label">星期</label>
          <div class="adv-field">
            <div class="p3-dd" :class="{ open: dd.weekday }">
              <button
                ref="weekBtn"
                type="button"
                class="p3-dd-btn"
                @click="openDD('weekday', weekBtn)"
                :aria-expanded="dd.weekday"
              >
                <span class="p3-dd-text">{{ weekday || "-- 全部星期 --" }}</span>
                <span class="p3-dd-caret">▼</span>
              </button>
            </div>

            <teleport to="body">
              <transition name="p3-dd-fade">
                <div
                  v-if="dd.weekday"
                  class="p3-dd-menu p3-dd-menu-tele"
                  :style="ddStyle.weekday"
                  role="listbox"
                  @mousedown.stop
                >
                  <button type="button" class="p3-dd-item" :class="{ active: weekday === '' }" @click="pick('weekday', '')">
                    -- 全部星期 --
                  </button>
                  <button
                    v-for="w in weekdayList"
                    :key="w"
                    type="button"
                    class="p3-dd-item"
                    :class="{ active: w === weekday }"
                    @click="pick('weekday', w)"
                  >
                    {{ w }}
                  </button>
                </div>
              </transition>
            </teleport>
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
                <span>跨校及跨域課程</span>
              </label>
              <label class="adv-checkbox">
                <input type="checkbox" v-model="tags.english" />
                <span>全英語授課</span>
              </label>

              <!-- ✅ 驚嘆號放在「課程內容分類」最後面 -->
              <span class="adv-info-wrap">
                <button
                  ref="tagInfoBtn"
                  type="button"
                  class="adv-info-btn"
                  @click.stop="toggleTagInfoTip"
                  aria-label="課程內容分類說明"
                >
                  !
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- ✅ 關鍵字查詢種類 -->
        <div class="adv-row adv-row-full">
          <label class="adv-label">關鍵字查詢</label>
          <div class="adv-field adv-radio-group">
            <label class="adv-radio"><input type="radio" v-model="keywordType" value="all" /><span>全部</span></label>
            <label class="adv-radio"><input type="radio" v-model="keywordType" value="course" /><span>課程名稱</span></label>
            <label class="adv-radio"><input type="radio" v-model="keywordType" value="room" /><span>教室名稱</span></label>
          </div>
        </div>

        <div class="adv-row adv-row-full">
          <label class="adv-label">關鍵字</label>
          <div class="adv-field">
            <input v-model="keyword" class="adv-input" placeholder="請輸入課程名稱或教室名稱" @keydown.enter.prevent="startSearch" />
          </div>
        </div>

        <div class="adv-actions">
          <button class="adv-btn adv-btn-primary" @click="startSearch">開始查詢</button>
          <button class="adv-btn adv-btn-ghost" @click="resetFilters">清除條件</button>
          <button class="adv-btn adv-btn-ghost" @click="goHome">回課程查詢</button>
        </div>
      </div>

      <!-- ✅ 查詢結果 -->
      <div class="adv-results-wrap">
        <div class="adv-results-head">
          <div class="adv-results-title">查詢結果</div>
          <div class="adv-results-sub">
            <template v-if="!hasSearched">尚未查詢</template>
            <template v-else>共 <b>{{ results.length }}</b> 筆</template>
          </div>
        </div>

        <div v-if="hasSearched && results.length === 0" class="adv-empty">找不到符合條件的課程</div>

        <div v-else-if="results.length > 0" class="adv-table-wrap">
          <div class="adv-table-scroll">
            <table class="adv-table">
              <thead>
                <tr>
                  <th>系所</th>
                  <th>課程名稱</th>
                  <th>年級</th>
                  <th>教師</th>
                  <th>教室</th>
                  <th>課別</th>
                  <th>學分</th>
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

                  <!-- ✅ 教室 tooltip（防閃爍） -->
                  <td class="room-cell">
                    <div class="room-wrap" @mouseenter="openRoomTip(c, $event, false)" @mouseleave="scheduleCloseRoomTip">
                      <button type="button" class="room-btn" @click.stop="toggleRoomPinned(c, $event)">
                        <span class="room-code">{{ c.room || "—" }}</span>
                      </button>
                    </div>
                  </td>

                  <td>{{ c.category }}</td>
                  <td>{{ c.credit || "—" }}</td>
                  <td>{{ c.day }}</td>
                  <td>{{ c.section }}</td>

                  <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                    <button class="adv-mini-btn" :class="{ active: user.isPreselected(c.courseID) }" @click="user.togglePreselect(c)">
                      {{ user.isPreselected(c.courseID) ? "已加入" : "加入" }}
                    </button>
                  </td>

                  <td v-if="user.isLoggedIn && !user.isAdmin" class="center">
                    <button class="adv-mini-btn ghost" :class="{ active: user.isFavorite(c.courseID) }" @click="user.toggleFavorite(c)">
                      {{ user.isFavorite(c.courseID) ? "已收藏" : "收藏" }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分頁 -->
          <div class="adv-pagination">
            <div class="adv-page-left">
              <span class="adv-page-label">每頁</span>

              <!-- ✅ 每頁 dropdown（Teleport） -->
              <div class="p3-dd p3-dd-sm" :class="{ open: pageSizeOpen }">
                <button
                  ref="psBtn"
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

              <span class="adv-page-label">筆</span>
            </div>

            <div class="adv-page-right">
              <button class="adv-page-btn" @click="prevPage" :disabled="page <= 1">←</button>
              <span class="adv-page-info">第 <b>{{ page }}</b> / <b>{{ totalPages }}</b> 頁</span>
              <button class="adv-page-btn" @click="nextPage" :disabled="page >= totalPages">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ✅ 教室 tooltip（hover 不閃） -->
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

    <!-- ✅ "!" 課程內容分類說明 tooltip（Teleport） -->
    <teleport to="body">
      <transition name="p3-dd-fade">
        <div
          v-if="tagInfoTipOpen"
          class="adv-info-tip tag-info-tip"
          ref="tagInfoTipEl"
          :style="tagInfoTipStyle"
          @click.stop
        >
          <div class="adv-info-title">以下是課程內容分類詳細說明：</div>
          <ol class="adv-info-ol">
            <li><b>遠距教學課程</b>：指透過網路進行教學，學生不需到校上課。授課、學習與互動均在線上完成。</li>
            <li><b>混合式遠距教學</b>：結合實體與線上教學的一種方式。部分課程內容在教室進行，部分則透過線上平台完成。</li>
            <li><b>同步遠距教學</b>：教師與學生在相同時間進行線上教學與互動，例如使用視訊會議即時上課。</li>
            <li><b>非同步遠距教學</b>：教師預先錄製教材或上傳課程內容，學生可在不同時間自行觀看與學習。</li>
            <li><b>遠距輔助課程</b>：以實體授課為主，輔以線上教材或討論區等網路學習資源，協助學生預習與複習。</li>
            <li><b>跨校及跨域課程</b>：由多所學校或不同領域合作開設，學生可跨校或跨系選修，以拓展學習範圍。</li>
            <li><b>全英語授課</b>：課程全程以英語進行，包括教材、講授與討論，提升學生的英語溝與專業應用能力。</li>
          </ol>
        </div>
      </transition>
    </teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { apiGet } from "@/api.js";
import { useUserStore } from "@/stores/user";

const user = useUserStore();
const router = useRouter();

// ✅ state
const semester = ref("");
const dept = ref("");
const grade = ref("");
const category = ref("");
const section = ref("");
const weekday = ref("");

const keywordType = ref("all");
const keyword = ref("");

// ✅ tags（保留狀態，不做篩選）
const tags = ref({
  distance: false,
  hybrid: false,
  sync: false,
  assist: false,
  async: false,
  cross: false,
  english: false,
});

// lists
const semesterList = ref([]);
const deptList = ref([]);
const gradeList = ref(["一年級", "二年級", "三年級", "四年級"]);
const categoryList = ref([]);
const sectionList = ref(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "A", "B"]);
const weekdayList = ref(["一", "二", "三", "四", "五", "六", "日"]);

// results
const results = ref([]);
const hasSearched = ref(false);
const loading = ref(false);
const errorMsg = ref("");

// ======================
// ✅ Teleport Dropdown（全部統一）
// ======================
const dd = ref({
  semester: false,
  dept: false,
  grade: false,
  category: false,
  section: false,
  weekday: false,
});

const ddStyle = ref({
  semester: {},
  dept: {},
  grade: {},
  category: {},
  section: {},
  weekday: {},
});

// refs for btn
const semBtn = ref(null);
const deptBtn = ref(null);
const gradeBtn = ref(null);
const catBtn = ref(null);
const secBtn = ref(null);
const weekBtn = ref(null);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function placeDD(btnEl, key) {
  if (!btnEl) return;
  const r = btnEl.getBoundingClientRect();
  const pad = 10;
  const gap = 8;
  const width = r.width;

  let left = r.left;
  let top = r.bottom + gap;
  left = clamp(left, pad, window.innerWidth - pad - width);

  ddStyle.value[key] = {
    position: "fixed",
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    zIndex: 60000,
  };
}

function closeAllDD() {
  Object.keys(dd.value).forEach((k) => (dd.value[k] = false));
}
function openDD(key, btnEl) {
  const next = !dd.value[key];
  closeAllDD();
  dd.value[key] = next;

  if (next) nextTick(() => placeDD(btnEl, key)); // ✅ 這裡不要 .value
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
  // 關 dropdown
  const inDD = e.target.closest?.(".p3-dd");
  const inMenu = e.target.closest?.(".p3-dd-menu-tele");
  if (!inDD && !inMenu) closeAllDD();

  // 關「課程內容分類」info tip
  const inTagInfoBtn = e.target.closest?.(".adv-info-btn");
  const inTagInfoTip = e.target.closest?.(".tag-info-tip");
  if (!inTagInfoBtn && !inTagInfoTip) tagInfoTipOpen.value = false;
}

// ======================
// ✅ "!" 課程內容分類說明 tooltip（Teleport）
// ======================
const tagInfoBtn = ref(null);
const tagInfoTipEl = ref(null);
const tagInfoTipOpen = ref(false);
const tagInfoTipStyle = ref({});

function placeTagInfoTip() {
  const btnEl = tagInfoBtn.value;
  if (!btnEl) return;

  const r = btnEl.getBoundingClientRect();
  const pad = 10;
  const gap = 10;
  const width = Math.min(520, Math.floor(window.innerWidth * 0.86));

  let left = r.left - 12;
  let top = r.bottom + gap;

  left = clamp(left, pad, window.innerWidth - pad - width);

  // 空間不夠就往上翻
  const preferH = 260;
  if (top + preferH > window.innerHeight - pad) {
    top = r.top - gap - preferH;
    top = clamp(top, pad, window.innerHeight - pad - 120);
  }

  tagInfoTipStyle.value = {
    position: "fixed",
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    zIndex: 60000,
  };
}

function toggleTagInfoTip() {
  tagInfoTipOpen.value = !tagInfoTipOpen.value;
  if (tagInfoTipOpen.value) nextTick(placeTagInfoTip);
}

// ======================
// ✅ Pagination
// ======================
const pageSizeList = [10, 20, 50];
const pageSize = ref(10);
const pageSizeOpen = ref(false);
const psBtn = ref(null);
const pageSizeMenuStyle = ref({});

function placePageSizeDD() {
  const btnEl = psBtn.value;
  if (!btnEl) return;

  const r = btnEl.getBoundingClientRect();
  const pad = 10;
  const gap = 8;
  const width = 220;

  let left = r.left;
  let top = r.bottom + gap;

  left = clamp(left, pad, window.innerWidth - pad - width);

  // ✅ 下面可用高度
  let maxH = window.innerHeight - pad - top;

  // ✅ 空間不夠就往上翻
  const MIN_OK = 120;
  const PREFER_H = 160;

  if (maxH < MIN_OK) {
    const preferTop = r.top - gap - PREFER_H;
    top = clamp(preferTop, pad, window.innerHeight - pad - MIN_OK);
    maxH = window.innerHeight - pad - top;
  }

  pageSizeMenuStyle.value = {
    position: "fixed",
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    maxHeight: `${maxH}px`,
    overflowY: "auto",
    zIndex: 60000,
  };
}

function togglePageSizeDD() {
  pageSizeOpen.value = !pageSizeOpen.value;
  if (pageSizeOpen.value) nextTick(placePageSizeDD);
}
function pickPageSize(n) {
  pageSize.value = n;
  pageSizeOpen.value = false;
}

const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(results.value.length / pageSize.value)));
const pagedResults = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return results.value.slice(start, start + pageSize.value);
});
watch([results, pageSize], () => (page.value = 1));
function prevPage() {
  page.value = Math.max(1, page.value - 1);
}
function nextPage() {
  page.value = Math.min(totalPages.value, page.value + 1);
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

function cancelCloseRoomTip() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
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
  if (top + tipRect.height > window.innerHeight - pad) top = anchorRect.top - gap - tipRect.height;
  top = clamp(top, pad, window.innerHeight - pad - tipRect.height);

  roomTipStyle.value = { position: "fixed", left: `${left}px`, top: `${top}px` };
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

// ======================
// ✅ data cache + joins
// ======================
const rawCourses = ref([]);
const deptMap = ref(new Map());
const teacherMap = ref(new Map());
const courseTeachersMap = ref(new Map());

const courseRoomMap = ref(new Map());
const buildingNameMap = ref(new Map());
const buildingImgMap = ref(new Map());

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
  const selNum = Number(String(selectedSemester).replace("-", ""));
  const csNum = Number(courseSemester);
  return csNum === selNum;
}
function sectionMatch(timesSlot, picked) {
  if (!picked) return true;
  const t = String(timesSlot ?? "").trim();
  if (!t) return false;
  if (t.includes(picked)) return true;
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
  const parts = t
    .split(/[,，\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.includes(picked);
}
function normalizeImagePath(p) {
  const raw = String(p || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;

  let cleaned = raw.replace(/\\/g, "/");
  cleaned = cleaned.replace(/^\.?\//, "");
  cleaned = cleaned.replace(/^public\//, "");
  cleaned = cleaned.replace(/^pubilc\//, ""); // typo 保險

  if (!cleaned.startsWith("/")) cleaned = "/" + cleaned;
  return cleaned;
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
    crm.set(cid, { buildingCode: x.buildingCode ?? "", roomNumber: x.roomNumber ?? "" });
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

  const buildingName = buildingCode ? buildingNameMap.value.get(buildingCode) || `${buildingCode}棟` : "";
  const roomImage = buildingCode ? buildingImgMap.value.get(buildingCode) || "" : "";
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
    credit: row.credit ?? row.credits ?? "",
    __raw: row,
  };
}

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

    // dept
    const dMap = new Map();
    const dSet = new Set();
    for (const d of departments || []) {
      const name = d.departmentName || "";
      dMap.set(String(d.departmentID), name);
      if (name) dSet.add(name);
    }
    deptMap.value = dMap;
    deptList.value = Array.from(dSet).sort((a, b) => a.localeCompare(b, "zh-Hant"));

    // teachers
    const tMap = new Map();
    for (const t of teachers || []) tMap.set(String(t.teacherID), t.teacherName || "");
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

    // semesterList
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

    // categoryList
    const catSet = new Set();
    for (const c of rawCourses.value) {
      const ct = String(c.courseType ?? "").trim();
      if (ct) catSet.add(ct);
    }
    categoryList.value = Array.from(catSet).sort((a, b) => a.localeCompare(b, "zh-Hant"));
  } catch (e) {
    errorMsg.value = e?.message || "API 連線失敗：請確認 Flask(5000) 與 Vite proxy";
    rawCourses.value = [];
  } finally {
    loading.value = false;
  }
}

// ✅ reflow
const onReflow = () => {
  // dropdown
  if (dd.value.semester) placeDD(semBtn.value, "semester");
  if (dd.value.dept) placeDD(deptBtn.value, "dept");
  if (dd.value.grade) placeDD(gradeBtn.value, "grade");
  if (dd.value.category) placeDD(catBtn.value, "category");
  if (dd.value.section) placeDD(secBtn.value, "section");
  if (dd.value.weekday) placeDD(weekBtn.value, "weekday");

  if (pageSizeOpen.value) placePageSizeDD();
  if (roomTipOpen.value) placeRoomTip();

  // ✅ tag info tip
  if (tagInfoTipOpen.value) placeTagInfoTip();
};

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

async function startSearch() {
  hasSearched.value = true;
  await ensureLoaded();
  if (!rawCourses.value.length) {
    results.value = [];
    return;
  }

  const kw = keyword.value.trim().toLowerCase();
  let list = rawCourses.value.filter((c) => semesterMatch(c.semester, semester.value)).map(toViewCourse);

  if (dept.value) list = list.filter((c) => String(c.dept || "").trim() === dept.value);
  if (grade.value) list = list.filter((c) => String(c.grade || "").includes(grade.value));
  if (category.value) list = list.filter((c) => String(c.category || "").trim() === category.value);
  if (weekday.value) list = list.filter((c) => String(c.day || "").trim() === weekday.value);
  if (section.value) list = list.filter((c) => sectionMatch(c.section, section.value));

  // tags：保留狀態，不做篩選（你原本的需求）
  // 若未來要做篩選，只要在這裡接上 row 的欄位即可。

  if (kw) {
    const hitCourse = (c) => String(c.name || "").toLowerCase().includes(kw);
    const hitRoom = (c) =>
      String(c.room || "").toLowerCase().includes(kw) ||
      String(c.roomCode || "").toLowerCase().includes(kw) ||
      String(c.buildingName || "").toLowerCase().includes(kw);

    const hitAll = (c) =>
      hitCourse(c) ||
      hitRoom(c) ||
      String(c.dept || "").toLowerCase().includes(kw) ||
      String(c.teacherFull || c.teacher || "").toLowerCase().includes(kw);

    if (keywordType.value === "course") list = list.filter(hitCourse);
    else if (keywordType.value === "room") list = list.filter(hitRoom);
    else list = list.filter(hitAll);
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
  keywordType.value = "all";
  keyword.value = "";
  results.value = [];
  hasSearched.value = false;

  // ✅ tags reset
  tags.value = {
    distance: false,
    hybrid: false,
    sync: false,
    assist: false,
    async: false,
    cross: false,
    english: false,
  };

  closeAllDD();
  pageSizeOpen.value = false;

  roomTipOpen.value = false;
  roomPinned.value = false;
  activeRoomId.value = "";
  activeRoomCourse.value = null;
  lastRoomAnchorEl = null;

  tagInfoTipOpen.value = false;
}

function goHome() {
  router.push("/courses");
}
</script>

<style scoped>
.p3-dd-menu-tele {
  position: fixed;
  max-height: var(--dd-maxh, 260px);
  overflow-y: auto;
}

.room-tip {
  pointer-events: auto;
}

/* --- layout --- */
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
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.42), 0 0 40px rgba(47, 230, 255, 0.08),
    0 0 26px rgba(124, 92, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
  align-items: center;
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
  box-shadow: 0 18px 40px rgba(47, 230, 255, 0.18), 0 0 0 1px rgba(124, 92, 255, 0.12);
}
.adv-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 54px rgba(47, 230, 255, 0.28), 0 0 26px rgba(47, 230, 255, 0.18);
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

/* Results */
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
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(25, 40, 70, 0.55);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22);
}
.adv-table-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  width: 100%;
}
.adv-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
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
  background: rgba(47, 230, 255, 0.1);
}

.strong {
  font-weight: 900;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}
.center {
  text-align: center;
}

.adv-mini-btn {
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid rgba(47, 230, 255, 0.3);
  background: rgba(47, 230, 255, 0.1);
  color: rgba(234, 242, 255, 0.92);
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.15s ease, background 0.15s ease;
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
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  opacity: 0.35;
  cursor: default;
}
.adv-page-info {
  color: rgba(234, 242, 255, 0.88);
  font-size: 13px;
  font-weight: 800;
}

/* p3 Dropdown */
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

/* ✅ "!" tooltip（Teleport + fixed） */
.adv-info-wrap {
  display: inline-flex;
  align-items: center;
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
  font-size: 16px;
  font-weight: 1000;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.adv-info-tip {
  z-index: 30000;
  width: min(520px, 86vw);
  padding: 14px 14px;
  border-radius: 14px;
  border: 1px solid rgba(47, 230, 255, 0.22);
  background: rgba(10, 20, 38, 0.94);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), 0 0 30px rgba(47, 230, 255, 0.12);
}
.adv-info-title {
  font-weight: 1000;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}
.adv-info-ol {
  margin: 0;
  padding: 0;
  counter-reset: item;
  display: grid;
  gap: 10px;
  color: rgba(234, 242, 255, 0.92);
  font-size: 13px;
  line-height: 1.5;
}
.adv-info-ol > li {
  list-style: none;
  position: relative;
  padding-left: 22px;
}
.adv-info-ol > li::before {
  counter-increment: item;
  content: counter(item) ".";
  position: absolute;
  left: 0;
  top: 0;
  color: rgba(47, 230, 255, 0.95);
  font-weight: 1000;
}
.adv-info-ol b {
  color: rgba(255, 255, 255, 0.95);
}

/* ✅ 教室 tooltip（Teleport + fixed） */
.room-cell {
  position: relative;
}
.room-wrap {
  position: relative;
  display: inline-block;
}
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
  z-index: 30000;
  width: min(420px, 80vw);
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(47, 230, 255, 0.22);
  background: rgba(10, 20, 38, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), 0 0 30px rgba(47, 230, 255, 0.12);
}
.room-tip-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
.room-tip-title {
  font-weight: 1000;
  letter-spacing: 0.04em;
}
.room-tip-sub {
  font-size: 12px;
  color: rgba(180, 210, 255, 0.75);
  font-weight: 800;
}
.pin {
  color: rgba(47, 230, 255, 0.9);
}
.room-tip-img {
  max-height: 320px;
  overflow: auto;
  border-radius: 12px;
}
.room-tip-img img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.room-tip-empty {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(180, 210, 255, 0.75);
  font-size: 12px;
  font-weight: 800;
}

/* RWD */
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

.p3-dd-sm {
  width: 92px;
}
.p3-dd-btn-sm {
  padding: 9px 12px;
  border-radius: 12px;
}
.p3-dd-menu-sm {
  top: calc(100% + 8px);
  padding: 8px;
  border-radius: 12px;
}
.p3-dd-menu-sm .p3-dd-item {
  padding: 9px 10px;
}
</style>
