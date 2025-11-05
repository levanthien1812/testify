import { MIN_NO_OF_NOTIFICATIONS } from "../config/constants/notification.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { getIO } from "../config/socket.js";
import { SOCKET_EVENTS } from "../config/constants/socket.js";
import httpStatus from "http-status";

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

const getNotification = async (receiverId, filter) => {
    const notification = await Notification.findOne({
        recipient_ids: receiverId,
        ...filter,
    });
    return notification;
};

const updateNotification = async (notificationId, notificationBody) => {
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        notificationBody,
        { new: true }
    );
    return notification;
};

const sendNotification = async (notification) => {
    const io = getIO();

    notification.recipient_ids.forEach((recipientId) => {
        io.to(recipientId.toString()).emit(
            SOCKET_EVENTS.RECEIVE_NOTIFICATION,
            notification
        );
    });
};

const markAllNotificationsAsRead = async (userId) => {
    await Notification.updateMany(
        { recipient_ids: userId },
        { $addToSet: { read_by: userId } }
    );
};

export default {
    createNotification,
    getNotification,
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    deleteNotification,
    updateNotification,
    sendNotification,
    markAllNotificationsAsRead,
};
