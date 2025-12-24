// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

// 頁面（一般使用者）
import CourseSearch from "@/views/CourseSearch.vue";
import Favorite from "@/views/Favorite.vue";
import CourseTable from "@/views/CourseTable.vue";
import Profile from "@/views/Profile.vue";
import AdvancedSearch from "@/views/AdvancedSearch.vue";

// 管理員頁面
import AdminHome from "@/views/AdminHome.vue";
import UserCreate from "@/views/admin/UserCreate.vue";
import UserEdit from "@/views/admin/UserEdit.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ======================================
    // 🔵 使用者系統
    // ======================================
    { path: "/", name: "Home", component: CourseSearch },
    { path: "/courses", name: "CourseSearch", component: CourseSearch },

    {
      path: "/favorites",
      name: "Favorite",
      component: Favorite,
      meta: { requiresAuth: true },
    },

    {
      path: "/coursetable",
      name: "CourseTable",
      component: CourseTable,
      meta: { requiresAuth: true },
    },

    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      meta: { requiresAuth: true },
    },

    {
      path: "/advanced-search",
      name: "AdvancedSearch",
      component: AdvancedSearch,
    },

    // ======================================
    // 🔴 管理員系統
    // ======================================
    {
      path: "/admin",
      name: "AdminHome",
      component: AdminHome,
      meta: { requiresAdmin: true },
    },
    {
      path: "/admin/users/new",
      name: "UserCreate",
      component: UserCreate,
      meta: { requiresAdmin: true },
    },
    {
      path: "/admin/users/:userID/edit",
      name: "UserEdit",
      component: UserEdit,
      meta: { requiresAdmin: true },
    },

    // ✅ 404
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

// ✅ 門禁：先 restoreSession 再判斷權限
let didRestoreSession = false;

router.beforeEach(async (to) => {
  const user = useUserStore();

  // 1) 第一次進來先還原登入狀態（避免 F5 後 isLoggedIn 變 false）
  if (!didRestoreSession && typeof user.restoreSession === "function") {
    try {
      await user.restoreSession(); // 這裡應該只做 localStorage 還原，不要打 API
    } finally {
      didRestoreSession = true;
    }
  }

  // 2) Admin 門禁
  if (to.meta.requiresAdmin) {
    if (!user.isLoggedIn) return { path: "/" };
    if (!user.isAdmin) return { path: "/" };
    return true;
  }

  // 3) 一般登入門禁
  if (to.meta.requiresAuth) {
    if (!user.isLoggedIn) return { path: "/" };
    return true;
  }

  return true;
});

export default router;
