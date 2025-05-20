import mongoose, { Schema, SchemaTypes } from "mongoose";

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
    },
    {
        timestamps: true,
    }
);

export const ChatAI = mongoose.model("ChatAI", ChatAISchema);
