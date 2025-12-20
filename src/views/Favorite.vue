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

      <!-- 若目前沒有收藏：顯示空狀態 -->
      <div v-if="count === 0" class="fav-empty">
        <p class="fav-empty-main">目前尚未收藏任何課程。</p>
        <p class="fav-empty-sub">
          可在課程查詢結果中點選「收藏」，快速建立自己的追蹤清單。
        </p>
      </div>

      <!-- 有收藏時：顯示表格 -->
      <div v-else class="fav-table-wrap">
        <table class="fav-table">
          <thead>
            <tr>
              <th>系所</th>
              <th>課程名稱</th>
              <th>年級</th>
              <th>上課人數</th>
              <th>教師姓名</th>
              <th>課別</th>
              <th>學分數</th>
              <th>地點</th>
              <th>星期</th>
              <th>節次</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(c, index) in favorites" :key="index">
              <td>{{ c.dept }}</td>
              <td class="strong">{{ c.name }}</td>
              <td>{{ c.grade }}</td>
              <td>{{ c.people }}</td>
              <td>{{ c.teacher }}</td>
              <td>{{ c.category }}</td>
              <td>{{ c.credit }}</td>
              <td>{{ c.room }}</td>
              <td>{{ c.day }}</td>
              <td>{{ c.section }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 底部：回首頁（手機版好按一點） -->
      <div class="fav-bottom">
        <button class="fav-btn fav-btn-ghost" @click="backHome">
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
  if (user.isLoggedIn) user.loadCollections();
});

const favorites = computed(() => user.favorites || []);
const count = computed(() => favorites.value.length);

function backHome() {
  router.push("/courses");
}

function deleteAll() {
  if (!favorites.value.length) return;
  if (confirm("確定要刪除所有收藏課程？")) {
    user.favorites = [];
    user._saveCollections();
  }
}
</script>

<style scoped>
.fav-root {
  min-height: calc(100vh - 72px); /* 扣掉上面的 header */
  padding: clamp(18px, 3.2vw, 42px) clamp(14px, 2.8vw, 34px)
    clamp(28px, 4vw, 60px);
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
  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.42),
    0 0 40px rgba(47, 230, 255, 0.08),
    0 0 26px rgba(124, 92, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 22px 22px 20px;
  position: relative;
}

/* 標題列 */
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

.fav-head-actions {
  display: flex;
  gap: 10px;
}

/* 空狀態 */
.fav-empty {
  padding: 26px 10px 22px;
  text-align: center;
  color: rgba(234, 242, 255, 0.9);
}

.fav-empty-main {
  font-size: 16px;
  font-weight: 700;
}

.fav-empty-sub {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(159, 179, 204, 0.9);
}

/* 表格 */
.fav-table-wrap {
  margin-top: 6px;
  background: rgba(12, 26, 44, 0.75);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
}

.fav-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.fav-table thead tr {
  background: rgba(255, 255, 255, 0.08);
}

.fav-table th {
  text-align: left;
  padding: 12px 12px;
  color: rgba(234, 242, 255, 0.86);
  letter-spacing: 0.04em;
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

.fav-table tbody tr:hover {
  background: rgba(63, 169, 245, 0.08);
}

.strong {
  font-weight: 800;
}

/* 底部按鈕（手機版用） */
.fav-bottom {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

/* 通用按鈕 */
.fav-btn {
  min-width: 132px;
  padding: 9px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.15s ease,
    background 0.15s ease,
    opacity 0.15s ease;
}

.fav-btn:active {
  transform: translateY(1px);
}

/* 次要按鈕（灰色玻璃） */
.fav-btn-ghost {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.92);
  border-color: rgba(124, 92, 255, 0.22);
}

.fav-btn-ghost:hover {
  background: rgba(124, 92, 255, 0.1);
  box-shadow: 0 0 22px rgba(124, 92, 255, 0.18);
  transform: translateY(-1px);
}

/* 危險按鈕（刪除） */
.fav-btn-danger {
  background: linear-gradient(
    135deg,
    rgba(255, 89, 120, 0.98),
    rgba(205, 68, 102, 0.9)
  );
  color: #fff5f7;
  border-color: rgba(255, 120, 140, 0.88);
  box-shadow:
    0 18px 40px rgba(255, 99, 132, 0.32),
    0 0 0 1px rgba(255, 160, 180, 0.14);
}

.fav-btn-danger:hover {
  transform: translateY(-1px);
  box-shadow:
    0 22px 54px rgba(255, 99, 132, 0.4),
    0 0 26px rgba(255, 160, 180, 0.24);
}

.fav-btn-danger:disabled {
  opacity: 0.4;
  cursor: default;
  transform: none;
  box-shadow: none;
}

/* RWD */
@media (max-width: 768px) {
  .fav-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .fav-head-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .fav-table-wrap {
    overflow-x: auto;
  }

  .fav-table {
    min-width: 760px;
  }

  .fav-bottom {
    justify-content: flex-start;
  }
}
</style>
