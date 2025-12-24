<template>
  <main class="fav-root">
    <section class="fav-card">
      <!-- 標題列 -->
      <header class="fav-head">
        <div>
          <h1 class="fav-title">我的收藏</h1>
          <p class="fav-sub">
            目前共 <b>{{ count }}</b> 筆收藏課程。
          </p>
        </div>

        <div class="fav-head-actions">
          <button class="fav-btn fav-btn-ghost" @click="backHome">
            回課程查詢
          </button>
          <button
            class="fav-btn fav-btn-danger"
            @click="deleteAll"
            :disabled="count === 0"
          >
            刪除全部
          </button>
        </div>
      </header>

      <!-- 空狀態 -->
      <div v-if="count === 0" class="fav-empty">
        <p class="fav-empty-main">目前尚未收藏任何課程。</p>
        <p class="fav-empty-sub">
          可在課程查詢結果中點選「收藏」，快速建立自己的追蹤清單。
        </p>
      </div>

      <!-- 表格 -->
      <div v-else class="fav-table-wrap">
        <table class="fav-table">
          <thead>
            <tr>
              <th>系所</th>
              <th>課程名稱</th>
              <th>年級</th>
              <th>教師姓名</th>
              <th>課別</th>
              <th>學分數</th>
              <th>地點（地圖）</th>
              <th>星期</th>
              <th>節次</th>
              <th class="center">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in favorites" :key="c.courseID">
              <td>{{ c.dept }}</td>
              <td class="strong">{{ c.name }}</td>
              <td>{{ c.grade }}</td>
              <td :title="c.teacherFull || c.teacher">{{ c.teacher }}</td>
              <td>{{ c.category }}</td>
              <td>{{ c.credit }}</td>

              <!-- ✅ 地點（地圖） -->
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

              <!-- ✅ 每列刪除 -->
              <td class="center">
                <button class="fav-mini-danger" @click="deleteOne(c)">
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機底部 -->
      <div class="fav-bottom">
        <button class="fav-btn fav-btn-ghost" @click="backHome">
          回課程查詢
        </button>
      </div>

      <!-- ✅ 教室 tooltip（Teleport，不被裁切） -->
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
              <div class="room-tip-title">
                {{ activeRoomCourse.buildingName || "—" }}
              </div>
              <div class="room-tip-sub">
                {{ activeRoomCourse.room || "" }}
                <span v-if="roomPinned" class="pin">（已固定）</span>
              </div>
            </div>

            <div v-if="activeRoomCourse.roomImage" class="room-tip-img">
              <img
                :src="activeRoomCourse.roomImage"
                alt="教室位置"
                loading="eager"
                decoding="async"
                @error="onRoomImgError"
              />
            </div>
            <div v-else class="room-tip-empty">沒有位置圖片</div>
          </div>
        </transition>
      </teleport>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const user = useUserStore();

onMounted(async () => {
  if (user.isLoggedIn) {
    await user.afterLoginBootstrap(); // 至少會 loadFavoritesFromDB
  }
  document.addEventListener("click", onDocClickRoom);
  window.addEventListener("resize", onReflow);
  window.addEventListener("scroll", onReflow, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClickRoom);
  window.removeEventListener("resize", onReflow);
  window.removeEventListener("scroll", onReflow, true);
  cancelCloseRoomTip();
});

const favorites = computed(() => user.favorites || []);
const count = computed(() => favorites.value.length);

function backHome() {
  router.push("/courses");
}

async function deleteAll() {
  if (!favorites.value.length) return;
  if (confirm("確定要刪除所有收藏課程？")) {
    await user.deleteAllFavorites?.();
    // 若你 store 沒這個函式，fallback：
    if (!user.deleteAllFavorites && user.favorites) {
      // 不建議直接改 store state，這段只是保險
    }
  }
}

async function deleteOne(c) {
  if (!c) return;
  if (!confirm(`確定要刪除「${c.name}」？`)) return;

  // ✅ 優先用專用 delete
  if (typeof user.deleteFavorite === "function") {
    await user.deleteFavorite(c.courseID);
    return;
  }
  // ✅ 沒有就用 toggleFavorite（你 CourseSearch 就是這樣做的）
  if (typeof user.toggleFavorite === "function") {
    await user.toggleFavorite(c);
  }
}

/* =========================
   ✅ 地圖 tooltip：和 CourseSearch 同邏輯
========================= */
const roomTipOpen = ref(false);
const roomPinned = ref(false);
const activeRoomId = ref("");
const activeRoomCourse = ref(null);

const roomTipEl = ref(null);
const roomTipStyle = ref({});
let lastRoomAnchorEl = null;

const roomTipHover = ref(false);
let closeTimer = null;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

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

  roomTipStyle.value = { position: "fixed", left: `${left}px`, top: `${top}px`, zIndex: 60000 };
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

function onReflow() {
  if (roomTipOpen.value) placeRoomTip();
}

// ✅ 圖片載入失敗時，直接清掉避免一直 broken
function onRoomImgError() {
  if (activeRoomCourse.value) activeRoomCourse.value.roomImage = "";
}
</script>

<style scoped>
.fav-root {
  min-height: calc(100vh - 72px);
  padding: clamp(18px, 3.2vw, 42px) clamp(14px, 2.8vw, 34px) clamp(28px, 4vw, 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #eaf2ff;
}

.fav-card {
  width: 100%;
  max-width: 1180px;
  background: rgba(10, 24, 44, 0.8);
  border-radius: 18px;
  border: 1px solid rgba(47, 230, 255, 0.22);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(10px);
  padding: 22px 22px 20px;
  position: relative;
}

.fav-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
}

.fav-title {
  font-size: clamp(22px, 2.4vw, 26px);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.fav-sub {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(159, 179, 204, 0.9);
}

.fav-head-actions { display: flex; gap: 10px; }

.fav-empty { padding: 26px 10px 22px; text-align: center; }
.fav-empty-main { font-size: 16px; font-weight: 700; }
.fav-empty-sub { margin-top: 8px; font-size: 13px; color: rgba(159, 179, 204, 0.9); }

.fav-table-wrap {
  margin-top: 6px;
  background: rgba(12, 26, 44, 0.75);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.fav-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.fav-table thead tr { background: rgba(255, 255, 255, 0.08); }
.fav-table th {
  text-align: left;
  padding: 12px 12px;
  color: rgba(234, 242, 255, 0.86);
  font-weight: 800;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}
.fav-table td {
  padding: 12px 12px;
  color: rgba(234, 242, 255, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}
.fav-table tbody tr:hover { background: rgba(63, 169, 245, 0.08); }

.strong { font-weight: 800; }
.center { text-align: center; }

.fav-bottom { margin-top: 18px; display: flex; justify-content: flex-end; }

.fav-btn {
  min-width: 132px;
  padding: 9px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 800;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.92);
}
.fav-btn-ghost { border-color: rgba(124, 92, 255, 0.22); }
.fav-btn-danger {
  background: linear-gradient(135deg, rgba(255, 89, 120, 0.98), rgba(205, 68, 102, 0.9));
  color: #fff5f7;
  border-color: rgba(255, 120, 140, 0.88);
}
.fav-btn-danger:disabled { opacity: 0.4; cursor: default; }

/* ✅ 每列刪除按鈕 */
.fav-mini-danger{
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255, 89, 120, 0.20);
  color: rgba(255, 210, 220, 0.95);
  font-weight: 900;
  cursor: pointer;
}
.fav-mini-danger:hover{
  background: rgba(255, 89, 120, 0.34);
  border-color: rgba(255, 120, 140, 0.55);
}

/* ✅ 地點 tooltip */
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
  max-width: 220px;
}
.room-code{
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* tooltip 本體 */
.room-tip {
  pointer-events: auto;
  width: min(420px, 80vw);
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(47, 230, 255, 0.22);
  background: rgba(10, 20, 38, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
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

/* 動畫沿用你 CourseSearch 的 */
.p3-dd-fade-enter-active, .p3-dd-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.p3-dd-fade-enter-from, .p3-dd-fade-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) {
  .fav-head { flex-direction: column; align-items: flex-start; }
  .fav-head-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
  .fav-table-wrap { overflow-x: auto; }
  .fav-table { min-width: 980px; }
  .fav-bottom { justify-content: flex-start; }
}
</style>
