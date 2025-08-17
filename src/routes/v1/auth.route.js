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

router.post(
    "/send-verification-code",
    validate(authValidation.sendEmailVerification),
    authController.sendEmailVerification
);

router.post(
    "/verify-email",
    validate(authValidation.verifyEmail),
    authController.verifyEmail
);

router.post("/login", validate(authValidation.login), authController.login);

router.post(
    "/loginGoogle",
    validate(authValidation.loginGoogle),
    authController.loginGoogle
);

router.patch(
    "/reset-password",
    validate(authValidation.resetPassword),
    authController.resetPassword
);
router.patch(
    "/send-reset-password-email",
    validate(authValidation.sendResetPasswordEmail),
    authController.sendResetPasswordEmail
);
router.post("/refresh", authController.refresh);
router.post("/logout", auth(), authController.logout);

export default router;
