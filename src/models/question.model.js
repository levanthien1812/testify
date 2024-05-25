import mongoose from "mongoose";
import { questionLevels } from "../config/levels.js";
import { questionTypes } from "../config/questionTypes.js";
import { toJSON } from "./plugins/toJSON.js";

const questionSchema = mongoose.Schema({
    order: {
        type: Number,
        min: 0,
        required: true,
    },
    test_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Test",
    },
    level: {
        type: String,
        enum: Object.values(questionLevels),
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    part: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Part",
        required: false,
    },
    type: {
        type: String,
        enum: Object.values(questionTypes),
    },
    __v: { type: Number, select: false },
});

questionSchema.plugin(toJSON);

export const Question = mongoose.model("Question", questionSchema);
