/**
 * Feature 5 — Student Enrollment
 * Spec: features/feature-5-student-enrollment.md
 */
import { beforeEach, describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import App from "../src/App.vue";
import Enrollments from "../src/views/Enrollments.vue";
import { vuetify } from "./testUtils.js";

const viewStubs = {
  teleport: true,
};

const signInStudent = () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      userId: 1,
      fName: "Jane",
      lName: "Doe",
      username: "jdoe",
      email: "jane@example.com",
      role: "student",
      token: "test-token",
    })
  );
};

beforeEach(() => {
  localStorage.clear();
  signInStudent();
});

describe("Feature 5 — Student Enrollment", () => {
  describe("US-5.1 — Open enrollment from the menu", () => {
    it("Menu Selection", async () => {
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: "/", name: "home", component: { template: "<div>Home</div>" } },
          { path: "/login", name: "login", component: { template: "<div>Login</div>" } },
          { path: "/enrollments", name: "enrollments", component: Enrollments },
        ],
      });
      await router.push("/");
      await router.isReady();

      const wrapper = mount(App, {
        attachTo: document.body,
        global: {
          plugins: [vuetify, router],
          stubs: viewStubs,
        },
      });

      const enrollmentLink = wrapper
        .findAll("a, button")
        .find((element) => element.text().trim() === "Enrollment");
      expect(enrollmentLink.attributes("href")).toContain("/enrollments");
      await router.push("/enrollments");
      await flushPromises();

      expect(router.currentRoute.value.name).toBe("enrollments");
      expect(wrapper.text()).toContain(
        "No enrollments yet. Create your first enrollment."
      );
      wrapper.unmount();
    });
  });
});