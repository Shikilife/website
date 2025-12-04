import { createRouter, createWebHistory } from "vue-router";

// 頁面（一般使用者）
import CourseSearch from "@/views/CourseSearch.vue";   // 課程查詢首頁（= Home）
import CourseResult from "@/views/CourseResult.vue";   // 查詢結果
import Favorite from "@/views/Favorite.vue";           // 我的收藏
import CourseTable from "@/views/CourseTable.vue";     // 課表
import Profile from "@/views/Profile.vue";             // 個人資訊
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
    {
      path: "/",
      name: "Home",
      component: CourseSearch, // 首頁 = 課程查詢首頁
    },
    {
      path: "/courses",
      name: "CourseSearch",
      component: CourseSearch,
    },
    {
      path: "/courses/result",
      name: "CourseResult",
      component: CourseResult,
    },
    {
      path: "/favorites",
      name: "Favorite",
      component: Favorite,
    },
    {
      path: "/Coursetable",
      name: "CourseTable",
      component: CourseTable,
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
    },
    {
      path: "/advanced-search",
      name: "AdvancedSearch",
      component: AdvancedSearch,
    },
    {
      path: "/advanced-search/result",
      name: "AdvancedSearchResult",
      component: () => import("@/views/AdvancedSearchResult.vue"),
    },


    // ======================================
    // 🔴 管理員系統
    // ======================================
    {
      path: "/admin",
      name: "AdminHome",
      component: AdminHome,
    },
    {
      path: "/admin/upload",
      name: "UploadCourse",
      component: UploadCourse,
    },
    {
      path: "/admin/preview",
      name: "PreviewCourse",
      component: PreviewCourse,
    },
    {
      path: "/admin/accounts",
      name: "ManageAccount",
      component: ManageAccount,
    },
  ],
});

export default router;
