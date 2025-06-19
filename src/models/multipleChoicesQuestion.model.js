import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

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
    allow_multiple: { type: Boolean, default: false },
    options: [
        {
            type: ChoiceType,
            required: true,
            _id: false,
        },
    ],
    answer: {
        type: {
            options: {
                type: [mongoose.SchemaTypes.ObjectId],
                _id: false,
            },
            explaination: {
                type: String,
            },
        },
        // required: true,
        select: false,
        _id: false,
    },
    __v: { type: Number, select: false },
});

multipleChoiceQuestionSchema.plugin(toJSON);

export const MultipleChoiceQuestion = mongoose.model(
    "MultipleChoiceQuestion",
    multipleChoiceQuestionSchema
);
