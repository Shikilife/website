// src/stores/user.js
import { defineStore } from "pinia";
import { apiGet, apiPost, apiDelete } from "@/api.js";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    isAdmin: false,
    userID: "",

    // ✅ 用 Set 來判斷是否已收藏/預選
    favoriteIds: new Set(),
    preselectIds: new Set(),

    // ✅ 給畫面用：課程明細（由 courseMap join）
    favorites: [],
    preselects: [],

    // ✅ 快取所有課程（用來 join courseID -> course object）
    courseMap: new Map(),
    _coursesLoaded: false,
  }),

  actions: {
    // --- 登入成功後呼叫 ---
    async afterLoginBootstrap() {
      await Promise.all([
        this.ensureCoursesLoaded(),
        this.loadFavoritesFromDB(),
        this.loadPreselectsFromDB(),
      ]);
      this.rebuildDetailLists();
    },

    async ensureCoursesLoaded() {
      if (this._coursesLoaded) return;
      const courses = await apiGet("/courses");
      const map = new Map();
      for (const c of courses || []) {
        const id = String(c.courseID ?? "").trim();
        if (id) map.set(id, c);
      }
      this.courseMap = map;
      this._coursesLoaded = true;
    },

    // --- DB -> store ---
    async loadFavoritesFromDB() {
      if (!this.isLoggedIn || !this.userID) return;
      const rows = await apiGet("/userFavorites"); // 會回整張表
      const ids = new Set(
        (rows || [])
          .filter((r) => String(r.userID) === String(this.userID))
          .map((r) => String(r.courseID))
      );
      this.favoriteIds = ids;
    },

    async loadPreselectsFromDB() {
      if (!this.isLoggedIn || !this.userID) return;
      const rows = await apiGet("/userPreSelects");
      const ids = new Set(
        (rows || [])
          .filter((r) => String(r.userID) === String(this.userID))
          .map((r) => String(r.courseID))
      );
      this.preselectIds = ids;
    },

    rebuildDetailLists() {
      // 把 ids -> 課程明細（你 CourseTable / Favorite 頁面要顯示用）
      const fav = [];
      for (const id of this.favoriteIds) {
        const raw = this.courseMap.get(String(id));
        if (raw) fav.push(raw);
      }
      const pre = [];
      for (const id of this.preselectIds) {
        const raw = this.courseMap.get(String(id));
        if (raw) pre.push(raw);
      }
      this.favorites = fav;
      this.preselects = pre;
    },

    // --- getter like ---
    isFavorite(courseID) {
      return this.favoriteIds.has(String(courseID));
    },
    isPreselected(courseID) {
      return this.preselectIds.has(String(courseID));
    },

    // --- toggle: UI 點按 -> DB ---
    async toggleFavorite(courseOrId) {
      if (!this.isLoggedIn || this.isAdmin) return;

      const courseID = String(courseOrId?.courseID ?? courseOrId);
      if (!courseID) return;

      const exists = this.favoriteIds.has(courseID);
      try {
        if (!exists) {
          await apiPost("/userFavorites", { userID: this.userID, courseID });
          this.favoriteIds.add(courseID);
        } else {
          await apiDelete("/userFavorites", { userID: this.userID, courseID });
          this.favoriteIds.delete(courseID);
        }
        this.rebuildDetailLists();
      } catch (e) {
        // 409 已存在通常是重複點太快，直接重新 sync
        await this.loadFavoritesFromDB();
        this.rebuildDetailLists();
        throw e;
      }
    },

    async togglePreselect(courseOrId) {
      if (!this.isLoggedIn || this.isAdmin) return;

      const courseID = String(courseOrId?.courseID ?? courseOrId);
      if (!courseID) return;

      const exists = this.preselectIds.has(courseID);
      try {
        if (!exists) {
          await apiPost("/userPreSelects", { userID: this.userID, courseID });
          this.preselectIds.add(courseID);
        } else {
          await apiDelete("/userPreSelects", { userID: this.userID, courseID });
          this.preselectIds.delete(courseID);
        }
        this.rebuildDetailLists();
      } catch (e) {
        await this.loadPreselectsFromDB();
        this.rebuildDetailLists();
        throw e;
      }
    },

    // --- 刪除全部收藏（後端沒提供 bulk delete，所以前端逐筆刪） ---
    async deleteAllFavorites() {
      const ids = Array.from(this.favoriteIds);
      await Promise.all(
        ids.map((courseID) => apiDelete("/userFavorites", { userID: this.userID, courseID }))
      );
      this.favoriteIds = new Set();
      this.rebuildDetailLists();
    },

    async deleteAllPreselects() {
      const ids = Array.from(this.preselectIds);
      await Promise.all(
        ids.map((courseID) => apiDelete("/userPreSelects", { userID: this.userID, courseID }))
      );
      this.preselectIds = new Set();
      this.rebuildDetailLists();
    },
  },
});
