<template>
  <div class="w-full min-h-screen bg-white px-10 py-10">

    <!-- 標題 -->
    <p class="text-center text-2xl font-bold mb-10">
      以查詢到 {{ results.length }} 筆資料，共 1 頁。
    </p>

    <!-- 結果表格 -->
    <table class="w-full border-collapse text-lg shadow">
      <thead>
        <tr class="bg-[#4B6587] text-white text-left">
          <th class="p-3 border">系所</th>
          <th class="p-3 border">課程名稱</th>
          <th class="p-3 border">年級</th>
          <th class="p-3 border">上課人數</th>
          <th class="p-3 border">教師姓名</th>
          <th class="p-3 border">課別</th>
          <th class="p-3 border">學分數</th>
          <th class="p-3 border">地點</th>
          <th class="p-3 border">星期</th>
          <th class="p-3 border">節次</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(c, index) in results"
          :key="index"
          class="border hover:bg-gray-100"
        >
          <td class="p-3 border">{{ c.dept }}</td>
          <td class="p-3 border">{{ c.name }}</td>
          <td class="p-3 border">{{ c.grade }}</td>
          <td class="p-3 border">{{ c.people }}</td>
          <td class="p-3 border">{{ c.teacher }}</td>
          <td class="p-3 border">{{ c.category }}</td>
          <td class="p-3 border">{{ c.credit }}</td>
          <td class="p-3 border">{{ c.room }}</td>
          <td class="p-3 border">{{ c.day }}</td>
          <td class="p-3 border">{{ c.section }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 繼續查詢 -->
    <div class="text-center mt-12">
      <button
        @click="goBack"
        class="px-10 py-3 bg-[#4B6587] text-white rounded-lg text-xl shadow hover:bg-[#3b526e]"
      >
        繼續查詢
      </button>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// 之後你會從 API 傳 query 結果過來，這裡先做 DEMO
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
  }
];

// 返回上一頁
function goBack() {
  router.push("/advanced-search");
}
</script>
