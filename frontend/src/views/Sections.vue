<script setup>
import { computed, onMounted, ref } from "vue";
import { toDateInputValue, formatDueDate } from "../config/validation.js";
import sectionServices from "../services/sectionServices.js";
import courseServices from "../services/courseServices.js";
import semesterServices from "../services/semesterServices.js";
import SectionsForm from "../components/SectionsForm.vue";

const emptyForm = () => ({
  sectionName: "",
  courseId: null,
  semesterId: null,
  startDate: "",
  endDate: "",
});

const sections = ref([]);
const courses = ref([]);
const semesters = ref([]);
const loading = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const isAddMode = ref(true);
const form = ref(emptyForm());
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const editingId = ref(null);
const deleteDialogOpen = ref(false);
const sectionToDelete = ref(null);
const deleting = ref(false);

const formTitle = computed(() =>
  isAddMode.value ? "Add Section" : "Edit Section"
);

const saveLabel = computed(() =>
  isAddMode.value ? "Create" : "Save Section"
);

const requiredRule = (value) => {
  if (value === null || value === undefined) return "Required";
  if (typeof value === "string" && value.trim() === "") return "Required";
  return true;
};

const sectionNameRules = [
  requiredRule,
  (value) =>
    String(value ?? "").trim().length <= 30 ||
    "Section name must be 30 characters or fewer.",
];

const endDateRules = [
  requiredRule,
  () => {
    const start = toDateInputValue(form.value.startDate);
    const end = toDateInputValue(form.value.endDate);
    if (!start || !end) return true;
    return end > start || "End date must be after start date.";
  },
];

const retrieveSections = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const [sectionsResponse, coursesResponse, semestersResponse] =
      await Promise.all([
        sectionServices.getSections(),
        courseServices.getCourses(),
        semesterServices.getSemesters(),
      ]);
    sections.value = sectionsResponse.data;
    courses.value = coursesResponse.data;
    semesters.value = semestersResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch sections.";
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isAddMode.value = true;
  editingId.value = null;
  form.value = emptyForm();
  formError.value = "";
  formDialogOpen.value = true;
};

const openEditDialog = (section) => {
  isAddMode.value = false;
  editingId.value = section.id;
  form.value = {
    sectionName: section.sectionName ?? "",
    startDate: toDateInputValue(section.startDate),
    endDate: toDateInputValue(section.endDate),
    courseId: section.courseId ?? null,
    semesterId: section.semesterId ?? null,
  };
  formError.value = "";
  formDialogOpen.value = true;
};

const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
  editingId.value = null;
};

const saveSection = async () => {
  formError.value = "";
  const { valid } = await formRef.value.validate();

  if (!valid) {
    return;
  }

  const start = toDateInputValue(form.value.startDate);
  const end = toDateInputValue(form.value.endDate);

  
if (!start || !end) {
  formError.value = "Required";
  return;
}
if (!(end > start)) {
  formError.value = "End date must be after start date.";
  return;
}

  saving.value = true;

  const payload = {
    sectionName: form.value.sectionName.trim(),
    courseId: form.value.courseId,
    semesterId: form.value.semesterId,
    startDate: toDateInputValue(form.value.startDate),
    endDate: toDateInputValue(form.value.endDate),
  };

  try {
    if (isAddMode.value) {
      await sectionServices.createSection(payload);
    } else {
      await sectionServices.updateSection(editingId.value, payload);
    }

    closeFormDialog();
    await retrieveSections();
  } catch (error) {
    formError.value =
      error.response?.data?.message ||
      (isAddMode.value
        ? "Failed to create section."
        : "Failed to update section.");
  } finally {
    saving.value = false;
  }
};


const openDeleteDialog = (section) => {
  sectionToDelete.value = section;
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false;
  sectionToDelete.value = null;
};

const confirmDeleteSection = async () => {
  if (!sectionToDelete.value?.id) {
    return;
  }

  deleting.value = true;
  listError.value = "";

  try {
    await sectionServices.deleteSection(sectionToDelete.value.id);
    closeDeleteDialog();
    await retrieveSections();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete section.";
  } finally {
    deleting.value = false;
  }
};

onMounted(retrieveSections);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Sections</v-card-title>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openAddDialog"
          >
            + New section
          </v-btn>
        </template>
      </v-card-item>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate class="mb-4" />

        <v-alert
          v-if="listError"
          type="error"
          density="compact"
          class="mb-4"
        >
          {{ listError }}
        </v-alert>

        <p v-if="!loading && sections.length === 0" class="text-body-1">
          No sections yet. Create your first section.
        </p>

        <v-table v-if="!loading && sections.length > 0">
          <thead>
            <tr>
              <th class="text-left">Section name</th>
              <th class="text-left">course</th>
              <th class="text-left">semester</th>
              <th class="text-left">Start date</th>
              <th class="text-left">End date</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="section in sections" :key="section.id">
              <td>{{ section.sectionName }}</td>
              <td>{{ section.course?.courseName }}</td>
              <td>{{ section.semester?.semesterName }}</td>
              <td>{{ formatDueDate(section.startDate) }}</td>
              <td>{{ formatDueDate(section.endDate) }}</td>
              <td>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Edit section"
                  @click="openEditDialog(section)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Delete section"
                  @click="openDeleteDialog(section)"
                >
                  mdi-trash-can
                </v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialogOpen" max-width="560">
      <v-card rounded="lg">
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <SectionsForm
            ref="formRef"
            v-model="form"
            :courses="courses"
            :semesters="semesters"
            @submit="saveSection"
          />
          <v-alert
            v-if="formError"
            type="error"
            density="compact"
            class="mt-2"
          >
            {{ formError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="saving"
            @click="saveSection"
          >
            {{ saveLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Delete Section</v-card-title>
        <v-card-text>Delete this section?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="deleting"
            @click="confirmDeleteSection"
          >
            Delete Section
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>