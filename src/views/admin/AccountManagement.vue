<template>
  <div class="p3-acc-page">
    <!-- 查詢列 -->
    <div class="p3-card p3-row">
      <div class="p3-row-left">
        <div class="p3-row-title">查詢帳號</div>
        <div class="p3-row-sub">Search by Student ID</div>
      </div>

      <div class="p3-row-right">
        <input
          v-model.trim="query"
          class="p3-input"
          placeholder="請輸入學號，例如 1001"
          @keydown.enter="onSearch"
        />
        <button class="p3-btn p3-btn-primary" @click="onSearch" :disabled="isLoading">
          查詢
        </button>

        <button class="p3-btn p3-btn-ghost" @click="refresh" :disabled="isLoading" title="重新抓取資料">
          重新取得
        </button>
      </div>
    </div>

    <!-- 功能鍵 -->
    <div class="p3-actions">
      <button class="p3-btn p3-btn-primary" @click="onCreate">
        新增
      </button>

      <button
        class="p3-btn p3-btn-ghost"
        :disabled="!selectedId"
        @click="onEdit"
        title="請先選取一筆資料"
      >
        修改
      </button>

      <button
        class="p3-btn p3-btn-danger"
        :disabled="!selectedId"
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
        <div class="p3-table-title">學生帳號列表</div>
        <div class="p3-table-sub">
          共 <b>{{ studentsView.length }}</b> 筆
          <span v-if="selectedId">｜已選：<b>{{ selectedId }}</b></span>
          <span v-if="isLoading">｜載入中…</span>
        </div>
      </div>

      <div class="p3-table-scroll">
        <table class="p3-table">
          <thead>
            <tr>
              <th class="center">選取</th>
              <th>學號</th>
              <th>性別</th>
              <th>姓名</th>
              <th>班級</th>
              <th>電話</th>
              <th>地址</th>
              <th>mail</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="s in studentsView"
              :key="s.id"
              :class="['p3-tr', selectedId === s.id ? 'is-selected' : '']"
              @click="selectRow(s.id)"
            >
              <td class="center">
                <input
                  type="radio"
                  name="selected"
                  :value="s.id"
                  v-model="selectedId"
                  @click.stop
                />
              </td>
              <td class="strong">{{ s.id }}</td>
              <td>{{ s.gender }}</td>
              <td>{{ s.name }}</td>
              <td>{{ s.class }}</td>
              <td>{{ s.phone }}</td>
              <td class="ellipsis" :title="s.address">{{ s.address }}</td>
              <td class="ellipsis" :title="s.email">{{ s.email }}</td>
            </tr>

            <tr v-if="!isLoading && studentsView.length === 0">
              <td class="center empty" colspan="8">
                沒有資料（可嘗試清空查詢或重新取得）
              </td>
            </tr>

            <tr v-if="isLoading">
              <td class="center empty" colspan="8">
                讀取中…
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 小提示：你目前後端只有 GET 全表 -->
      <div class="p3-hint">
        ✅ 目前已串：GET <b>/api/users</b>（全表）｜🧪 查詢先用前端篩選｜
        🧠 後續再補：GET 帶 query / DELETE / POST / PUT
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

/**
 * ✅ API Base
 * - 若你有設定 Vite proxy（推薦）：就用相對路徑 "/api/users"
 * - 若你沒有 proxy：可以在 .env 設定 VITE_API_BASE_URL=http://127.0.0.1:5000
 */
const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "";

const isLoading = ref(false);
const errorMsg = ref("");

const query = ref("");
const selectedId = ref("");

/**
 * students：前端顯示用統一格式
 * id, gender, name, class, phone, address, email
 */
const students = ref([]);

/**
 * ✅ 將後端 users 原始欄位「映射」成前端需要的欄位
 * 因為你目前後端是 SELECT *，欄位名稱不一定剛好叫這些
 * 所以做一層容錯 mapping，避免前端直接爆掉
 */
function normalizeUserRow(row) {
  // ⚠️ 下面這些 key 是「可能」出現的命名
  const id =
    row.id ??
    row.userID ??
    row.studentId ??
    row.student_id ??
    row.account ??
    "";

  const gender =
    row.gender ??
    row.sex ??
    row.Gender ??
    "";

  const name =
    row.name ??
    row.username ??
    row.userName ??
    row.fullname ??
    "";

  const cls =
    row.class ??
    row.className ??
    row.class_name ??
    row.departmentClass ??
    "";

  const phone =
    row.phone ??
    row.tel ??
    row.mobile ??
    row.phoneNumber ??
    "";

  const address =
    row.address ??
    row.addr ??
    row.homeAddress ??
    "";

  const email =
    row.email ??
    row.mail ??
    row.Email ??
    "";

  return {
    id: String(id || ""),
    gender: String(gender || ""),
    name: String(name || ""),
    class: String(cls || ""),
    phone: String(phone || ""),
    address: String(address || ""),
    email: String(email || ""),
  };
}

/**
 * ✅ 現在可串的 API：GET /api/users（全表）
 */
async function fetchUsers() {
  errorMsg.value = "";
  isLoading.value = true;

  try {
    // ✅ 推薦：有 proxy 就用 "/api/users"
    // 沒 proxy：API_BASE = "http://127.0.0.1:5000"
    const res = await fetch(`${API_BASE}/api/users`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const raw = await res.json();
    if (!Array.isArray(raw)) {
      throw new Error("API 回傳格式不是陣列（Array）");
    }

    const normalized = raw.map(normalizeUserRow).filter((u) => u.id);
    students.value = normalized;

    // 若目前選取的 id 不存在了，清掉
    if (selectedId.value && !students.value.some((s) => s.id === selectedId.value)) {
      selectedId.value = "";
    }
  } catch (e) {
    errorMsg.value = `取得 users 失敗：${e?.message || "unknown error"}`;
  } finally {
    isLoading.value = false;
  }
}

/**
 * ✅ 顯示用資料源（先用前端 query 篩選）
 * 之後後端支援查詢後，可改成打：GET /api/users?query=...
 */
const studentsView = computed(() => {
  const q = query.value?.trim();
  if (!q) return students.value;
  return students.value.filter((s) => String(s.id).includes(q));
});

function selectRow(id) {
  selectedId.value = id;
}

async function refresh() {
  await fetchUsers();
}

/**
 * ✅ 查詢（目前：前端篩選；之後：改後端查詢）
 */
async function onSearch() {
  errorMsg.value = "";

  // ✅ 目前後端沒有 query 參數，所以不必額外打 API
  // 你按查詢只是觸發 computed 更新（UI 會自己變）
  // 但保留 hook，方便你之後改成「打查詢 API」

  // 🧠 TODO（後端補上後改這裡）：
  // - GET /api/users?query=1001
  // - 回來後 students.value = 回傳資料
}

/**
 * ✅ 新增（目前後端無 POST）
 */
function onCreate() {
  errorMsg.value = "";
  alert("TODO：新增（後端需要提供 POST /api/users 或 /api/admin/users）");
}

/**
 * ✅ 修改（目前後端無 PUT）
 */
function onEdit() {
  errorMsg.value = "";
  if (!selectedId.value) return;
  alert(`TODO：修改學號 ${selectedId.value}（後端需要提供 PUT /api/users/${selectedId.value}）`);
}

/**
 * ✅ 刪除
 * - 目前後端無 DELETE，所以先做「UI 操作」提示
 * - 之後後端補 DELETE，再把 TODO 區塊打開即可
 */
async function onDelete() {
  errorMsg.value = "";
  if (!selectedId.value) return;

  const ok = confirm(`確認刪除學號 ${selectedId.value}？`);
  if (!ok) return;

  // ✅ 目前後端沒有 DELETE，所以先不真的刪 DB，只做提示
  // 你也可以先做本地刪除（假動作），讓 UI 看起來像刪了：
  students.value = students.value.filter((s) => s.id !== selectedId.value);
  selectedId.value = "";

  // 🧠 TODO（後端補上後打開）：
  // try {
  //   isLoading.value = true;
  //   const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(selectedId.value)}`, {
  //     method: "DELETE",
  //   });
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //   await fetchUsers(); // 刪完重新拉
  // } catch (e) {
  //   errorMsg.value = `刪除失敗：${e?.message || "unknown error"}`;
  // } finally {
  //   isLoading.value = false;
  // }
}

onMounted(async () => {
  await fetchUsers();
});
</script>

<style scoped>
.p3-acc-page{
  width: 100%;
  display: grid;
  gap: 14px;
}

/* 查詢列 */
.p3-row{
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 14px;
  align-items: center;
}

.p3-row-title{
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.04em;
}
.p3-row-sub{
  margin-top: 4px;
  font-size: 12px;
  color: rgba(180, 200, 230, 0.75);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.p3-row-right{
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
}

@media (max-width: 860px){
  .p3-row{ grid-template-columns: 1fr; }
  .p3-row-right{ grid-template-columns: 1fr; }
}

/* 功能鍵 */
.p3-actions{
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.p3-actions .p3-btn{
  min-width: 110px;
}

/* danger button */
.p3-btn-danger{
  background: linear-gradient(135deg, rgba(255, 76, 76, 0.95), rgba(255, 120, 120, 0.7));
  color: #1a0b0b;
  box-shadow: 0 8px 24px rgba(255, 76, 76, 0.22);
}
.p3-btn-danger:hover{
  background: #fff;
  box-shadow: 0 10px 34px rgba(255, 76, 76, 0.35), 0 0 12px rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}
.p3-btn-danger:active{
  transform: skewX(-12deg) scale(0.96);
}

/* table */
.p3-table-wrap{
  padding: 18px;
}
.p3-table-head{
  display:flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.p3-table-title{
  font-weight: 900;
  letter-spacing: 0.04em;
}
.p3-table-sub{
  font-size: 12px;
  color: rgba(180, 200, 230, 0.75);
}

.p3-table-scroll{
  width: 100%;
  overflow: auto;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
}

.p3-table{
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  font-size: 14px;
}

.p3-table thead tr{
  background: rgba(255,255,255,0.06);
}
.p3-table th,
.p3-table td{
  padding: 12px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  white-space: nowrap;
}
.p3-table th{
  color: rgba(234,242,255,0.86);
  font-weight: 900;
  letter-spacing: 0.04em;
  text-align: left;
}
.center{ text-align: center; }
.strong{ font-weight: 900; }
.ellipsis{
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p3-tr{
  cursor: pointer;
  transition: background .16s ease;
}
.p3-tr:hover{
  background: rgba(47,230,255,0.08);
}
.is-selected{
  background: rgba(148,123,255,0.10);
  box-shadow: inset 0 0 0 1px rgba(148,123,255,0.22);
}

.empty{
  padding: 18px;
  color: rgba(180, 200, 230, 0.8);
}

.p3-alert{
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 76, 76, 0.12);
  border: 1px solid rgba(255, 76, 76, 0.22);
  color: rgba(255, 210, 210, 0.95);
  font-weight: 700;
}

.p3-hint{
  margin-top: 12px;
  font-size: 12px;
  color: rgba(180, 200, 230, 0.75);
}
</style>
