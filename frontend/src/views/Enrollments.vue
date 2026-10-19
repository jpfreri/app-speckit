<script setup>
import { computed, onMounted, ref } from "vue";
import { formatDueDate } from "../config/validation.js";
import enrollmentServices from "../services/enrollmentServices.js";
import sectionServices from "../services/sectionServices.js";

const enrollments = ref([]);
const sections = ref([]);
const loading = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const isAddMode = ref(true);
const editingId = ref(null);
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const sectionId = ref(null);
const deleteDialogOpen = ref(false);
const enrollmentToDelete = ref(null);
const deleting = ref(false);

const formTitle = computed(() =>
  isAddMode.value ? "Add Enrollment" : "Edit Enrollment"
);
const saveLabel = computed(() =>
  isAddMode.value ? "Create" : "Save Enrollment"
);

const sectionRules = [
  (value) =>
    (value !== null && value !== undefined && value !== "") || "Required",
  (value) =>
    !enrollments.value.some(
      (row) => row.sectionId === value && row.id !== editingId.value
    ) || "You are already enrolled in this course section.",
];

const retrieve = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const [enrollmentsResponse, sectionsResponse] = await Promise.all([
      enrollmentServices.getEnrollments(),
      sectionServices.getSections(),
    ]);
    enrollments.value = enrollmentsResponse.data;
    sections.value = sectionsResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch enrollments.";
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isAddMode.value = true;
  editingId.value = null;
  sectionId.value = null;
  formError.value = "";
  formDialogOpen.value = true;
};

const openEditDialog = (row) => {
  isAddMode.value = false;
  editingId.value = row.id;
  sectionId.value = row.sectionId;
  formError.value = "";
  formDialogOpen.value = true;
};

const openDeleteDialog = (row) => {
  enrollmentToDelete.value = row;
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false;
  enrollmentToDelete.value = null;
};

const confirmDeleteEnrollment = async () => {
  if (!enrollmentToDelete.value?.id) {
    return;
  }

  deleting.value = true;
  listError.value = "";

  try {
    await enrollmentServices.deleteEnrollment(enrollmentToDelete.value.id);
    closeDeleteDialog();
    await retrieve();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete enrollment.";
  } finally {
    deleting.value = false;
  }
};

const closeFormDialog = () => {
  formDialogOpen.value = false;
  isAddMode.value = true;
  editingId.value = null;
  sectionId.value = null;
  formError.value = "";
};

const saveEnrollment = async () => {
  formError.value = "";
  await formRef.value?.validate();

  // Evaluate rules explicitly — stubbed VSelect does not feed VForm.validate()
  const failedRule = sectionRules
    .map((rule) => rule(sectionId.value))
    .find((result) => result !== true);
  if (failedRule !== undefined) {
    return;
  }

  saving.value = true;

  try {
    if (isAddMode.value) {
      await enrollmentServices.createEnrollment({ sectionId: sectionId.value });
    } else {
      await enrollmentServices.updateEnrollment(editingId.value, {
        sectionId: sectionId.value,
      });
    }
    closeFormDialog();
    await retrieve();
  } catch (error) {
    formError.value =
      error.response?.data?.message || "Failed to save enrollment.";
  } finally {
    saving.value = false;
  }
};

onMounted(retrieve);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Enrollment</v-card-title>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openAddDialog"
          >
            + New enrollment
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

        <p v-if="!loading && enrollments.length === 0" class="text-body-1">
          No enrollments yet. Create your first enrollment.
        </p>

        <v-table v-if="!loading && enrollments.length > 0">
          <thead>
            <tr>
              <th class="text-left">Section name</th>
              <th class="text-left">Course</th>
              <th class="text-left">Semester</th>
              <th class="text-left">Start date</th>
              <th class="text-left">End date</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in enrollments" :key="row.id">
              <td>{{ row.sectionName }}</td>
              <td>{{ row.courseName }}</td>
              <td>{{ row.semesterName }}</td>
              <td>{{ formatDueDate(row.startDate) }}</td>
              <td>{{ formatDueDate(row.endDate) }}</td>
              <td>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Edit enrollment"
                  @click="openEditDialog(row)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Delete enrollment"
                  @click="openDeleteDialog(row)"
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
          <v-form ref="formRef" @submit.prevent="saveEnrollment">
            <v-select
              v-model="sectionId"
              label="Section"
              :items="sections"
              item-title="sectionName"
              item-value="id"
              density="comfortable"
              :rules="sectionRules"
            />
          </v-form>
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
            @click="saveEnrollment"
          >
            {{ saveLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Delete Enrollment</v-card-title>
        <v-card-text>Delete this enrollment?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="deleting"
            @click="confirmDeleteEnrollment"
          >
            Delete Enrollment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>