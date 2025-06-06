import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const TrueFalseQuestionSchema = new mongoose.Schema({
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
        _id: false,
    },
    __v: { type: Number, select: false },
});

TrueFalseQuestionSchema.plugin(toJSON);

export const TrueFalseQuestion = mongoose.model(
    "TrueFalseQuestion",
    TrueFalseQuestionSchema
);
