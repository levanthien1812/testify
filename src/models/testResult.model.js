import mongoose from "mongoose";

const TestResultSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now,
    },
});

export const TestResult = mongoose.model("TestResult", TestResultSchema);
