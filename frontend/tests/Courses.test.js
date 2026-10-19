/**
 * Feature 3 — Course Management
 * Spec: features/feature-3-course-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Courses from "../src/views/Courses.vue";
import courseServices from "../src/services/courseServices.js";
import semesterServices from "../src/services/semesterServices.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/courseServices.js", () => ({
  default: {
    getCourses: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
  },
}));

vi.mock("../src/services/semesterServices.js", () => ({
  default: {
    getSemesters: vi.fn(),
  },
}));

const fall2026 = {
  id: 1,
  semesterName: "2026 Fall",
  startDate: "2026-08-15",
  endDate: "2026-12-15",
};

const cmsc1234 = {
  id: 1,
  courseName: "CMSC-1234",
  semesterId: 1,
};

const zool1000 = {
  id: 2,
  courseName: "ZOOL-1000",
  semesterId: 1,
};

const validCourseForm = (overrides = {}) => ({
  courseName: "CMSC-1234",
  semesterId: 1,
  ...overrides,
});

const VDialogStub = {
  name: "VDialog",
  props: { modelValue: Boolean },
  template: `<div v-if="modelValue" class="v-dialog-stub"><slot /></div>`,
};

const clickButton = async (wrapper, label) => {
  const buttons = wrapper.findAll("button");
  const button =
    buttons.find((item) => item.text().trim() === label) ??
    buttons.find((item) => item.text().includes(label));
  expect(button).toBeTruthy();
  await button.trigger("click");
  await flushPromises();
};

const fieldByLabel = (wrapper, componentName, label) => {
  const field = wrapper
    .findAllComponents({ name: componentName })
    .find((item) => item.props("label") === label);
  expect(field, `${componentName} labeled "${label}"`).toBeTruthy();
  return field;
};

const fillCourseForm = async (wrapper, overrides = {}) => {
  const values = validCourseForm(overrides);

  await fieldByLabel(wrapper, "VTextField", "Course Name").setValue(values.courseName);
  await fieldByLabel(wrapper, "VSelect", "Semester").setValue(values.semesterId);
  await flushPromises();
};

const mountCourses = async () => {
  const mounted = await mountWithPlugins(Courses, {
    attachTo: document.body,
    global: {
      stubs: { VDialog: VDialogStub },
    },
  });
  await flushPromises();
  return mounted;
};

describe("Feature 3 — Course Management", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    courseServices.getCourses.mockResolvedValue({ data: [] });
    courseServices.createCourse.mockResolvedValue({ data: cmsc1234 });
    courseServices.updateCourse.mockResolvedValue({ data: cmsc1234 });
    courseServices.deleteCourse.mockResolvedValue({
      data: { message: "Course deleted successfully." },
    });
    semesterServices.getSemesters.mockResolvedValue({ data: [fall2026] });
  });

  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = "";
  });

  describe("US-3.1 — Select to work with Courses", () => {
    it("Menu Selection", async () => {
      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      expect(wrapper.text()).toContain("Courses");
    });
  });

  describe("US-3.2 — Create course", () => {
    it("User creates a new course", async () => {
      courseServices.getCourses
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValue({ data: [cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New course");
      await fillCourseForm(wrapper);
      await clickButton(wrapper, "Create");

      expect(courseServices.createCourse).toHaveBeenCalledWith({
        courseName: "CMSC-1234",
        semesterId: 1,
      });
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(false);
      const row = wrapper.findAll("tbody tr")[0];
      expect(row.text()).toContain("CMSC-1234");
      expect(row.text()).toContain("2026 Fall");
    });

    it("User creates a course with a missing required field", async () => {
      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New course");
      await fillCourseForm(wrapper, { semesterId: null });
      await clickButton(wrapper, "Create");

      expect(courseServices.createCourse).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("Required");
    });

    it("User creates a course with a name that is too long", async () => {
      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New course");
      await fillCourseForm(wrapper, {
        courseName: "2026 Fall Extended Summer Session",
      });
      await clickButton(wrapper, "Create");

      expect(courseServices.createCourse).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("Course name must be 30 characters or fewer.");
    });

    it("User creates a course with a duplicate name", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [cmsc1234] });
      courseServices.createCourse.mockRejectedValue({
        response: { data: { message: "Course name is already taken." } },
      });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New course");
      await fillCourseForm(wrapper);
      await clickButton(wrapper, "Create");

      expect(courseServices.createCourse).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Course name is already taken.");
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(true);
    });
  });

  describe("US-3.3 — View courses", () => {
    it("Courses view loads with existing courses", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [zool1000, cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      const names = wrapper.findAll("tbody tr").map((row) => row.find("td").text());
      expect(names).toEqual(["ZOOL-1000", "CMSC-1234"]);
    });

    it("There are no courses", async () => {
      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      expect(wrapper.text()).toContain("No courses yet. Create your first course.");
    });
  });

  describe("US-3.4 — Manage course rows", () => {
    it("course rows show edit and delete actions", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      expect(wrapper.find('[aria-label="Edit course"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Delete course"]').exists()).toBe(true);
    });
  });

  describe("US-3.5 — Edit a course", () => {
    it("User selects to edit a course", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await wrapper.get('[aria-label="Edit course"]').trigger("click");
      await flushPromises();

      expect(wrapper.text()).toContain("Edit Course");
      expect(fieldByLabel(wrapper, "VTextField", "Course Name").props("modelValue")).toBe(
        "CMSC-1234"
      );
      expect(fieldByLabel(wrapper, "VSelect", "Semester").props("modelValue")).toBe(1);
    });

    it("User edits a course with valid values and saves", async () => {
      courseServices.getCourses
        .mockResolvedValueOnce({ data: [cmsc1234] })
        .mockResolvedValue({ data: [{ ...cmsc1234, courseName: "CMSC-5678" }] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await wrapper.get('[aria-label="Edit course"]').trigger("click");
      await flushPromises();
      await fillCourseForm(wrapper, { courseName: "CMSC-5678" });
      await clickButton(wrapper, "Save Course");

      expect(courseServices.updateCourse).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          courseName: "CMSC-5678",
          semesterId: 1,
        })
      );
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(false);
      expect(wrapper.text()).toContain("CMSC-5678");
    });

    it("User edits a course with invalid values and saves", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await wrapper.get('[aria-label="Edit course"]').trigger("click");
      await flushPromises();
      await fillCourseForm(wrapper, {
        courseName: "2026 Fall Extended Summer Session",
      });
      await clickButton(wrapper, "Save Course");

      expect(courseServices.updateCourse).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("Edit Course");
      expect(wrapper.text()).toContain("Course name must be 30 characters or fewer.");
    });

    it("User edits a course and cancels", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await wrapper.get('[aria-label="Edit course"]').trigger("click");
      await flushPromises();
      await fillCourseForm(wrapper, { courseName: "CMSC-5678" });
      await clickButton(wrapper, "Cancel");

      expect(courseServices.updateCourse).not.toHaveBeenCalled();
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(false);
      expect(wrapper.text()).toContain("CMSC-1234");
    });
  });

  describe("US-3.6 — Delete a course", () => {
    it("User selects to delete a course", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await wrapper.get('[aria-label="Delete course"]').trigger("click");
      await flushPromises();

      expect(wrapper.text()).toContain("Delete this course?");
    });

    it("User deletes a course", async () => {
      courseServices.getCourses
        .mockResolvedValueOnce({ data: [cmsc1234] })
        .mockResolvedValue({ data: [] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await wrapper.get('[aria-label="Delete course"]').trigger("click");
      await flushPromises();
      await clickButton(wrapper, "Delete Course");

      expect(courseServices.deleteCourse).toHaveBeenCalledWith(1);
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(false);
      expect(wrapper.text()).not.toContain("CMSC-1234");
    });

    it("User cancels deleting a course", async () => {
      courseServices.getCourses.mockResolvedValue({ data: [cmsc1234] });

      const mounted = await mountCourses();
      wrapper = mounted.wrapper;

      await wrapper.get('[aria-label="Delete course"]').trigger("click");
      await flushPromises();
      await clickButton(wrapper, "Cancel");

      expect(courseServices.deleteCourse).not.toHaveBeenCalled();
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(false);
      expect(wrapper.text()).toContain("CMSC-1234");
    });
  });
});
