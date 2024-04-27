import authRoute from "./auth.route.js";
import userRoute from "./user.route.js"
import express from "express";

const router = express.Router();

const routes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute
  }
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router
