import apiClient from "./services.js";

const enrollmentServices = {
  getEnrollments() {
    return apiClient.get("enrollments");
  },

  createEnrollment(enrollment) {
    return apiClient.post("enrollments", enrollment);
  },

  updateEnrollment(id, enrollment) {
    return apiClient.put(`enrollments/${id}`, enrollment);
  },

  deleteEnrollment(id) {
    return apiClient.delete(`enrollments/${id}`);
  },
};

export default enrollmentServices;