import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
    {
        taker_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
            required: true,
        },
        test_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Test",
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        correct_answers: {
            type: Number,
            required: true,
            default: 0,
        },
        wrong_answers: {
            type: Number,
            required: true,
            default: 0,
        },
        remark: {
            type: String,
            required: false,
        },
        start_time: {
            type: Date,
            required: true,
        },
        submit_time: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

export const Submission = mongoose.model("Submission", SubmissionSchema);
