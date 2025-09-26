import mongoose, { Schema } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";
import { NOTIFICATION_TYPES } from "../config/constants/notification.js";

const NotificationSchema = new Schema(
    {
        recipient_ids: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false, // Can be null for system notifications
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(NOTIFICATION_TYPES),
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: false,
        },
        read_by: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        metadata: {
            type: Schema.Types.Mixed, // For storing additional flexible data
            required: false,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

NotificationSchema.virtual("sender", {
    ref: "User",
    localField: "sender_id",
    foreignField: "_id",
    justOne: true,
});

NotificationSchema.virtual("recipients", {
    ref: "User",
    localField: "recipient_ids",
    foreignField: "_id",
});

NotificationSchema.plugin(toJSON);

NotificationSchema.pre(/^find/, function (next) {
    this.populate({
        path: "sender",
        select: "name email photo",
    }).populate({
        path: "recipients",
        select: "name email photo",
    });
    next();
});

export const Notification = mongoose.model("Notification", NotificationSchema);
