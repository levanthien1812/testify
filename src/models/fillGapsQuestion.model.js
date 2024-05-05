import mongoose from "mongoose";

const fillGapsQuestionSchema = mongoose.Schema({
    text: {
        type: String,
        required: true,
        match: [
            /.*\*{3}.*/,
            "Text is not in correct format, must contain at least one ***",
        ],
    },
    question_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Question",
        select: false,
    },
    image: String,
    answer: {
        type: [String],
        required: true,
        select: false,
        _id: false,
    },
    explaination: {
        type: String,
    },
    __v: { type: Number, select: false },
});

export const FillGapsQuestion = mongoose.model(
    "FillGapsQuestion",
    fillGapsQuestionSchema
);