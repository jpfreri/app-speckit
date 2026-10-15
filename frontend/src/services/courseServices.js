import apiClient from "./services.js";

const courseServices = {
  getCourses() {
    return apiClient.get("courses");
  },

  createCourse(course) {
    return apiClient.post("courses", course);
  },

  updateCourse(courseId, course) {
    return apiClient.put(`courses/${courseId}`, course);
  },

  deleteCourse(courseId) {
    return apiClient.delete(`courses/${courseId}`);
  },
};

export default courseServices;
