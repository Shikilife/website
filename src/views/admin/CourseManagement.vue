<template>
  <div class="p3-card w-full">

    <!-- 🔍 搜尋列 -->
    <div class="p3-search-row">
      <div class="p3-search-label">查詢課程</div>

      <input
        v-model="searchText"
        class="p3-input"
        placeholder="請輸入課程名稱"
        @keydown.enter="search"
      />

      <button class="p3-btn p3-btn-primary" @click="search">
        搜尋
      </button>
    </div>

    <!-- ➕ 新增 -->
    <div class="p3-actions-center">
      <button class="p3-btn p3-btn-ghost" @click="addCourse">
        ➕ 新增課程
      </button>
    </div>

    <!-- 📄 表格 -->
    <div class="p3-table-wrap">
      <table class="p3-table">
        <thead>
          <tr>
            <th>系所</th>
            <th>課程名稱</th>
            <th>人數</th>
            <th>教師</th>
            <th>課別</th>
            <th>學分</th>
            <th>星期</th>
            <th>節次</th>
            <th class="center">修改</th>
            <th class="center">刪除</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in courses" :key="c.id">
            <td>{{ c.dept }}</td>
            <td class="strong">{{ c.name }}</td>
            <td>{{ c.people }}</td>
            <td>{{ c.teacher }}</td>
            <td>{{ c.category }}</td>
            <td>{{ c.credit }}</td>
            <td>{{ c.day }}</td>
            <td>{{ c.section }}</td>

            <td class="center action" @click="editCourse(c)">
              ✎
            </td>
            <td class="center action danger" @click="deleteCourse(c)">
              ⊖
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 結果 -->
    <p class="p3-result">
      查詢成功，共 <b>{{ courses.length }}</b> 筆
    </p>

  </div>
</template>

<script setup>
import { ref } from "vue";

/* ========= state ========= */
const searchText = ref("");

const courses = ref([
  {
    id: 1,
    dept: "資管系",
    name: "不想上課",
    people: 1000,
    teacher: "？？？",
    category: "選修",
    credit: 3,
    day: "一",
    section: "3-4",
  },
]);

/* ========= actions ========= */
function search() {
  // 🔜 之後改成：
  // axios.get("/api/course", { params: { keyword: searchText.value } })

  console.log("search:", searchText.value);
}

function addCourse() {
  // 🔜 導頁 or 開 Modal
  console.log("add course");
}

function editCourse(course) {
  // 🔜 導頁 /course/edit/:id
  console.log("edit:", course);
}

function deleteCourse(course) {
  // 🔜 開確認 Popup → axios.delete
  console.log("delete:", course);
}
</script>

<style scoped>
/* ===== 搜尋列 ===== */
.p3-search-row {
  display: grid;
  grid-template-columns: 140px 1fr 120px;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.p3-search-label {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

/* ===== 中央操作 ===== */
.p3-actions-center {
  text-align: center;
  margin-bottom: 18px;
}

/* ===== 表格 ===== */
.p3-table-wrap {
  margin-top: 12px;
  background: rgba(12, 26, 44, 0.6);
  border-radius: 16px;
  overflow-x: auto;
}

.p3-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.p3-table th {
  padding: 12px;
  background: rgba(255,255,255,0.08);
  color: rgba(234,242,255,0.9);
  font-weight: 900;
  white-space: nowrap;
}

.p3-table td {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  white-space: nowrap;
}

.p3-table tbody tr:hover {
  background: rgba(47,230,255,0.08);
}

.strong {
  font-weight: 900;
}

.center {
  text-align: center;
}

/* ===== 操作 ===== */
.action {
  cursor: pointer;
  font-weight: 900;
  color: var(--p3-lime);
}

.action:hover {
  text-decoration: underline;
}

.danger {
  color: #ff6b6b;
}

/* ===== 結果 ===== */
.p3-result {
  text-align: center;
  margin-top: 18px;
  font-size: 16px;
  opacity: 0.9;
}
</style>
