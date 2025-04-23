import mongoose from "mongoose";
import {
    PUBLIC_ANSWER_VISIBILITY_LEVEL,
    TEST_LEVEL,
} from "../config/constants/levels.js";
import { paginate } from "./plugins/paginate.js";
import { toJSON } from "./plugins/toJSON.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";
import { PassCode } from "./passcode.model.js";

const TestOption = new mongoose.Schema({
    allow_close_time: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            close_time: { type: Date, required: false },
        },
        required: true,
    },
    allow_view_submission_after_test: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
    },
    allow_multiple_submissions: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            maximum_submissions: { type: Number, required: false },
        },
        required: true,
    },
    allow_save_progress: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
    },
    allow_show_taker_answers_after_test: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            delay_time: { type: Number, required: false },
        },
        required: true,
    },
    allow_show_maker_answers_after_test: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            visibility_level: {
                type: String,
                enum: Object.values(PUBLIC_ANSWER_VISIBILITY_LEVEL),
                required: false,
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
        },
        required: true,
    },
    allow_shuffle_questions: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
    },
    allow_shuffle_answers: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
    },
    allow_review_before_submission: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
    },
    disallow_time_limit: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            duration: { type: Number, required: false }, // Time limit in minutes
        },
        required: true,
    },
});

const TestSchema = mongoose.Schema(
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
        status: {
            type: String,
            required: true,
            enum: Object.values(TEST_STATUS),
        },
        share_option: {
            type: String,
            enum: Object.values(SHARE_OPTION),
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
        includes_manually_scored_questions: {
            type: Boolean,
        },
        passcode: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "PassCode",
            required: false,
        },
        options: {
            type: TestOption,
            required: true,
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

TestSchema.plugin(toJSON);
TestOption.plugin(toJSON);

TestSchema.plugin(paginate);

export const Test = mongoose.model("Test", TestSchema);
