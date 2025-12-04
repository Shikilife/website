import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    username: "",
    isAdmin: false,
  }),

  actions: {
    // 學生登入
    loginStudent(name) {
      this.username = name;
      this.isLoggedIn = true;
      this.isAdmin = false;
    },

    // 管理員登入
    loginAdmin(name) {
      this.username = name;
      this.isLoggedIn = true;
      this.isAdmin = true;
    },

    // 登出
    logout() {
      this.username = "";
      this.isLoggedIn = false;
      this.isAdmin = false;
    },
  },
});
