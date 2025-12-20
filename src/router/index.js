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




const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ======================================
    // 🔵 使用者系統
    // ======================================
    { path: "/", name: "Home", component: CourseSearch },

    { path: "/courses", name: "CourseSearch", component: CourseSearch },

    // ✅ 需要登入（你可以決定要不要）
    { path: "/favorites", name: "Favorite", component: Favorite, meta: { requiresAuth: true } },

    // 🔧 路徑一致小寫
    { path: "/coursetable", name: "CourseTable", component: CourseTable, meta: { requiresAuth: true } },

    { path: "/profile", name: "Profile", component: Profile, meta: { requiresAuth: true } },

    { path: "/advanced-search", name: "AdvancedSearch", component: AdvancedSearch },


    // ======================================
    // 🔴 管理員系統
    // ======================================
    { path: "/admin", name: "AdminHome", component: AdminHome, meta: { requiresAdmin: true } },
  
  ],
});

// ✅ 門禁
router.beforeEach((to) => {
  const user = useUserStore();

  if (to.meta.requiresAdmin) {
    if (!user.isLoggedIn) return { path: "/" };
    if (!user.isAdmin) return { path: "/" };
    return true;
  }

  if (to.meta.requiresAuth) {
    if (!user.isLoggedIn) return { path: "/" };
    return true;
  }

  return true;
});

export default router;
