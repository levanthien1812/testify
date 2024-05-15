import mongoose from "mongoose";
import { testLevels } from "../config/levels.js";
import { paginate } from "./plugins/paginate.js";
import { toJSON } from "./plugins/toJSON.js";

const PartType = {
    order: {
        type: Number,
        min: 1,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        min: 0,
    },
    description: String,
    num_questions: {
        type: Number,
        min: 0,
        required: true,
    },
};

const testSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    datetime: {
        type: Date,
        required: true,
        validate(value) {
            if (new Date(value) < new Date()) {
                throw new Error("Test date must be after today");
            }
        },
    },
    max_score: {
        type: Number,
        default: 10,
        min: 0,
        required: true,
    },
    duration: {
        type: Number,
        min: 0,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    maker_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "User",
    },
    level: {
        type: String,
        enum: Object.values(testLevels),
    },
    parts: {
        type: [PartType],
    },
    num_questions: {
        type: Number,
        min: 1,
        required: true,
    },
    code: {
        type: String,
    },
    is_finished: {
        type: Boolean,
        default: false,
    },
    taker_ids: {
        type: [mongoose.SchemaTypes.ObjectId],
    },
    __v: { type: Number, select: false },
});

testSchema.plugin(toJSON);
testSchema.plugin(paginate);

export const Test = mongoose.model("Test", testSchema);
