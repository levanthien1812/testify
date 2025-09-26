import { Notification } from "../models/notification.model.js";

const createNotification = async (body) => {
    let notification = await Notification.create(body);
    notification = await notification.populate([
        { path: "sender", select: "name email photo" },
        { path: "recipients", select: "name email photo" },
    ]);
    return notification;
};

const getNotifications = async (userId) => {
    const notifications = await Notification.find({ recipient_ids: userId });
    return notifications;
};

export default {
    createNotification,
    getNotifications,
};
