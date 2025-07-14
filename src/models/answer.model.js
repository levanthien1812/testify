import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const answerSchema = mongoose.Schema(
    {
        submission_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: "Submission",
        },
        question_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: "Question",
        },
        date: {
            type: Date,
            default: new Date().toISOString(),
        },
        is_correct: {
            type: Boolean,
        },
        score: {
            type: Number,
        },
        skipped: {
            type: Boolean,
            default: false,
        },
        evaluated: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

answerSchema.plugin(toJSON);

export const Answer = mongoose.model("Answer", answerSchema);
