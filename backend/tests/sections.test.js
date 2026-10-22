import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server.js";
import db from "../app/models/index.js";

const adminToken = "admin-token";
const studentToken = "student-token";

let admin;
let semester;
let course;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const sectionBody = (overrides = {}) => ({
  sectionName: "01",
  courseId: course.id,
  semesterId: semester.id,
  startDate: "2026-08-15",
  endDate: "2026-12-15",
  ...overrides,
});

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
  await db.section.destroy({ where: {} });
  await db.course.destroy({ where: {} });
  await db.semester.destroy({ where: {} });
  await db.session.destroy({ where: {} });
  await db.user.destroy({ where: {} });

  admin = await createUser("admin", "admin", "admin@test.com");
  const student = await createUser("student", "student", "student@test.com");
  await createSession(admin, adminToken);
  await createSession(student, studentToken);

  semester = await db.semester.create({
    semesterName: "2026 Fall",
    startDate: "2026-08-15",
    endDate: "2026-12-15",
  });
  course = await db.course.create({
    courseName: "CMSC-1234",
    semesterId: semester.id,
    startDate: "2026-08-15",
    endDate: "2026-12-15",
  });
});

describe("sections API", () => {
  it("User creates a new section", async () => {
    const response = await request(app)
      .post("/course-t2/sections")
      .set(auth(adminToken))
      .send(sectionBody());

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      sectionName: "01",
      courseId: course.id,
      semesterId: semester.id,
      startDate: "2026-08-15",
      endDate: "2026-12-15",
    });
    expect(response.body.id).toEqual(expect.any(Number));

    const stored = await db.section.findAll();
    expect(stored).toHaveLength(1);
    expect(stored[0].sectionName).toBe("01");
  });

  it("User creates a section with a duplicate name", async () => {
    await db.section.create(sectionBody());

    const response = await request(app)
      .post("/course-t2/sections")
      .set(auth(adminToken))
      .send(sectionBody());

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Section name is already taken." });

    const stored = await db.section.findAll({ where: { sectionName: "01" } });
    expect(stored).toHaveLength(1);
  });

  it("User creates a section with an unknown semester", async () => {
    const response = await request(app)
      .post("/course-t2/sections")
      .set(auth(adminToken))
      .send(sectionBody({ semesterId: 999999 }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Semester with id=999999 not found.",
    });
    expect(await db.section.count()).toBe(0);
  });

  it("User creates a section with an unknown course", async () => {
    const response = await request(app)
      .post("/course-t2/sections")
      .set(auth(adminToken))
      .send(sectionBody({ courseId: 999999 }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Course with id=999999 not found.",
    });
    expect(await db.section.count()).toBe(0);
  });

  it("Sections view loads with existing sections", async () => {
    await db.section.create(
      sectionBody({
        sectionName: "02",
        startDate: "2026-09-01",
        endDate: "2026-12-15",
      })
    );
    await db.section.create(sectionBody());

    const response = await request(app)
      .get("/course-t2/sections")
      .set(auth(adminToken));

    expect(response.status).toBe(200);
    expect(response.body.map((section) => section.sectionName)).toEqual([
      "01",
      "02",
    ]);
  });

  it("User edits a section with valid values and saves", async () => {
    const existing = await db.section.create(sectionBody());

    const response = await request(app)
      .put(`/course-t2/sections/${existing.id}`)
      .set(auth(adminToken))
      .send(
        sectionBody({
          sectionName: "02",
          endDate: "2026-12-20",
        })
      );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: existing.id,
      sectionName: "02",
      courseId: course.id,
      semesterId: semester.id,
      startDate: "2026-08-15",
      endDate: "2026-12-20",
    });

    const stored = await db.section.findByPk(existing.id);
    expect(stored.sectionName).toBe("02");
    expect(stored.endDate).toBe("2026-12-20");
  });

  it("User deletes a section", async () => {
    const existing = await db.section.create(sectionBody());

    const response = await request(app)
      .delete(`/course-t2/sections/${existing.id}`)
      .set(auth(adminToken));

    expect(response.status).toBe(200);
    expect(await db.section.findByPk(existing.id)).toBeNull();
  });

  it("Student can list sections via the API", async () => {
    await db.section.create(sectionBody());

    const response = await request(app)
      .get("/course-t2/sections")
      .set(auth(studentToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].sectionName).toBe("01");
  });

  it("Student cannot create a section via the API", async () => {
    const response = await request(app)
      .post("/course-t2/sections")
      .set(auth(studentToken))
      .send(sectionBody());

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Admin role required." });
    expect(await db.section.count()).toBe(0);
  });

  it("Unauthenticated API request to sections", async () => {
    const response = await request(app).get("/course-t2/sections");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/i);
  });
});
