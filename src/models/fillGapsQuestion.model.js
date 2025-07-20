import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";
import {
    FILL_GAP_INDICATOR,
    FILL_GAPS_METHOD,
} from "../config/constants/constants.js";

const fillGapsQuestionSchema = new mongoose.Schema({
    instruction_text: {
        type: String,
        required: false,
    },
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
                type: [
                    {
                        id: String,
                        text: String,
                    },
                ],
                _id: false,
            },
            explaination: {
                type: String,
            },
        },
        select: false,
        _id: false,
    },
    json_text: {
        type: String,
        required: true,
    },
    fill_method: {
        type: String,
        required: true,
        enum: Object.values(FILL_GAPS_METHOD),
    },
    given_words: {
        type: [
            {
                text: {
                    type: String,
                    required: true,
                },
                _id: false,
            },
        ],
        validate(value) {
            if (
                this.fill_method === FILL_GAPS_METHOD.DRAG_DROP &&
                value.length < this.num_gaps
            ) {
                throw new Error(
                    `Please provide at least ${this.num_gaps} words`
                );
            }
        },
    },
    __v: { type: Number, select: false },
});

fillGapsQuestionSchema.plugin(toJSON);

export const FillGapsQuestion = mongoose.model(
    "FillGapsQuestion",
    fillGapsQuestionSchema
);
