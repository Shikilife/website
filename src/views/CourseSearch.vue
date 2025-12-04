
<template>
  <div class="w-full min-h-screen bg-white px-10 py-10">

    <!-- 🔍 搜尋區塊 -->
    <div class="flex flex-col items-center">

      <!-- 學年期 -->
      <div class="flex items-center gap-6 mb-8">
        <span class="text-xl font-bold">學年期：</span>

        <select
          v-model="semester"
          class="w-[500px] border rounded-lg px-4 py-3 text-lg shadow-sm"
        >
          <option value="">-- 請選擇學期 --</option>
          <option v-for="s in semesterList" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- 關鍵字查詢 -->
      <div class="flex items-center gap-4 mb-4">
        <span class="text-xl font-bold">關鍵字查詢：</span>

        <label class="flex items-center text-xl">
          <input type="radio" v-model="type" value="course" class="w-5 h-5 mr-2" />
          課程名稱
        </label>

        <label class="flex items-center text-xl ml-6">
          <input type="radio" v-model="type" value="teacher" class="w-5 h-5 mr-2" />
          教師名稱
        </label>
      </div>

      <div class="w-[600px] mb-8">
        <input
          v-model="keyword"
          type="text"
          placeholder="請輸入關鍵字"
          class="w-full border px-4 py-3 rounded-lg shadow-sm text-lg"
        />
      </div>

      <!-- 按鈕 -->
      <div class="flex gap-8">

        <!-- 🎯 一般搜尋 -->
        <button
          @click="search"
          class="px-10 py-3 bg-[#4B6587] text-white text-xl rounded-lg shadow hover:bg-[#3b526e]"
        >
          開始查詢
        </button>

        <!-- 🔵 進階搜尋：跳轉至 /advanced-search -->
        <button
          @click="advancedSearch"
          class="px-10 py-3 bg-gray-400 text-white text-xl rounded-lg shadow hover:bg-gray-500"
        >
          進階搜尋
        </button>

      </div>

    </div>

    <!-- 📄 搜尋結果表格（顯示於下方） -->
    <div v-if="results.length > 0" class="mt-16">

      <table class="w-full border-collapse text-lg">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="p-3 border">系所</th>
            <th class="p-3 border">課程名稱</th>
            <th class="p-3 border">年級</th>
            <th class="p-3 border">人數</th>
            <th class="p-3 border">教師</th>
            <th class="p-3 border">課別</th>
            <th class="p-3 border">地點</th>
            <th class="p-3 border">星期</th>
            <th class="p-3 border">節次</th>

            <!-- ⭐ 已登入才顯示 -->
            <th v-if="user.isLoggedIn" class="p-3 border text-center">預選</th>
            <th v-if="user.isLoggedIn" class="p-3 border text-center">收藏</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(c, index) in results"
            :key="index"
            class="hover:bg-gray-100"
          >
            <td class="p-3 border">{{ c.dept }}</td>
            <td class="p-3 border">{{ c.name }}</td>
            <td class="p-3 border">{{ c.grade }}</td>
            <td class="p-3 border">{{ c.people }}</td>
            <td class="p-3 border">{{ c.teacher }}</td>
            <td class="p-3 border">{{ c.category }}</td>
            <td class="p-3 border">{{ c.room }}</td>
            <td class="p-3 border">{{ c.day }}</td>
            <td class="p-3 border">{{ c.section }}</td>

            <!-- ⭐ 已登入才顯示 -->
            <td v-if="user.isLoggedIn" class="p-3 border text-center text-blue-600 cursor-pointer">
              加入
            </td>

            <td v-if="user.isLoggedIn" class="p-3 border text-center text-blue-600 cursor-pointer">
              加入
            </td>

          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const user = useUserStore();
const router = useRouter();

// 搜尋欄位
const semester = ref("");
const type = ref("course");
const keyword = ref("");

// 學期 options
const semesterList = ["112-1", "112-2", "113-1", "113-2"];

// 搜尋結果
const results = ref([]);

// 🔍 一般搜尋
function search() {
  if (!keyword.value) {
    alert("請輸入關鍵字");
    return;
  }

  // ⚠ demo 資料（之後改 API）
  results.value = [
    {
      dept: "資管系",
      name: "資料庫管理系統",
      grade: "2A",
      people: 40,
      teacher: "連中岳",
      category: "專業必修",
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
      room: "F602",
      day: "二",
      section: "5~7",
    }
  ];
}

// 🔵 進階搜尋 → 跳轉
function advancedSearch() {
  router.push("/advanced-search");
}
</script>
