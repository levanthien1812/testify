import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";
import { FILL_GAP_INDICATOR } from "../config/constants/constants.js";

const fillGapsQuestionSchema = mongoose.Schema({
    text: {
        type: String,
        required: true,
        match: [
            /.*\_{3}.*/,
            `Text is not in correct format, must contain at least one ${FILL_GAP_INDICATOR} representing a gap`,
        ],
    },
    question_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Question",
        select: false,
    },
    image: String,
    num_gaps: {
        type: Number,
        min: 1,
        required: true,
    },
    answer: {
        type: {
            gaps: {
                type: [String],
                _id: false,
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

fillGapsQuestionSchema.plugin(toJSON);

export const FillGapsQuestion = mongoose.model(
    "FillGapsQuestion",
    fillGapsQuestionSchema
);
