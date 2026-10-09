/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth-session-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, h } from "vue";
import { flushPromises } from "@vue/test-utils";
import { VApp } from "vuetify/components";
import MenuBar from "../src/components/MenuBar.vue";
import { mountWithPlugins, createTestRouter } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: { logoutUser: vi.fn() },
}));

vi.mock("../src/services/userServices.js", () => ({
  default: { getUser: vi.fn(), updateUser: vi.fn() },
}));

const Host = defineComponent({
  render: () => h(VApp, () => h(MenuBar)),
});

const signInAs = (role) => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      userId: 1,
      username: "jdoe",
      email: "jane@example.com",
      fName: "Jane",
      lName: "Doe",
      role,
      token: "test-token",
    })
  );
};

let wrapper;

async function mountMenuBar(path) {
  ({ wrapper } = await mountWithPlugins(Host, {
    router: await createTestRouter(path),
    attachTo: document.body,
  }));
  await flushPromises();
  return wrapper;
}

async function openProfileMenu() {
  await wrapper.find('[aria-label="Open profile menu"]').trigger("click");
  await flushPromises();
}

const navLabels = () => wrapper.findAll(".v-app-bar .v-btn").map((btn) => btn.text());

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  wrapper?.unmount();
  document.body.innerHTML = "";
});

describe("Feature 1 — User Authentication & Session Management", () => {
  describe("US-1.6 — Role-based MenuBar", () => {
    it("MenuBar is visible on the login page", async () => {
      await mountMenuBar("/login");

      expect(wrapper.find(".v-app-bar").exists()).toBe(true);
      expect(wrapper.find('[aria-label="Open profile menu"]').exists()).toBe(false);
      expect(document.body.textContent).not.toContain("Sign out");
      expect(navLabels()).not.toContain("Semesters");
      expect(navLabels()).not.toContain("Courses");
    });

    it("Signed-in user sees Sign out in MenuBar", async () => {
      signInAs("student");
      await mountMenuBar("/");
      await openProfileMenu();

      expect(wrapper.find(".v-app-bar").exists()).toBe(true);
      expect(document.body.textContent).toContain("Sign out");
      expect(document.body.textContent).toContain("Jane Doe");
    });

    it("Student does not see admin-only menu items", async () => {
      signInAs("student");
      await mountMenuBar("/");

      expect(navLabels()).not.toContain("Semesters");
      expect(navLabels()).not.toContain("Courses");
    });

    it("Admin MenuBar in Feature 1 has Sign out but no catalog links yet", async () => {
      signInAs("admin");
      await mountMenuBar("/");
      await openProfileMenu();

      expect(document.body.textContent).toContain("Sign out");
      expect(navLabels()).toContain("Semesters");
      expect(navLabels()).toContain("Courses");
    });
  });
});

describe("Feature 2 — Semester Management", () => {
  describe("US-2.1 — Select to work with Semesters", () => {
    it("Menu Selection", async () => {
      signInAs("admin");
      const router = await createTestRouter("/");
      ({ wrapper } = await mountWithPlugins(Host, {
        router,
        attachTo: document.body,
      }));
      await flushPromises();

      const semestersBtn = wrapper
        .findAllComponents({ name: "VBtn" })
        .find((btn) => btn.text().includes("Semesters"));

      expect(semestersBtn).toBeTruthy();
      expect(semestersBtn.props("to")).toBe("/semesters");

      const link = semestersBtn.find("a");
      if (link.exists()) {
        await link.trigger("click");
      } else {
        await semestersBtn.trigger("click");
      }
      await flushPromises();

      await vi.waitFor(() => {
        expect(router.currentRoute.value.name).toBe("semesters");
      });
    });
  });

  describe("US-2.7 — Restrict semester management to admins", () => {
    it("Student does not see Semesters in the menu", async () => {
      signInAs("student");
      await mountMenuBar("/");

      expect(navLabels()).not.toContain("Semesters");
    });
  });
});

describe("Feature 3 — Course Management", () => {
  describe("US-3.1 — Select to work with Courses", () => {
    it("Menu Selection", async () => {
      signInAs("admin");
      const router = await createTestRouter("/");
      ({ wrapper } = await mountWithPlugins(Host, {
        router,
        attachTo: document.body,
      }));
      await flushPromises();

      const coursesBtn = wrapper
        .findAllComponents({ name: "VBtn" })
        .find((btn) => btn.text().includes("Courses"));

      expect(coursesBtn).toBeTruthy();
      expect(coursesBtn.props("to")).toBe("/courses");

      const link = coursesBtn.find("a");
      if (link.exists()) {
        await link.trigger("click");
      } else {
        await coursesBtn.trigger("click");
      }
      await flushPromises();

      await vi.waitFor(() => {
        expect(router.currentRoute.value.name).toBe("courses");
      });
    });
  });

  describe("US-3.7 — Restrict course management to admins", () => {
    it("Student does not see Courses in the menu", async () => {
      signInAs("student");
      await mountMenuBar("/");

      expect(navLabels()).not.toContain("Courses");
    });
  });
});
