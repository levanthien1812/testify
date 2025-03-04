import { sendAt } from "cron";
import { Schema, model } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";
import { paginate } from "./plugins/paginate.js";

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
        removed_for: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        reply_to: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "Message",
        },
        reactions: [
            {
                user_id: Schema.Types.ObjectId,
                emoji: String,
                created_at: Date,
                _id: false,
            },
        ],
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

MessageSchema.plugin(toJSON, { timestamps: true });
MessageSchema.plugin(paginate);

export const Message = model("Message", MessageSchema);
