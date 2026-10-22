import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import App from "../src/App.vue";
import Sections from "../src/views/Sections.vue";
import sectionServices from "../src/services/sectionServices.js";
import courseServices from "../src/services/courseServices.js";
import semesterServices from "../src/services/semesterServices.js";
import { vuetify } from "./testUtils.js";

vi.mock("../src/services/sectionServices.js", () => ({
  default: {
    getSections: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
  },
}));

vi.mock("../src/services/courseServices.js", () => ({
  default: {
    getCourses: vi.fn(),
  },
}));

vi.mock("../src/services/semesterServices.js", () => ({
  default: {
    getSemesters: vi.fn(),
  },
}));

const course = { id: 1, courseName: "CMSC-1234" };
const semester = { id: 2, semesterName: "2026 Fall" };

const sectionRecord = (overrides = {}) => ({
  id: 10,
  sectionName: "01",
  courseId: course.id,
  semesterId: semester.id,
  startDate: "2026-08-15",
  endDate: "2026-12-15",
  course,
  semester,
  ...overrides,
});

const datePickerStub = {
  name: "VDatePicker",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    '<input class="test-date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
};

const dialogStub = {
  name: "VDialog",
  props: ["modelValue"],
  template: '<div v-if="modelValue" class="test-dialog"><slot /></div>',
};

const selectStub = {
  name: "VSelect",
  props: {
    modelValue: { default: null },
    items: { type: Array, default: () => [] },
    label: { type: String, default: "" },
    rules: { type: Array, default: () => [] },
  },
  emits: ["update:modelValue"],
  template: `
    <label>
      <span>{{ label }}</span>
      <select
        class="test-select"
        :value="modelValue ?? ''"
        @change="$emit('update:modelValue', $event.target.value === '' ? null : Number($event.target.value))"
      >
        <option value=""></option>
        <option v-for="item in items" :key="item.id" :value="item.id">
          {{ item.courseName || item.semesterName }}
        </option>
      </select>
      <span v-for="(rule, index) in rules" :key="index">{{ rule(modelValue) }}</span>
    </label>
  `,
};

const viewStubs = {
  teleport: true,
  VDatePicker: datePickerStub,
  VDialog: dialogStub,
  VSelect: selectStub,
};

const signInAdmin = () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      userId: 1,
      fName: "Ada",
      lName: "Admin",
      username: "admin",
      email: "admin@test.com",
      role: "admin",
      token: "admin-token",
    })
  );
};

const catalog = () => {
  courseServices.getCourses.mockResolvedValue({ data: [course] });
  semesterServices.getSemesters.mockResolvedValue({ data: [semester] });
};

const mountSections = async (sections = []) => {
  if (sections !== null) {
    sectionServices.getSections.mockResolvedValue({ data: sections });
  }
  catalog();

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "home", component: { template: "<div>Home</div>" } },
      { path: "/login", name: "login", component: { template: "<div>Login</div>" } },
      { path: "/sections", name: "sections", component: Sections },
    ],
  });
  await router.push("/sections");
  await router.isReady();

  const wrapper = mount(Sections, {
    attachTo: document.body,
    global: {
      plugins: [vuetify, router],
      stubs: viewStubs,
    },
  });
  await flushPromises();
  return wrapper;
};

const clickText = async (wrapper, text) => {
  const target = wrapper
    .findAll("button, a")
    .find((element) => element.text() === text);
  await target.trigger("click");
  await flushPromises();
};

const fieldByLabel = (wrapper, label) =>
  wrapper
    .findAllComponents({ name: "VTextField" })
    .find((component) => component.props("label") === label) ||
  wrapper
    .findAllComponents({ name: "VSelect" })
    .find((component) => component.props("label") === label);

const setField = async (wrapper, label, value) => {
  await fieldByLabel(wrapper, label).vm.$emit("update:modelValue", value);
  await flushPromises();
};

const chooseSelect = async (wrapper, label, value) => {
  const select = wrapper
    .findAllComponents({ name: "VSelect" })
    .find((component) => component.props("label") === label);
  await select.find("select").setValue(String(value));
  await flushPromises();
};

const setDates = async (wrapper, startDate, endDate) => {
  const pickers = wrapper.findAllComponents({ name: "VDatePicker" });
  await pickers[0].vm.$emit("update:modelValue", startDate);
  await pickers[1].vm.$emit("update:modelValue", endDate);
  await flushPromises();
};

const fillValidSection = async (wrapper, overrides = {}) => {
  await setField(wrapper, "Section Name", overrides.sectionName ?? "01");
  await chooseSelect(wrapper, "Course", overrides.courseId ?? course.id);
  await chooseSelect(wrapper, "Semester", overrides.semesterId ?? semester.id);
  await setDates(
    wrapper,
    overrides.startDate ?? "2026-08-15",
    overrides.endDate ?? "2026-12-15"
  );
};

const cardTitle = (wrapper, text) =>
  wrapper.findAll(".v-card-title").find((node) => node.text() === text);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  signInAdmin();
});

describe("Sections", () => {
  it("Menu Selection", async () => {
    sectionServices.getSections.mockResolvedValue({ data: [] });
    catalog();
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div>Home</div>" } },
        { path: "/login", name: "login", component: { template: "<div>Login</div>" } },
        { path: "/sections", name: "sections", component: Sections },
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

    const sectionsLink = wrapper
      .findAll("a, button")
      .find((element) => element.text().trim() === "Sections");
    expect(sectionsLink.attributes("href")).toContain("/sections");
    await router.push("/sections");
    await flushPromises();

    expect(router.currentRoute.value.name).toBe("sections");
    expect(wrapper.text()).toContain("No sections yet. Create your first section.");
    wrapper.unmount();
  });

  it("User creates a new section", async () => {
    const created = sectionRecord();
    sectionServices.getSections
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [created] });
    catalog();
    sectionServices.createSection.mockResolvedValue({ data: created });

    const wrapper = await mountSections(null);
    await clickText(wrapper, "+ New section");
    await fillValidSection(wrapper);
    await clickText(wrapper, "Create");

    expect(sectionServices.createSection).toHaveBeenCalledWith({
      sectionName: "01",
      courseId: course.id,
      semesterId: semester.id,
      startDate: "2026-08-15",
      endDate: "2026-12-15",
    });
    expect(cardTitle(wrapper, "Add Section")).toBeUndefined();
    expect(wrapper.text()).toContain("01");
    expect(wrapper.text()).toContain("CMSC-1234");
    expect(wrapper.text()).toContain("2026 Fall");
    wrapper.unmount();
  });

  it("User creates a section with a missing required field", async () => {
    const wrapper = await mountSections();
    await clickText(wrapper, "+ New section");
    await clickText(wrapper, "Create");

    expect(sectionServices.createSection).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Required");
    wrapper.unmount();
  });

  it("User creates a section with a name that is too long", async () => {
    const wrapper = await mountSections();
    await clickText(wrapper, "+ New section");
    await fillValidSection(wrapper, {
      sectionName: "2026 Fall Extended Summer Session",
    });
    await clickText(wrapper, "Create");

    expect(sectionServices.createSection).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Section name must be 30 characters or fewer.");
    wrapper.unmount();
  });

  it("User creates a section with end date before start date", async () => {
    const wrapper = await mountSections();
    await clickText(wrapper, "+ New section");
    await fillValidSection(wrapper, {
      startDate: "2026-12-15",
      endDate: "2026-08-15",
    });
    await clickText(wrapper, "Create");

    expect(sectionServices.createSection).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("End date must be after start date.");
    wrapper.unmount();
  });

  it("User creates a section with a duplicate name", async () => {
    const existing = sectionRecord();
    sectionServices.createSection.mockRejectedValue({
      response: { data: { message: "Section name is already taken." } },
    });

    const wrapper = await mountSections([existing]);
    await clickText(wrapper, "+ New section");
    await fillValidSection(wrapper);
    await clickText(wrapper, "Create");

    expect(sectionServices.createSection).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Section name is already taken.");
    expect(wrapper.findAll("tbody tr")).toHaveLength(1);
    expect(cardTitle(wrapper, "Add Section")).toBeTruthy();
    wrapper.unmount();
  });

  it("Sections view loads with existing sections", async () => {
    const wrapper = await mountSections([
      sectionRecord({ id: 1, sectionName: "01", startDate: "2026-08-15" }),
      sectionRecord({
        id: 2,
        sectionName: "02",
        startDate: "2026-09-01",
        endDate: "2026-12-15",
      }),
    ]);

    const rows = wrapper.findAll("tbody tr").map((row) => row.text());
    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain("01");
    expect(rows[1]).toContain("02");
    wrapper.unmount();
  });

  it("There are no sections", async () => {
    const wrapper = await mountSections();

    expect(wrapper.text()).toContain("No sections yet. Create your first section.");
    wrapper.unmount();
  });

  it("section rows show edit and delete actions", async () => {
    const wrapper = await mountSections([sectionRecord()]);

    expect(wrapper.find('[aria-label="Edit section"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Delete section"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it("User selects to edit a section", async () => {
    const wrapper = await mountSections([sectionRecord()]);
    await wrapper.find('[aria-label="Edit section"]').trigger("click");
    await flushPromises();

    expect(cardTitle(wrapper, "Edit Section").text()).toBe("Edit Section");
    expect(fieldByLabel(wrapper, "Section Name").props("modelValue")).toBe("01");
    expect(fieldByLabel(wrapper, "Course").text()).toContain("CMSC-1234");
    expect(fieldByLabel(wrapper, "Semester").text()).toContain("2026 Fall");
    wrapper.unmount();
  });

  it("User edits a section with valid values and saves", async () => {
    const existing = sectionRecord();
    const updated = sectionRecord({ sectionName: "02", endDate: "2026-12-20" });
    sectionServices.getSections
      .mockResolvedValueOnce({ data: [existing] })
      .mockResolvedValueOnce({ data: [updated] });
    catalog();
    sectionServices.updateSection.mockResolvedValue({ data: updated });

    const wrapper = await mountSections(null);
    await wrapper.find('[aria-label="Edit section"]').trigger("click");
    await flushPromises();
    await setField(wrapper, "Section Name", "02");
    await setDates(wrapper, "2026-08-15", "2026-12-20");
    await clickText(wrapper, "Save Section");

    expect(sectionServices.updateSection).toHaveBeenCalledWith(existing.id, {
      sectionName: "02",
      courseId: course.id,
      semesterId: semester.id,
      startDate: "2026-08-15",
      endDate: "2026-12-20",
    });
    expect(cardTitle(wrapper, "Edit Section")).toBeUndefined();
    expect(wrapper.text()).toContain("02");
    wrapper.unmount();
  });

  it("User edits a section with invalid values and saves", async () => {
    const wrapper = await mountSections([sectionRecord()]);
    await wrapper.find('[aria-label="Edit section"]').trigger("click");
    await flushPromises();
    await setField(wrapper, "Section Name", "");
    await clickText(wrapper, "Save Section");

    expect(sectionServices.updateSection).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Required");
    expect(cardTitle(wrapper, "Edit Section")).toBeTruthy();
    wrapper.unmount();
  });

  it("User edits a section and cancels", async () => {
    const wrapper = await mountSections([sectionRecord()]);
    await wrapper.find('[aria-label="Edit section"]').trigger("click");
    await flushPromises();
    await setField(wrapper, "Section Name", "02");
    await clickText(wrapper, "Cancel");

    expect(sectionServices.updateSection).not.toHaveBeenCalled();
    expect(cardTitle(wrapper, "Edit Section")).toBeUndefined();
    expect(wrapper.text()).toContain("01");
    expect(wrapper.findAll("tbody tr")).toHaveLength(1);
    wrapper.unmount();
  });

  it("User selects to delete a section", async () => {
    const wrapper = await mountSections([sectionRecord()]);
    await wrapper.find('[aria-label="Delete section"]').trigger("click");
    await flushPromises();

    expect(cardTitle(wrapper, "Delete Section")).toBeTruthy();
    expect(wrapper.text()).toContain("Delete this section?");
    wrapper.unmount();
  });

  it("User deletes a section", async () => {
    const existing = sectionRecord();
    sectionServices.getSections
      .mockResolvedValueOnce({ data: [existing] })
      .mockResolvedValueOnce({ data: [] });
    catalog();
    sectionServices.deleteSection.mockResolvedValue({ data: {} });

    const wrapper = await mountSections(null);
    await wrapper.find('[aria-label="Delete section"]').trigger("click");
    await flushPromises();
    await clickText(wrapper, "Delete Section");

    expect(sectionServices.deleteSection).toHaveBeenCalledWith(existing.id);
    expect(cardTitle(wrapper, "Delete Section")).toBeUndefined();
    expect(wrapper.text()).toContain("No sections yet. Create your first section.");
    wrapper.unmount();
  });

  it("User cancels deleting a section", async () => {
    const wrapper = await mountSections([sectionRecord()]);
    await wrapper.find('[aria-label="Delete section"]').trigger("click");
    await flushPromises();
    const cancel = wrapper
      .findAll("button")
      .filter((button) => button.text() === "Cancel")
      .at(-1);
    await cancel.trigger("click");
    await flushPromises();

    expect(sectionServices.deleteSection).not.toHaveBeenCalled();
    expect(cardTitle(wrapper, "Delete Section")).toBeUndefined();
    expect(wrapper.text()).toContain("01");
    wrapper.unmount();
  });
});
