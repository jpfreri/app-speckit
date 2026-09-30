/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth-session-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Register from "../src/views/Register.vue";
import authServices from "../src/services/authServices.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: {
    registerUser: vi.fn(),
  },
}));

const validValues = {
  fName: "Jane",
  lName: "Doe",
  email: "jane@example.com",
  username: "jdoe",
  password: "password123",
  confirmPassword: "password123",
};

async function fillAndSubmit(overrides = {}) {
  const values = { ...validValues, ...overrides };
  const { wrapper } = await mountWithPlugins(Register);
  const [passwordInput, confirmInput] = wrapper.findAll('input[autocomplete="new-password"]');

  await wrapper.find('input[autocomplete="given-name"]').setValue(values.fName);
  await wrapper.find('input[autocomplete="family-name"]').setValue(values.lName);
  await wrapper.find('input[autocomplete="email"]').setValue(values.email);
  await wrapper.find('input[autocomplete="username"]').setValue(values.username);
  await passwordInput.setValue(values.password);
  await confirmInput.setValue(values.confirmPassword);

  await wrapper.find("form").trigger("submit");
  await flushPromises();

  return wrapper;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Feature 1 — User Authentication & Session Management", () => {
  describe("US-1.1 — Registration", () => {
    it("User submits registration with invalid email format", async () => {
      const wrapper = await fillAndSubmit({ email: "notanemail" });

      expect(wrapper.text()).toContain("Enter a valid email address.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits registration with missing username", async () => {
      const wrapper = await fillAndSubmit({ username: "   " });

      expect(wrapper.text()).toContain("Username is required.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits registration with password too short", async () => {
      const wrapper = await fillAndSubmit({ password: "short12", confirmPassword: "short12" });

      expect(wrapper.text()).toContain("Password must be at least 8 characters.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits registration with mismatched passwords", async () => {
      const wrapper = await fillAndSubmit({ confirmPassword: "different123" });

      expect(wrapper.text()).toContain("Passwords do not match.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });
  });
});
