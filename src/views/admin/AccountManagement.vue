<template>
  <div class="p3-acc-page">
    <!-- 查詢列 -->
    <div class="p3-card p3-row">
      <div class="p3-row-left">
        <div class="p3-row-title">查詢帳號</div>
        <div class="p3-row-sub">SEARCH BY USERNAME / NAME / ID</div>
      </div>

      <div class="p3-row-right">
        <input
          v-model.trim="query"
          class="p3-input"
          placeholder="請輸入 學號 / 姓名 / 班級 / 性別"
          @keydown.enter="onSearch"
        />

        <button class="p3-btn p3-btn-primary p3-no-skew" @click="onSearch" :disabled="isLoading">
          查詢
        </button>

        <button
          class="p3-btn p3-btn-ghost p3-no-skew"
          @click="refresh"
          :disabled="isLoading"
          title="重新抓取資料"
        >
          重新取得
        </button>
      </div>
    </div>

    <!-- 功能鍵 -->
    <div class="p3-actions">
      <button class="p3-btn p3-btn-primary p3-no-skew" @click="onCreate">新增</button>

      <button
        class="p3-btn p3-btn-ghost p3-no-skew"
        :disabled="!selectedUserID"
        @click="onEdit"
        title="請先選取一筆資料"
      >
        修改
      </button>

      <button
        class="p3-btn p3-btn-danger p3-no-skew"
        :disabled="!selectedUserID"
        @click="onDelete"
        title="請先選取一筆資料"
      >
        刪除
      </button>
    </div>

    <!-- 狀態列 -->
    <div v-if="errorMsg" class="p3-alert">{{ errorMsg }}</div>

    <!-- 表格 -->
    <div class="p3-card p3-table-wrap">
      <div class="p3-table-head">
        <div class="p3-table-title">使用者列表</div>
        <div class="p3-table-sub">
          目前顯示 <b>{{ usersPage.length }}</b> / <b>{{ usersView.length }}</b> 筆
          <span v-if="isLoading">｜載入中…</span>
        </div>
      </div>

      <div class="p3-table-scroll">
        <table class="p3-table">
          <thead>
            <tr>
              <th class="center">選取</th>
              <th>學號（userID）</th>
              <th>姓名（username）</th>
              <th>性別（gender）</th>
              <th>班級（class）</th>
              <th>角色（isadmin）</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="u in usersPage"
              :key="u.userID"
              :class="['p3-tr', selectedUserID === u.userID ? 'is-selected' : '']"
              @click="selectRow(u.userID)"
            >
              <td class="center">
                <input
                  type="radio"
                  name="selected"
                  :value="u.userID"
                  v-model="selectedUserID"
                  @click.stop
                />
              </td>

              <td class="strong">{{ u.userID }}</td>
              <td>{{ u.username }}</td>
              <td>{{ u.gender || "—" }}</td>
              <td>{{ u.className || "—" }}</td>

              <td>
                <span class="p3-role-pill" :class="u.isadmin === 1 ? 'admin' : 'user'">
                  {{ u.isadmin === 1 ? "是" : "否" }}
                </span>
              </td>
            </tr>

            <tr v-if="isLoading">
              <td class="center empty" colspan="6">讀取中…</td>
            </tr>

            <tr v-if="!isLoading && usersView.length === 0">
              <td class="center empty" colspan="6">
                沒有資料（可嘗試清空查詢或重新取得）
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ✅ 分頁區 -->
      <div class="p3-pagination-bar" v-if="usersView.length > 0">
        <div class="p3-pagination-left">
          <label class="p3-pg-field">
            <span class="p3-pg-label">每頁顯示</span>

            <div class="p3-dd p3-dd--sm" :class="{ open: ddPageSizeOpen }">
              <button
                type="button"
                class="p3-dd-btn p3-dd-btn--sm"
                @click.stop="togglePageSize()"
                :aria-expanded="ddPageSizeOpen"
              >
                <span class="p3-dd-text">{{ pageSize }}</span>
                <span class="p3-dd-caret">▼</span>
              </button>

              <transition name="p3-dd-fade">
                <div v-if="ddPageSizeOpen" class="p3-dd-menu p3-dd-menu--sm" role="listbox">
                  <button
                    v-for="n in [10, 20, 30, 50]"
                    :key="n"
                    type="button"
                    class="p3-dd-item"
                    :class="{ active: n === pageSize }"
                    @click="selectPageSize(n)"
                  >
                    {{ n }}
                  </button>
                </div>
              </transition>
            </div>

            <span class="p3-pg-label">筆</span>
          </label>

          <div class="p3-pg-pages">
            <button class="p3-pg-btn" @click="prevPage" :disabled="currentPage <= 1">
              ← 上一頁
            </button>

            <span class="p3-pg-text">第 <b>{{ currentPage }}</b> / <b>{{ totalPages }}</b> 頁</span>

            <button class="p3-pg-btn" @click="nextPage" :disabled="currentPage >= totalPages">
              下一頁 →
            </button>
          </div>
        </div>

        <div class="p3-pagination-right">
          <label class="p3-pg-field">
            <span class="p3-pg-label">跳到</span>

            <input
              v-model.number="jumpPage"
              type="number"
              :min="1"
              :max="totalPages"
              class="p3-pg-jump"
              @keydown.enter="goToPage(jumpPage)"
            />

            <button class="p3-pg-go" @click="goToPage(jumpPage)">GO</button>
          </label>

          <div class="p3-pg-summary">
            目前顯示 <b>{{ usersPage.length }}</b> / <b>{{ usersView.length }}</b>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "";

const isLoading = ref(false);
const errorMsg = ref("");

const query = ref("");
const selectedUserID = ref("");

/* ✅ 分頁 */
const pageSize = ref(20);
const currentPage = ref(1);
const jumpPage = ref(1);

/* ✅ dropdown（pageSize） */
const ddPageSizeOpen = ref(false);
function togglePageSize() {
  ddPageSizeOpen.value = !ddPageSizeOpen.value;
}
function selectPageSize(n) {
  pageSize.value = Number(n);
  ddPageSizeOpen.value = false;
}

/* data */
const users = ref([]);

/* ✅ 班級：classID -> className */
const classMap = ref(new Map());
function cleanText(v) {
  return String(v ?? "").replace(/\r/g, "").trim();
}

async function fetchClasses() {
  // 有資料就不重抓
  if (classMap.value.size > 0) return;

  try {
    const res = await fetch(`${API_BASE}/api/class`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error("class API 回傳格式不是陣列（Array）");

    const m = new Map();
    for (const c of raw) {
      const id = String(c?.classID ?? c?.classId ?? c?.id ?? "").trim();
      const name = cleanText(c?.className ?? c?.name ?? "");
      if (id !== "") m.set(id, name);
    }
    classMap.value = m;
  } catch (e) {
    // class 失敗不擋 users（只是不顯示班級名稱）
    console.warn("fetchClasses failed:", e?.message || e);
  }
}

/** ✅ 依你 DB：userID=學號、username=姓名、gender=性別、isadmin=1/0、classID=班級id（如果有） */
function normalizeUserRow(row) {
  const userID = cleanText(row?.userID ?? row?.userid ?? row?.id ?? "");
  const username = cleanText(row?.username ?? row?.name ?? "");
  const gender = cleanText(row?.gender ?? "");
  const isadmin = Number(row?.isadmin ?? 0);

  // ✅ 可能的欄位名稱都接住
  const classID = String(row?.classID ?? row?.classId ?? row?.class_id ?? "").trim();
  const className = classID ? (classMap.value.get(classID) || "") : "";

  return {
    userID,
    username,
    gender,
    isadmin,
    classID,
    className,
  };
}

async function fetchUsers() {
  errorMsg.value = "";
  isLoading.value = true;

  try {
    // ✅ 先抓班級對照表，再抓 users
    await fetchClasses();

    const res = await fetch(`${API_BASE}/api/users`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error("API 回傳格式不是陣列（Array）");

    users.value = raw.map(normalizeUserRow).filter((u) => u.userID);

    currentPage.value = 1;
    jumpPage.value = 1;

    if (selectedUserID.value && !users.value.some((u) => u.userID === selectedUserID.value)) {
      selectedUserID.value = "";
    }
  } catch (e) {
    errorMsg.value = `取得 users 失敗：${e?.message || "unknown error"}`;
  } finally {
    isLoading.value = false;
  }
}

/* 查詢（前端 filter） */
const usersView = computed(() => {
  const q = query.value?.trim().toLowerCase();
  if (!q) return users.value;

  return users.value.filter((u) => {
    return (
      String(u.userID).toLowerCase().includes(q) ||
      String(u.username).toLowerCase().includes(q) ||
      String(u.gender).toLowerCase().includes(q) ||
      String(u.className || "").toLowerCase().includes(q) ||
      String(u.isadmin).toLowerCase().includes(q)
    );
  });
});

/* 分頁 computed */
const totalPages = computed(() => {
  const total = usersView.value.length;
  const size = Math.max(1, Number(pageSize.value) || 20);
  return Math.max(1, Math.ceil(total / size));
});

const usersPage = computed(() => {
  const size = Math.max(1, Number(pageSize.value) || 20);
  const page = Math.min(Math.max(1, Number(currentPage.value) || 1), totalPages.value);
  const start = (page - 1) * size;
  return usersView.value.slice(start, start + size);
});

function clampPage(p) {
  const n = Number(p) || 1;
  return Math.min(Math.max(1, n), totalPages.value);
}
function prevPage() {
  currentPage.value = clampPage(currentPage.value - 1);
  jumpPage.value = currentPage.value;
}
function nextPage() {
  currentPage.value = clampPage(currentPage.value + 1);
  jumpPage.value = currentPage.value;
}
function goToPage(p) {
  currentPage.value = clampPage(p);
  jumpPage.value = currentPage.value;
}

watch(pageSize, () => {
  currentPage.value = clampPage(currentPage.value);
  jumpPage.value = currentPage.value;
});
watch(query, () => {
  currentPage.value = 1;
  jumpPage.value = 1;
});
watch(usersView, () => {
  currentPage.value = clampPage(currentPage.value);
  jumpPage.value = currentPage.value;
});

function selectRow(userID) {
  selectedUserID.value = userID;
}

async function refresh() {
  // ✅ refresh 也重新抓班級（避免後端新增班級）
  classMap.value = new Map();
  await fetchUsers();
}
async function onSearch() {
  currentPage.value = 1;
  jumpPage.value = 1;
}

/* ✅ 新增/修改：導頁 */
function onCreate() {
  router.push("/admin/users/new");
}
function onEdit() {
  if (!selectedUserID.value) return;
  router.push(`/admin/users/${encodeURIComponent(selectedUserID.value)}/edit`);
}

/* ✅ 刪除：真刪除（DELETE） */
async function onDelete() {
  if (!selectedUserID.value) return;

  const ok = confirm(`確認刪除 學號 ${selectedUserID.value}？`);
  if (!ok) return;

  errorMsg.value = "";
  isLoading.value = true;

  try {
    const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(selectedUserID.value)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);

    await fetchUsers();
    selectedUserID.value = "";
  } catch (e) {
    errorMsg.value = `刪除失敗：${e?.message || "unknown error"}`;
  } finally {
    isLoading.value = false;
  }
}

/* ✅ 點外面關閉 dropdown */
function onDocClick(e) {
  const el = e.target.closest?.(".p3-dd");
  if (!el) ddPageSizeOpen.value = false;
}
onMounted(() => {
  document.addEventListener("click", onDocClick);
  fetchUsers();
});
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<style scoped>
.p3-acc-page { width: 100%; display: grid; gap: 14px; }
.p3-btn:active,
.p3-btn-danger:active,
.p3-btn-ghost:active,
.p3-btn-primary:active {
  transform: translateY(0) scale(0.98) !important;
}

/* 查詢列 RWD */
.p3-row{
  display:grid;
  grid-template-columns: minmax(0,1fr) minmax(0,1.2fr);
  gap:14px;
  align-items:center;
}

.p3-row-title { font-weight: 900; font-size: 18px; letter-spacing: 0.04em; }
.p3-row-sub { margin-top: 4px; font-size: 12px; color: rgba(180,200,230,0.75); letter-spacing: 0.16em; text-transform: uppercase; }
.p3-row-right{
  display:grid;
  grid-template-columns: minmax(0,1fr) auto auto;
  gap:10px;
  align-items:center;
}

.p3-row-left,
.p3-row-right{
  min-width: 0;
}
@media (max-width: 860px){
  .p3-row{ grid-template-columns: 1fr; }
  .p3-row-right{ grid-template-columns: 1fr; }
  .p3-row-right .p3-btn{ width: 100%; }
}

/* 功能鍵 RWD */
.p3-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.p3-actions .p3-btn { min-width: 110px; }
@media (max-width: 520px){
  .p3-actions .p3-btn{ flex: 1; min-width: 0; }
}
.p3-row-right .p3-input{
  min-width: 0;
  width: 100%;
}
.p3-acc-page{ overflow-x: auto; }

/* ✅ 按下去不要變形 */
.p3-no-skew:active{ transform: none !important; }

/* danger button */
.p3-btn-danger{
  background: linear-gradient(135deg, rgba(255, 76, 76, 0.95), rgba(255, 120, 120, 0.7));
  color: #1a0b0b;
  box-shadow: 0 8px 24px rgba(255, 76, 76, 0.22);
}
.p3-btn-danger:hover{
  background: #fff;
  box-shadow: 0 10px 34px rgba(255, 76, 76, 0.35), 0 0 12px rgba(255,255,255,0.6);
  transform: translateY(-2px);
}

/* table */
.p3-table-wrap{ padding: 18px; }
.p3-table-head{ display:flex; align-items: end; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.p3-table-title{ font-weight: 900; letter-spacing: 0.04em; }
.p3-table-sub{ font-size: 12px; color: rgba(180,200,230,0.75); }

.p3-table-scroll{ width: 100%; overflow: auto; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); }
.p3-table{ width: 100%; min-width: 980px; border-collapse: collapse; font-size: 14px; } /* ✅ 多一欄班級 */
.p3-table thead tr{ background: rgba(255,255,255,0.06); }
.p3-table th, .p3-table td{ padding: 12px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
.p3-table th{ color: rgba(234,242,255,0.86); font-weight: 900; letter-spacing: 0.04em; text-align: left; }
.center{ text-align:center; }
.strong{ font-weight: 900; }
.empty{ padding: 18px; color: rgba(180,200,230,0.8); }

.p3-tr{ cursor:pointer; transition: background .16s ease; }
.p3-tr:hover{ background: rgba(47,230,255,0.08); }
.is-selected{ background: rgba(148,123,255,0.10); box-shadow: inset 0 0 0 1px rgba(148,123,255,0.22); }

.p3-alert{
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 76, 76, 0.12);
  border: 1px solid rgba(255, 76, 76, 0.22);
  color: rgba(255, 210, 210, 0.95);
  font-weight: 700;
}
.p3-hint{ margin-top: 12px; font-size: 12px; color: rgba(180,200,230,0.75); }

/* role pill */
.p3-role-pill{
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.18);
  color: rgba(234,242,255,0.9);
}
.p3-role-pill.admin{
  border-color: rgba(255,190,11,0.35);
  box-shadow: 0 0 0 1px rgba(255,190,11,0.12) inset;
}
.p3-role-pill.user{
  border-color: rgba(47,230,255,0.28);
  box-shadow: 0 0 0 1px rgba(47,230,255,0.10) inset;
}

/* 分頁區（你原本那套） */
.p3-pagination-bar{ margin-top:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; }
.p3-pagination-left,.p3-pagination-right{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.p3-pg-field{ display:inline-flex; align-items:center; gap:10px; padding:8px 10px; border-radius:14px; background:rgba(0,0,0,0.16); border:1px solid rgba(255,255,255,0.10); }
.p3-pg-label{ font-size:12px; font-weight:800; color:rgba(180,200,230,0.8); }
.p3-pg-pages{ display:inline-flex; align-items:center; gap:10px; padding:8px 10px; border-radius:14px; background:rgba(0,0,0,0.16); border:1px solid rgba(255,255,255,0.10); }
.p3-pg-btn{ height:38px; padding:0 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); color:rgba(234,242,255,0.86); font-weight:900; cursor:pointer; transition: transform .12s ease, box-shadow .18s ease, border-color .18s ease; }
.p3-pg-btn:hover:not(:disabled){ transform:translateY(-1px); box-shadow:0 10px 22px rgba(0,0,0,0.25); border-color:rgba(47,230,255,0.28); }
.p3-pg-btn:disabled{ opacity:.45; cursor:not-allowed; }
.p3-pg-text{ font-size:13px; color:rgba(234,242,255,0.86); }
.p3-pg-jump{ width:92px; height:38px; padding:0 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.16); background:rgba(0,0,0,0.18); color:rgba(234,242,255,0.92); font-weight:900; outline:none; }
.p3-pg-go{ height:38px; padding:0 16px; border-radius:12px; border:0; background:linear-gradient(135deg, rgba(47,230,255,0.95), rgba(148,123,255,0.55)); color:#061224; font-weight:1000; letter-spacing:0.04em; cursor:pointer; transition: transform .12s ease, box-shadow .18s ease; }
.p3-pg-go:hover{ transform:translateY(-1px); box-shadow:0 12px 26px rgba(47,230,255,0.18); }
.p3-pg-summary{ font-size:12px; color:rgba(180,200,230,0.78); font-weight:800; }

/* ✅ dropdown（展開像你圖片2） */
.p3-dd { position: relative; width: 92px; }
.p3-dd--sm { width: 92px; }

.p3-dd-btn{
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(0,0,0,0.18);
  color: rgba(234,242,255,0.92);
  font-weight: 900;
  display:flex;
  align-items:center;
  justify-content: space-between;
  cursor:pointer;
  outline:none;
}
.p3-dd-btn--sm{ height: 38px; }

.p3-dd.open .p3-dd-btn{
  border-color: rgba(47,230,255,0.45);
  box-shadow: 0 0 18px rgba(47,230,255,0.12);
}

.p3-dd-caret{
  font-size: 10px;
  color: rgba(47,230,255,0.95);
  transition: transform .18s ease;
}
.p3-dd.open .p3-dd-caret{ transform: rotate(180deg); }

.p3-dd-menu{
  position:absolute;
  left:0; right:0;
  top: calc(100% + 10px);
  z-index: 80;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(47,230,255,0.22);
  background: rgba(10, 20, 38, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 70px rgba(0,0,0,0.55), 0 0 30px rgba(47,230,255,0.12);
}
.p3-dd-menu--sm{ padding: 8px; }

.p3-dd-item{
  width:100%;
  text-align:left;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(234,242,255,0.90);
  cursor:pointer;
  font-weight: 900;
  transition: all .16s ease;
}
.p3-dd-item:hover{
  background: rgba(47,230,255,0.12);
  border-color: rgba(47,230,255,0.22);
}
.p3-dd-item.active{
  background: rgba(47,230,255,0.18);
  border-color: rgba(47,230,255,0.35);
  box-shadow: 0 0 18px rgba(47,230,255,0.10);
}

.p3-dd-fade-enter-active,
.p3-dd-fade-leave-active{
  transition: opacity .15s ease, transform .15s ease;
}
.p3-dd-fade-enter-from,
.p3-dd-fade-leave-to{
  opacity: 0;
  transform: translateY(-4px);
}
</style>
