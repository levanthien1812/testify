import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const chatRequestSchema = mongoose.Schema(
    {
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

chatRequestSchema.virtual("sender", {
    ref: "User",
    localField: "sender_id",
    foreignField: "_id",
    justOne: true,
});

chatRequestSchema.virtual("receiver", {
    ref: "User",
    localField: "receiver_id",
    foreignField: "_id",
    justOne: true,
});

chatRequestSchema.plugin(toJSON, { timestamps: true });

export const ChatRequest = mongoose.model("ChatRequest", chatRequestSchema);
