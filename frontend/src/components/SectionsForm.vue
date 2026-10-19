<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  courses: { type: Array, default: () => [] },
  semesters: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);

const updateField = (field, value) => {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
};

const requiredRule = [(value) => !!value?.toString().trim() || "Required"];

const nameRules = [
  (value) => !!value?.trim() || "Required",
  (value) =>
    (value?.trim() || "").length <= 30 ||
    "Section name must be 30 characters or fewer.",
];

const endDateRules = computed(() => [
  (value) => !!value || "Required",
  (value) =>
    !props.modelValue.startDate ||
    value > props.modelValue.startDate ||
    "End date must be after start date.",
]);

const validate = () => formRef.value.validate();

defineExpose({ validate });
</script>

<template>
  <v-form ref="formRef" @submit.prevent="emit('submit')">
  <v-text-field
  :model-value="modelValue.sectionName"
  label="Section Name"
  density="comfortable"
  :rules="nameRules"
  @update:model-value="updateField('sectionName', $event)"
/>
<v-select
  :model-value="modelValue.courseId"
  label="Course"
  :items="courses"
  item-title="courseName"
  item-value="id"
  density="comfortable"
  :rules="requiredRule"
  @update:model-value="updateField('courseId', $event)"
/>
<v-select
  :model-value="modelValue.semesterId"
  label="Semester"
  :items="semesters"
  item-title="semesterName"
  item-value="id"
  density="comfortable"
  :rules="requiredRule"
  @update:model-value="updateField('semesterId', $event)"
/>
<div class="text-subtitle-2 mb-2">Start Date</div>
<v-date-picker
  :model-value="modelValue.startDate"
  @update:model-value="updateField('startDate', $event)"
/>
<div class="text-subtitle-2 mb-2">End Date</div>
<v-date-picker
  :model-value="modelValue.endDate"
  @update:model-value="updateField('endDate', $event)"
/>
  </v-form>
</template>