<script setup>
import { onMounted, ref } from "vue";
import semesterServices from "../services/semesterServices.js";
import { toDateInputValue } from "../config/validation.js";

const emptyForm = () => ({
  semesterName: "",
  startDate: "",
  endDate: "",
});

const semesters = ref([]);
const loading = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const form = ref(emptyForm());
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);

const retrieveSemesters = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const [semestersResponse] = await Promise.all([
      semesterServices.getSemesters(),
    ]);
    semesters.value = semestersResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch semesters.";
  } finally {
    loading.value = false;
  }
};

const requiredRule = [(value) => !!value?.toString().trim() || "Required"];
const nameRules = [
  (value) => !!value?.trim() || "Required",
  (value) =>
    (value?.trim() || "").length <= 30 ||
    "Semester name must be 30 characters or fewer.",
];

const endDateRules = [
  (value) => !!value || "Required",
  (value) =>
    !form.value.startDate ||
    value > form.value.startDate ||
    "End date must be after start date.",
];

const openAddDialog = () => {
  form.value = emptyForm();
  formError.value = "";
  formDialogOpen.value = true;
};


const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
};

const saveSemester =  async () => {
  formError.value = "";
  const { valid } = await formRef.value.validate();

  if (!valid) {
    return;
  }

  saving.value = true;

  try {
    await semesterServices.createSemester({
      semesterName: form.value.semesterName.trim(),
      startDate: form.value.startDate,
      endDate: form.value.endDate,
    });
    closeFormDialog();
    await retrieveSemesters();
  } catch (error) {
    formError.value =
      error.response?.data?.message || "Failed to create semester.";
  } finally {
    saving.value = false;
  }
};

onMounted(retrieveSemesters);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Semesters</v-card-title>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openAddDialog"
          >
            + New semester
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

        <p v-if="!loading && semesters.length === 0" class="text-body-1">
          No semesters yet. Create your first semester.
        </p>

        <v-table v-if="!loading && semesters.length > 0">
          <thead>
            <tr>
              <th class="text-left">Semester name</th>
              <th class="text-left">Start date</th>
              <th class="text-left">End date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="semester in semesters" :key="semester.id">
              <td>{{ semester.semesterName }}</td>
              <td>{{ toDateInputValue(semester.startDate) }}</td>
              <td>{{ toDateInputValue(semester.endDate) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

        <v-dialog v-model="formDialogOpen" max-width="560">
      <v-card rounded="lg">
        <v-card-title>Add Semester</v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveSemester">
            <v-text-field
              v-model="form.semesterName"
              label="Semester Name"
              density="comfortable"
              :rules="nameRules"
            />
            <v-text-field
              v-model="form.startDate"
              label="Start Date"
              type="date"
              density="comfortable"
              :rules="requiredRule"
            />
            <v-text-field
              v-model="form.endDate"
              label="End Date"
              type="date"
              density="comfortable"
              :rules="endDateRules"
            />
          </v-form>
          <v-alert v-if="formError" type="error" density="compact" class="mt-2">
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
            @click="saveSemester"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>