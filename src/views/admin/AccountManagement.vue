<template>
  <div class="w-full">

    <div class="flex items-center mb-6">
      <span class="text-xl font-bold mr-4">查詢帳號：</span>
      <input class="flex-1 border px-4 py-2 rounded-lg" placeholder="請輸入學號" />
      <button class="ml-4 px-6 py-2 bg-[#4B6587] text-white rounded-lg">查詢</button>
    </div>

    <div class="flex gap-4 mb-6">
      <button class="px-6 py-2 bg-[#4B6587] text-white rounded-lg">新增</button>
      <button class="px-6 py-2 bg-gray-400 text-white rounded-lg">刪除</button>
      <button class="px-6 py-2 bg-[#4B6587] text-white rounded-lg">修改</button>
    </div>

    <table class="w-full text-center border-collapse">
      <thead class="bg-[#90A4AE] text-white">
        <tr>
          <th class="p-2 border">※</th>
          <th class="p-2 border">學號</th>
          <th class="p-2 border">性別</th>
          <th class="p-2 border">姓名</th>
          <th class="p-2 border">班級</th>
          <th class="p-2 border">電話</th>
          <th class="p-2 border">地址</th>
          <th class="p-2 border">mail</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="s in students" :key="s.id" class="bg-gray-100">
          <td class="p-2 border">※</td>
          <td class="p-2 border">{{ s.id }}</td>
          <td class="p-2 border">{{ s.gender }}</td>
          <td class="p-2 border">{{ s.name }}</td>
          <td class="p-2 border">{{ s.class }}</td>
          <td class="p-2 border">{{ s.phone }}</td>
          <td class="p-2 border">{{ s.address }}</td>
          <td class="p-2 border">{{ s.email }}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { ref } from "vue";

const students = ref([
  {
    id: "1001",
    gender: "女",
    name: "楊咔咔",
    class: "資四1C",
    phone: "0938501928",
    address: "台北市信義區",
    email: "aa@mail.com",
  },
  {
    id: "1002",
    gender: "女",
    name: "王杯杯",
    class: "資四1C",
    phone: "0912582957",
    address: "台中市西屯區",
    email: "bb@ntunhs.tw",
  }
]);
</script>
