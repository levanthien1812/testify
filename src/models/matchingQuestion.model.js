import mongoose from "mongoose";

const matchingQuestionSchema = mongoose.Schema({
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
        type: [
            {
                left: mongoose.SchemaTypes.ObjectId,
                right: mongoose.SchemaTypes.ObjectId,
            },
        ],
        _id: false,
        select: false,
    },
    explaination: {
        type: String,
    },
    __v: { type: Number, select: false },
});

export const MatchingQuestion = mongoose.model(
    "MatchingQuestion",
    matchingQuestionSchema
);
