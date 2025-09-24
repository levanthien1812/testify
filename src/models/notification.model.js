import mongoose, { Schema } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const NotificationSchema = new Schema(
    {
        recipients: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false, // Can be null for system notifications
        },
        type: {
            type: String,
            required: true,
            enum: [
                "test_assigned",
                "test_published",
                "submission_graded",
                "new_message",
                "user_blocked",
                "user_unblocked",
                "group_added",
                "group_removed",
                "other",
            ],
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

NotificationSchema.plugin(toJSON);

export const Notification = mongoose.model("Notification", NotificationSchema);
