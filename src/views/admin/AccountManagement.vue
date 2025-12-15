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

            <tr v-if="studentsView.length === 0">
              <td class="center empty" colspan="8">
                沒有資料（可嘗試清空查詢或重新取得）
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const isLoading = ref(false);
const errorMsg = ref("");

const query = ref("");
const selectedId = ref("");

const students = ref([
  {
    id: "1001",
    gender: "女",
    name: "楊咔咔",
    class: "資四1C",
    phone: "0938501928",
    address: "台北市信義區",
    email: "aa@mail.com",
  },
  {
    id: "1002",
    gender: "女",
    name: "王杯杯",
    class: "資四1C",
    phone: "0912582957",
    address: "台中市西屯區",
    email: "bb@ntunhs.tw",
  },
]);

// ✅ 之後串 API：studentsView 就是你顯示用資料源（可接查詢條件）
const studentsView = computed(() => {
  const q = query.value;
  if (!q) return students.value;
  return students.value.filter((s) => String(s.id).includes(q));
});

function selectRow(id) {
  selectedId.value = id;
}

/** ✅ 查詢（之後改成 API：GET /students?query=...） */
async function onSearch() {
  errorMsg.value = "";
  isLoading.value = true;

  try {
    // demo：目前用 computed 篩選就好
    // 之後你可以在這裡呼叫 API，把 students.value 換成回傳資料
  } catch (e) {
    errorMsg.value = "查詢失敗，請稍後再試。";
  } finally {
    isLoading.value = false;
  }
}

/** ✅ 新增（之後改成打開新增表單 modal → POST /students） */
function onCreate() {
  errorMsg.value = "";
  // demo：先提示，之後接你的新增彈窗/頁面
  alert("TODO：新增（之後接 API / 表單）");
}

/** ✅ 修改（需要 selectedId，之後打開編輯 modal → PUT /students/:id） */
function onEdit() {
  errorMsg.value = "";
  if (!selectedId.value) return;
  alert(`TODO：修改學號 ${selectedId.value}（之後接 API / 表單）`);
}

/** ✅ 刪除（需要 selectedId，之後接你剛做的 Confirm Popup → DELETE /students/:id） */
function onDelete() {
  errorMsg.value = "";
  if (!selectedId.value) return;

  // demo：先用 confirm，之後換成你那個 Persona Confirm Modal
  const ok = confirm(`確認刪除學號 ${selectedId.value}？`);
  if (!ok) return;

  students.value = students.value.filter((s) => s.id !== selectedId.value);
  selectedId.value = "";
}
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
  grid-template-columns: 1fr auto;
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
  overflow: auto;            /* ✅ 讓表格自己滾動，避免整頁 overflow */
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
}

.p3-table{
  width: 100%;
  min-width: 980px;          /* ✅ 欄位多：桌機維持完整，手機用 scroll */
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
</style>
