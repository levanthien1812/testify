import { MIN_NO_OF_NOTIFICATIONS } from "../config/constants/notification.js";
import { Notification } from "../models/notification.model.js";

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

export default {
    createNotification,
    getNotifications,
    getUnreadNotificationsCount,
};
