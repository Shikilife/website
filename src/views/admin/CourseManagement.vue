<template>
  <div class="w-full">

    <!-- 🔍 搜尋 -->
    <div class="flex items-center mb-6">
      <span class="text-xl font-bold mr-4">查詢課程：</span>
      <input v-model="searchText"
        class="flex-1 border px-4 py-2 rounded-lg" placeholder="請輸入課程名稱" />
      <button class="ml-4 px-6 py-2 bg-[#4B6587] text-white rounded-lg">查詢</button>
    </div>

    <button class="block mx-auto mb-6 px-6 py-2 bg-[#4B6587] text-white rounded-lg">
      新增課程
    </button>

    <!-- 📄 資料表格 -->
    <table class="w-full text-center border-collapse">
      <thead class="bg-[#90A4AE] text-white">
        <tr>
          <th class="p-2 border">系所</th>
          <th class="p-2 border">課程名稱</th>
          <th class="p-2 border">上課人數</th>
          <th class="p-2 border">教師姓名</th>
          <th class="p-2 border">課別</th>
          <th class="p-2 border">學分數</th>
          <th class="p-2 border">星期</th>
          <th class="p-2 border">節次</th>
          <th class="p-2 border">修改</th>
          <th class="p-2 border">刪除</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="c in courses" :key="c.id" class="bg-gray-100">
          <td class="p-2 border">{{ c.dept }}</td>
          <td class="p-2 border">{{ c.name }}</td>
          <td class="p-2 border">{{ c.people }}</td>
          <td class="p-2 border">{{ c.teacher }}</td>
          <td class="p-2 border">{{ c.category }}</td>
          <td class="p-2 border">{{ c.credit }}</td>
          <td class="p-2 border">{{ c.day }}</td>
          <td class="p-2 border">{{ c.section }}</td>

          <td class="p-2 border cursor-pointer">※</td>
          <td class="p-2 border cursor-pointer">⊖</td>
        </tr>
      </tbody>
    </table>

    <p class="text-center text-xl mt-6">查詢成功，共 {{ courses.length }} 筆。</p>

  </div>
</template>

<script setup>
import { ref } from "vue";

const searchText = ref("");

const courses = ref([
  {
    id: 1,
    dept: "-",
    name: "不想上課",
    people: 1000,
    teacher: "-",
    category: "-",
    credit: 100,
    day: "-",
    section: "-",
  }
]);
</script>
