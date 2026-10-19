import apiClient from "./services.js";

const enrollmentServices = {
  getEnrollments() {
    return apiClient.get("enrollments");
  },

  createEnrollment(enrollment) {
    return apiClient.post("enrollments", enrollment);
  },
};

export default enrollmentServices;