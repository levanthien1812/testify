import mongoose, { Schema } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const MessageAISchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        chat_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Chat",
        },
        role: {
            type: String,
            required: true,
        },
        reply_to: {
            type: Schema.Types.ObjectId,
            ref: "MessageAI",
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

MessageAISchema.plugin(toJSON, { timestamps: true });

export const MessageAI = mongoose.model("MessageAI", MessageAISchema);
