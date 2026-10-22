import apiClient from "./services.js";

const semesterServices = {
  getSemesters() {
    return apiClient.get("semesters");
  },

  createSemester(payload) {
    return apiClient.post("semesters", payload);
  },

  updateSemester(semesterId, semester) {
    return apiClient.put(`semesters/${semesterId}`, semester);
  },

  deleteSemester(semesterId) {
    return apiClient.delete(`semesters/${semesterId}`);
  },

};

export default semesterServices;
