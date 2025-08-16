import mongoose, { Schema, model } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";
import { Chat } from "./chat.model.js";
import {
    MESSAGE_TYPE,
    NOTIFICATION_TYPE,
} from "../config/constants/message.js";

const MessageSchema = new mongoose.Schema(
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
            type: String,
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
        is_read: {
            type: Schema.Types.Boolean,
            required: false,
        },
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
        type: {
            type: String,
            enum: Object.values(MESSAGE_TYPE),
            default: MESSAGE_TYPE.MESSAGE,
        },
        notification_type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPE),
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

MessageSchema.pre("save", async function (next) {
    if (this.isModified("read_by")) {
        try {
            const chat = await Chat.findById(this.chat_id);

            if (chat) {
                const membersToConsider = chat.members.filter(
                    (memberId) => !memberId.equals(this.sender_id)
                );

                const allMembersRead = membersToConsider.every((memberId) =>
                    this.read_by.some((readId) => readId.equals(memberId))
                );

                this.is_read = allMembersRead;
            } else {
                this.is_read = false; //if chat is not found, then the message cannot be read by all.
            }
            next();
        } catch (error) {
            console.error("Error in pre-save middleware:", error);
            next(error); // Pass the error to the next middleware
        }
    } else {
        next(); // If read_by is not modified, proceed without changes
    }
});

MessageSchema.virtual("sender", {
    ref: "User",
    localField: "sender_id",
    foreignField: "_id",
    justOne: true,
});

MessageSchema.virtual("reactions.user", {
    ref: "User",
    localField: "reactions.user_id",
    foreignField: "_id",
    justOne: true,
});

MessageSchema.pre(/^find/, function (next) {
    this.populate("sender", "name photo");
    this.populate({
        path: "reactions.user",
        select: "name photo",
    });
    next();
});

MessageSchema.plugin(toJSON, { timestamps: true });

export const Message = model("Message", MessageSchema);
