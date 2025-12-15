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

        <div class="p3-field">
          <label class="p3-label">學年期</label>
          <div class="p3-select-wrapper">
            <select v-model="semester" class="p3-select">
              <option value="" disabled selected>-- 請選擇學期 --</option>
              <option v-for="s in semesterList" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="p3-field">
          <label class="p3-label">關鍵字查詢</label>

          <div class="p3-radio-row">
            <label class="p3-radio" :class="{ 'active': type === 'course' }">
              <input type="radio" v-model="type" value="course" />
              <div class="radio-indicator"></div>
              <span>課程名稱</span>
            </label>

            <label class="p3-radio" :class="{ 'active': type === 'teacher' }">
              <input type="radio" v-model="type" value="teacher" />
              <div class="radio-indicator"></div>
              <span>教師名稱</span>
            </label>
          </div>
        </div>

        <div class="p3-field">
          <label class="p3-label">關鍵字</label>
          <input
            v-model="keyword"
            type="text"
            class="p3-input"
            placeholder="例如：資料庫 / 連中岳"
            @keydown.enter="search"
          />
          <div class="p3-hint">
            Tip：按 Enter 也可以直接查詢
          </div>
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

    <div v-if="results.length > 0" class="p3-results-wrap">
      <div class="p3-results-head">
        <div class="p3-results-title">查詢結果</div>
        <div class="p3-results-sub">
          共 <b>{{ results.length }}</b> 筆
        </div>
      </div>

      <div class="p3-table-wrap">
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
              <th v-if="user.isLoggedIn" class="center">預選</th>
              <th v-if="user.isLoggedIn" class="center">收藏</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(c, index) in results" :key="index">
              <td>{{ c.dept }}</td>
              <td class="strong">{{ c.name }}</td>
              <td>{{ c.grade }}</td>
              <td>{{ c.people }}</td>
              <td>{{ c.teacher }}</td>
              <td>{{ c.category }}</td>
              <td>{{ c.room }}</td>
              <td>{{ c.day }}</td>
              <td>{{ c.section }}</td>
              
              <td v-if="user.isLoggedIn" class="center">
                <button class="p3-mini-btn" title="加入預選">
                  <span>加入</span>
                </button>
              </td>
              <td v-if="user.isLoggedIn" class="center">
                <button class="p3-mini-btn ghost" title="加入收藏">
                  <span>收藏</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const user = useUserStore();
const router = useRouter();

const semester = ref("");
const type = ref("course");
const keyword = ref("");
const semesterList = ["112-1", "112-2", "113-1", "113-2"];
const results = ref([]);

function search() {
  if (!keyword.value) {
    alert("請輸入關鍵字");
    return;
  }
  // Demo Data
  results.value = [
    {
      dept: "資管系", name: "資料庫管理系統", grade: "2A", people: 40, teacher: "連中岳",
      category: "專業必修", room: "F602", day: "二", section: "2~4",
    },
    {
      dept: "資管系", name: "資料庫管理系統", grade: "2A", people: 40, teacher: "連中岳",
      category: "專業必修", room: "F602", day: "二", section: "5~7",
    },
  ];
}

function advancedSearch() {
  router.push("/advanced-search");
}
</script>

<style scoped>
/* CourseSearch.vue */

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
  position: absolute; inset: 0; width: 100%; height: 100%;
  overflow: hidden; pointer-events: none; z-index: 0;
}

.p3-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 52px 52px; opacity: 0.35;
  animation: gridMove 18s linear infinite;
}
@keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 52px 52px; } }

.p3-bg-slash {
  position: absolute; width: min(1200px, 140vw); height: min(1200px, 140vw);
  right: -40vw; top: -35vw; max-width: 1200px; max-height: 1200px;
}

/* 佈局 Grid */
.p3-container {
  max-width: 1180px; margin: 0 auto; display: grid;
  grid-template-columns: 1.1fr 0.9fr; gap: 32px; position: relative; z-index: 1;
}
@media (max-width: 980px) { .p3-container { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .p3-actions { flex-direction: column; } .p3-btn { width: 100%; } }

/* Hero 區域 */
.p3-hero { padding: 18px 8px; }

.p3-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(30, 50, 80, 0.8);
  border: 1px solid rgba(47,230,255,0.4);
  box-shadow: 0 0 20px rgba(47,230,255,0.15);
  padding: 6px 12px; border-radius: 6px;
  font-size: 13px; color: #fff; font-weight: 600;
  backdrop-filter: blur(8px);
}
.p3-badge-icon { color: var(--p3-neon); font-size: 14px; }

.p3-title {
  margin-top: 22px; font-size: clamp(28px, 4vw, 40px); line-height: 1.1;
  font-weight: 800; letter-spacing: 0.02em;
  text-shadow: 0 0 25px rgba(47,230,255,0.2);
}
.p3-title-sub {
  display: block; margin-top: 10px; font-size: 14px; font-weight: 600;
  color: rgba(180, 210, 255, 0.9); letter-spacing: 0.16em; text-transform: uppercase;
}
.p3-desc {
  margin-top: 16px; max-width: 520px; color: rgba(220, 235, 255, 0.9);
  line-height: 1.7; font-size: clamp(13px, 1.4vw, 16px);
}
.p3-meta { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px; }
.p3-chip {
  display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px;
  border-radius: 12px;
  background: rgba(30, 50, 80, 0.6);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(234,242,255,0.9); font-size: 13px;
}
.dot { background: var(--p3-neon); box-shadow: 0 0 12px rgba(47,230,255,0.8); width:6px; height:6px; border-radius:50%; }
.dot2 { background: var(--p3-lime); box-shadow: 0 0 12px rgba(106,255,212,0.6); width:6px; height:6px; border-radius:50%; }

/* Panel 區域 */
.p3-panel {
  background: rgba(25, 40, 70, 0.75);
  border: 1px solid rgba(47,230,255,0.25);
  border-radius: 20px; padding: 24px 28px; position: relative;
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08);
  overflow: hidden;
}
.p3-panel::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: linear-gradient(180deg, var(--p3-neon), var(--p3-neon2));
  box-shadow: 0 0 25px rgba(47,230,255,0.5);
}
.p3-panel-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 12px;
}
.p3-panel-title { font-size: 18px; font-weight: 800; letter-spacing: 0.03em; color: #fff; }
.p3-panel-sub { font-size: 11px; letter-spacing: 0.2em; color: rgba(180, 210, 255, 0.7); text-transform: uppercase; }
.p3-field { margin-top: 18px; }
.p3-label {
  display: block; font-size: 13px; margin-bottom: 8px;
  color: rgba(234,242,255,0.8); letter-spacing: 0.05em; font-weight: 600;
}

/* =========================================
   ✅ 修正：下拉選單 (Select) 樣式
   ========================================= */
.p3-select-wrapper { position: relative; width: 100%; }

/* 自定義箭頭 (霓虹色) */
.p3-select-wrapper::after {
  content: "▼"; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  font-size: 10px; color: var(--p3-neon); pointer-events: none;
}

.p3-select {
  width: 100%;
  appearance: none; /* 移除預設醜樣式 */
  -webkit-appearance: none;
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #fff;
  outline: none;
  cursor: pointer;
  transition: all 0.25s ease;
}

.p3-select:hover { border-color: rgba(255, 255, 255, 0.4); background-color: rgba(255, 255, 255, 0.12); }
.p3-select:focus { border-color: var(--p3-neon); box-shadow: 0 0 15px rgba(47, 230, 255, 0.2); }

/* ✅ 解決下拉選單在 Windows/Dark Mode 變白色的問題 */
.p3-select option {
  background-color: #0e1a2b; /* 強制深色背景 */
  color: #fff;
  padding: 10px;
}

/* Radio 按鈕 */
.p3-radio-row { display: flex; gap: 12px; }
.p3-radio {
  display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  cursor: pointer; user-select: none; transition: all 0.2s ease; flex: 1;
}
.p3-radio input { display: none; }
.radio-indicator {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3); position: relative;
}
.radio-indicator::after {
  content: ""; position: absolute; inset: 2px; background: var(--p3-neon);
  border-radius: 50%; opacity: 0; transform: scale(0.5);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.p3-radio.active { background: rgba(47, 230, 255, 0.15); border-color: rgba(47, 230, 255, 0.5); }
.p3-radio.active .radio-indicator { border-color: var(--p3-neon); }
.p3-radio.active .radio-indicator::after { opacity: 1; transform: scale(1); }
.p3-radio span { color: #fff; font-size: 14px; font-weight: 500; }

.p3-hint { margin-top: 8px; font-size: 12px; color: rgba(180, 210, 255, 0.7); }

/* =========================================
   ✅ 按鈕區 (Swag Skew Buttons)
   ========================================= */
.p3-actions { margin-top: 28px; display: flex; gap: 16px; }

/* 基礎按鈕設定：傾斜 + 隱藏溢出 */
.p3-btn {
  flex: 1;
  position: relative;
  padding: 14px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transform: skewX(-12deg); /* 傾斜本體 */
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}
/* 內容轉正：避免文字歪掉 */
.btn-content {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transform: skewX(12deg); /* 反向轉正 */
  font-weight: 800; letter-spacing: 0.1em; font-size: 15px;
  position: relative; z-index: 2;
}

/* Primary Button (Neon Style) */
.p3-btn-primary {
  background: var(--p3-neon);
  color: #061224; /* 深色文字 */
  box-shadow: 0 0 20px rgba(47, 230, 255, 0.25);
}
/* Hover 效果 */
.p3-btn-primary:hover {
  transform: skewX(-12deg) translateY(-2px) scale(1.02);
  box-shadow: 
    0 0 30px rgba(47, 230, 255, 0.5),
    -4px 4px 0 rgba(124, 92, 255, 0.8); /* 錯位陰影 */
  background: #fff; /* 變白 */
}
/* 光束動畫 */
.btn-shine {
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  transform: skewX(-20deg); transition: none; pointer-events: none; z-index: 1;
}
.p3-btn-primary:hover .btn-shine {
  animation: shineSwipe 0.6s ease;
}
@keyframes shineSwipe { 0% { left: -100%; } 100% { left: 200%; } }

/* Ghost Button */
.p3-btn-ghost {
  background: transparent;
  color: rgba(234,242,255,0.8);
  border: 2px solid rgba(255,255,255,0.15);
}
.p3-btn-ghost:hover {
  border-color: var(--p3-neon2); /* 變紫 */
  color: #fff;
  box-shadow: inset 0 0 20px rgba(124, 92, 255, 0.2);
  text-shadow: 0 0 8px rgba(124, 92, 255, 0.8);
}
.p3-btn-arrow { transition: transform 0.3s; }
.p3-btn-ghost:hover .p3-btn-arrow { transform: translateX(5px); }


/* 結果表格的小按鈕 (Mini Swag) */
.p3-mini-btn {
  padding: 6px 14px;
  border-radius: 4px;
  border: none;
  background: rgba(47, 230, 255, 0.15);
  color: var(--p3-neon);
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
  transform: skewX(-12deg); /* 這裡也給它斜一下 */
  transition: all 0.2s;
  box-shadow: 0 0 0 1px rgba(47,230,255,0.3);
}
.p3-mini-btn span { display: block; transform: skewX(12deg); } /* 文字轉正 */

.p3-mini-btn:hover {
  background: var(--p3-neon);
  color: #000;
  box-shadow: 0 0 15px var(--p3-neon);
  transform: skewX(-12deg) translateY(-1px);
}

.p3-mini-btn.ghost {
  box-shadow: 0 0 0 1px rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.8);
  background: transparent;
}
.p3-mini-btn.ghost:hover {
  box-shadow: 0 0 0 1px #fff, 0 0 10px rgba(255,255,255,0.5);
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* Result Table */
.p3-results-wrap { max-width: 1180px; margin: 48px auto 0; position: relative; z-index: 1; }
.p3-results-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 16px; padding: 0 4px; }
.p3-results-title { font-size: 20px; font-weight: 800; letter-spacing: 0.04em; }
.p3-results-sub { color: rgba(180, 210, 255, 0.7); font-size: 13px; }

.p3-table-wrap {
  background: rgba(25, 40, 70, 0.7);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 18px 50px rgba(0,0,0,0.25);
}
.p3-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.p3-table thead tr { background: rgba(255,255,255,0.08); }
.p3-table th { text-align: left; padding: 14px 16px; color: rgba(234,242,255,0.8); letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); white-space: nowrap; }
.p3-table td { padding: 14px 16px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
.p3-table tbody tr:hover { background: rgba(47, 230, 255, 0.1); }
.strong { font-weight: 700; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.3); }
.center { text-align: center; }
</style>