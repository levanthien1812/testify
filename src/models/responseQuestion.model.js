import mongoose, { Schema } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const ResponseQuestionSchema = Schema({
    question_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    min_length: {
        type: Number,
        required: false,
    },
    max_length: {
        type: Number,
        required: false,
        default: 100000,
    },
    images: [String],
    __v: { type: Number, select: false },
});

ResponseQuestionSchema.plugin(toJSON);

export const ResponseQuestion = mongoose.model(
    "ResponseQuestion",
    ResponseQuestionSchema
);
