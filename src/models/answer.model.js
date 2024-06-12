import mongoose from "mongoose";

const answerSchema = mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "User",
    },
    question_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Question",
    },
    date: {
        type: Date,
        default: new Date().toISOString(),
    },
    is_correct: {
        type: Boolean,
    },
    score: {
        type: Number,
        required: true,
        default: 0,
    },
});

export const Answer = mongoose.model("Answer", answerSchema);
