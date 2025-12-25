<template>
  <teleport to="body">
    <transition name="p3-modal-fade">
      <div v-if="modelValue" class="p3-modal-mask" @click.self="close">
        <div class="p3-modal-card" role="dialog" aria-modal="true" @click.stop>
          <header class="p3-modal-head">
            <div class="p3-modal-title">
              <span class="p3-modal-badge">COURSE</span>
              <span class="title-text">
                {{ mode === "edit" ? "修改課程" : "新增課程" }}
              </span>
            </div>
            <button class="p3-x" @click="close" aria-label="close">✕</button>
          </header>

          <div class="p3-modal-body">
            <div v-if="errorMsg" class="p3-alert">{{ errorMsg }}</div>

            <div class="grid">
              <!-- courseID -->
              <label class="field">
                <span class="label">課程代碼 courseID <span class="req">*</span></span>
                <input
                  v-model.trim="form.courseID"
                  class="p3-input"
                  :disabled="mode === 'edit'"
                  placeholder="例如 CS101"
                />
                <div v-if="mode === 'edit'" class="hint">（修改模式不可更改 courseID）</div>
              </label>

              <!-- courseName -->
              <label class="field">
                <span class="label">課程名稱 courseName <span class="req">*</span></span>
                <input
                  v-model.trim="form.courseName"
                  class="p3-input"
                  placeholder="例如 資料結構"
                />
              </label>

              <!-- departmentID (自製 dropdown + 搜尋) -->
              <div class="field">
                <span class="label">系所 departmentID <span class="req">*</span></span>

                <div class="p3-dd" :class="{ open: ddDeptOpen }">
                  <button
                    type="button"
                    class="p3-dd-btn p3-dd-btn--full"
                    @click.stop="toggleDeptDd"
                  >
                    <span class="p3-dd-text">{{ deptLabel(form.departmentID) || "請選擇" }}</span>
                    <span class="p3-dd-caret">▼</span>
                  </button>

                  <transition name="p3-dd-fade">
                    <div v-if="ddDeptOpen" class="p3-dd-menu" role="listbox" @click.stop>
                      <input
                        v-model.trim="deptKeyword"
                        class="p3-dd-search"
                        placeholder="搜尋系所名稱 / 代碼…"
                      />
                      <div class="p3-dd-list">
                        <button
                          type="button"
                          class="p3-dd-item"
                          :class="{ active: !form.departmentID }"
                          @click="pickDept('')"
                        >
                          —
                        </button>

                        <button
                          v-for="d in deptFiltered"
                          :key="String(d.departmentID)"
                          type="button"
                          class="p3-dd-item"
                          :class="{ active: String(form.departmentID) === String(d.departmentID) }"
                          @click="pickDept(String(d.departmentID))"
                        >
                          {{ d.departmentName }}（{{ d.departmentID }}）
                        </button>

                        <div v-if="deptFiltered.length === 0" class="p3-dd-empty">沒有符合的系所</div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- semesterText -->
              <label class="field">
                <span class="label">學期 semester</span>
                <input
                  v-model.trim="form.semesterText"
                  class="p3-input"
                  placeholder="例如 113-1（送出轉 1131）"
                />
               
              </label>

              <!-- credits -->
              <label class="field">
                <span class="label">學分 credits</span>
                <input
                  v-model.number="form.credits"
                  type="number"
                  min="0"
                  step="1"
                  class="p3-input"
                  placeholder="例如 3"
                />
              </label>

              <!-- ✅ courseType：改成自製 dropdown（修你圖 1 那個灰白原生下拉） -->
              <div class="field">
                <span class="label">課別 courseType</span>

                <div class="p3-dd" :class="{ open: ddTypeOpen }">
                  <button
                    type="button"
                    class="p3-dd-btn p3-dd-btn--full"
                    @click.stop="ddTypeOpen = !ddTypeOpen"
                  >
                    <span class="p3-dd-text">{{ form.courseType || "（不填）" }}</span>
                    <span class="p3-dd-caret">▼</span>
                  </button>

                  <transition name="p3-dd-fade">
                    <div v-if="ddTypeOpen" class="p3-dd-menu" role="listbox" @click.stop>
                      <button type="button" class="p3-dd-item" :class="{ active: form.courseType === '' }" @click="pickType('')">
                        （不填）
                      </button>
                      <button
                        v-for="t in courseTypeOptions"
                        :key="t"
                        type="button"
                        class="p3-dd-item"
                        :class="{ active: form.courseType === t }"
                        @click="pickType(t)"
                      >
                        {{ t }}
                      </button>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- DayOfWeek -->
              <label class="field">
                <span class="label">星期 DayOfWeek</span>
                <input v-model.trim="form.DayOfWeek" class="p3-input" placeholder="例如 2（代表週二）" />
              </label>

              <!-- timesSlot -->
              <label class="field">
                <span class="label">節次 timesSlot</span>
                <input v-model.trim="form.timesSlot" class="p3-input" placeholder="例如 3,4 或 3-4" />
              </label>
            </div>

            <p class="tip">
              ※ 目前只保證 <b>/api/courses</b> CRUD。教師/教室是 join（courseteacher / classroom），後端若沒新增/修改 API，這裡先不動。
            </p>
          </div>

          <footer class="p3-modal-foot">
            <button class="p3-btn p3-btn-ghost" @click="close" :disabled="saving">取消</button>
            <button class="p3-btn p3-btn-primary" @click="submit" :disabled="saving">
              {{ saving ? "送出中…" : (mode === "edit" ? "儲存修改" : "新增課程") }}
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: "create" }, // create | edit
  initial: { type: Object, default: null },  // raw course row
  departments: { type: Array, default: () => [] }, // [{departmentID, departmentName}]
});
const emit = defineEmits(["update:modelValue", "save"]);

const errorMsg = ref("");
const saving = ref(false);

const form = reactive({
  courseID: "",
  courseName: "",
  departmentID: "",
  semesterText: "",
  credits: null,
  courseType: "",
  DayOfWeek: "",
  timesSlot: "",
});

const courseTypeOptions = [
  "必修",
  "選修",
  "通識",
  "專業必修",
  "專業選修",
];

function resetFromInitial() {
  errorMsg.value = "";
  const c = props.initial || {};

  form.courseID = String(c.courseID ?? "");
  form.courseName = String(c.courseName ?? "");
  form.departmentID = String(c.departmentID ?? "");
  form.credits = c.credits ?? null;

  // semester int -> 顯示 113-1
  const sem = c.semester;
  form.semesterText = sem != null && sem !== "" ? formatSemesterFromInt(sem) : "";

  form.courseType = String(c.courseType ?? "");
  form.DayOfWeek = String(c.DayOfWeek ?? "");
  form.timesSlot = String(c.timesSlot ?? "");
}

watch(
  () => [props.modelValue, props.mode, props.initial],
  () => {
    if (props.modelValue) resetFromInitial();
  },
  { deep: true }
);

function close() {
  emit("update:modelValue", false);
}

/* ===== semester helpers ===== */
function parseSemesterToInt(input) {
  const s = String(input ?? "").trim();
  if (!s) return null;

  if (/^\d+$/.test(s)) return Number(s);

  const m = s.match(/^(\d{2,4})\s*[-\/\s]\s*(\d{1})$/);
  if (!m) return null;

  const year = Number(m[1]);
  const term = Number(m[2]);
  if (!Number.isFinite(year) || !Number.isFinite(term)) return null;
  return year * 10 + term; // 113-1 => 1131
}

function formatSemesterFromInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  const str = String(n);
  if (str.length >= 2) return `${str.slice(0, -1)}-${str.slice(-1)}`;
  return str;
}

function normalizeTimesSlot(v) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (s.includes("-") && !s.includes(",")) {
    const [a, b] = s.split("-").map((x) => x.trim());
    if (a && b) return `${a},${b}`;
  }
  return s;
}

/* ===== validate + submit ===== */
function validate() {
  if (!String(form.courseID).trim()) return "請輸入 courseID";
  if (!String(form.courseName).trim()) return "請輸入 courseName";
  if (!String(form.departmentID).trim()) return "請選擇 departmentID";
  return "";
}

async function submit() {
  const err = validate();
  if (err) { errorMsg.value = err; return; }

  saving.value = true;
  errorMsg.value = "";

  const payload = {
    courseID: String(form.courseID).trim(),
    courseName: String(form.courseName).trim(),
    departmentID: String(form.departmentID).trim(),
    semester: parseSemesterToInt(form.semesterText), // ✅ int or null
    credits: (form.credits === null || form.credits === "" || Number.isNaN(Number(form.credits))) ? undefined : Number(form.credits),
    courseType: String(form.courseType || "").trim() || undefined,
    DayOfWeek: String(form.DayOfWeek || "").trim() || undefined,
    timesSlot: normalizeTimesSlot(form.timesSlot) || undefined,
  };

  try {
    emit("save", payload);
  } catch (e) {
    errorMsg.value = e?.message || "送出失敗";
  } finally {
    saving.value = false;
  }
}

/* ===== dropdown states ===== */
const ddDeptOpen = ref(false);
const ddTypeOpen = ref(false);
const deptKeyword = ref("");

function deptLabel(deptId) {
  const id = String(deptId || "").trim();
  if (!id) return "";
  const hit = props.departments.find((d) => String(d.departmentID) === id);
  return hit ? `${hit.departmentName}（${hit.departmentID}）` : id;
}

const deptFiltered = computed(() => {
  const kw = String(deptKeyword.value || "").trim().toLowerCase();
  if (!kw) return props.departments;
  return props.departments.filter((d) =>
    String(d.departmentName || "").toLowerCase().includes(kw) ||
    String(d.departmentID || "").toLowerCase().includes(kw)
  );
});

function toggleDeptDd() {
  ddDeptOpen.value = !ddDeptOpen.value;
  if (ddDeptOpen.value) deptKeyword.value = "";
}
function pickDept(id) {
  form.departmentID = String(id || "").trim();
  ddDeptOpen.value = false;
}
function pickType(t) {
  form.courseType = t;
  ddTypeOpen.value = false;
}

/* ===== esc / click outside ===== */
function onEsc(e) {
  if (e.key === "Escape" && props.modelValue) close();
}

function onDocClick(e) {
  const el = e.target.closest?.(".p3-dd");
  if (!el) {
    ddDeptOpen.value = false;
    ddTypeOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("keydown", onEsc);
  document.addEventListener("click", onDocClick);
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onEsc);
  document.removeEventListener("click", onDocClick);
});
</script>

<style scoped>
.p3-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.p3-modal-card {
  width: min(980px, 96vw);
  border-radius: 18px;
  background: rgba(10, 20, 38, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
  overflow: visible; /* ✅ 讓 dropdown 不會被裁切 */
}

.p3-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

.p3-modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.p3-modal-badge {
  font-weight: 1000;
  letter-spacing: .12em;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(47, 230, 255, 0.12);
  border: 1px solid rgba(47, 230, 255, 0.22);
  color: rgba(234, 242, 255, 0.92);
}

.title-text {
  font-weight: 1000;
  letter-spacing: .04em;
  color: rgba(234, 242, 255, 0.92);
}

.p3-x {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.18);
  color: rgba(234, 242, 255, 0.88);
  cursor: pointer;
  font-weight: 900;
}

.p3-modal-body {
  padding: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 860px) {
  .grid { grid-template-columns: 1fr; }
}

.field .label {
  display: block;
  font-size: 12px;
  font-weight: 900;
  color: rgba(180, 200, 230, 0.82);
  margin-bottom: 6px;
}

.req { color: #ff7b7b; margin-left: 4px; }

.p3-input{
  height: 44px;
  width: 100%;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.16);
  color: rgba(234,242,255,0.92);
  outline: none;
  font-weight: 900;
}
.p3-input:focus{
  border-color: rgba(47,230,255,0.38);
  box-shadow: 0 0 0 3px rgba(47,230,255,0.10);
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(180, 200, 230, 0.68);
  font-weight: 800;
}

.tip {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(180, 200, 230, 0.75);
  font-weight: 800;
  text-align: center;
}

.p3-modal-foot {
  padding: 14px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
}

/* alert */
.p3-alert {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 76, 76, 0.12);
  border: 1px solid rgba(255, 76, 76, 0.22);
  color: rgba(255, 210, 210, 0.95);
  font-weight: 800;
}

/* ===== dropdown（沿用你 user 頁面風格） ===== */
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
.p3-dd-text{ font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
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
  z-index: 3000;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(47,230,255,0.22);
  background: rgba(10, 20, 38, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 70px rgba(0,0,0,0.55), 0 0 30px rgba(47,230,255,0.12);
  max-height: 260px;
  overflow: auto;
}

.p3-dd-search{
  width: 100%;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: rgba(234,242,255,0.92);
  font-weight: 900;
  padding: 0 12px;
  outline: none;
  margin-bottom: 10px;
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

.p3-dd-empty{
  padding: 10px 12px;
  color: rgba(180,200,230,0.75);
  font-weight: 900;
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

/* modal transition */
.p3-modal-fade-enter-active,
.p3-modal-fade-leave-active {
  transition: opacity .16s ease, transform .16s ease;
}
.p3-modal-fade-enter-from,
.p3-modal-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
