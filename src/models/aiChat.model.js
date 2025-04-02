import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON";

const AIChatSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "User",
    },
    conversation: [
        {
            role: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                required: true,
            },
            _id: false,
        },
    ],
    chat_name: {
        type: String,
        required: true,
    },
});

AIChat.plugin(toJSON, { timestamps: true });

export const AIChat = mongoose.model("AIChat", AIChatSchema);
