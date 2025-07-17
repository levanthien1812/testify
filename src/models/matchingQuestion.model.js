import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const matchingQuestionSchema = mongoose.Schema({
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
    left_items: [
        {
            text: {
                type: String,
                required: true,
            },
        },
    ],
    right_items: [
        {
            text: {
                type: String,
                required: true,
            },
        },
    ],
    answer: {
        type: {
            matchings: {
                type: [
                    {
                        left: mongoose.SchemaTypes.ObjectId,
                        right: mongoose.SchemaTypes.ObjectId,
                    },
                ],
                _id: false,
            },
            explaination: {
                type: String,
            },
        },

        _id: false,
        select: false,
    },
    __v: { type: Number, select: false },
});

matchingQuestionSchema.plugin(toJSON);

export const MatchingQuestion = mongoose.model(
    "MatchingQuestion",
    matchingQuestionSchema
);
