<template>
  <div class="p3-user-page">
    <div class="p3-card p3-head">
      <div>
        <div class="kicker">ADMIN · USERS</div>
        <h1 class="title">新增使用者</h1>
      </div>
      <button class="p3-btn p3-btn-ghost" @click="goBack" :disabled="isLoading">返回</button>
    </div>

    <div v-if="errorMsg" class="p3-alert">{{ errorMsg }}</div>
    <div v-if="okMsg" class="p3-ok">{{ okMsg }}</div>

    <div class="p3-card p3-form">
      <div class="grid">
        <div class="field">
          <label>學號（userID）*</label>
          <input v-model.trim="form.userID" class="p3-input" placeholder="例如：11200201" />
        </div>

        <div class="field">
          <label>姓名（username）*</label>
          <input v-model.trim="form.username" class="p3-input" placeholder="例如：陳志豪" />
        </div>

        <div class="field">
          <label>性別（gender）</label>

          <div class="p3-dd" :class="{ open: ddGenderOpen }">
            <button
              type="button"
              class="p3-dd-btn p3-dd-btn--full"
              @click.stop="ddGenderOpen = !ddGenderOpen"
            >
              <span class="p3-dd-text">{{ form.gender || "—" }}</span>
              <span class="p3-dd-caret">▼</span>
            </button>

            <transition name="p3-dd-fade">
              <div v-if="ddGenderOpen" class="p3-dd-menu" role="listbox">
                <button type="button" class="p3-dd-item" :class="{ active: form.gender === '' }" @click="pickGender('')">—</button>
                <button type="button" class="p3-dd-item" :class="{ active: form.gender === '男' }" @click="pickGender('男')">男</button>
                <button type="button" class="p3-dd-item" :class="{ active: form.gender === '女' }" @click="pickGender('女')">女</button>
                <button type="button" class="p3-dd-item" :class="{ active: form.gender === '其他' }" @click="pickGender('其他')">其他</button>
              </div>
            </transition>
          </div>
        </div>

        <!-- ✅ 班級 dropdown（由 /api/class 取得） -->
        <div class="field">
          <label>班級（classID）</label>

          <div class="p3-dd" :class="{ open: ddClassOpen }">
            <button
              type="button"
              class="p3-dd-btn p3-dd-btn--full"
              @click.stop="ddClassOpen = !ddClassOpen"
            >
              <span class="p3-dd-text">
                {{ selectedClassText }}
              </span>
              <span class="p3-dd-caret">▼</span>
            </button>

            <transition name="p3-dd-fade">
              <div v-if="ddClassOpen" class="p3-dd-menu" role="listbox">
                <button
                  type="button"
                  class="p3-dd-item"
                  :class="{ active: form.classID == null }"
                  @click="pickClass(null)"
                >
                  —
                </button>

                <button
                  v-for="c in classList"
                  :key="c.classID"
                  type="button"
                  class="p3-dd-item"
                  :class="{ active: String(form.classID) === String(c.classID) }"
                  @click="pickClass(c.classID)"
                >
                  {{ c.className }}（{{ c.classID }}）
                </button>
              </div>
            </transition>
          </div>

          <div class="hint" style="margin-top:8px">
            來源：GET <b>/api/class</b>
          </div>
        </div>

        <div class="field">
          <label>手機（phone）</label>
          <input v-model.trim="form.phone" class="p3-input" placeholder="例如：0910-555-001" />
        </div>

        <div class="field">
          <label>Email（email）</label>
          <input v-model.trim="form.email" type="email" class="p3-input" placeholder="例如：u201@mail.edu.tw" />
        </div>

        <div class="field full">
          <label>地址（address）</label>
          <input v-model.trim="form.address" class="p3-input" placeholder="例如：台北市中正區中山南路1號" />
        </div>

        <div class="field">
          <label>密碼（password）*</label>
          <input v-model.trim="form.password" type="password" class="p3-input" placeholder="請輸入密碼" />
        </div>

        <div class="field">
          <label>是否管理員（isadmin）</label>

          <div class="p3-dd" :class="{ open: ddAdminOpen }">
            <button
              type="button"
              class="p3-dd-btn p3-dd-btn--full"
              @click.stop="ddAdminOpen = !ddAdminOpen"
            >
              <span class="p3-dd-text">{{ form.isadmin === 1 ? "是（1）" : "否（0）" }}</span>
              <span class="p3-dd-caret">▼</span>
            </button>

            <transition name="p3-dd-fade">
              <div v-if="ddAdminOpen" class="p3-dd-menu" role="listbox">
                <button type="button" class="p3-dd-item" :class="{ active: form.isadmin === 0 }" @click="pickAdmin(0)">否（0）</button>
                <button type="button" class="p3-dd-item" :class="{ active: form.isadmin === 1 }" @click="pickAdmin(1)">是（1）</button>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="p3-btn p3-btn-primary" @click="submit" :disabled="isLoading || !canSubmit">
          {{ isLoading ? "建立中..." : "建立" }}
        </button>
        <button class="p3-btn p3-btn-ghost" @click="goBack" :disabled="isLoading">取消</button>
      </div>

      <div class="hint">
        POST <b>/api/users</b>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "";

const isLoading = ref(false);
const errorMsg = ref("");
const okMsg = ref("");

const form = ref({
  userID: "",
  username: "",
  gender: "",
  classID: null, // ✅ 用 dropdown 選，送出仍是 classID
  phone: "",
  address: "",
  email: "",
  password: "",
  isadmin: 0,
});

const canSubmit = computed(() => !!form.value.userID && !!form.value.username && !!form.value.password);

function goBack() {
  router.push("/admin");
}

/* ✅ dropdown open 狀態 */
const ddGenderOpen = ref(false);
const ddAdminOpen = ref(false);
const ddClassOpen = ref(false);

function pickGender(v) {
  form.value.gender = v;
  ddGenderOpen.value = false;
}
function pickAdmin(v) {
  form.value.isadmin = Number(v);
  ddAdminOpen.value = false;
}
function pickClass(v) {
  form.value.classID = v === null ? null : Number(v);
  ddClassOpen.value = false;
}

/* ✅ 班級清單（GET /api/class） */
const classList = ref([]);
function cleanText(v) {
  return String(v ?? "").replace(/\r/g, "").trim();
}

async function fetchClasses() {
  try {
    const res = await fetch(`${API_BASE}/api/class`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error("class API 回傳不是陣列");

    classList.value = raw
      .map((c) => ({
        classID: Number(c?.classID),
        className: cleanText(c?.className),
      }))
      .filter((c) => Number.isFinite(c.classID));
  } catch (e) {
    // 不阻擋新增，只是班級不顯示
    console.warn("fetchClasses failed:", e?.message || e);
    classList.value = [];
  }
}

const selectedClassText = computed(() => {
  if (form.value.classID == null) return "—";
  const hit = classList.value.find((c) => String(c.classID) === String(form.value.classID));
  if (!hit) return `未選擇（${form.value.classID}）`;
  return `${hit.className}（${hit.classID}）`;
});

/* ✅ 點外面關閉 */
function onDocClick(e) {
  const el = e.target.closest?.(".p3-dd");
  if (!el) {
    ddGenderOpen.value = false;
    ddAdminOpen.value = false;
    ddClassOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
  fetchClasses();
});
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));

async function submit() {
  errorMsg.value = "";
  okMsg.value = "";
  if (!canSubmit.value) {
    errorMsg.value = "學號(userID) / 姓名(username) / 密碼(password) 必填";
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      userID: form.value.userID,
      username: form.value.username,
      gender: form.value.gender || null,
      classID: form.value.classID ?? null,
      phone: form.value.phone || null,
      address: form.value.address || null,
      email: form.value.email || null,
      password: form.value.password,
      isadmin: Number(form.value.isadmin || 0),
    };

    const res = await fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);

    okMsg.value = data?.message || "使用者建立成功";
    setTimeout(() => router.push("/admin"), 350);
  } catch (e) {
    errorMsg.value = `建立失敗：${e?.message || "unknown error"}`;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.p3-user-page { display:grid; gap:14px; }
.p3-head{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
.kicker{ font-size:12px; letter-spacing:.22em; color:rgba(180,200,230,.85); }
.title{ font-size:26px; font-weight:1000; margin-top:6px; }

.p3-form{ padding:18px; }
.grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.field label{ display:block; font-weight:900; margin-bottom:8px; color:rgba(234,242,255,.86); }
.full{ grid-column:1/-1; }

.actions{ margin-top:16px; display:flex; justify-content:flex-end; gap:10px; flex-wrap:wrap; }
.hint{ margin-top:10px; font-size:12px; color:rgba(180,200,230,.75); }
@media (max-width:860px){ .grid{ grid-template-columns:1fr; } }

.p3-btn:active,.p3-btn-primary:active,.p3-btn-ghost:active{ transform: translateY(0) scale(.98) !important; }

.p3-alert{
  padding:10px 12px; border-radius:12px;
  background:rgba(255,76,76,.12); border:1px solid rgba(255,76,76,.22);
  color:rgba(255,210,210,.95); font-weight:800;
}
.p3-ok{
  padding:10px 12px; border-radius:12px;
  background:rgba(47,230,255,.10); border:1px solid rgba(47,230,255,.22);
  color:rgba(220,255,255,.95); font-weight:800;
}

/* ✅ dropdown */
.p3-dd{ position: relative; width:100%; }
.p3-dd-btn{
  width:100%;
  height:44px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(0,0,0,.14);
  color:rgba(234,242,255,.92);
  font-weight:900;
  padding:0 12px;
  outline:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  cursor:pointer;
}
.p3-dd.open .p3-dd-btn{
  border-color: rgba(47,230,255,0.55);
  box-shadow: 0 0 18px rgba(47,230,255,0.14);
}

.p3-dd-text{ font-weight:900; }
.p3-dd-caret{
  font-size:10px;
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
  max-height: 260px;
  overflow: auto;
}

.p3-dd-item{
  width:100%;
  text-align:left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(234,242,255,0.90);
  cursor: pointer;
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
