import mongoose, { Schema, SchemaTypes } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const ChatAISchema = new Schema(
    {
        chat_name: {
            type: String,
            trim: true,
        },
        user_id: {
            type: SchemaTypes.ObjectId,
            ref: "User",
            trim: true,
        },
        is_pinned: {
            type: Boolean,
            default: false,
        },
        is_archived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

ChatAISchema.plugin(toJSON);

export const ChatAI = mongoose.model("ChatAI", ChatAISchema);
