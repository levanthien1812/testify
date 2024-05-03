import mongoose from "mongoose";

export const ChoiceType = {
    text: { type: String, required: true },
    image: String,
};

const multipleChoiceQuestionSchema = mongoose.Schema({
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
    image: String,
    allow_multiple: { type: Boolean, default: false },
    options: [
        {
            type: ChoiceType,
            required: true,
        },
    ],
    anwser: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        select: false,
    },
    __v: { type: Number, select: false },
});

export const MultipleChoiceQuestion = mongoose.model(
    "MultipleChoiceQuestion",
    multipleChoiceQuestionSchema
);
