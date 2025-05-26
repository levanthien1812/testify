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
        timestamps: true,
    }
);

MessageAISchema.plugin(toJSON);

export const MessageAI = mongoose.model("MessageAI", MessageAISchema);
