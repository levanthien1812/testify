import mongoose from "mongoose";
import { TEST_LEVEL } from "../config/constants/levels.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { QUESTION_NUMBERING_METHOD } from "../config/constants/test.js";
import { paginate } from "./plugins/paginate.js";
import { toJSON } from "./plugins/toJSON.js";
import { TestOption } from "./test.model.js";

const TestTemplatePart = new mongoose.Schema(
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
        num_questions: {
            type: Number,
            min: 0,
            required: true,
        },
        order: {
            type: Number,
            min: 1,
            required: true,
        },
    },
    { _id: false },
);

const TestTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        datetime: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        max_score: {
            type: Number,
            required: true,
            min: 0,
        },
        num_questions: {
            type: Number,
            required: true,
            min: 0,
        },
        num_parts: {
            type: Number,
            required: true,
            min: 0,
        },
        level: {
            type: String,
            enum: Object.values(TEST_LEVEL),
            required: true,
        },
        share_option: {
            type: String,
            enum: Object.values(SHARE_OPTION),
            required: false,
        },
        options: {
            type: TestOption,
            required: true,
        },
        question_numbering_method: {
            type: String,
            enum: Object.values(QUESTION_NUMBERING_METHOD),
            required: false,
        },
        parts: [TestTemplatePart],
        maker_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: "Maker",
        },
    },
    { timestamps: true },
);

// Add plugins
TestTemplateSchema.plugin(toJSON);
TestTemplateSchema.plugin(paginate);

const TestTemplate = mongoose.model("TestTemplate", TestTemplateSchema);

export default TestTemplate;
