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
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const sectionId = ref(null);

const sectionRules = [
  (value) =>
    (value !== null && value !== undefined && value !== "") || "Required",
  (value) =>
    !enrollments.value.some((row) => row.sectionId === value) ||
    "You are already enrolled in this course section.",
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
  sectionId.value = null;
  formError.value = "";
  formDialogOpen.value = true;
};

const closeFormDialog = () => {
  formDialogOpen.value = false;
  sectionId.value = null;
  formError.value = "";
};

const saveEnrollment = async () => {
  formError.value = "";
  const { valid } = await formRef.value.validate();

  if (!valid) {
    return;
  }

  saving.value = true;

  try {
    await enrollmentServices.createEnrollment({ sectionId: sectionId.value });
    closeFormDialog();
    await retrieve();
  } catch (error) {
    formError.value =
      error.response?.data?.message || "Failed to create enrollment.";
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in enrollments" :key="row.id">
              <td>{{ row.sectionName }}</td>
              <td>{{ row.courseName }}</td>
              <td>{{ row.semesterName }}</td>
              <td>{{ formatDueDate(row.startDate) }}</td>
              <td>{{ formatDueDate(row.endDate) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialogOpen" max-width="560">
      <v-card rounded="lg">
        <v-card-title>Add Enrollment</v-card-title>
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
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>