import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const userChoiceSchema = mongoose.Schema({
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
    answers: {
        type: [String],
        required: true,
    },
});

userChoiceSchema.plugin(toJSON);

export const UserChoice = mongoose.model("UserChoice", userChoiceSchema);
