<template>
  <div class="p3-card max-w-xl">

    <!-- 標題 -->
    <h2 class="text-2xl font-extrabold mb-4 tracking-wide">
      匯入課程資料
    </h2>

    <p class="text-sm opacity-80 mb-6">
      請上傳 CSV 或 Excel 檔案，系統將依格式匯入課程資料。
    </p>

    <!-- 檔案選擇區 -->
    <div class="p3-file-wrap mb-6">
      <label class="p3-file-label">
        <input
          type="file"
          class="p3-file-input"
          accept=".csv,.xlsx"
          @change="onFileChange"
        />

        <span class="p3-file-btn">
          📂 選擇檔案
        </span>

        <span class="p3-file-name">
          {{ fileName || "尚未選擇檔案" }}
        </span>
      </label>

      <p class="p3-file-hint">
        建議格式：CSV / XLSX（之後可加入欄位驗證）
      </p>
    </div>

    <!-- 操作按鈕 -->
    <div class="flex gap-4">
      <button
        class="p3-btn p3-btn-primary flex-1"
        :disabled="!file"
        @click="upload"
      >
        上傳課程資料
      </button>

      <button
        class="p3-btn p3-btn-ghost flex-1"
        :disabled="!file"
        @click="preview"
      >
        預覽
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";

/* ========= state ========= */
const file = ref(null);
const fileName = ref("");

/* ========= handlers ========= */
function onFileChange(e) {
  const selected = e.target.files[0];
  if (!selected) return;

  file.value = selected;
  fileName.value = selected.name;

  // 之後串 API / 驗證都用這個 file
  // console.log(file.value);
}

function upload() {
  if (!file.value) return;

  // 🔜 之後這裡接 API
  // const formData = new FormData();
  // formData.append("file", file.value);
  // await axios.post("/api/import-course", formData);

  alert(`已準備上傳：${fileName.value}`);
}

function preview() {
  if (!file.value) return;

  // 🔜 之後可以做 CSV / Excel 預覽
  alert(`預覽檔案：${fileName.value}`);
}
</script>

<style scoped>
/* ===== File Upload (Persona Style) ===== */

.p3-file-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.p3-file-label {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.p3-file-input {
  display: none;
}

/* 霓虹選擇檔案按鈕 */
.p3-file-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: linear-gradient(
    135deg,
    var(--p3-neon),
    var(--p3-accent)
  );
  color: #061224;
  box-shadow:
    0 8px 26px rgba(47, 230, 255, 0.35),
    0 0 18px rgba(47, 230, 255, 0.25);
  transition: transform .15s ease, box-shadow .2s ease;
}

.p3-file-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 14px 40px rgba(47, 230, 255, 0.55),
    0 0 28px rgba(47, 230, 255, 0.35);
}

/* 檔名顯示 */
.p3-file-name {
  font-size: 14px;
  color: rgba(234,242,255,0.9);
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 提示文字 */
.p3-file-hint {
  font-size: 12px;
  color: rgba(159,179,204,0.9);
}

/* disabled 狀態 */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
