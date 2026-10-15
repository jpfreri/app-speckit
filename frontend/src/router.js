import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Sections from "./views/Sections.vue";
import Utils from "./config/utils.js";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "registers",
      component: Register,
    },
    {
      path: "/sections",
      name: "sections",
      component: Sections,
      beforeEnter: (to, from, next) => {
        if (!Utils.getStore("user")) {
          next({ name: "login" });
        } else {
          next();
        }
      },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "home" },
    },
  ],
});

export default router;
