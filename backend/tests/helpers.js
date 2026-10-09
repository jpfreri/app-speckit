import request from "supertest";
import db from "../app/models/index.js";

/** Sync schema for tests (no models registered in the starter shell). */
export const syncTestDatabase = async () => {
  await db.sequelize.sync({ force: true });
};

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const registerAdmin = async (app, overrides = {}) => {
  const response = await request(app).post("/courses/register").send({
    fName: "Alex",
    lName: "Admin",
    email: "admin@example.com",
    username: "adminuser",
    password: "password123",
    role: "admin",
    ...overrides,
  });

  return {
    token: response.body.token,
    userId: response.body.userId,
    response,
  };
};

export const registerUser = async (app, overrides = {}) => {
  const response = await request(app).post("/courses/register").send({
    fName: "Jane",
    lName: "Doe",
    email: "student1@example.com",
    username: "student1",
    password: "password123",
    role: "student",
    ...overrides,
  });

  return {
    token: response.body.token,
    userId: response.body.userId,
    response,
  };
};

export const validSemester = (overrides = {}) => ({
  semesterName: "2026 Fall",
  startDate: "2026-08-15",
  endDate: "2026-12-15",
  ...overrides,
});

export const createSemester = async (app, token, overrides = {}) => {
  return request(app)
    .post("/courses/semesters")
    .set(authHeader(token))
    .send(validSemester(overrides));
};

export const validCourse = (overrides = {}) => ({
  courseName: "CMSC-1234",
  semesterId: 1,
  ...overrides,
});

export const createCourse = async (app, token, overrides = {}) => {
  return request(app)
    .post("/courses/courses")
    .set(authHeader(token))
    .send(validCourse(overrides));
};
