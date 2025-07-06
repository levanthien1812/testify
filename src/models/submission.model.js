import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const SubmissionSchema = new mongoose.Schema(
    {
        taker_id: {
            type: String,
            required: true,
        },
        test_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Test",
            required: true,
        },
        score: {
            type: Number,
        },
        correct_answers: {
            type: Number,
        },
        wrong_answers: {
            type: Number,
        },
        remark: {
            type: String,
        },
        start_time: {
            type: Date,
            required: true,
        },
        submit_time: {
            type: Date,
            required: true,
        },
        is_evaluated: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

SubmissionSchema.virtual("taker", {
    ref: "Taker",
    localField: "taker_id",
    foreignField: "_id",
    justOne: true,
});

SubmissionSchema.pre(/^find/, function (next) {
    this.populate("taker");
    next();
});

SubmissionSchema.plugin(toJSON);

export const Submission = mongoose.model("Submission", SubmissionSchema);
