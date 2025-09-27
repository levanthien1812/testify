import httpStatus from "http-status";
import notificationService from "../services/notification.service.js";
import catchAsync from "../utils/catchAsync.js";

const getNotifications = catchAsync(async (req, res) => {
    const notifications = await notificationService.getNotifications(
        req.user.id,
        req.query
    );
    return res.status(httpStatus.OK).send({ notifications: notifications });
});

export default { getNotifications };
