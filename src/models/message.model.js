import { sendAt } from "cron";
import { Schema, model } from "mongoose";

const MessageSchema = Schema(
    {
        text: {
            type: String,
            required: true,
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
        image: {
            type: String,
            required: false,
        },
        readBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
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

export const Message = model("Message", MessageSchema);
