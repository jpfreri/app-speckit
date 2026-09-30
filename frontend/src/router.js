import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/login.vue";
import Utils from "./config/utils.js";
import Register from "./views/Register.vue"
import Home from "./views/Home.vue";
import Semesters from "./views/Semesters.vue";

const publicRouteNames = new Set(["login", "registers"]);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/semesters",
      name: "semesters",
      component: Semesters,
    },
   
  ],
});


router.beforeEach((to, _from, next) => {
  const user = Utils.getStore("user");
  const isPublicRoute = publicRouteNames.has(to.name);

  if (!user && !isPublicRoute) {
    next({ name: "login" });
    return;
  }

  if (user && isPublicRoute) {
    next({ name: "home" });
    return;
  }

  next();
});

export default router;
