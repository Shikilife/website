// src/stores/user.js
import { defineStore } from "pinia";
import { apiGet } from "@/api";
import { accounts } from "@/data/accounts"; // ✅ 先用 mock，後端上線可移除

// ✅ 現在先用假登入；後端上線後改 false
const USE_MOCK_AUTH = true;

/**
 * User Store（正式版）
 * - 管理登入狀態
 * - 管理 token
 * - 提供 profile 給 Profile.vue 使用
 */
export const useUserStore = defineStore("user", {
  state: () => ({
    // === 登入狀態 ===
    isLoggedIn: false,
    isAdmin: false,
    username: "",

    // === Token（JWT 或 session key）===
    token: localStorage.getItem("auth_token") || "",

    // === 個人資料（Profile.vue 會用）===
    profile: null,
    profileLoading: false,
    profileError: "",
    favorites: [], // 收藏課程（存整個 viewCourse 物件）
    preselects: [], // 預選課程（存整個 viewCourse 物件）
  }),

  actions: {
    /**
     * ✅ 登入成功後，統一由這裡寫入狀態
     * AuthModal.vue 會呼叫這個
     */
    setSession({ token, user }) {
      // token
      if (token) {
        this.token = token;
        localStorage.setItem("auth_token", token);
      } else {
        this.token = "";
        localStorage.removeItem("auth_token");
      }

      // status
      this.isLoggedIn = true;
      this.isAdmin = !!user.isAdmin;

      // App.vue 顯示 user.username，所以這裡用「顯示名稱」最合理
      // 也可改成 user.username（學號）看你 UI 想顯示哪個
      this.username = (user.name || user.username || user.id || "").toString();

      // profile（統一格式，Profile.vue 直接吃）
      this.profile = {
        id: (
          user.id ||
          user.studentID ||
          user.userID ||
          user.username ||
          ""
        ).toString(),
        name: (user.name || user.username || "").toString(),
        gender: user.gender || "",
        className: user.className || user.class || "",
        phone: user.phone || "",
        address: user.address || "",
        email: user.email || user.mail || "",
      };

      this.loadCollections();
    },

    /**
     * ✅ App.vue 啟動時呼叫
     * 用 token 向後端確認「我還是不是登入狀態」
     * - 現在：支援 mock（從 accounts 找）
     * - 未來：GET /api/me
     */
    async restoreSession() {
      if (!this.token) return;

      // ======================
      // ✅ Mock 模式（現在可用）
      // ======================
      if (USE_MOCK_AUTH) {
        // mock token 格式：mock_<id>_<timestamp>
        const m = String(this.token).match(/^mock_(\d+)_/);
        if (!m) {
          this.logout();
          return;
        }
        this.loadCollections();

        const id = Number(m[1]);
        const acc = accounts.find((a) => a.id === id);

        if (!acc) {
          this.logout();
          return;
        }

        const isAdmin = acc.role === "管理員";

        this.isLoggedIn = true;
        this.isAdmin = isAdmin;
        this.username = acc.name || acc.username;

        this.profile = {
          id: acc.username, // 學號 / 帳號
          name: acc.name || acc.username,
          gender: "",
          className: "",
          phone: "",
          address: "",
          email: "",
        };

        return;
      }

      // ======================
      // ✅ 正式模式（後端上線）
      // ======================
      try {
        /**
         * 🔴 後端必須提供：
         * GET /api/me
         * Header: Authorization: Bearer <token>
         *
         * ✅ 回傳建議：
         * { id, username, name, isAdmin, gender, className, phone, address, email }
         */
        const data = await apiGet("/api/me");

        this.isLoggedIn = true;
        this.isAdmin = !!data.isAdmin;

        // 顯示名稱
        this.username = (
          data.name ||
          data.username ||
          data.id ||
          ""
        ).toString();

        this.profile = {
          id: (data.id || data.username || "").toString(),
          name: (data.name || data.username || "").toString(),
          gender: data.gender || "",
          className: data.className || "",
          phone: data.phone || "",
          address: data.address || "",
          email: data.email || "",
        };
        this.loadCollections();
      } catch (e) {
        // token 失效 → 強制登出
        this.logout();
      }
    },

    /**
     * ✅ Profile.vue 會用
     * 若 restoreSession 已經抓過，這裡不會重打
     */
    async fetchProfile() {
      if (this.profile) return;

      this.profileLoading = true;
      this.profileError = "";

      // Mock：直接用現有資料即可（沒有就回錯）
      if (USE_MOCK_AUTH) {
        this.profileError =
          "（Mock）目前沒有更多個人資料欄位，需後端 /api/me 補齊";
        this.profileLoading = false;
        return;
      }

      try {
        /**
         * 🔴 後端必須提供：
         * GET /api/me
         */
        const data = await apiGet("/api/me");

        this.profile = {
          id: (data.id || data.username || "").toString(),
          name: (data.name || data.username || "").toString(),
          gender: data.gender || "",
          className: data.className || "",
          phone: data.phone || "",
          address: data.address || "",
          email: data.email || "",
        };
      } catch (e) {
        this.profileError = e?.message || "個人資料讀取失敗";
      } finally {
        this.profileLoading = false;
      }
    },
    // ======================
    // ✅ 收藏 / 預選（LocalStorage）
    // ======================
    _key(prefix) {
      // 用 profile.id 最穩（學生用學號、管理者也有 id）
      const uid = this.profile?.id || this.username || "guest";
      return `${prefix}_${uid}`;
    },

    loadCollections() {
      try {
        const fav = JSON.parse(localStorage.getItem(this._key("fav")) || "[]");
        const pre = JSON.parse(localStorage.getItem(this._key("pre")) || "[]");
        this.favorites = Array.isArray(fav) ? fav : [];
        this.preselects = Array.isArray(pre) ? pre : [];
      } catch {
        this.favorites = [];
        this.preselects = [];
      }
    },

    _saveCollections() {
      localStorage.setItem(
        this._key("fav"),
        JSON.stringify(this.favorites || [])
      );
      localStorage.setItem(
        this._key("pre"),
        JSON.stringify(this.preselects || [])
      );
    },

    isFavorite(courseID) {
      const id = String(courseID ?? "");
      return (this.favorites || []).some((c) => String(c.courseID) === id);
    },

    isPreselected(courseID) {
      const id = String(courseID ?? "");
      return (this.preselects || []).some((c) => String(c.courseID) === id);
    },

    toggleFavorite(course) {
      if (!course?.courseID) return;
      const id = String(course.courseID);

      const idx = (this.favorites || []).findIndex(
        (c) => String(c.courseID) === id
      );
      if (idx >= 0) this.favorites.splice(idx, 1);
      else this.favorites.push(course);

      this._saveCollections();
    },

    togglePreselect(course) {
      if (!course?.courseID) return;
      const id = String(course.courseID);

      const idx = (this.preselects || []).findIndex(
        (c) => String(c.courseID) === id
      );
      if (idx >= 0) this.preselects.splice(idx, 1);
      else this.preselects.push(course);

      this._saveCollections();
    },

    /**
     * ✅ 登出
     */
    async logout() {
      try {
        /**
         * （可選）
         * 後端如果有 session，可以做：
         * POST /api/auth/logout
         */
        // await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        // ignore
      }

      this.isLoggedIn = false;
      this.isAdmin = false;
      this.username = "";
      this.profile = null;
      this.token = "";
      this.profileLoading = false;
      this.profileError = "";

      localStorage.removeItem("auth_token");
      this.favorites = [];
      this.preselects = [];
    },
  },
});
