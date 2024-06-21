import mongoose, { Schema } from "mongoose";

const ResponseQuestionSchema = Schema({
    question_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    minLength: {
        type: Number,
        required: false,
    },
    maxLength: {
        type: Number,
        required: false,
        default: 100000,
    },
    image: String,
    __v: { type: Number, select: false },
});

export const ResponseQuestion = mongoose.model(
    "ResponseQuestion",
    ResponseQuestionSchema
);
