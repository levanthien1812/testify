import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const matchingAnswerSchema = mongoose.Schema({
    answer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Answer",
    },
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
        },
        _id: false,
        required: true,
    },
});

matchingAnswerSchema.plugin(toJSON);

export const MatchingAnswer = mongoose.model(
    "MatchingAnswer",
    matchingAnswerSchema
);
