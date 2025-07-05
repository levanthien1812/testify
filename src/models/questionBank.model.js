import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const QuestionBankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    maker_id: {
        type: String,
        required: true,
        ref: "Maker",
    },
    description: {
        type: String,
    },
    question_ids: [
        {
            type: String,
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

QuestionBankSchema.virtual("questions", {
    ref: "Question",
    localField: "question_ids",
    foreignField: "_id",
    justOne: false,
});

QuestionBankSchema.pre(/^find/, function (next) {
    this.populate("questions");
    next();
});

QuestionBankSchema.plugin(toJSON, { timestamps: true });

const QuestionBank = mongoose.model("QuestionBank", QuestionBankSchema);

export default QuestionBank;
