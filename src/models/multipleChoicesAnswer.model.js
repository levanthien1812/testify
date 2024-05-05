import mongoose from "mongoose";

const multipleChoicesAnswerSchema = mongoose.Schema({
    answer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Answer",
    },
    answer: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        _id: false
    },
});

export const MultipleChoicesAnswer = mongoose.model(
    "MultipleChoicesAnswer",
    multipleChoicesAnswerSchema
);
