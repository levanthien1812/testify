import mongoose from "mongoose";

const fillGapsAnswerSchema = mongoose.Schema({
    answer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Answer",
    },
    answer: {
        type: [String],
        required: true,
        _id: false
    },
});

export const FillGapsAnswer = mongoose.model(
    "FillGapsAnswer",
    fillGapsAnswerSchema
);
