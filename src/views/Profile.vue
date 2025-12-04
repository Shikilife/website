<template>
  <div class="p-10 text-center text-2xl">
    <p class="font-bold mb-6">個人資訊</p>

    <div class="text-xl leading-loose">
      <p>姓名：{{ username }}</p>
      <p>學號：{{ studentId }}</p>
      <p>系所：資訊管理系</p>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const { username, studentId } = storeToRefs(userStore);
</script>
