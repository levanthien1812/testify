import express from "express";
import authValidation from "../../validations/auth.validation.js";
import authController from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

router.post(
    "/register",
    validate(authValidation.register),
    authController.register
);

router.post("/login", validate(authValidation.login), authController.login);
router.post("/refresh",authController.refresh);

export default router;
