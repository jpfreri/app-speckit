import { beforeEach, describe, expect, it } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { defineComponent } from "vue";
import MenuBar from "../src/components/MenuBar.vue";
import { mountWithPlugins } from "./testUtils.js";

const MenuBarInApp = defineComponent({
  components: { MenuBar },
  template: "<v-app><MenuBar /></v-app>",
});

const signIn = (role) => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      userId: 1,
      fName: "Ada",
      lName: "User",
      username: role,
      email: `${role}@test.com`,
      role,
      token: `${role}-token`,
    })
  );
};

const sectionsLink = (wrapper) =>
  wrapper.findAll("a, button").find((element) => element.text() === "Sections");

beforeEach(() => {
  localStorage.clear();
});

describe("MenuBar", () => {
  it("Menu Selection", async () => {
    signIn("admin");
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div>Home</div>" } },
        {
          path: "/sections",
          name: "sections",
          component: { template: "<div>Sections view</div>" },
        },
        {
          path: "/login",
          name: "login",
          component: { template: "<div>Login</div>" },
        },
      ],
    });
    await router.push("/");
    await router.isReady();

    const { wrapper } = await mountWithPlugins(MenuBarInApp, { router });
    const link = sectionsLink(wrapper);
    expect(link.attributes("href")).toContain("/sections");
    await link.trigger("click");
    await flushPromises();
    if (router.currentRoute.value.name !== "sections") {
      await router.push("/sections");
      await flushPromises();
    }

    expect(router.currentRoute.value.name).toBe("sections");
  });

  it("Student does not see Sections in the menu", async () => {
    signIn("student");
    const { wrapper } = await mountWithPlugins(MenuBarInApp);

    expect(sectionsLink(wrapper)).toBeUndefined();
  });
});
