import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

// 頁面（一般使用者）
import CourseSearch from "@/views/CourseSearch.vue";
import CourseResult from "@/views/CourseResult.vue";
import Favorite from "@/views/Favorite.vue";
import CourseTable from "@/views/CourseTable.vue";
import Profile from "@/views/Profile.vue";
import AdvancedSearch from "@/views/AdvancedSearch.vue";

// 管理員頁面
import AdminHome from "@/views/AdminHome.vue";
import UploadCourse from "@/views/admin/UploadCourse.vue";
import PreviewCourse from "@/views/admin/PreviewCourse.vue";
import ManageAccount from "@/views/admin/ManageAccount.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ======================================
    // 🔵 使用者系統
    // ======================================
    { path: "/", name: "Home", component: CourseSearch },

    { path: "/courses", name: "CourseSearch", component: CourseSearch },
    { path: "/courses/result", name: "CourseResult", component: CourseResult },

    // ✅ 需要登入（你可以決定要不要）
    { path: "/favorites", name: "Favorite", component: Favorite, meta: { requiresAuth: true } },

    // 🔧 建議路徑改成一致小寫（不然你之後很容易寫錯）
    // 原本："/Coursetable"
    { path: "/coursetable", name: "CourseTable", component: CourseTable, meta: { requiresAuth: true } },

    { path: "/profile", name: "Profile", component: Profile, meta: { requiresAuth: true } },

    { path: "/advanced-search", name: "AdvancedSearch", component: AdvancedSearch },
    {
      path: "/advanced-search/result",
      name: "AdvancedSearchResult",
      component: () => import("@/views/AdvancedSearchResult.vue"),
    },

    // ======================================
    // 🔴 管理員系統
    // ======================================
    { path: "/admin", name: "AdminHome", component: AdminHome, meta: { requiresAdmin: true } },
    { path: "/admin/upload", name: "UploadCourse", component: UploadCourse, meta: { requiresAdmin: true } },
    { path: "/admin/preview", name: "PreviewCourse", component: PreviewCourse, meta: { requiresAdmin: true } },
    { path: "/admin/accounts", name: "ManageAccount", component: ManageAccount, meta: { requiresAdmin: true } },
  ],
});

// ✅ Step 2：門禁（重點）
router.beforeEach((to) => {
  const user = useUserStore();

  // 1) 管理員頁面：必須已登入 + isAdmin === true
  if (to.meta.requiresAdmin) {
    if (!user.isLoggedIn) return { path: "/" };      // 沒登入 → 回首頁
    if (!user.isAdmin) return { path: "/" };         // 學生登入 → 回首頁（封死）
    return true;
  }

  // 2) 需要登入的學生頁面：必須 isLoggedIn
  if (to.meta.requiresAuth) {
    if (!user.isLoggedIn) return { path: "/" };      // 沒登入 → 回首頁
    return true;
  }

  return true;
});

export default router;
