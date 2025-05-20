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
    },
    {
        timestamps: true,
    }
);

MessageAISchema.plugin(toJSON);

export const MessageAI = mongoose.model("MessageAI", MessageAISchema);
