import mongoose from "mongoose";

const matchingAnswerSchema = mongoose.Schema({
    answer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Answer",
    },
    answer: {
        type: [
            {
                left: mongoose.SchemaTypes.ObjectId,
                right: mongoose.SchemaTypes.ObjectId,
            },
        ],
        _id: false,
        required: true,
    },
});

export const MatchingAnswer = mongoose.model(
    "MatchingAnswer",
    matchingAnswerSchema
);
