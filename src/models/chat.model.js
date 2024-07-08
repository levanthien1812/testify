import mongoose, { Mongoose } from "mongoose";

const ChatModel = mongoose.Schema(
    {
        members: [
            {
                member: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                nick_name: {
                    type: String,
                    trim: true,
                },
            },
        ],
        is_group_chat: {
            type: Boolean,
            default: false,
        },
        group_admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        chat_name: {
            type: String,
            trim: true,
        },
        appearances: {
            background_color: {
                type: String,
                default: "#ffffff",
            },
            messages_color: {
                type: String,
                default: "#000000",
            },
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

export const Chat = mongoose.model("Chat", ChatModel);
