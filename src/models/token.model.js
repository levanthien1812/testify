import mongoose from "mongoose";
import TOKEN_TYPE from "../config/constants/tokens.js";

const tokenSchema = mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
            required: true,
        },
        expires: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            enum: [
                TOKEN_TYPE.REFRESH,
                TOKEN_TYPE.RESET_PASSWORD,
                TOKEN_TYPE.VERIFY_EMAIL,
            ],
            required: true,
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamp: true,
    }
);

export const Token = mongoose.model("Token", tokenSchema);
