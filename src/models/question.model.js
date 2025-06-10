import mongoose from "mongoose";
import { QUESTION_LEVEL } from "../config/constants/levels.js";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { toJSON } from "./plugins/toJSON.js";

const questionSchema = mongoose.Schema(
    {
        order: {
            type: Number,
            min: 0,
            required: false,
        },
        test_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: false,
            ref: "Test",
        },
        level: {
            type: String,
            enum: Object.values(QUESTION_LEVEL),
        },
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        part_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Part",
            required: false,
        },
        type: {
            type: String,
            enum: Object.values(QUESTION_TYPE),
        },
        is_content_provided: {
            type: Boolean,
            default: false,
        },
        __v: { type: Number, select: false },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

questionSchema.plugin(toJSON);

export const Question = mongoose.model("Question", questionSchema);
