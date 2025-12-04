<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center">
    <div class="bg-white rounded-xl p-10 shadow-xl w-[360px] text-center">

      <h2 class="text-2xl font-bold mb-6">操作成功！</h2>

      <p class="text-lg mb-8">{{ message }}</p>

      <button
        @click="$emit('close')"
        class="w-full py-3 bg-[#4B6587] rounded-lg text-white text-lg hover:bg-[#3d546f]"
      >
        確定
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: "已成功完成操作！" }
})
</script>
