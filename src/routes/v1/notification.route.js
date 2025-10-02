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

router
    .route("/:id")
    .delete(
        auth(RIGHTS.DELETE_NOTIFICATION),
        notificationController.deleteNotification
    );

router
    .route("/:id/read")
    .patch(
        auth(RIGHTS.MARK_NOTIFICATION_AS_READ),
        notificationController.markNotificationAsRead
    );

export default router;
