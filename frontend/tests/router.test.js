/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
 */
import { describe, it, expect, beforeEach } from "vitest";
import router from "../src/router.js";

describe("Feature 2 — Semester Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("US-2.7 — Restrict semester management to admins", () => {
    it("Unauthenticated user navigates to semesters", async () => {
      await router.push("/login");
      await router.push("/semesters");

      expect(router.currentRoute.value.name).toBe("login");
    });
  });
});
