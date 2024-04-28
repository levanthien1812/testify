import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  question_id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "Question",
  },
  image: String,
  allow_multiple: Boolean,
});

export const Question = mongoose.model("Question", questionSchema);
