/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
 */
import { describe, it, expect } from "vitest";
import Semesters from "../src/views/Semesters.vue";
import { mountWithPlugins } from "./testUtils.js";

describe("Feature 2 — Semester Management", () => {
  describe("US-2.1 — Select to work with Semesters", () => {
    it("Menu Selection", async () => {
      const { wrapper } = await mountWithPlugins(Semesters);

      expect(wrapper.text()).toContain("Semesters");
    });
  });
});
