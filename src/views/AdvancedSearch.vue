<template>
  <div class="w-full min-h-screen bg-white px-10 py-10">

    <!-- 🔵 搜尋整體區塊 -->
    <div class="flex flex-col items-center">

      <!-- 第一排：學年期 -->
      <div class="flex items-center gap-6 mb-10 w-full max-w-4xl">
        <span class="text-xl font-bold w-24 text-right">學年期：</span>
        <select v-model="semester"
          class="flex-1 border rounded-lg px-4 py-3 text-lg shadow-sm">
          <option value="">113學年度下學期</option>
        </select>
      </div>

      <!-- 第二排：系所、年級 -->
      <div class="flex items-center gap-6 mb-10 w-full max-w-4xl">
        <span class="text-xl font-bold w-24 text-right">系所：</span>
        <select v-model="dept"
          class="flex-1 border rounded-lg px-4 py-3 text-lg shadow-sm">
          <option value="">資管系</option>
        </select>

        <span class="text-xl font-bold w-24 text-right">年級：</span>
        <select v-model="grade"
          class="flex-1 border rounded-lg px-4 py-3 text-lg shadow-sm">
          <option value="">二年級</option>
        </select>
      </div>

      <!-- 第三排：課別、節次 -->
      <div class="flex items-center gap-6 mb-10 w-full max-w-4xl">
        <span class="text-xl font-bold w-24 text-right">課別：</span>
        <select v-model="category"
          class="flex-1 border rounded-lg px-4 py-3 text-lg shadow-sm">
          <option value="">-- 請選擇課別 --</option>
        </select>

        <span class="text-xl font-bold w-24 text-right">節次：</span>
        <select v-model="section"
          class="flex-1 border rounded-lg px-4 py-3 text-lg shadow-sm">
          <option value="">-- 請選擇節次 --</option>
        </select>
      </div>

      <!-- 第四排：星期 -->
      <div class="flex items-center gap-6 mb-10 w-full max-w-4xl">
        <span class="text-xl font-bold w-24 text-right">星期：</span>
        <select v-model="weekday"
          class="flex-1 border rounded-lg px-4 py-3 text-lg shadow-sm">
          <option value="">-- 請選擇星期 --</option>
        </select>
      </div>

      <!-- 課程內容分類 -->
      <div class="flex flex-col mb-8 w-full max-w-4xl">
        <span class="text-xl font-bold mb-3">課程內容分類：</span>

        <div class="flex flex-wrap gap-x-10 gap-y-4 pl-10 text-xl">

          <label class="flex items-center">
            <input type="checkbox" class="w-5 h-5 mr-2" /> 遠距教學課程
          </label>

          <label class="flex items-center">
            <input type="checkbox" class="w-5 h-5 mr-2" /> 混合式遠距教學
          </label>

          <label class="flex items-center">
            <input type="checkbox" class="w-5 h-5 mr-2" /> 同步遠距教學
          </label>

          <label class="flex items-center">
            <input type="checkbox" class="w-5 h-5 mr-2" /> 遠距輔助課程
          </label>

          <label class="flex items-center">
            <input type="checkbox" class="w-5 h-5 mr-2" /> 非同步遠距教學
          </label>

          <label class="flex items-center">
            <input type="checkbox" class="w-5 h-5 mr-2" /> 跨校及跨域
          </label>

          <label class="flex items-center">
            <input type="checkbox" class="w-5 h-5 mr-2" /> 全英語授課
          </label>

          <button class="ml-4 text-gray-600 text-3xl">ℹ</button>

        </div>
      </div>

      <!-- 關鍵字查詢 -->
      <div class="flex items-center gap-4 mb-8 w-full max-w-4xl">
        <span class="text-xl font-bold w-40 text-right">關鍵字查詢：</span>

        <label class="flex items-center text-xl">
          <input type="radio" v-model="keywordType" value="course" class="w-5 h-5 mr-2" />
          課程名稱
        </label>

        <label class="flex items-center text-xl ml-6">
          <input type="radio" v-model="keywordType" value="teacher" class="w-5 h-5 mr-2" />
          教師名稱
        </label>
      </div>

      <!-- 搜尋輸入框 -->
      <div class="w-full max-w-4xl mb-10 flex items-center">
        <input v-model="keyword"
          placeholder="請輸入關鍵字"
          class="flex-1 border px-4 py-3 rounded-lg shadow-sm text-lg" />
      </div>

      <!-- 開始查詢 -->
      <button @click="startSearch"
        class="px-10 py-3 bg-[#4B6587] text-white text-xl rounded-lg shadow hover:bg-[#3b526e] mb-12">
        開始查詢
      </button>

      <!-- ⬅ 回首頁 -->
      <button 
        @click="goHome"
        class="px-10 py-3 bg-gray-400 text-white text-xl rounded-lg shadow hover:bg-gray-500"
      >
        回首頁
      </button>

    </div>

  </div>
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
  alert("你按了開始查詢（之後會串 API）");
}

function goHome() {
  router.push("/courses");
}
</script>
