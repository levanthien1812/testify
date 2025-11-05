import httpStatus from "http-status";
import notificationService from "../services/notification.service.js";
import catchAsync from "../utils/catchAsync.js";

const getNotifications = catchAsync(async (req, res) => {
    const notifications = await notificationService.getNotifications(
        req.user.id,
        req.query
    );
    return res.status(httpStatus.OK).send({ notifications });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
    const notification = await notificationService.markNotificationAsRead(
        req.user.id,
        req.params.id
    );

    return res.status(httpStatus.OK).send({ notification });
});

const deleteNotification = catchAsync(async (req, res) => {
    await notificationService.deleteNotification(req.params.id);

    return res.status(httpStatus.OK).send({ deleted: true });
});

const markAllNotificationsAsRead = catchAsync(async (req, res) => {
    await notificationService.markAllNotificationsAsRead(req.user.id);

    return res.status(httpStatus.OK).send({ marked: true });
});

export default {
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
};
