<template>
  <main class="ct-root">
    <section class="ct-card">
      <!-- 標題 & 操作 -->
      <header class="ct-head">
        <div class="min-w-0">
          <h1 class="ct-title">我的課表</h1>
          <p class="ct-sub">
            目前為模擬課表（可放入課程卡片）。之後可從「預選 / 收藏」或 API 自動帶入。
          </p>
        </div>

        <div class="ct-head-actions">
          <button class="ct-btn ct-btn-ghost" @click="goHome">回課程查詢</button>
        </div>
      </header>

      <!-- 週次提示（可選） -->
      <div class="ct-info">
        <span class="ct-pill"><span class="dot"></span> 本週模式</span>
        <span class="ct-pill"><span class="dot dot2"></span> Demo 資料</span>
      </div>

      <!-- 課表 -->
      <div class="ct-table-wrap">
        <table class="ct-table">
          <thead>
            <tr>
              <th class="ct-col-period">節次</th>
              <th class="ct-col-time">時間</th>
              <th v-for="(d, i) in weekdays" :key="i" class="ct-col-day">
                {{ d }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(p, i) in periods" :key="i">
              <td class="ct-cell-time ct-sticky">
                <div class="ct-period">{{ p.name }}</div>
              </td>
              <td class="ct-cell-time ct-sticky2">
                <div class="ct-time">{{ p.time }}</div>
              </td>

              <!-- 7 天 -->
              <td v-for="dayIndex in 7" :key="dayIndex" class="ct-cell-slot">
                <!-- ✅ 只在「起始節次」畫卡片；被 span 覆蓋的格子不畫 -->
                <template v-for="course in getCoursesAt(dayIndex, i)" :key="course.id">
                  <div
                    class="ct-course"
                    :style="courseStyle(course)"
                    :title="courseTitle(course)"
                  >
                    <div class="ct-course-top">
                      <div class="ct-course-name">{{ course.name }}</div>
                      <div class="ct-course-tag">{{ course.dept }}</div>
                    </div>

                    <div class="ct-course-meta">
                      <span class="ct-course-chip">{{ course.teacher }}</span>
                      <span class="ct-course-chip">{{ course.room }}</span>
                      <span class="ct-course-chip">{{ course.credit }} 學分</span>
                    </div>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版底部按鈕 -->
      <div class="ct-bottom">
        <button class="ct-btn ct-btn-ghost w-full" @click="goHome">
          回課程查詢
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

/**
 * periods index = rowIndex
 * 0 -> 第一節, 1 -> 第二節 ...
 */
const periods = [
  { name: "一", time: "08:10~09:00" },
  { name: "二", time: "09:10~10:00" },
  { name: "三", time: "10:10~11:00" },
  { name: "四", time: "11:10~12:00" },
  { name: "五", time: "12:40~13:30" },
  { name: "六", time: "13:40~14:30" },
  { name: "七", time: "14:40~15:30" },
  { name: "八", time: "15:40~16:30" },
  { name: "九", time: "16:40~17:30" },
];

/**
 * ✅ Demo 課程資料（之後串 API 就把這份替換成 API 回來的陣列）
 * day: 1~7（星期一到星期日）
 * start: 起始節次 index（0=一節）
 * span: 佔用幾節（2=連上兩節）
 */
const demoCourses = [
  {
    id: 1,
    day: 2, // 星期二
    start: 1, // 第二節
    span: 3, // 2~4
    name: "資料庫管理系統",
    dept: "資管系",
    teacher: "連中岳",
    room: "F602",
    credit: 3,
    tone: "cyan",
  },
  {
    id: 2,
    day: 1, // 星期一
    start: 7, // 第八節
    span: 2,
    name: "作業系統",
    dept: "資工系",
    teacher: "王老師",
    room: "C301",
    credit: 3,
    tone: "violet",
  },
  {
    id: 3,
    day: 5, // 星期五
    start: 0, // 第一節
    span: 3,
    name: "人工智慧",
    dept: "資工系",
    teacher: "林老師",
    room: "E201",
    credit: 3,
    tone: "lime",
  },
];

/**
 * ✅ 只在該格是「課程起點」時回傳該課程
 * dayIndex: 1~7
 * rowIndex: 0~8
 */
function getCoursesAt(dayIndex, rowIndex) {
  return demoCourses.filter((c) => c.day === dayIndex && c.start === rowIndex);
}

/**
 * ✅ 課程卡片樣式：用 CSS 變數決定顏色 + 用 grid-row 以視覺跨節次
 * 這裡我們用「絕對高度」的方式做跨節次：把卡片高度設為 span * cellHeight
 * cellHeight 由 CSS 的 --ct-row-h 控制
 */
function courseStyle(course) {
  const toneMap = {
    cyan: { a: "var(--p3-neon)", b: "rgba(47,230,255,0.25)" },
    violet: { a: "var(--p3-neon2)", b: "rgba(148,123,255,0.22)" },
    lime: { a: "var(--p3-lime)", b: "rgba(106,255,212,0.18)" },
  };
  const tone = toneMap[course.tone] || toneMap.cyan;

  return {
    "--ct-accent": tone.a,
    "--ct-glow": tone.b,
    height: `calc(var(--ct-row-h) * ${course.span} + (${course.span - 1} * var(--ct-row-gap)))`,
  };
}

function courseTitle(course) {
  return `${course.name}\n${course.dept}｜${course.teacher}\n${course.room}｜${course.credit}學分`;
}

function goHome() {
  router.push("/courses");
}
</script>

<style scoped>
/* ✅ 專屬課表：不要再塞 p3-* 的 CourseSearch CSS，避免互相打架 */

/* root */
.ct-root{
  padding: clamp(16px, 2.4vw, 28px);
  width: 100%;
}

/* card */
.ct-card{
  /* 用 persona.css 的玻璃卡風格當底 */
  background: rgba(30, 50, 80, 0.70);
  border: 1px solid rgba(47, 230, 255, 0.25);
  border-radius: 18px;
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 60px rgba(0,0,0,0.30);
  padding: clamp(14px, 2.2vw, 22px);
  overflow: hidden;
  position: relative;
}

/* subtle neon line */
.ct-card::before{
  content:"";
  position:absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg,
    rgba(47,230,255,0),
    rgba(47,230,255,0.95),
    rgba(148,123,255,0.85),
    rgba(47,230,255,0)
  );
  opacity: .85;
}

/* header */
.ct-head{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  gap: 16px;
  padding-top: 8px;
}

.ct-title{
  font-size: clamp(18px, 2.4vw, 26px);
  font-weight: 900;
  letter-spacing: .06em;
  margin: 0;
  text-shadow: 0 0 18px rgba(47,230,255,0.12);
}

.ct-sub{
  margin: 8px 0 0;
  color: rgba(210, 230, 255, 0.85);
  line-height: 1.6;
  font-size: 13px;
  max-width: 720px;
}

.ct-head-actions{
  flex: 0 0 auto;
}

/* info pills */
.ct-info{
  margin-top: 14px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ct-pill{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(234,242,255,0.88);
  font-size: 12px;
  font-weight: 700;
}

.dot{
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--p3-neon);
  box-shadow: 0 0 12px rgba(47,230,255,0.8);
}
.dot2{
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--p3-lime);
  box-shadow: 0 0 12px rgba(106,255,212,0.6);
}

/* buttons */
.ct-btn{
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 900;
  letter-spacing: .08em;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.92);
  transition: transform .12s ease, box-shadow .18s ease, background .18s ease;
}
.ct-btn:hover{
  transform: translateY(-1px);
  background: rgba(255,255,255,0.10);
  box-shadow: 0 0 18px rgba(47,230,255,0.10);
}
.ct-btn-ghost{
  border-color: rgba(148,123,255,0.25);
}

/* table wrapper */
.ct-table-wrap{
  margin-top: 16px;
  border-radius: 16px;
  overflow: auto; /* ✅ 讓小螢幕可橫滑，避免整頁 overflow */
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(12, 26, 44, 0.45);
}

/* table */
.ct-table{
  width: 100%;
  min-width: 980px; /* ✅ 表格寬度不夠就橫滑，不爆版 */
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;

  /* ✅ 控制跨節次高度 */
  --ct-row-h: 56px;
  --ct-row-gap: 0px;
}

.ct-table thead th{
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(255,255,255,0.08);
  color: rgba(234,242,255,0.90);
  font-weight: 900;
  letter-spacing: .05em;
  padding: 12px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
  white-space: nowrap;
}

.ct-table tbody td{
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* columns */
.ct-col-period{ width: 64px; }
.ct-col-time{ width: 140px; }
.ct-col-day{ min-width: 140px; }

/* time cells */
.ct-cell-time{
  padding: 10px 10px;
  background: rgba(255,255,255,0.04);
  color: rgba(234,242,255,0.88);
  font-weight: 800;
  white-space: nowrap;
}

.ct-period{
  font-size: 14px;
}
.ct-time{
  font-size: 12px;
  color: rgba(190,210,255,0.80);
}

/* sticky left columns (節次/時間) */
.ct-sticky{
  position: sticky;
  left: 0;
  z-index: 1;
  backdrop-filter: blur(8px);
}
.ct-sticky2{
  position: sticky;
  left: 64px;
  z-index: 1;
  backdrop-filter: blur(8px);
}

/* slot cell */
.ct-cell-slot{
  position: relative;
  padding: 10px;
  height: var(--ct-row-h);
  background:
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 100% 100%, 36px 36px;
}

/* course card */
.ct-course{
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;

  border-radius: 14px;
  padding: 10px 10px 10px;
  background: rgba(25, 45, 75, 0.78);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(16px);

  /* neon accent */
  box-shadow:
    0 12px 26px rgba(0,0,0,0.28),
    0 0 0 1px rgba(255,255,255,0.06),
    0 0 18px var(--ct-glow);

  overflow: hidden;
}

.ct-course::before{
  content:"";
  position:absolute;
  left:0; top:0; bottom:0;
  width: 4px;
  background: linear-gradient(180deg, var(--ct-accent), rgba(255,255,255,0));
  opacity: .95;
}

.ct-course-top{
  display:flex;
  align-items:flex-start;
  justify-content: space-between;
  gap: 10px;
}

.ct-course-name{
  font-weight: 900;
  letter-spacing: .02em;
  color: rgba(234,242,255,0.95);
  line-height: 1.25;
  font-size: 13px;
}

.ct-course-tag{
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  color: rgba(234,242,255,0.86);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  padding: 4px 8px;
  border-radius: 999px;
}

.ct-course-meta{
  margin-top: 10px;
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ct-course-chip{
  font-size: 11px;
  font-weight: 800;
  color: rgba(234,242,255,0.86);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  padding: 4px 8px;
  border-radius: 999px;
}

/* bottom */
.ct-bottom{
  margin-top: 14px;
  display:none;
}

@media (max-width: 768px){
  .ct-head-actions{ display:none; }
  .ct-bottom{ display:block; }
}

/* ✅ 手機最小化字級，避免擠爆 */
@media (max-width: 420px){
  .ct-sub{ font-size: 12px; }
}
</style>
