import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const QuestionBankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
        ref: "User",
    },
    description: {
        type: String,
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        },
    ],
    tags: [
        {
            type: String,
        },
    ],
    is_bookmarked: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

QuestionBankSchema.plugin(toJSON, { timestamps: true });

const QuestionBank = mongoose.model("QuestionBank", QuestionBankSchema);

export default QuestionBank;
