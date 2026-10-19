/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth-session-management.md
 */
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server.js";
import db from "../app/models/index.js";
import { syncTestDatabase } from "./helpers.js";

const validRegistration = (overrides = {}) => ({
  fName: "Jane",
  lName: "Doe",
  email: "jane@example.com",
  username: "jdoe",
  password: "password123",
  role: "student",
  ...overrides,
});

beforeEach(async () => {
  await syncTestDatabase();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 1 — User Authentication & Session Management", () => {
  describe("US-1.1 — Registration", () => {
    it("User registers with valid information", async () => {
      const res = await request(app).post("/courses/register").send(validRegistration());

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          userId: expect.any(Number),
          username: "jdoe",
          email: "jane@example.com",
          token: expect.any(String),
          role: "student",
        })
      );
      expect(res.body).not.toHaveProperty("password");

      const stored = await db.user.unscoped().findByPk(res.body.userId);
      expect(stored.password).not.toBe("password123");
      expect(stored.password).toMatch(/^\$2[aby]\$10\$/);
      expect(await bcrypt.compare("password123", stored.password)).toBe(true);
    });

    it("User submits registration with missing email", async () => {
      const { email: _omitted, ...payload } = validRegistration();

      const res = await request(app).post("/courses/register").send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Email is required." });

      const whitespaceRes = await request(app)
        .post("/courses/register")
        .send(validRegistration({ email: "   " }));

      expect(whitespaceRes.status).toBe(400);
      expect(whitespaceRes.body).toEqual({ message: "Email is required." });
      expect(await db.user.count()).toBe(0);
    });

    it("User submits registration with password too short", async () => {
      const res = await request(app)
        .post("/courses/register")
        .send(validRegistration({ password: "short12" }));

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Password must be at least 8 characters." });
      expect(await db.user.count()).toBe(0);
    });

    it("User registers with a duplicate username", async () => {
      await request(app).post("/courses/register").send(validRegistration()).expect(201);

      const res = await request(app)
        .post("/courses/register")
        .send(validRegistration({ email: "other@example.com" }));

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Username is already taken." });

      const caseRes = await request(app)
        .post("/courses/register")
        .send(validRegistration({ username: "  JDOE  ", email: "third@example.com" }));

      expect(caseRes.status).toBe(400);
      expect(caseRes.body).toEqual({ message: "Username is already taken." });
      expect(await db.user.count()).toBe(1);
    });

    it("User registers with a duplicate email", async () => {
      await request(app).post("/courses/register").send(validRegistration()).expect(201);

      const res = await request(app)
        .post("/courses/register")
        .send(validRegistration({ username: "janedoe2" }));

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Email is already registered." });
      expect(await db.user.count()).toBe(1);
    });
  });
});
