<template>
  <!-- Overlay：點背景可關閉 + ESC 可關閉 -->
  <div
    class="p3-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="p3-confirm-title"
    @click.self="emit('cancel')"
  >
    <div class="p3-modal-card p3-card">
      <!-- Header -->
      <div class="p3-modal-head">
        <div class="p3-modal-badge">CONFIRM ACTION</div>
        <h2 id="p3-confirm-title" class="p3-modal-title">確認刪除？</h2>
      </div>

      <!-- Body -->
      <p class="p3-modal-desc">
        你確定要刪除帳號
        <span class="p3-username">「{{ target.username }}」</span>
        嗎？
      </p>

      <!-- Actions -->
      <div class="p3-modal-actions">
        <button class="p3-btn p3-btn-ghost p3-btn-wide" @click="emit('cancel')">
          取消
        </button>

        <button class="p3-btn p3-btn-danger p3-btn-wide" @click="emit('confirm')">
          刪除
        </button>
      </div>

      <!-- Hint -->
      <div class="p3-modal-hint">Tip：按 ESC 也可以取消</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  target: { type: Object, required: true },
});

const emit = defineEmits(["cancel", "confirm"]);

function onKeydown(e) {
  if (e.key === "Escape") emit("cancel");
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
/* Overlay */
.p3-modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 80;

  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

/* Card (搭配 persona.css 的 .p3-card) */
.p3-modal-card {
  width: min(440px, 92vw);
  padding: 22px 22px 18px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
}

/* Persona-ish neon frame */
.p3-modal-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(47, 230, 255, 0.55), rgba(148, 123, 255, 0.35), transparent 70%);
  filter: blur(10px);
  opacity: 0.55;
  pointer-events: none;
}

/* Head */
.p3-modal-head {
  position: relative;
  z-index: 1;
  margin-bottom: 12px;
}

.p3-modal-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(234, 242, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(47, 230, 255, 0.22);
}

.p3-modal-title {
  margin-top: 10px;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-shadow: 0 0 18px rgba(47, 230, 255, 0.14);
}

/* Body */
.p3-modal-desc {
  position: relative;
  z-index: 1;
  margin-top: 6px;
  margin-bottom: 16px;
  line-height: 1.7;
  color: rgba(234, 242, 255, 0.86);
  font-weight: 600;
}

.p3-username {
  color: var(--p3-neon);
  text-shadow: 0 0 18px rgba(47, 230, 255, 0.25);
  font-weight: 900;
}

/* Actions */
.p3-modal-actions {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.p3-btn-wide {
  width: 100%;
  justify-content: center;
}

/* Danger button（符合 persona.css 按鈕邏輯，但危險色獨立） */
.p3-btn-danger {
  background: linear-gradient(135deg, rgba(255, 76, 76, 0.95), rgba(255, 120, 120, 0.7));
  color: #1a0b0b;
  box-shadow: 0 8px 24px rgba(255, 76, 76, 0.22);
}

.p3-btn-danger:hover {
  background: #fff;
  box-shadow: 0 10px 34px rgba(255, 76, 76, 0.35), 0 0 12px rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.p3-btn-danger:active {
  transform: skewX(-12deg) scale(0.96);
}

/* Hint */
.p3-modal-hint {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  font-size: 12px;
  color: rgba(180, 200, 230, 0.75);
}
</style>
