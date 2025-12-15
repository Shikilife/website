<template>
  <main class="cr-root">
    <section class="cr-card">
      <!-- 標題 + 查詢條件 -->
      <header class="cr-head">
        <div>
          <h1 class="cr-title">課程查詢結果</h1>
          <p class="cr-sub">
            這裡預留給「一般搜尋」的完整結果頁，之後可以加入分頁、排序，以及預選 / 收藏功能。
          </p>
        </div>

        <div class="cr-head-right">
          <div v-if="semester || keyword" class="cr-tag">
            <span class="cr-tag-label">目前條件</span>
            <span v-if="semester">學期：{{ semester }}</span>
            <span v-if="keyword">關鍵字：「{{ keyword }}」</span>
          </div>

          <button class="cr-btn cr-btn-ghost" @click="goBack">
            返回查詢
          </button>
        </div>
      </header>

      <!-- 沒有結果 -->
      <div v-if="results.length === 0" class="cr-empty">
        <p>目前尚未有查詢結果。</p>
        <p class="cr-empty-sub">請回到課程查詢頁重新輸入條件。</p>

        <button class="cr-btn cr-btn-primary" @click="goBack">
          回課程查詢
        </button>
      </div>

      <!-- 有結果：表格 -->
      <div v-else class="cr-table-wrap">
        <table class="cr-table">
          <thead>
            <tr>
              <th>系所</th>
              <th>課程名稱</th>
              <th>年級</th>
              <th>人數</th>
              <th>教師</th>
              <th>課別</th>
              <th>學分數</th>
              <th>地點</th>
              <th>星期</th>
              <th>節次</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(c, index) in results"
              :key="index"
            >
              <td>{{ c.dept }}</td>
              <td class="cr-strong">{{ c.name }}</td>
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

      <!-- 底部資訊 -->
      <footer v-if="results.length" class="cr-footer">
        <div class="cr-footer-info">
          共 <b>{{ results.length }}</b> 筆結果（示意資料，之後可串 API 與分頁）
        </div>

        <button class="cr-btn cr-btn-ghost" @click="goBack">
          重新查詢
        </button>
      </footer>
    </section>
  </main>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

// 之後可以從 /courses 統一 push 過來，例如：router.push({ name: 'CourseResult', query: { keyword, semester } })
const keyword = computed(() => route.query.keyword || "");
const semester = computed(() => route.query.semester || "");

// 🔹 DEMO 用假資料，之後可改成 API 回傳
const results = [
  {
    dept: "資管系",
    name: "資料庫管理系統",
    grade: "2A",
    people: 40,
    teacher: "連中岳",
    category: "專業必修",
    credit: 3,
    room: "F602",
    day: "二",
    section: "2~4",
  },
  {
    dept: "資管系",
    name: "資料庫管理系統",
    grade: "2A",
    people: 40,
    teacher: "連中岳",
    category: "專業必修",
    credit: 3,
    room: "F602",
    day: "二",
    section: "5~7",
  },
];

function goBack() {
  router.push("/courses");
}
</script>

<style scoped>
.cr-root {
  min-height: calc(100vh - 72px); /* 扣掉 header 高度，跟其他頁一致 */
  padding: clamp(18px, 3.2vw, 42px) clamp(14px, 2.8vw, 34px)
    clamp(28px, 4vw, 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #eaf2ff;
}

.cr-card {
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
.cr-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

.cr-title {
  font-size: clamp(22px, 2.4vw, 26px);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.cr-sub {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(159, 179, 204, 0.9);
}

.cr-head-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

/* 查詢條件 tag */
.cr-tag {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(6, 18, 36, 0.92);
  border: 1px solid rgba(47, 230, 255, 0.35);
  font-size: 12px;
  color: rgba(218, 235, 255, 0.96);
}

.cr-tag-label {
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(111, 250, 212, 0.95);
}

/* 沒有結果 */
.cr-empty {
  margin-top: 40px;
  text-align: center;
}

.cr-empty p {
  font-size: 16px;
}

.cr-empty-sub {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(159, 179, 204, 0.9);
}

.cr-empty .cr-btn {
  margin-top: 18px;
}

/* 結果表格 */
.cr-table-wrap {
  margin-top: 10px;
  background: rgba(12, 26, 44, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
}

/* 讓窄螢幕可以左右捲動 */
@media (max-width: 900px) {
  .cr-table-wrap {
    overflow-x: auto;
  }
}

.cr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 860px;
}

.cr-table thead tr {
  background: rgba(255, 255, 255, 0.08);
}

.cr-table th {
  text-align: left;
  padding: 12px 10px;
  color: rgba(234, 242, 255, 0.86);
  letter-spacing: 0.04em;
  font-weight: 800;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.cr-table td {
  padding: 10px 10px;
  color: rgba(234, 242, 255, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.cr-table tbody tr:hover {
  background: rgba(63, 169, 245, 0.08);
}

.cr-strong {
  font-weight: 800;
}

/* footer */
.cr-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(159, 179, 204, 0.9);
}

.cr-footer-info b {
  color: rgba(234, 242, 255, 0.96);
}

/* 按鈕通用 */
.cr-btn {
  min-width: 138px;
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

.cr-btn:active {
  transform: translateY(1px);
}

/* 主要按鈕 */
.cr-btn-primary {
  background: linear-gradient(135deg, rgba(47, 230, 255, 0.96), rgba(51, 183, 255, 0.7));
  color: #061022;
  border-color: rgba(47, 230, 255, 0.4);
  box-shadow:
    0 18px 40px rgba(47, 230, 255, 0.18),
    0 0 0 1px rgba(124, 92, 255, 0.12);
}

.cr-btn-primary:hover {
  box-shadow:
    0 22px 54px rgba(47, 230, 255, 0.28),
    0 0 26px rgba(47, 230, 255, 0.18);
  transform: translateY(-1px);
}

/* 次要按鈕 */
.cr-btn-ghost {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 242, 255, 0.92);
  border-color: rgba(124, 92, 255, 0.22);
}

.cr-btn-ghost:hover {
  background: rgba(124, 92, 255, 0.1);
  box-shadow: 0 0 22px rgba(124, 92, 255, 0.18);
  transform: translateY(-1px);
}

/* RWD */
@media (max-width: 768px) {
  .cr-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .cr-head-right {
    align-items: flex-start;
  }

  .cr-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
