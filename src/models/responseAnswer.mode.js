import mongoose, { Schema, SchemaTypes } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const ResponseAnswerSchema = Schema({
    answer_id: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    answer: {
        type: {
            response: {
                type: String,
                _id: false,
            },
        },
        required: true,
        _id: false,
    },
    __v: { type: Number, select: false },
});

ResponseAnswerSchema.plugin(toJSON);

export const ResponseAnswer = mongoose.model(
    "ResponseAnswer",
    ResponseAnswerSchema
);
