<template>
  <div class="p-10 flex flex-col items-center">

    <p class="text-2xl font-bold mb-10">我的收藏，共 0 筆。</p>

    <table class="border w-[95%] text-center text-xl">
      <thead>
        <tr class="bg-[#6F859A] text-white">
          <th class="p-3">系所</th>
          <th class="p-3">課程名稱</th>
          <th class="p-3">年級</th>
          <th class="p-3">上課人數</th>
          <th class="p-3">教師姓名</th>
          <th class="p-3">課別</th>
          <th class="p-3">學分數</th>
          <th class="p-3">地點</th>
          <th class="p-3">星期</th>
          <th class="p-3">節次</th>
        </tr>
      </thead>
    </table>

    <!-- 按鈕 -->
    <div class="flex gap-16 mt-10">
      <button
        class="px-10 py-3 text-xl bg-[#4B6587] text-white rounded-lg"
        @click="backHome"
      >回首頁</button>

      <button
        class="px-10 py-3 text-xl bg-red-500 text-white rounded-lg"
      >刪除ALL</button>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

function backHome() {
  router.push("/");
}
</script>
