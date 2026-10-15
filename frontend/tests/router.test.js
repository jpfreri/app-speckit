import { beforeEach, describe, expect, it } from "vitest";
import router from "../src/router.js";

beforeEach(async () => {
  localStorage.clear();
  await router.push("/");
  await router.isReady();
});

describe("router", () => {
  it("Unauthenticated user navigates to sections", async () => {
    await router.push("/sections");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe("login");
  });
});
