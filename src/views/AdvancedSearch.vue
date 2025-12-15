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

        <button class="adv-back-btn" @click="goHome">
          回課程查詢
        </button>
      </header>

      <!-- 表單本體 -->
      <div class="adv-form">

        <!-- 第一排：學年期 -->
        <div class="adv-row">
          <label class="adv-label">學年期</label>
          <div class="adv-field">
            <select v-model="semester" class="adv-select">
              <option value="">113 學年度下學期</option>
            </select>
          </div>
        </div>

        <!-- 第二排：系所 + 年級 -->
        <div class="adv-row adv-row-2col">
          <div class="adv-col">
            <label class="adv-label">系所</label>
            <div class="adv-field">
              <select v-model="dept" class="adv-select">
                <option value="">資訊管理系</option>
              </select>
            </div>
          </div>

          <div class="adv-col">
            <label class="adv-label">年級</label>
            <div class="adv-field">
              <select v-model="grade" class="adv-select">
                <option value="">二年級</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 第三排：課別 + 節次 -->
        <div class="adv-row adv-row-2col">
          <div class="adv-col">
            <label class="adv-label">課別</label>
            <div class="adv-field">
              <select v-model="category" class="adv-select">
                <option value="">-- 請選擇課別 --</option>
              </select>
            </div>
          </div>

          <div class="adv-col">
            <label class="adv-label">節次</label>
            <div class="adv-field">
              <select v-model="section" class="adv-select">
                <option value="">-- 請選擇節次 --</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 第四排：星期 -->
        <div class="adv-row">
          <label class="adv-label">星期</label>
          <div class="adv-field">
            <select v-model="weekday" class="adv-select">
              <option value="">-- 請選擇星期 --</option>
            </select>
          </div>
        </div>

        <!-- 課程內容分類 -->
        <div class="adv-row adv-row-full">
          <label class="adv-label">課程內容分類</label>
          <div class="adv-field">
            <div class="adv-checkbox-group">
              <label class="adv-checkbox">
                <input type="checkbox" />
                <span>遠距教學課程</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" />
                <span>混合式遠距教學</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" />
                <span>同步遠距教學</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" />
                <span>遠距輔助課程</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" />
                <span>非同步遠距教學</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" />
                <span>跨校及跨域</span>
              </label>

              <label class="adv-checkbox">
                <input type="checkbox" />
                <span>全英語授課</span>
              </label>

              <button type="button" class="adv-info-btn">
                ℹ
              </button>
            </div>
          </div>
        </div>

        <!-- 關鍵字查詢種類 -->
        <div class="adv-row adv-row-full">
          <label class="adv-label">關鍵字查詢</label>
          <div class="adv-field adv-radio-group">
            <label class="adv-radio">
              <input
                type="radio"
                v-model="keywordType"
                value="course"
              />
              <span>課程名稱</span>
            </label>

            <label class="adv-radio">
              <input
                type="radio"
                v-model="keywordType"
                value="teacher"
              />
              <span>教師名稱</span>
            </label>
          </div>
        </div>

        <!-- 關鍵字輸入 -->
        <div class="adv-row adv-row-full">
          <label class="adv-label">關鍵字</label>
          <div class="adv-field">
            <input
              v-model="keyword"
              class="adv-input"
              placeholder="請輸入課程名稱或教師姓名"
            />
          </div>
        </div>

        <!-- 按鈕列 -->
        <div class="adv-actions">
          <button class="adv-btn adv-btn-primary" @click="startSearch">
            開始查詢
          </button>

          <button class="adv-btn adv-btn-ghost" @click="goHome">
            回課程查詢
          </button>
        </div>
      </div>

      <!-- 小提示 -->
      <p class="adv-note">
        提示：這頁是進階條件搜尋入口，未來可將查詢條件組合後帶到
        <b>結果頁（/advanced-search/result）</b> 再顯示查詢結果表格。
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const semester = ref("");
const dept = ref("");
const grade = ref("");
const category = ref("");
const section = ref("");
const weekday = ref("");

const keywordType = ref("course");
const keyword = ref("");

function startSearch() {
  // 之後你可以把所有條件組成 query 帶去 result 頁
  alert("你按了開始查詢（之後會串 API / 導向結果頁）");
}

function goHome() {
  router.push("/courses");
}
</script>

<style scoped>
.adv-root {
  min-height: calc(100vh - 72px); /* 扣掉上面的 header 高度 */
  padding: clamp(18px, 3.2vw, 42px) clamp(14px, 2.8vw, 34px)
    clamp(28px, 4vw, 60px);
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

/* 標題列 */
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

/* 回首頁按鈕 */
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
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.adv-back-btn:hover {
  background: rgba(124, 92, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 0 22px rgba(124, 92, 255, 0.18);
}

/* 表單本體 */
.adv-form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 每一排 */
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

/* 兩欄排版 */
.adv-col {
  flex: 1;
}

/* 左邊 label */
.adv-label {
  width: 110px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(234, 242, 255, 0.9);
}

/* 右邊內容 */
.adv-field {
  flex: 1;
}

/* 共用輸入/選單風格 */
.adv-select,
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

.adv-select:focus,
.adv-input:focus {
  border-color: rgba(63, 169, 245, 0.6);
  box-shadow: 0 0 0 4px rgba(63, 169, 245, 0.18);
}

.adv-input::placeholder {
  color: rgba(159, 179, 204, 0.9);
}

/* 課程內容分類 checkbox 區 */
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

/* ℹ 按鈕 */
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

/* 關鍵字查詢 radio 區 */
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

/* 按鈕列 */
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
  transition:
    transform 0.08s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.adv-btn:active {
  transform: translateY(1px);
}

/* 主要按鈕 */
.adv-btn-primary {
  background: linear-gradient(
    135deg,
    rgba(47, 230, 255, 0.95),
    rgba(51, 183, 255, 0.65)
  );
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

/* 次要按鈕 */
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

/* 底部提示 */
.adv-note {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(159, 179, 204, 0.92);
}

/* RWD：窄螢幕下 label 改成上面一行 */
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
</style>
