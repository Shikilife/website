<template>
  <vue-particles
    id="tsparticles"
    :options="particlesOptions"
    :particlesInit="particlesInit"
    class="p3-particles-layer"
  />

  <div class="p3-app min-h-screen w-full">
    <header :class="['p3-topbar', isHome ? 'p3-topbar-glass' : 'p3-topbar-solid']">
      <div class="p3-topbar-inner">
        <!-- Brand / Logo -->
        <div
          class="flex items-center gap-4 min-w-0 group cursor-pointer"
          @click="$router.push('/')"
        >
          <div class="logo-wrapper">
            <img
              src="/logo.png"
              alt="logo"
              class="w-12 h-12 rounded-md p3-logo"
            />
            <div class="logo-glow"></div>
          </div>

          <div class="leading-tight min-w-0">
            <h1 class="text-xl font-extrabold tracking-wide truncate p3-brand-title">
              課程查詢系統
            </h1>
            <p class="text-xs opacity-70 truncate p3-brand-sub tracking-wider">
              NTUNHS COURSE INQUIRY
            </p>
          </div>
        </div>

        <!-- Auth Area -->
        <div class="flex items-center">
          <!-- ✅ 未登入：永遠呼叫 openAuth() -->
          <button
            v-if="!user.isLoggedIn"
            class="p3-login-btn-new"
            @click="openAuth"
          >
            <span class="btn-content">
              <span class="btn-icon">✦</span>
              LOGIN
            </span>
            <div class="btn-shine"></div>
          </button>

          <!-- ✅ 已登入：顯示使用者選單 -->
          <div v-else class="relative" ref="menuWrap">
            <button
              class="p3-user-btn"
              aria-haspopup="menu"
              :aria-expanded="userMenuOpen"
              @click="toggleUserMenu"
            >
              <span class="user-name">{{ user.username }}</span>
              <span class="user-arrow">▼</span>
            </button>

            <UserMenu
              v-if="userMenuOpen"
              @close="userMenuOpen = false"
              @open-auth="openAuth"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- ✅ Route Page Transition -->
    <div class="p3-page-shell">
      <router-view v-slot="{ Component, route }">
        <transition name="p3-route" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </div>

    <!-- ✅ Modal 開關只看 showAuthModal -->
    <AuthModal v-if="showAuthModal" @close="closeAuth" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";

import AuthModal from "@/components/AuthModal.vue";
import UserMenu from "@/components/UserMenu.vue";

import { loadSlim } from "tsparticles-slim";

const route = useRoute();
const user = useUserStore();

const isHome = computed(() => route.path === "/courses" || route.path === "/");

const showAuthModal = ref(false);
const userMenuOpen = ref(false);
const menuWrap = ref(null);

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}

/** ✅ 開啟登入/選身份 modal */
function openAuth() {
  showAuthModal.value = true;
}

/** ✅ 關閉登入/選身份 modal */
function closeAuth() {
  showAuthModal.value = false;
}

/** ✅ 點外面自動關閉 UserMenu */
function onDocClick(e) {
  if (!userMenuOpen.value) return;

  const el = menuWrap.value;
  if (!el) return;
  if (el.contains(e.target)) return;

  userMenuOpen.value = false;
}

/**
 * ✅ DEMO：只做 localStorage 還原
 * - 不打 /me
 * - 不處理 token
 */
async function bootAuth() {
  try {
    if (typeof user.restoreSession === "function") {
      await user.restoreSession();
    }
  } catch {
    // 若 localStorage 壞掉就清乾淨
    if (typeof user.logout === "function") user.logout();
  }
}

onMounted(async () => {
  document.addEventListener("click", onDocClick);
  await bootAuth();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
});

watch(
  () => user.isLoggedIn,
  (ok) => {
    if (ok) userMenuOpen.value = false;
  }
);

// 粒子初始化
const particlesInit = async (engine) => {
  await loadSlim(engine);
};

// Persona 粒子設定
const particlesOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: { enable: true, mode: "push" },
      onHover: { enable: true, mode: "grab" },
      resize: true,
    },
    modes: {
      grab: { distance: 140, links: { opacity: 0.5 } },
      push: { quantity: 4 },
    },
  },
  particles: {
    color: { value: "#2fe6ff" },
    links: {
      color: "#2fe6ff",
      distance: 150,
      enable: true,
      opacity: 0.2,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: { default: "bounce" },
      random: false,
      speed: 0.8,
      straight: false,
    },
    number: { density: { enable: true, area: 800 }, value: 60 },
    opacity: { value: 0.3 },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 3 } },
  },
  detectRetina: true,
};
</script>

<style scoped>
:global(.p3-modal) {
  z-index: 9999 !important;
}

/* 變數定義 */
.p3-topbar {
  --neon-blue: #2fe6ff;
  --neon-purple: #7c5cff;
  --deep-bg: rgba(9, 20, 36, 0.95);
  --glass-bg: rgba(9, 20, 36, 0.65);

  height: 72px;
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(47, 230, 255, 0.1);
}

/* Header 線條：流光 */
.p3-topbar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--neon-blue) 20%,
    var(--neon-purple) 50%,
    var(--neon-blue) 80%,
    transparent 100%
  );
  opacity: 0.8;
  box-shadow: 0 0 10px var(--neon-blue);
  animation: borderFlow 4s infinite linear;
}

@keyframes borderFlow {
  0% { background-position: 0% 50%; opacity: 0.6; }
  50% { opacity: 1; }
  100% { background-position: 100% 50%; opacity: 0.6; }
}

.p3-topbar-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
}

.p3-topbar-solid {
  background: var(--deep-bg);
  backdrop-filter: blur(20px);
}

.p3-topbar-inner {
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo 區域微調 */
.logo-wrapper {
  position: relative;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.group:hover .logo-wrapper {
  transform: scale(1.1) rotate(-3deg);
}

.p3-logo {
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

/* 標題字體 */
.p3-brand-title {
  color: #eaf2ff;
  text-shadow: 0 0 10px rgba(47, 230, 255, 0.3);
  transition: color 0.3s;
}

.p3-brand-sub {
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(159, 179, 204, 0.8);
}

/* 登入按鈕 */
.p3-login-btn-new {
  position: relative;
  transform: skewX(-15deg);
  padding: 10px 24px;
  background: transparent;
  border: 2px solid var(--neon-blue);
  color: var(--neon-blue);
  font-family: "Arial", sans-serif;
  font-weight: 900;
  letter-spacing: 0.1em;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 0 10px rgba(47, 230, 255, 0.1);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  transform: skewX(15deg);
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
  transition: transform 0.3s ease;
}

.p3-login-btn-new:hover {
  background: var(--neon-blue);
  color: #000;
  box-shadow: 0 0 20px var(--neon-blue), -4px 4px 0 rgba(124, 92, 255, 0.8);
  transform: skewX(-15deg) translateY(-2px);
}

.p3-login-btn-new:hover .btn-icon {
  transform: rotate(180deg);
}

.p3-login-btn-new:active {
  transform: skewX(-15deg) translateY(1px);
  box-shadow: 0 0 5px var(--neon-blue);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: skewX(15deg);
  transition: none;
}

.p3-login-btn-new:hover .btn-shine {
  animation: shineMove 0.75s;
}

@keyframes shineMove {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* 已登入按鈕 */
.p3-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #eaf2ff;
  font-weight: 700;
  transition: all 0.2s;
  transform: skewX(-10deg);
}

.p3-user-btn span {
  transform: skewX(10deg);
}

.p3-user-btn:hover {
  background: rgba(47, 230, 255, 0.15);
  border-color: var(--neon-blue);
  box-shadow: 0 0 15px rgba(47, 230, 255, 0.2);
}

.user-arrow {
  font-size: 10px;
  opacity: 0.7;
}

/* ✅ Route Transition */
.p3-route-enter-active,
.p3-route-leave-active {
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}

.p3-route-enter-from {
  opacity: 0;
  transform: translateX(34px) skewX(-3deg);
  filter: blur(6px);
}

.p3-route-enter-to {
  opacity: 1;
  transform: translateX(0) skewX(0deg);
  filter: blur(0);
}

.p3-route-leave-from {
  opacity: 1;
  transform: translateX(0) skewX(0deg);
  filter: blur(0);
}

.p3-route-leave-to {
  opacity: 0;
  transform: translateX(-34px) skewX(3deg);
  filter: blur(6px);
}

.p3-page-shell {
  width: 100%;
  overflow-x: clip;
}

@media (prefers-reduced-motion: reduce) {
  .p3-route-enter-active,
  .p3-route-leave-active {
    transition: none !important;
  }
}

:global(html, body, #app) {
  width: 100%;
  overflow-x: hidden;
}
</style>
