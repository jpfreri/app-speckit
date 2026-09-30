/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import {
  syncTestDatabase,
  registerAdmin,
  authHeader,
  validSemester,
  createSemester,
} from "./helpers.js";

describe("Feature 2 — Semester Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-2.2 — Create semester", () => {
    it("User creates a new semester", async () => {
      const { token } = await registerAdmin(app);
      const response = await createSemester(app, token);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          semesterName: "2026 Fall",
          startDate: "2026-08-15",
          endDate: "2026-12-15",
        })
      );

      const stored = await db.semester.findOne({
        where: { semesterName: "2026 Fall" },
      });
      expect(stored).not.toBeNull();
    });

    it("User creates a semester with a duplicate name", async () => {
      const { token } = await registerAdmin(app);
      await createSemester(app, token);

      const response = await request(app)
        .post("/courses/semesters")
        .set(authHeader(token))
        .send(validSemester());

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Semester name is already taken.",
      });
      expect(await db.semester.count({ where: { semesterName: "2026 Fall" } })).toBe(
        1
      );
    });
  });
});
