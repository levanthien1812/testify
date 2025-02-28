import { sendAt } from "cron";
import { Schema, model } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const MessageSchema = Schema(
    {
        text: {
            type: String,
            validate: {
                validator: function (value) {
                    if (this.images.length === 0) {
                        return value.trim().length > 0;
                    }
                    return true;
                },
                message: "Text is required when no images are uploaded.",
            },
        },
        chat_id: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        images: [
            {
                type: String,
                required: false,
            },
        ],
        read_by: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        deleted: {
            type: Schema.Types.Boolean,
            required: false,
        },
        reply_to: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "Message",
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

MessageSchema.plugin(toJSON, { timestamps: true });

export const Message = model("Message", MessageSchema);
