/**
 * Feature 3 — Course Management
 * Spec: features/feature-3-course-management.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import {
  syncTestDatabase,
  registerAdmin,
  registerUser,
  authHeader,
  createSemester,
  validCourse,
  createCourse,
} from "./helpers.js";

const adminWithSemester = async () => {
  const { token } = await registerAdmin(app);
  const semester = await createSemester(app, token, { semesterName: "2026 Fall" });
  return { token, semesterId: semester.body.id };
};

describe("Feature 3 — Course Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("US-3.2 — Create course", () => {
    it("User creates a new course", async () => {
      const { token, semesterId } = await adminWithSemester();

      const response = await createCourse(app, token, { semesterId });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          courseName: "CMSC-1234",
          semesterId,
        })
      );
      expect(await db.course.count({ where: { courseName: "CMSC-1234" } })).toBe(1);
    });

    it("User creates a course with a duplicate name", async () => {
      const { token, semesterId } = await adminWithSemester();
      await createCourse(app, token, { semesterId });

      const response = await createCourse(app, token, { semesterId });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course name is already taken." });
      expect(await db.course.count({ where: { courseName: "CMSC-1234" } })).toBe(1);
    });

    it("User creates a course with an unknown semester", async () => {
      const { token } = await registerAdmin(app);

      const response = await createCourse(app, token, { semesterId: 9999 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester with id=9999 not found." });
      expect(await db.course.count()).toBe(0);
    });
  });

  describe("US-3.3 — View courses", () => {
    it("Courses view loads with existing courses", async () => {
      const { token } = await registerAdmin(app);
      const fall = await createSemester(app, token, {
        semesterName: "2026 Fall",
        startDate: "2026-08-15",
        endDate: "2026-12-15",
      });
      const spring = await createSemester(app, token, {
        semesterName: "2026 Spring",
        startDate: "2026-01-15",
        endDate: "2026-05-15",
      });
      await createCourse(app, token, {
        courseName: "CMSC-1234",
        semesterId: fall.body.id,
      });
      await createCourse(app, token, {
        courseName: "ZOOL-1000",
        semesterId: spring.body.id,
      });
      await createCourse(app, token, {
        courseName: "ART-1000",
        semesterId: fall.body.id,
      });

      const response = await request(app)
        .get("/courses/courses")
        .set(authHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.map((row) => row.courseName)).toEqual([
        "ZOOL-1000",
        "ART-1000",
        "CMSC-1234",
      ]);
    });
  });

  describe("US-3.5 — Edit a course", () => {
    it("User edits a course with valid values and saves", async () => {
      const { token, semesterId } = await adminWithSemester();
      const created = await createCourse(app, token, { semesterId });

      const response = await request(app)
        .put(`/courses/courses/${created.body.id}`)
        .set(authHeader(token))
        .send(validCourse({ semesterId, courseName: "CMSC-5678" }));

      expect(response.status).toBe(200);
      const stored = await db.course.findByPk(created.body.id);
      expect(stored.courseName).toBe("CMSC-5678");
    });
  });

  describe("US-3.6 — Delete a course", () => {
    it("User deletes a course", async () => {
      const { token, semesterId } = await adminWithSemester();
      const created = await createCourse(app, token, { semesterId });

      const response = await request(app)
        .delete(`/courses/courses/${created.body.id}`)
        .set(authHeader(token));

      expect(response.status).toBe(200);
      expect(await db.course.findByPk(created.body.id)).toBeNull();
      expect(await db.semester.findByPk(semesterId)).not.toBeNull();
    });
  });

  describe("US-3.7 — Restrict course management to admins", () => {
    it("Student can list courses via the API", async () => {
      const { token: adminToken, semesterId } = await adminWithSemester();
      await createCourse(app, adminToken, { semesterId });
      const { token } = await registerUser(app);

      const response = await request(app)
        .get("/courses/courses")
        .set(authHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        expect.objectContaining({ courseName: "CMSC-1234" }),
      ]);
    });

    it("Student cannot create a course via the API", async () => {
      const { semesterId } = await adminWithSemester();
      const { token } = await registerUser(app);

      const response = await request(app)
        .post("/courses/courses")
        .set(authHeader(token))
        .send(validCourse({ semesterId }));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(await db.course.count()).toBe(0);
    });

    it("Unauthenticated API request to courses", async () => {
      const response = await request(app).get("/courses/courses");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/i);
    });
  });
});
