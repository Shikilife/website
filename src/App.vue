<template>
  <!-- ✅ 單一 root：wrapper -->
  <div class="p3-shell">
    <!-- 背景粒子 -->
    <vue-particles
      id="tsparticles"
      :options="particlesOptions"
      :particlesInit="particlesInit"
      class="p3-particles-layer"
    />

    <!-- 主應用 -->
    <div class="p3-app min-h-screen w-full">
      <!-- Header -->
      <header :class="['p3-topbar', isHome ? 'p3-topbar-glass' : 'p3-topbar-solid']">
        <div class="p3-topbar-inner">
          <!-- Logo -->
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
              <div class="text-lg font-bold tracking-wide truncate">
                課程查詢系統
              </div>
              <div class="text-xs opacity-70 truncate tracking-wider">
                NTUNHS COURSE INQUIRY
              </div>
            </div>
          </div>

          <!-- Right -->
          <div class="flex items-center gap-3">
            <UserMenu />
          </div>
        </div>
      </header>

      <!-- Page -->
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { loadSlim } from "tsparticles-slim";
import UserMenu from "@/components/UserMenu.vue";

const route = useRoute();

/* 是否首頁 */
const isHome = computed(() => route.path === "/");

/* 粒子初始化 */
const particlesInit = async (engine) => {
  await loadSlim(engine);
};

/* 粒子設定 */
const particlesOptions = {
  background: {
    color: { value: "transparent" },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 80,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: { value: "#ffffff" },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.15,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.6,
      outModes: { default: "bounce" },
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 60,
    },
    opacity: { value: 0.25 },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 3 } },
  },
  detectRetina: true,
};
</script>

<style>
/* 外層 wrapper */
.p3-shell {
  position: relative;
  min-height: 100vh;
}

/* 粒子層 */
#tsparticles {
  position: fixed;
  inset: 0;
  z-index: 0;
}

/* 主應用 */
.p3-app {
  position: relative;
  z-index: 1;
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* 防止橫向捲軸 */
html,
body,
#app {
  width: 100%;
  overflow-x: hidden;
}
</style>
