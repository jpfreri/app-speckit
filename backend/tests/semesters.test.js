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
  registerUser,
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

  describe("US-2.3 — View semesters", () => {
    it("Semesters view loads with existing semesters", async () => {
      const { token } = await registerAdmin(app);
      await createSemester(app, token, { semesterName: "2026 Fall" });
      await createSemester(app, token, {
        semesterName: "2026 Spring",
        startDate: "2026-01-15",
        endDate: "2026-05-15",
      });

      const response = await request(app)
        .get("/courses/semesters")
        .set(authHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.map((row) => row.semesterName)).toEqual([
        "2026 Spring",
        "2026 Fall",
      ]);
    });
  });

  describe("US-2.5 — Edit a semester", () => {
    it("User edits a semester with valid values and saves", async () => {
      const { token } = await registerAdmin(app);
      const created = await createSemester(app, token);

      const response = await request(app)
        .put(`/courses/semesters/${created.body.id}`)
        .set(authHeader(token))
        .send({
          semesterName: "2027 Spring",
          startDate: "2027-01-10",
          endDate: "2027-04-30",
        });

      expect(response.status).toBe(200);

      const stored = await db.semester.findByPk(created.body.id);
      expect(stored.semesterName).toBe("2027 Spring");
    });
  });

  describe("US-2.6 — Delete a semester", () => {
    it("User deletes a semester", async () => {
      const { token } = await registerAdmin(app);
      const created = await createSemester(app, token);

      const response = await request(app)
        .delete(`/courses/semesters/${created.body.id}`)
        .set(authHeader(token));

      expect(response.status).toBe(200);
      expect(await db.semester.findByPk(created.body.id)).toBeNull();
    });
  });

  describe("US-2.7 — Restrict semester management to admins", () => {
    it("Student cannot list semesters via the API", async () => {
      const { token } = await registerUser(app);

      const response = await request(app)
        .get("/courses/semesters")
        .set(authHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
    });

    it("Student cannot create a semester via the API", async () => {
      const { token } = await registerUser(app);

      const response = await request(app)
        .post("/courses/semesters")
        .set(authHeader(token))
        .send(validSemester());

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(await db.semester.count()).toBe(0);
    });

    it("Unauthenticated API request to semesters", async () => {
      const response = await request(app).get("/courses/semesters");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/i);
    });
  });
});
