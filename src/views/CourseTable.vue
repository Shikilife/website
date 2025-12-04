<template>
  <div class="p-10 flex flex-col items-center">
    <table class="border border-gray-500 w-[95%] text-center text-xl">
      <thead>
        <tr class="bg-gray-300">
          <th class="p-3">節次</th>
          <th class="p-3">時間</th>
          <th class="p-3">星期一</th>
          <th class="p-3">星期二</th>
          <th class="p-3">星期三</th>
          <th class="p-3">星期四</th>
          <th class="p-3">星期五</th>
          <th class="p-3">星期六</th>
          <th class="p-3">星期日</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(p, i) in periods" :key="i">
          <td class="border p-3">{{ p.name }}</td>
          <td class="border p-3">{{ p.time }}</td>

          <td class="border p-6" v-for="d in 7" :key="d"></td>
        </tr>
      </tbody>
    </table>

    <button
      @click="home"
      class="mt-10 px-10 py-3 bg-[#4B6587] text-white rounded-lg text-xl"
    >回首頁</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

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

function home() {
  router.push("/");
}
</script>
