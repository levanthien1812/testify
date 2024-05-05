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
        ref: "MultipleChoiceQuestion",
    },
    date: {
        type: Date,
        default: new Date().toISOString(),
    },
    is_correct: {
        type: Boolean,
    },
});

export const Answer = mongoose.model("Answer", answerSchema);
