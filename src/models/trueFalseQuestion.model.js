import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const TrueFalseQuestionSchema = new mongoose.Schema({
    instruction_text: {
        type: String,
        required: false,
    },
    text: {
        type: String,
        required: true,
    },
    question_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Question",
        select: false,
    },
    answer: {
        type: {
            is_true: {
                type: Boolean,
                required: true,
            },
            explaination: {
                type: String,
            },
        },
        select: false,
        _id: false,
    },
    __v: { type: Number, select: false },
});

TrueFalseQuestionSchema.plugin(toJSON);

export const TrueFalseQuestion = mongoose.model(
    "TrueFalseQuestion",
    TrueFalseQuestionSchema
);
