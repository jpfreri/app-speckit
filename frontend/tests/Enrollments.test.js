/**
 * Feature 5 — Student Enrollment
 * Spec: features/feature-5-student-enrollment.md
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import App from "../src/App.vue";
import Enrollments from "../src/views/Enrollments.vue";
import enrollmentServices from "../src/services/enrollmentServices.js";
import sectionServices from "../src/services/sectionServices.js";
import { vuetify } from "./testUtils.js";

vi.mock("../src/services/enrollmentServices.js", () => ({
    default: {
        getEnrollments: vi.fn(),
        createEnrollment: vi.fn(),
        updateEnrollment: vi.fn(),
        deleteEnrollment: vi.fn(),
    },
}));

vi.mock("../src/services/sectionServices.js", () => ({
    default: {
        getSections: vi.fn(),
    },
}));

const section = {
    id: 10,
    sectionName: "01",
    courseId: 1,
    semesterId: 2,
    startDate: "2026-08-15",
    endDate: "2026-12-15",
};

const section2 = {
    id: 11,
    sectionName: "02",
    courseId: 1,
    semesterId: 2,
    startDate: "2026-09-01",
    endDate: "2026-12-15",
};

const enrollmentRecord = (overrides = {}) => ({
    id: 1,
    userId: 1,
    sectionId: section.id,
    sectionName: "01",
    courseName: "CMSC-1234",
    semesterName: "2026 Fall",
    startDate: "2026-08-15",
    endDate: "2026-12-15",
    ...overrides,
});

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
          {{ item.sectionName }}
        </option>
      </select>
      <span v-for="(rule, index) in rules" :key="index">{{ rule(modelValue) }}</span>
    </label>
  `,
};

const viewStubs = {
    teleport: true,
    VDialog: dialogStub,
    VSelect: selectStub,
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

const mountEnrollments = async (rows = []) => {
    enrollmentServices.getEnrollments.mockResolvedValue({ data: rows });
    sectionServices.getSections.mockResolvedValue({ data: [section, section2] });

    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: "/", name: "home", component: { template: "<div>Home</div>" } },
            { path: "/login", name: "login", component: { template: "<div>Login</div>" } },
            { path: "/enrollments", name: "enrollments", component: Enrollments },
        ],
    });
    await router.push("/enrollments");
    await router.isReady();

    const wrapper = mount(Enrollments, {
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

const chooseSection = async (wrapper, id) => {
    const select = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((component) => component.props("label") === "Section");
    await select.find("select").setValue(String(id));
    await flushPromises();
};

const cardTitle = (wrapper, text) =>
    wrapper.findAll(".v-card-title").find((node) => node.text() === text);

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    signInStudent();
});

describe("Feature 5 — Student Enrollment", () => {
    describe("US-5.1 — Open enrollment from the menu", () => {
        it("Menu Selection", async () => {
            enrollmentServices.getEnrollments.mockResolvedValue({ data: [] });
            sectionServices.getSections.mockResolvedValue({ data: [section] });

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

    describe("US-5.2 — Add an enrollment", () => {
        it("Student creates a new enrollment", async () => {
            const created = enrollmentRecord();
            enrollmentServices.getEnrollments
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: [created] });
            sectionServices.getSections.mockResolvedValue({ data: [section] });
            enrollmentServices.createEnrollment.mockResolvedValue({ data: created });

            const router = createRouter({
                history: createMemoryHistory(),
                routes: [
                    { path: "/enrollments", name: "enrollments", component: Enrollments },
                ],
            });
            await router.push("/enrollments");
            await router.isReady();

            const wrapper = mount(Enrollments, {
                attachTo: document.body,
                global: { plugins: [vuetify, router], stubs: viewStubs },
            });
            await flushPromises();

            await clickText(wrapper, "+ New enrollment");
            await chooseSection(wrapper, section.id);
            await clickText(wrapper, "Create");

            expect(enrollmentServices.createEnrollment).toHaveBeenCalledWith({
                sectionId: section.id,
            });
            expect(cardTitle(wrapper, "Add Enrollment")).toBeUndefined();
            expect(wrapper.text()).toContain("01");
            expect(wrapper.text()).toContain("CMSC-1234");
            expect(wrapper.text()).toContain("2026 Fall");
            wrapper.unmount();
        });

        it("Student creates an enrollment with a missing section", async () => {
            const wrapper = await mountEnrollments([]);
            await clickText(wrapper, "+ New enrollment");
            await clickText(wrapper, "Create");

            expect(enrollmentServices.createEnrollment).not.toHaveBeenCalled();
            expect(wrapper.text()).toContain("Required");
            wrapper.unmount();
        });

        it("Student enrolls in a section they already have", async () => {
            const wrapper = await mountEnrollments([enrollmentRecord()]);
            await clickText(wrapper, "+ New enrollment");
            await chooseSection(wrapper, section.id);
            await clickText(wrapper, "Create");

            expect(enrollmentServices.createEnrollment).not.toHaveBeenCalled();
            expect(wrapper.text()).toContain(
                "You are already enrolled in this course section."
            );
            wrapper.unmount();
        });
    });
    describe("US-5.3 — View enrollments", () => {
        it("Enrollment view loads with existing enrollments", async () => {
            const wrapper = await mountEnrollments([
                enrollmentRecord({
                    id: 1,
                    sectionId: 10,
                    sectionName: "01",
                    startDate: "2026-08-15",
                    endDate: "2026-12-15",
                }),
                enrollmentRecord({
                    id: 2,
                    sectionId: 11,
                    sectionName: "02",
                    startDate: "2026-09-01",
                    endDate: "2026-12-15",
                }),
            ]);

            const rows = wrapper.findAll("tbody tr").map((row) => row.text());
            expect(rows).toHaveLength(2);
            expect(rows[0]).toContain("01");
            expect(rows[0]).toContain("CMSC-1234");
            expect(rows[0]).toContain("2026 Fall");
            expect(rows[1]).toContain("02");
            expect(rows[1]).toContain("CMSC-1234");
            expect(rows[1]).toContain("2026 Fall");
            wrapper.unmount();
        });

        it("There are no enrollments", async () => {
            const wrapper = await mountEnrollments([]);

            expect(wrapper.text()).toContain(
                "No enrollments yet. Create your first enrollment."
            );
            wrapper.unmount();
        });
    });
    describe("US-5.4 — Manage enrollment rows", () => {
        it("Enrollment rows show edit and delete actions", async () => {
            const wrapper = await mountEnrollments([enrollmentRecord()]);

            expect(wrapper.find('[aria-label="Edit enrollment"]').exists()).toBe(true);
            expect(wrapper.find('[aria-label="Delete enrollment"]').exists()).toBe(true);
            wrapper.unmount();
        });
    });

    describe("US-5.5 — Edit an enrollment", () => {
        it("Student selects to edit an enrollment", async () => {
            const wrapper = await mountEnrollments([enrollmentRecord()]);
            await wrapper.find('[aria-label="Edit enrollment"]').trigger("click");
            await flushPromises();

            expect(cardTitle(wrapper, "Edit Enrollment").text()).toBe("Edit Enrollment");
            const select = wrapper
                .findAllComponents({ name: "VSelect" })
                .find((c) => c.props("label") === "Section");
            expect(select.props("modelValue")).toBe(section.id);
            wrapper.unmount();
        });

        it("Student edits an enrollment with a valid section and saves", async () => {
            const existing = enrollmentRecord();
            const updated = enrollmentRecord({
                sectionId: section2.id,
                sectionName: "02",
                startDate: "2026-09-01",
            });

            enrollmentServices.getEnrollments
                .mockResolvedValueOnce({ data: [existing] })
                .mockResolvedValueOnce({ data: [updated] });
            sectionServices.getSections.mockResolvedValue({
                data: [section, section2],
            });
            enrollmentServices.updateEnrollment.mockResolvedValue({ data: updated });

            const router = createRouter({
                history: createMemoryHistory(),
                routes: [
                    { path: "/enrollments", name: "enrollments", component: Enrollments },
                ],
            });
            await router.push("/enrollments");
            await router.isReady();

            const wrapper = mount(Enrollments, {
                attachTo: document.body,
                global: { plugins: [vuetify, router], stubs: viewStubs },
            });
            await flushPromises();

            await wrapper.find('[aria-label="Edit enrollment"]').trigger("click");
            await flushPromises();
            await chooseSection(wrapper, section2.id);
            await clickText(wrapper, "Save Enrollment");

            expect(enrollmentServices.updateEnrollment).toHaveBeenCalledWith(
                existing.id,
                { sectionId: section2.id }
            );
            expect(cardTitle(wrapper, "Edit Enrollment")).toBeUndefined();
            expect(wrapper.text()).toContain("02");
            wrapper.unmount();
        });

        it("Student edits an enrollment with a missing section and saves", async () => {
            const wrapper = await mountEnrollments([enrollmentRecord()]);
            await wrapper.find('[aria-label="Edit enrollment"]').trigger("click");
            await flushPromises();

            const select = wrapper
                .findAllComponents({ name: "VSelect" })
                .find((c) => c.props("label") === "Section");
            await select.vm.$emit("update:modelValue", null);
            await flushPromises();

            await clickText(wrapper, "Save Enrollment");

            expect(enrollmentServices.updateEnrollment).not.toHaveBeenCalled();
            expect(wrapper.text()).toContain("Required");
            expect(cardTitle(wrapper, "Edit Enrollment")).toBeTruthy();
            wrapper.unmount();
        });

        it("Student edits an enrollment and cancels", async () => {
            const wrapper = await mountEnrollments([enrollmentRecord()]);
            await wrapper.find('[aria-label="Edit enrollment"]').trigger("click");
            await flushPromises();

            await chooseSection(wrapper, section2.id);
            await clickText(wrapper, "Cancel");

            expect(enrollmentServices.updateEnrollment).not.toHaveBeenCalled();
            expect(cardTitle(wrapper, "Edit Enrollment")).toBeUndefined();
            expect(wrapper.text()).toContain("01");
            wrapper.unmount();
        });
    });

    describe("US-5.6 — Delete an enrollment", () => {
        it("Student selects to delete an enrollment", async () => {
            const wrapper = await mountEnrollments([enrollmentRecord()]);
            await wrapper.find('[aria-label="Delete enrollment"]').trigger("click");
            await flushPromises();

            expect(cardTitle(wrapper, "Delete Enrollment")).toBeTruthy();
            expect(wrapper.text()).toContain("Delete this enrollment?");
            wrapper.unmount();
        });

        it("Student deletes an enrollment", async () => {
            const existing = enrollmentRecord();
            enrollmentServices.getEnrollments
                .mockResolvedValueOnce({ data: [existing] })
                .mockResolvedValueOnce({ data: [] });
            sectionServices.getSections.mockResolvedValue({
                data: [section, section2],
            });
            enrollmentServices.deleteEnrollment.mockResolvedValue({ data: {} });

            const router = createRouter({
                history: createMemoryHistory(),
                routes: [
                    { path: "/enrollments", name: "enrollments", component: Enrollments },
                ],
            });
            await router.push("/enrollments");
            await router.isReady();

            const wrapper = mount(Enrollments, {
                attachTo: document.body,
                global: { plugins: [vuetify, router], stubs: viewStubs },
            });
            await flushPromises();

            await wrapper.find('[aria-label="Delete enrollment"]').trigger("click");
            await flushPromises();
            await clickText(wrapper, "Delete Enrollment");

            expect(enrollmentServices.deleteEnrollment).toHaveBeenCalledWith(
                existing.id
            );
            expect(cardTitle(wrapper, "Delete Enrollment")).toBeUndefined();
            expect(wrapper.text()).toContain(
                "No enrollments yet. Create your first enrollment."
            );
            wrapper.unmount();
        });

        it("Student cancels deleting an enrollment", async () => {
            const wrapper = await mountEnrollments([enrollmentRecord()]);
            await wrapper.find('[aria-label="Delete enrollment"]').trigger("click");
            await flushPromises();

            const cancel = wrapper
                .findAll("button")
                .filter((button) => button.text() === "Cancel")
                .at(-1);
            await cancel.trigger("click");
            await flushPromises();

            expect(enrollmentServices.deleteEnrollment).not.toHaveBeenCalled();
            expect(cardTitle(wrapper, "Delete Enrollment")).toBeUndefined();
            expect(wrapper.text()).toContain("01");
            wrapper.unmount();
        });
    });
});