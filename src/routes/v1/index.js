import authRoute from "./auth.route.js";
import express from "express";

const router = express.Router();

const routes = [
  {
    path: "/auth",
    route: authRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router
