import mongoose from "mongoose";
import { ChoiceType } from "./mulitpleChoicesQuestion.model.js";

const userChoiceSchema = mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User'
    },
    question_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'MultipleChoiceQuestion'
    },
    choice: [{
        type: ChoiceType,
        required: true
    }],
    date: {
        type: Date,
        default: new Date().toISOString()
    }
});

export const UserChoice = mongoose.model("UserChoice", userChoiceSchema);
