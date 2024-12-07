import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const fillGapsAnswerSchema = mongoose.Schema({
    answer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Answer",
    },
    answer: {
        type: [String],
        required: true,
        _id: false,
    },
});

fillGapsAnswerSchema.plugin(toJSON);

export const FillGapsAnswer = mongoose.model(
    "FillGapsAnswer",
    fillGapsAnswerSchema
);
