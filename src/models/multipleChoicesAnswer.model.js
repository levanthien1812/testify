import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const multipleChoicesAnswerSchema = mongoose.Schema({
    answer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Answer",
    },
    answer: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        _id: false,
    },
});

multipleChoicesAnswerSchema.plugin(toJSON);

export const MultipleChoicesAnswer = mongoose.model(
    "MultipleChoicesAnswer",
    multipleChoicesAnswerSchema
);
