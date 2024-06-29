import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const PartSchema = mongoose.Schema(
    {
        order: {
            type: Number,
            min: 1,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            min: 0,
        },
        description: String,
        num_questions: {
            type: Number,
            min: 0,
            required: true,
        },
        test_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Test",
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

PartSchema.plugin(toJSON);

export const Part = mongoose.model("Part", PartSchema);
