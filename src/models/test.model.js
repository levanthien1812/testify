import mongoose from "mongoose";
import { testLevels } from "../config/levels.js";

const testSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  test_date: {
    type: Date,
    required: true,
    validate(value) {
      if (new Date(value) < new Date()) {
        throw new Error("Test date must be after today");
      }
    },
  },
  max_score: {
    type: Number,
    default: 10,
    min: 0,
    required: true,
  },
  duration: {
    type: Number,
    min: 0,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  maker_id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "User",
  },
  level: {
    type: String,
    enum: Object.values(testLevels),
  },
  parts: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          min: 0,
        },
        description: String,
      },
    ],
  },
  code: {
    type: String,
  },
});

export const Test = mongoose.model("Test", testSchema);
