import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const TrueFalseAnswerSchema = mongoose.Schema({
    answer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Answer",
    },
    answer: {
        type: {
            is_true: {
                type: Boolean,
                required: true,
            },
        },
        required: true,
        _id: false,
    },
    __v: { type: Number, select: false },
});

TrueFalseAnswerSchema.plugin(toJSON);

export const TrueFalseAnswer = mongoose.model(
    "TrueFalseAnswer",
    TrueFalseAnswerSchema
);
