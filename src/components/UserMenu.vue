<template>
  <div class="p3-menu" role="menu" aria-label="User menu">
    <!-- 共用：所有登入者都有 -->
    <button class="p3-item" @click="go('/profile')" role="menuitem">
      <span class="p3-item-dot"></span>
      個人資訊
    </button>

    <!-- ✅ 學生專屬 -->
    <template v-if="!user.isAdmin">
      <button class="p3-item" @click="go('/coursetable')" role="menuitem">
        <span class="p3-item-dot"></span>
        課表
      </button>

      <button class="p3-item" @click="go('/favorites')" role="menuitem">
        <span class="p3-item-dot"></span>
        我的收藏
      </button>

      <div class="p3-divider" aria-hidden="true"></div>
    </template>

    <!-- ✅ 管理者專屬 -->
    <template v-else>
      <button class="p3-item" @click="go('/admin')" role="menuitem">
        <span class="p3-item-dot"></span>
        管理者課程
      </button>

      <div class="p3-divider" aria-hidden="true"></div>
    </template>

    <button class="p3-item p3-item-danger" @click="logoutUser" role="menuitem">
      <span class="p3-item-dot p3-item-dot-danger"></span>
      登出
    </button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const user = useUserStore();

// ✅ 多加一個 open-auth 事件：通知 App.vue 打開 AuthModal
const emit = defineEmits(["close", "open-auth"]);

function go(path) {
  router.push(path);
  emit("close");
}

// ✅ 登出後：關選單 → 回到 /courses(或/) → 叫 App.vue 打開 AuthModal
async function logoutUser() {
  await user.logout(); // ✅ 用 store action（mock / 真 API 都會走這裡）

  emit("close");

  // 你想回到哪裡都可以：建議 /courses 比 / 更一致（看你路由）
  router.push("/courses");

  // ✅ 重點：讓 App.vue 幫你把登入視窗打開
  emit("open-auth");
}
</script>

<style scoped>
/* 你的 style 原封不動保留 */
.p3-menu{
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 220px;
  border-radius: 16px;
  padding: 10px;
  z-index: 60;

  background: rgba(30, 50, 80, 0.78);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(47, 230, 255, 0.28);

  box-shadow:
    0 18px 60px rgba(0,0,0,0.38),
    0 0 26px rgba(47, 230, 255, 0.12),
    inset 0 0 0 1px rgba(255,255,255,0.06);

  overflow: hidden;
}

.p3-item{
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid transparent;

  color: rgba(234,242,255,0.92);
  background: transparent;
  cursor: pointer;

  font-weight: 800;
  letter-spacing: 0.04em;

  transition: transform .12s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
}

.p3-item:hover{
  background: rgba(47,230,255,0.10);
  border-color: rgba(47,230,255,0.22);
  box-shadow: 0 0 18px rgba(47,230,255,0.10);
  transform: translateY(-1px);
}

.p3-item:active{
  transform: scale(0.98);
}

.p3-item-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--p3-neon, #2fe6ff);
  box-shadow: 0 0 14px rgba(47,230,255,0.55);
  flex: 0 0 auto;
}

.p3-divider{
  margin: 8px 2px;
  height: 1px;
  background: linear-gradient(90deg,
    rgba(47,230,255,0),
    rgba(47,230,255,0.35),
    rgba(148,123,255,0.30),
    rgba(47,230,255,0)
  );
  opacity: 0.85;
}

.p3-item-danger{
  color: rgba(255, 170, 170, 0.95);
}

.p3-item-danger:hover{
  background: rgba(255, 83, 83, 0.12);
  border-color: rgba(255, 83, 83, 0.28);
  box-shadow: 0 0 18px rgba(255, 83, 83, 0.14);
}

.p3-item-dot-danger{
  background: rgba(255, 83, 83, 0.9);
  box-shadow: 0 0 14px rgba(255, 83, 83, 0.45);
}
</style>
