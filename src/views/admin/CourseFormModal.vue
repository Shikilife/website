<template>
  <teleport to="body">
    <transition name="p3-modal-fade">
      <div v-if="modelValue" class="p3-modal-mask" @click.self="close">
        <div class="p3-modal-card p3-card" role="dialog" aria-modal="true">
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
              <label class="field">
                <span class="label">課程代碼 courseID *</span>
                <input
                  v-model.trim="form.courseID"
                  class="p3-input"
                  :disabled="mode === 'edit'"
                  placeholder="例如 CS101"
                />
                <div v-if="mode === 'edit'" class="hint">（修改模式不可更改 courseID）</div>
              </label>

              <label class="field">
                <span class="label">課程名稱 courseName *</span>
                <input
                  v-model.trim="form.courseName"
                  class="p3-input"
                  placeholder="例如 資料結構"
                />
              </label>

              <label class="field">
                <span class="label">學分 credits *</span>
                <input
                  v-model.number="form.credits"
                  type="number"
                  min="0"
                  step="1"
                  class="p3-input"
                  placeholder="例如 3"
                />
              </label>

              <label class="field">
                <span class="label">學期 semester</span>
                <input
                  v-model.trim="form.semester"
                  class="p3-input"
                  placeholder="例如 113-1（若你後端有用）"
                />
              </label>

              <label class="field">
                <span class="label">系所 departmentID *</span>
                <select v-model="form.departmentID" class="p3-select">
                  <option value="">請選擇</option>
                  <option
                    v-for="d in departments"
                    :key="d.departmentID"
                    :value="String(d.departmentID)"
                  >
                    {{ d.departmentName }}（{{ d.departmentID }}）
                  </option>
                </select>
              </label>

              <!-- ✅ 下面三個是「你表格會顯示」但後端不一定要有 -->
              <label class="field">
                <span class="label">課別 courseType</span>
                <input
                  v-model.trim="form.courseType"
                  class="p3-input"
                  placeholder="例如 必修 / 選修"
                />
              </label>

              <label class="field">
                <span class="label">星期 DayOfWeek</span>
                <input
                  v-model.trim="form.DayOfWeek"
                  class="p3-input"
                  placeholder="例如 2（代表週二）"
                />
              </label>

              <label class="field">
                <span class="label">節次 timesSlot</span>
                <input
                  v-model.trim="form.timesSlot"
                  class="p3-input"
                  placeholder="例如 3,4 或 3-4"
                />
              </label>
            </div>

            <p class="tip">
              ※ 目前 API 文件只保證 <b>/api/courses</b> 的 CRUD，
              教師與教室是 <b>courseteacher / classroom</b> join 的資料，
              若後端還沒提供新增/修改 API，這裡先不動它們。
            </p>
          </div>

          <footer class="p3-modal-foot">
            <button class="p3-btn p3-btn-ghost" @click="close">取消</button>
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
import { reactive, ref, watch, onMounted, onBeforeUnmount } from "vue";

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
  credits: 0,
  semester: "",
  departmentID: "",
  courseType: "",
  DayOfWeek: "",
  timesSlot: "",
});

function resetFromInitial() {
  errorMsg.value = "";

  const c = props.initial || {};
  form.courseID = String(c.courseID ?? "");
  form.courseName = String(c.courseName ?? "");
  form.credits = Number(c.credits ?? c.credit ?? 0);
  form.semester = String(c.semester ?? "");
  form.departmentID = String(c.departmentID ?? "");
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

function validate() {
  if (!String(form.courseID).trim()) return "請輸入 courseID";
  if (!String(form.courseName).trim()) return "請輸入 courseName";
  if (!String(form.departmentID).trim()) return "請選擇 departmentID";
  if (Number.isNaN(Number(form.credits))) return "credits 必須是數字";
  return "";
}

function normalizeTimesSlot(v) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  // 允許 "3-4" -> "3,4"
  if (s.includes("-") && !s.includes(",")) {
    const [a, b] = s.split("-").map((x) => x.trim());
    if (a && b) return `${a},${b}`;
  }
  return s;
}

async function submit() {
  const err = validate();
  if (err) {
    errorMsg.value = err;
    return;
  }

  saving.value = true;
  errorMsg.value = "";

  // ✅ 給 CourseManagement 呼叫 API 用的 payload
  const payload = {
    courseID: String(form.courseID).trim(),
    courseName: String(form.courseName).trim(),
    credits: Number(form.credits),
    semester: String(form.semester).trim(),
    departmentID: String(form.departmentID).trim(),
    courseType: String(form.courseType).trim(),
    DayOfWeek: String(form.DayOfWeek).trim(),
    timesSlot: normalizeTimesSlot(form.timesSlot),
  };

  try {
    emit("save", payload);
  } catch (e) {
    errorMsg.value = e?.message || "送出失敗";
  } finally {
    saving.value = false;
  }
}

function onEsc(e) {
  if (e.key === "Escape" && props.modelValue) close();
}

onMounted(() => document.addEventListener("keydown", onEsc));
onBeforeUnmount(() => document.removeEventListener("keydown", onEsc));
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
  width: min(860px, 96vw);
  border-radius: 18px;
  overflow: hidden;
}

.p3-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
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

.p3-select {
  height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.18);
  color: rgba(234, 242, 255, 0.92);
  font-weight: 900;
  outline: none;
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
