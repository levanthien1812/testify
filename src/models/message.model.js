import { sendAt } from "cron";
import { Schema, model } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

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
        read_by: [
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

MessageSchema.plugin(toJSON, { timestamps: true });

export const Message = model("Message", MessageSchema);
