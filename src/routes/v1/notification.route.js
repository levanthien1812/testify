import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { RIGHTS } from "../../config/constants/roles.js";
import notificationController from "../../controllers/notification.controller.js";

const router = Router();

router
    .route("/")
    .get(
        auth(RIGHTS.GET_NOTIFICATIONS),
        notificationController.getNotifications
    );

export default router;
