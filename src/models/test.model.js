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
import {
    PAGINATION_MODE,
    QUESTION_NUMBERING_METHOD,
    RECORDING_MODE,
} from "../config/constants/test.js";
import { ApiError } from "../utils/apiError.js";

const TestOption = new mongoose.Schema({
    allow_close_time: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            close_time: { type: Date, required: false },
        },
        required: true,
        _id: false,
    },
    allow_view_submission_after_test: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
        _id: false,
    },
    allow_multiple_submissions: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            maximum_submissions: { type: Number, required: false },
        },
        required: true,
        _id: false,
    },
    allow_save_progress: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
        _id: false,
    },
    allow_show_taker_answers_after_test: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            delay_time: { type: Number, required: false },
        },
        required: true,
        _id: false,
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
        _id: false,
    },
    allow_shuffle_questions: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
        _id: false,
    },
    allow_shuffle_answers: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
        _id: false,
    },
    allow_review_before_submission: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
        },
        required: true,
        _id: false,
    },
    disallow_time_limit: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            duration: { type: Number, required: false }, // Time limit in minutes
        },
        required: true,
        _id: false,
    },
    pagination_mode: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            mode: {
                type: String,
                enum: Object.values(PAGINATION_MODE),
                default: PAGINATION_MODE.ALL,
            },
            allow_back_navigation: {
                type: Boolean,
                required: false,
                default: false,
            },
            require_completion_before_next: {
                type: Boolean,
                required: false,
                default: false,
            },
            questions_per_page: {
                type: Number,
                required: false,
                default: 10,
            },
        },
        required: true,
        _id: false,
    },
    require_screen_recorder: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            record_mode: {
                type: String,
                enum: Object.values(RECORDING_MODE),
                required: false,
            },
            interval_in_seconds: {
                type: Number,
                required: false,
                default: 10,
            },
            include_audio: { type: Boolean, required: false, default: false },
        },
        required: true,
        _id: false,
    },
    require_camera_on: {
        type: {
            enable: { type: Boolean, required: true },
            let_taker_know: { type: Boolean, required: true },
            record_mode: {
                type: String,
                enum: Object.values(RECORDING_MODE),
                required: false,
            },
            interval_in_seconds: {
                type: Number,
                required: false,
                default: 10,
            },
            include_audio: { type: Boolean, required: false, default: false },
        },
        required: true,
        _id: false,
    },
});

const TestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        datetime: {
            type: Date,
            required: true,
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
            ref: "Maker",
        },
        level: {
            type: String,
            enum: Object.values(TEST_LEVEL),
        },
        num_parts: {
            type: Number,
            min: 0,
            default: 0,
            required: true,
            validate(value) {
                if (value === 1) {
                    throw new ApiError(
                        httpStatus.BAD_REQUEST,

                        "Test must have at least 2 parts or no part"
                    );
                }
            },
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
        question_numbering_method: {
            type: String,
            enum: Object.values(QUESTION_NUMBERING_METHOD),
            default: QUESTION_NUMBERING_METHOD.CONTINUOUS,
        },
        // assigned by maker
        taker_ids: [String],
        joined_taker_ids: [
            { type: mongoose.SchemaTypes.ObjectId, ref: "Taker" },
        ],
        are_answers_provided: {
            type: Boolean,
            default: false,
        },
        includes_manually_scored_questions: {
            type: Boolean,
        },
        passcode_id: {
            type: String,
            ref: "PassCode",
            required: false,
        },
        options: {
            type: TestOption,
            required: true,
        },
        notify_assignment: {
            type: Boolean,
            default: false,
        },
        __v: { type: Number, select: false },
        accessed_by: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Taker" }],
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

TestSchema.virtual("takers", {
    ref: "Taker",
    localField: "taker_ids",
    foreignField: "_id",
    justOne: false,
});

TestSchema.virtual("passcode", {
    ref: "PassCode",
    localField: "passcode_id",
    foreignField: "_id",
    justOne: true,
});

TestSchema.pre(/^find/, async function (next) {
    this.populate({
        path: "takers",
        select: "name user_id user",
        populate: {
            path: "user",
            select: "name email photo",
        },
    }).populate("passcode");

    next();
});

TestSchema.plugin(toJSON);
TestOption.plugin(toJSON);

TestSchema.plugin(paginate);

export const Test = mongoose.model("Test", TestSchema);
