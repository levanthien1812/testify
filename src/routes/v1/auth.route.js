import express from "express";
import authValidation from "../../validations/auth.validation.js";
import authController from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.js";

const router = express.Router();

router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);

router.post("/login", validate(authValidation.login), authController.login);

export default router;
