import mongoose from "mongoose";
import { questionLevels } from "../config/levels";

const questionSchema = mongoose.Schema({
  order: {
    type: Number,
    min: 0,
    required: true,
  },
  test_id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "Test",
  },
  level: {
    type: String,
    enum: Object.values(questionLevels),
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    part_number: {
        type: Number
    }
});

export const Question = mongoose.model("Question", questionSchema);
