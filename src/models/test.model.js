import mongoose from "mongoose";
import { TEST_LEVEL } from "../config/constants/levels.js";
import { paginate } from "./plugins/paginate.js";
import { toJSON } from "./plugins/toJSON.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";

const testSchema = mongoose.Schema(
    {
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
            enum: Object.values(TEST_LEVEL),
        },
        num_parts: {
            type: Number,
            min: 1,
            default: 1,
        },
        num_questions: {
            type: Number,
            min: 1,
            required: true,
        },
        code: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(TEST_STATUS),
        },
        enable_close_time: {
            type: Boolean,
            default: true,
        },
        close_time: {
            type: Date,
        },
        share_option: {
            type: String,
            enum: Object.values(SHARE_OPTION),
        },
        public_answers_option: {
            type: String,
            enum: Object.values(PUBLIC_ANSWER_OPTION),
            required: true,
        },
        public_answers_date: {
            type: Date,
            required: false,
        },
        // assigned by maker
        taker_ids: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
        joined_taker_ids: [
            { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
        ],
        are_answers_provided: {
            type: Boolean,
            default: false,
        },
        __v: { type: Number, select: false },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

testSchema.plugin(toJSON);
testSchema.plugin(paginate);

export const Test = mongoose.model("Test", testSchema);
