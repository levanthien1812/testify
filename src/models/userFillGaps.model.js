import mongoose from "mongoose";

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

export const UserChoice = mongoose.model("UserChoice", userChoiceSchema);
