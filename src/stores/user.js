// src/stores/user.js
import { defineStore } from "pinia";
import { apiGet } from "@/api.js";

const LS_KEY = "user_session_v1";

// 統一 ID 格式化工具 (轉字串並去空白)
const normId = (id) => String(id ?? "").trim();

// ✅ optional table 用：抓不到也不要讓整個 ensureCoursesLoaded 爆掉
async function safeApiGet(path, fallback = []) {
  try {
    const data = await apiGet(path);
    return data ?? fallback;
  } catch (e) {
    // 不要 throw，避免破壞登入後 bootstrap
    console.warn(`[safeApiGet] ${path} failed:`, e?.message || e);
    return fallback;
  }
}

// ✅ 星期格式化：2 -> 二（你 courses.DayOfWeek 是字串 "2"）
function normalizeDay(v) {
  const s = String(v ?? "").trim();
  if (!s) return "—";
  if (/^[1-7]$/.test(s)) return ["一", "二", "三", "四", "五", "六", "日"][Number(s) - 1];
  // 若是已經是中文/英文縮寫就原樣回傳或簡單對應
  const map = { Mon: "一", Tue: "二", Wed: "三", Thu: "四", Fri: "五", Sat: "六", Sun: "日" };
  return map[s] || s;
}

// ✅ 圖片路徑：你的 buildingMaps.imagePath 可能是 "/img/xxx.png" 或 "./public/xxx.png"
function normalizeImagePath(p) {
  const raw = String(p ?? "").trim();
  if (!raw) return "";
  // 若已是完整 URL 直接回傳
  if (/^https?:\/\//i.test(raw)) return raw;
  // 修正常見 typo：pubilc
  const cleaned = raw.replace(/\\/g, "/").replace(/^\.\/pubilc\//, "/").replace(/^\.\/public\//, "/");
  // 讓它至少是 / 開頭（給前端當作 public/static）
  return cleaned.startsWith("/") ? cleaned : `/${cleaned.replace(/^\.\//, "")}`;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    isAdmin: false,
    userID: "",
    username: "",
    profile: null,

    // ✅ 主資料：Set (用來快速判斷按鈕是否要亮燈，效能 O(1))
    favoriteIds: new Set(),
    preselectIds: new Set(),

    // ✅ 顯示用：Array (給前端表格 v-for 使用，包含完整中文資料)
    favorites: [],
    preselects: [],

    // ✅ 資料快取 (Cache)
    courseMap: new Map(),        // 課程基本資料
    deptMap: new Map(),          // 系所代碼 -> 系所名稱
    teacherMap: new Map(),       // 教師代碼 -> 教師姓名
    courseTeacherMap: new Map(), // 課程ID -> [教師姓名列]
    roomMap: new Map(),          // 課程ID -> 教室代碼 (例如 F603)

    // ✅ 新增：building / 地圖 join（不影響你其他頁，只有收藏/預選顯示更完整）
    courseRoomMap: new Map(),    // 課程ID -> { buildingCode, roomNumber }
    buildingNameMap: new Map(),  // buildingCode -> buildingName
    buildingImgMap: new Map(),   // buildingCode -> imagePath

    _coursesLoaded: false,
  }),

  getters: {
    // 判斷是否預選 (供 v-if 或 class 判斷)
    isPreselected: (state) => (courseID) => {
      const id = normId(courseID);
      return state.preselectIds.has(id);
    },
    // 判斷是否收藏 (供 v-if 或 class 判斷)
    isFavorite: (state) => (courseID) => {
      const id = normId(courseID);
      return state.favoriteIds.has(id);
    },
  },

  actions: {
    // ✅ 內部用 API 請求工具 (支援 DELETE 帶 Body，解決無法刪除的問題)
    async _apiMutate(path, method, body) {
      const url = path.startsWith("/api/") ? path : `/api${path}`;

      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      // GET 與 HEAD 不能有 body，其他都可以
      if (body && method !== "GET" && method !== "HEAD") {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${method} ${url} failed (${res.status}) ${text}`);
      }

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) return res.json();
      return null;
    },

    restoreSession() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        this.isLoggedIn = !!s.isLoggedIn;
        this.isAdmin = !!s.isAdmin;
        this.userID = s.userID || "";
        this.username = s.username || "";
        this.profile = s.profile || null;
      } catch {
        localStorage.removeItem(LS_KEY);
      }
    },

    async login(account, password, role) {
      const acc = normId(account);
      const pw = normId(password);
      const r = normId(role);
      if (!acc || !pw) throw new Error("請輸入帳號與密碼");

      const users = await apiGet("/users");
      const hit = (users || []).find((u) => {
        const uid = normId(u.userID);
        const uname = normId(u.username);
        return uid === acc || uname === acc;
      });

      if (!hit) throw new Error("帳號或密碼錯誤");
      // 真實環境請勿明碼比對密碼
      if (normId(hit.password) !== pw) throw new Error("帳號或密碼錯誤");

      const isAdmin = Number(hit.isadmin) === 1;
      if (r === "admin" && !isAdmin) throw new Error("此帳號不是管理者");
      if (r === "student" && isAdmin) throw new Error("此帳號是管理者，請選管理者登入");

      this.isLoggedIn = true;
      this.isAdmin = isAdmin;
      this.userID = normId(hit.userID);
      this.username = normId(hit.username || hit.userID);
      this.profile = hit;

      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          isLoggedIn: this.isLoggedIn,
          isAdmin: this.isAdmin,
          userID: this.userID,
          username: this.username,
          profile: this.profile,
        })
      );

      await this.afterLoginBootstrap();
      return hit;
    },

    logout() {
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.userID = "";
      this.username = "";
      this.profile = null;
      this.favoriteIds = new Set();
      this.preselectIds = new Set();
      this.favorites = [];
      this.preselects = [];
      localStorage.removeItem(LS_KEY);
    },

    async afterLoginBootstrap() {
      // 確保資料載入順序：先載入所有關聯表 -> 再載入使用者清單 -> 最後組裝顯示列表
      await Promise.all([
        this.ensureCoursesLoaded(),
        this.loadFavoritesFromDB(),
        this.loadPreselectsFromDB(),
      ]);
      this.rebuildDetailLists();
    },

    // ✅ 一次載入所有關聯資料表 + building 地圖（safe，不會炸登入）
    async ensureCoursesLoaded() {
      if (this._coursesLoaded) return;

      try {
        // 並行請求所有需要的資料表
        const [courses, departments, teachers, courseTeachers, classrooms] =
          await Promise.all([
            apiGet("/courses"),
            apiGet("/departments"),
            apiGet("/teachers"),
            apiGet("/courseteacher"),
            apiGet("/classroom"),
          ]);

        // ✅ building 兩張表：可能你後端還沒開，這裡用 safeApiGet
        const [buildings, buildingMaps] = await Promise.all([
          safeApiGet("/buildings", []),
          safeApiGet("/buildingMaps", []),
        ]);

        // 1. 建立 Course Map
        const cMap = new Map();
        for (const c of courses || []) {
          const id = normId(c.courseID);
          if (id) cMap.set(id, c);
        }
        this.courseMap = cMap;

        // 2. 建立 Department Map (ID -> Name)
        const dMap = new Map();
        for (const d of departments || []) {
          const did = normId(d.departmentID);
          if (!did) continue;
          dMap.set(did, d.departmentName);
        }
        this.deptMap = dMap;

        // 3. 建立 Teacher Map (ID -> Name)
        const tMap = new Map();
        for (const t of teachers || []) {
          const tid = normId(t.teacherID);
          if (!tid) continue;
          tMap.set(tid, t.teacherName);
        }
        this.teacherMap = tMap;

        // 4. 建立 Course-Teacher Map (CourseID -> [TeacherName, ...])
        const ctMap = new Map();
        for (const ct of courseTeachers || []) {
          const cid = normId(ct.courseID);
          const tid = normId(ct.teacherID);
          const tName = tMap.get(tid);
          if (cid && tName) {
            if (!ctMap.has(cid)) ctMap.set(cid, []);
            ctMap.get(cid).push(tName);
          }
        }
        this.courseTeacherMap = ctMap;

        // 5. 建立 Classroom Map
        // - roomMap: courseID -> "F603"
        // - courseRoomMap: courseID -> { buildingCode, roomNumber }
        const rMap = new Map();
        const crMap = new Map();
        for (const r of classrooms || []) {
          const cid = normId(r.courseID);
          const buildingCode = String(r.buildingCode || "").trim();
          const roomNumber = String(r.roomNumber || "").trim();
          const code = `${buildingCode}${roomNumber}`;
          if (!cid) continue;
          if (code) rMap.set(cid, code);
          crMap.set(cid, { buildingCode, roomNumber });
        }
        this.roomMap = rMap;
        this.courseRoomMap = crMap;

        // 6. buildings: buildingCode -> buildingName
        const bNameMap = new Map();
        for (const b of buildings || []) {
          const code = String(b.buildingCode || "").trim();
          if (!code) continue;
          bNameMap.set(code, String(b.buildingName || "").trim());
        }
        this.buildingNameMap = bNameMap;

        // 7. buildingMaps: buildingCode -> imagePath
        const bImgMap = new Map();
        for (const bm of buildingMaps || []) {
          const code = String(bm.buildingCode || "").trim();
          if (!code) continue;
          bImgMap.set(code, normalizeImagePath(bm.imagePath));
        }
        this.buildingImgMap = bImgMap;

        this._coursesLoaded = true;
      } catch (e) {
        console.error("Data loading failed", e);
      }
    },

    async loadFavoritesFromDB() {
      if (!this.isLoggedIn || !this.userID) return;
      const rows = await apiGet("/userFavorites");
      const ids = new Set(
        (rows || [])
          .filter((r) => normId(r.userID) === normId(this.userID))
          .map((r) => normId(r.courseID))
          .filter(Boolean)
      );
      this.favoriteIds = ids;
    },

    async loadPreselectsFromDB() {
      if (!this.isLoggedIn || !this.userID) return;
      const rows = await apiGet("/userPreSelects");
      const ids = new Set(
        (rows || [])
          .filter((r) => normId(r.userID) === normId(this.userID))
          .map((r) => normId(r.courseID))
          .filter(Boolean)
      );
      this.preselectIds = ids;
    },

    // ✅ 核心：後端 raw course -> 前端顯示 view（收藏/預選會用）
    _mapToView(raw) {
      if (!raw) return null;
      const cid = normId(raw.courseID);

      // 教師
      const teachers = this.courseTeacherMap.get(cid) || [];
      const teacherStr = teachers.join(" / ") || "—";

      // 教室（F603）
      const roomStr = this.roomMap.get(cid) || "—";

      // buildingName / roomImage（如果你的後端沒這兩張表，safeApiGet 會回空，這裡就顯示 —）
      const roomInfo = this.courseRoomMap.get(cid) || {};
      const buildingCode = String(roomInfo.buildingCode || "").trim();
      const buildingName =
        buildingCode
          ? this.buildingNameMap.get(buildingCode) || `${buildingCode}棟`
          : "—";
      const roomImage =
        buildingCode
          ? this.buildingImgMap.get(buildingCode) || ""
          : "";

      // 系所名稱
      const deptName =
        this.deptMap.get(normId(raw.departmentID)) || raw.departmentID || "—";

      // ✅ 你 API 真實欄位（你之前貼的 courses JSON）
      const day = normalizeDay(raw.DayOfWeek ?? raw.day);
      const section = String(raw.timesSlot ?? raw.section ?? "").trim() || "—";
      const category = String(raw.courseType ?? raw.category ?? "").trim() || "—";

      // credit 欄位：你 courses 表常見是 credit（不是 credits）
      const credit = raw.credit ?? raw.credits ?? "—";

      return {
        ...raw,

        // 前端常用欄位
        courseID: raw.courseID,
        name: raw.courseName || raw.name || "—",
        dept: deptName,

        credit,
        grade: raw.grade || raw.class || "—",

        teacher: teacherStr,
        teacherFull: teacherStr,

        room: roomStr,

        // ✅ 新增給收藏/預選 tooltip 或卡片用
        buildingName,
        roomImage,

        category,
        day,
        section,
      };
    },

    // 重新組裝 favorites 和 preselects 陣列，讓畫面更新
    rebuildDetailLists() {
      const fav = [];
      for (const id of this.favoriteIds) {
        const raw = this.courseMap.get(normId(id));
        if (raw) fav.push(this._mapToView(raw));
      }
      this.favorites = fav;

      const pre = [];
      for (const id of this.preselectIds) {
        const raw = this.courseMap.get(normId(id));
        if (raw) pre.push(this._mapToView(raw));
      }
      this.preselects = pre;
    },

    // ✅ 收藏 Toggle（你的原本邏輯保留）
    async toggleFavorite(courseOrId) {
      if (!this.isLoggedIn || !this.userID) return alert("請先登入");

      const id = normId(courseOrId?.courseID ?? courseOrId);
      if (!id) return;

      const exists = this.favoriteIds.has(id);

      // 1. 樂觀 UI 更新
      if (exists) this.favoriteIds.delete(id);
      else this.favoriteIds.add(id);
      this.rebuildDetailLists();

      // 2. API
      try {
        if (exists) {
          await this._apiMutate("/userFavorites", "DELETE", {
            userID: this.userID,
            courseID: id,
          });
        } else {
          await this._apiMutate("/userFavorites", "POST", {
            userID: this.userID,
            courseID: id,
          });
        }
      } catch (e) {
        console.error("Toggle Favorite API Error:", e);
        await this.loadFavoritesFromDB();
        this.rebuildDetailLists();
        alert("操作失敗，請檢查網路");
      }
    },

    async deleteFavorite(courseID) {
      const id = normId(courseID);
      if (this.favoriteIds.has(id)) {
        await this.toggleFavorite(id);
      }
    },

    async deleteAllFavorites() {
      if (!this.favorites.length) return;
      if (!confirm("確定要刪除全部收藏？")) return;

      const backupIds = new Set(this.favoriteIds);

      this.favoriteIds.clear();
      this.rebuildDetailLists();

      try {
        for (const id of backupIds) {
          await this._apiMutate("/userFavorites", "DELETE", {
            userID: this.userID,
            courseID: id,
          });
        }
      } catch (e) {
        console.error("Delete All Error:", e);
        alert("部分刪除失敗，重新載入資料...");
        await this.loadFavoritesFromDB();
        this.rebuildDetailLists();
      }
    },

    // ✅ 預選 Toggle（你的原本邏輯保留）
    async togglePreselect(courseOrId) {
      if (!this.isLoggedIn || !this.userID) return alert("請先登入");

      const id = normId(courseOrId?.courseID ?? courseOrId);
      if (!id) return;

      const exists = this.preselectIds.has(id);

      if (exists) this.preselectIds.delete(id);
      else this.preselectIds.add(id);
      this.rebuildDetailLists();

      try {
        if (exists) {
          await this._apiMutate("/userPreSelects", "DELETE", {
            userID: this.userID,
            courseID: id,
          });
        } else {
          await this._apiMutate("/userPreSelects", "POST", {
            userID: this.userID,
            courseID: id,
          });
        }
      } catch (e) {
        console.error("Toggle Preselect API Error:", e);
        await this.loadPreselectsFromDB();
        this.rebuildDetailLists();
        alert("操作失敗");
      }
    },

    async removePreselect(courseID) {
      const id = normId(courseID);
      if (this.preselectIds.has(id)) {
        await this.togglePreselect(id);
      }
    },
  },
});
