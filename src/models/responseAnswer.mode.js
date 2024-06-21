import mongoose, { Schema, SchemaTypes } from "mongoose";

const ResponseAnswerSchema = Schema({
    answer_id: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    __v: { type: Number, select: false },
});

export const ResponseAnswer = mongoose.model(
    "ResponseAnswer",
    ResponseAnswerSchema
);
