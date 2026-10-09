<script setup>
import { computed, onMounted, ref } from "vue";
import courseServices from "../services/courseServices.js";
import semesterServices from "../services/semesterServices.js";


const emptyForm = () => ({
  courseName: "",
  semesterId: "",
});

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
const courseToDelete = ref(null);
const deleting = ref(false);
const requiredRule = [(value) => !!value || "Required"];
const formTitle = computed(() =>
  isAddMode.value ? "Add Course" : "Edit Course",
);
const saveLabel = computed(() =>
  isAddMode.value ? "Create" : "Save Course",
);
const nameRules = [
  (value) => !!value?.trim() || "Required",
  (value) =>
    (value?.trim() || "").length <= 30 ||
    "Course name must be 30 characters or fewer.",
];

const retrieveSemesters = async () => {
  try {
    const response = await semesterServices.getSemesters();
    semesters.value = response.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch semesters.";
  }
};



const retrieveCourses = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const response = await courseServices.getCourses();
    courses.value = response.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch courses.";
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

const openEditDialog = (course) => {
  isAddMode.value = false;
  editingId.value = course.id;
  form.value = {
    courseName: course.courseName ?? "",
    semesterId: course.semesterId ?? "",
  };
  formError.value = "";
  formDialogOpen.value = true;
};

const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
  editingId.value = null;
};

const saveCourse = async () => {
  formError.value = "";
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  const payload = {
    courseName: form.value.courseName,
    semesterId: form.value.semesterId,
  };

  try {
    if (isAddMode.value) {
      await courseServices.createCourse(payload);
    } else {
      await courseServices.updateCourse(editingId.value, {
        ...payload,
        courseId: editingId.value,
      });
    }

    closeFormDialog();
    await retrieveCourses();
  } catch (error) {
    formError.value =
      error.response?.data?.message ||
      (isAddMode.value
        ? "Failed to create course."
        : "Failed to update course.");
  } finally {
    saving.value = false;
  }
};

const openDeleteDialog = (course) => {
  courseToDelete.value = course;
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false;
  courseToDelete.value = null;
};

const confirmDeleteCourse = async () => {
  if (!courseToDelete.value?.id) {
    return;
  }

  deleting.value = true;
  listError.value = "";

  try {
    await courseServices.deleteCourse(courseToDelete.value.id);
    closeDeleteDialog();
    await retrieveCourses();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete course.";
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  retrieveCourses();
  retrieveSemesters();
});
</script>

<template>
    <v-container class="py-8">
      <v-card rounded="lg">
        <v-card-item>
          <v-card-title>Courses</v-card-title>
          <template #append>
            <v-btn
              color="primary"
              variant="elevated"
              class="oc-cta"
              @click="openAddDialog"
            >
              + New course
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
  
          <p v-if="!loading && courses.length === 0" class="text-body-1">
            No courses yet. Create your first course.
          </p>
  
          <v-table v-if="!loading && courses.length > 0">
            <thead>
              <tr>
                <th class="text-left">Course name</th>
                <th class="text-left">Semester</th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in courses" :key="course.id">
                <td>{{ course.courseName }}</td>
                <td>{{ semesters.find(semester => semester.id === Number(course.semesterId))?.semesterName }}</td>                <td>
                  <v-icon
                    size="small"
                    class="mx-4"
                    aria-label="Edit course"
                    @click="openEditDialog(course)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    size="small"
                    class="mx-4"
                    aria-label="Delete course"
                    @click="openDeleteDialog(course)"
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
            <v-form ref="formRef" @submit.prevent="saveCourse">
              <v-text-field
                v-model="form.courseName"
                label="Course Name"
                density="comfortable"
                :rules="nameRules"
              />
              <v-select
            v-model="form.semesterId"
            :items="semesters"
            item-title="semesterName"
            item-value="id"
            label="Semester"
            density="comfortable"
            :rules="requiredRule"
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
              @click="saveCourse"
            >
              {{ saveLabel }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <v-dialog v-model="deleteDialogOpen" max-width="420">
        <v-card rounded="lg">
          <v-card-title>Delete Course</v-card-title>
          <v-card-text>Delete this course?</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="closeDeleteDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              class="oc-cta"
              :loading="deleting"
              @click="confirmDeleteCourse"
            >
              Delete Course
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
