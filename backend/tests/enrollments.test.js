/**
 * Feature 5 — Student Enrollment
 * Spec: features/feature-5-student-enrollment.md
 */
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server.js";
import db from "../app/models/index.js";

const studentToken = "student-token";
const otherStudentToken = "other-student-token";

let student;
let section;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const createUser = async (role, username, email) =>
  db.user.create({
    fName: role === "admin" ? "Ada" : "Sam",
    lName: "User",
    email,
    username,
    password: await bcrypt.hash("password1", 10),
    role,
  });

const createSession = (user, token) =>
  db.session.create({
    token,
    email: user.email,
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    userId: user.id,
  });

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

beforeEach(async () => {
  await db.enrollment.destroy({ where: {} });
  await db.section.destroy({ where: {} });
  await db.course.destroy({ where: {} });
  await db.semester.destroy({ where: {} });
  await db.session.destroy({ where: {} });
  await db.user.destroy({ where: {} });

  student = await createUser("student", "student", "student@test.com");
  const other = await createUser("student", "other", "other@test.com");
  await createSession(student, studentToken);
  await createSession(other, otherStudentToken);

  const semester = await db.semester.create({
    semesterName: "2026 Fall",
    startDate: "2026-08-15",
    endDate: "2026-12-15",
  });
  const course = await db.course.create({
    courseName: "CMSC-1234",
    semesterId: semester.id,
    startDate: "2026-08-15",
    endDate: "2026-12-15",
  });
  section = await db.section.create({
    sectionName: "01",
    courseId: course.id,
    semesterId: semester.id,
    startDate: "2026-08-15",
    endDate: "2026-12-15",
  });
});

describe("Feature 5 — Student Enrollment", () => {
  describe("US-5.2 — Add an enrollment", () => {
    it("Student creates a new enrollment", async () => {
      const response = await request(app)
        .post("/courses/enrollments")
        .set(auth(studentToken))
        .send({ sectionId: section.id });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        userId: student.id,
        sectionId: section.id,
        sectionName: "01",
        courseName: "CMSC-1234",
        semesterName: "2026 Fall",
        startDate: "2026-08-15",
        endDate: "2026-12-15",
      });
      expect(response.body.id).toEqual(expect.any(Number));

      const stored = await db.enrollment.findAll();
      expect(stored).toHaveLength(1);
      expect(stored[0].userId).toBe(student.id);
    });

    it("Student enrolls in a section they already have via the API", async () => {
      await db.enrollment.create({
        userId: student.id,
        sectionId: section.id,
      });

      const response = await request(app)
        .post("/courses/enrollments")
        .set(auth(studentToken))
        .send({ sectionId: section.id });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "You are already enrolled in this course section.",
      });

      const stored = await db.enrollment.findAll({
        where: { userId: student.id, sectionId: section.id },
      });
      expect(stored).toHaveLength(1);
    });

    it("Student enrolls with an unknown section", async () => {
      const response = await request(app)
        .post("/courses/enrollments")
        .set(auth(studentToken))
        .send({ sectionId: 999999 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Section with id=999999 not found.",
      });

      const stored = await db.enrollment.findAll();
      expect(stored).toHaveLength(0);
    });
  });
});