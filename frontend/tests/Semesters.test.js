/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Semesters from "../src/views/Semesters.vue";
import semesterServices from "../src/services/semesterServices.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/semesterServices.js", () => ({
  default: {
    getSemesters: vi.fn(),
    createSemester: vi.fn(),
  },
}));

const fall2026 = {
  id: 1,
  semesterName: "2026 Fall",
  startDate: "2026-08-15",
  endDate: "2026-12-15",
};

const spring2026 = {
  id: 2,
  semesterName: "2026 Spring",
  startDate: "2026-01-15",
  endDate: "2026-05-15",
};

const validSemesterForm = (overrides = {}) => ({
  semesterName: "2026 Fall",
  startDate: "2026-08-15",
  endDate: "2026-12-15",
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

const fillSemesterForm = async (wrapper, overrides = {}) => {
  const values = validSemesterForm(overrides);
  const fields = wrapper.findAllComponents({ name: "VTextField" });

  await fields[0].setValue(values.semesterName);
  await fields[1].setValue(values.startDate);
  await fields[2].setValue(values.endDate);
  await flushPromises();
};

const mountSemesters = async () => {
  const mounted = await mountWithPlugins(Semesters, {
    attachTo: document.body,
    global: {
      stubs: { VDialog: VDialogStub },
    },
  });
  await flushPromises();
  return mounted;
};

describe("Feature 2 — Semester Management", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    semesterServices.getSemesters.mockResolvedValue({ data: [] });
    semesterServices.createSemester.mockResolvedValue({ data: fall2026 });
  });

  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = "";
  });

  describe("US-2.1 — Select to work with Semesters", () => {
    it("Menu Selection", async () => {
      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      expect(wrapper.text()).toContain("Semesters");
    });
  });

  describe("US-2.2 — Create semester", () => {
    it("User creates a new semester", async () => {
      semesterServices.getSemesters
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValue({ data: [fall2026] });

      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New semester");
      await fillSemesterForm(wrapper);
      await clickButton(wrapper, "Create");

      expect(semesterServices.createSemester).toHaveBeenCalledWith({
        semesterName: "2026 Fall",
        startDate: "2026-08-15",
        endDate: "2026-12-15",
      });
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(false);
      expect(wrapper.text()).toContain("2026 Fall");
    });

    it("User creates a semester with a missing required field", async () => {
      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New semester");
      await fillSemesterForm(wrapper, {
        semesterName: "2026 Fall",
        startDate: "2026-08-15",
        endDate: "",
      });
      await clickButton(wrapper, "Create");

      expect(semesterServices.createSemester).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("Required");
    });

    it("User creates a semester with a name that is too long", async () => {
      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New semester");
      await fillSemesterForm(wrapper, {
        semesterName: "2026 Fall Extended Summer Session",
        startDate: "2026-08-15",
        endDate: "2026-12-15",
      });
      await clickButton(wrapper, "Create");

      expect(semesterServices.createSemester).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain(
        "Semester name must be 30 characters or fewer."
      );
    });

    it("User creates a semester with end date before start date", async () => {
      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New semester");
      await fillSemesterForm(wrapper, {
        semesterName: "2026 Fall",
        startDate: "2026-12-15",
        endDate: "2026-08-15",
      });
      await clickButton(wrapper, "Create");

      expect(semesterServices.createSemester).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("End date must be after start date.");
    });

    it("User creates a semester with a duplicate name", async () => {
      semesterServices.getSemesters.mockResolvedValue({ data: [fall2026] });
      semesterServices.createSemester.mockRejectedValue({
        response: { data: { message: "Semester name is already taken." } },
      });

      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      await clickButton(wrapper, "+ New semester");
      await fillSemesterForm(wrapper);
      await clickButton(wrapper, "Create");

      expect(semesterServices.createSemester).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Semester name is already taken.");
      expect(wrapper.find(".v-dialog-stub").exists()).toBe(true);
    });
  });

  describe("US-2.3 — View semesters", () => {
    it("Semesters view loads with existing semesters", async () => {
      semesterServices.getSemesters.mockResolvedValue({
        data: [spring2026, fall2026],
      });

      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      const names = wrapper.findAll("tbody tr").map((row) => row.find("td").text());
      expect(names).toEqual(["2026 Spring", "2026 Fall"]);
    });

    it("There are no semesters", async () => {
      const mounted = await mountSemesters();
      wrapper = mounted.wrapper;

      expect(wrapper.text()).toContain(
        "No semesters yet. Create your first semester."
      );
    });
  });
});
