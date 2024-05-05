import express from "express";
import { auth } from "../../middlewares/auth.js";
import userController from "../../controllers/user.controller.js";

const router = express.Router();

router.route("/").get(auth("getUsers"), userController.getUsers);

router.route("/takers").post(auth("createTaker"), userController.createTaker);

export default router;
