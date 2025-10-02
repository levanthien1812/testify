import { MIN_NO_OF_NOTIFICATIONS } from "../config/constants/notification.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";

const createNotification = async (body) => {
    let notification = await Notification.create(body);
    notification = await notification.populate([
        { path: "sender", select: "name email photo" },
        { path: "recipients", select: "name email photo" },
    ]);
    return notification;
};

const getNotifications = async (userId, query) => {
    const filter = {
        recipient_ids: userId,
    };
    if (query.status === "unread") {
        filter.read_by = { $ne: userId };
    } else if (query.status === "read") {
        filter.read_by = userId;
    }
    if (query.oldestNotificationId) {
        filter._id = { $lt: query.oldestNotificationId };
    }

    const notifications = await Notification.find(filter)
        .sort({ created_at: -1 })
        .limit(query.limit || MIN_NO_OF_NOTIFICATIONS);
    return notifications;
};

const getUnreadNotificationsCount = async (userId) => {
    const count = await Notification.countDocuments({
        recipient_ids: userId,
        read_by: { $ne: userId },
    });
    return count;
};

const markNotificationAsRead = async (userId, notificationId) => {
    const existingNotification = await Notification.findById(notificationId);
    if (!existingNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }

    if (!existingNotification.recipient_ids.includes(userId)) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You are not authorized to perform this action"
        );
    }

    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { $addToSet: { read_by: userId } },
        { new: true }
    );

    return notification;
};

const deleteNotification = async (notificationId) => {
    const notification = await Notification.findByIdAndDelete(notificationId);
    return notification;
};

export default {
    createNotification,
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    deleteNotification,
};
