import mongoose from "mongoose";
import {
    PASSCODE_METHOD,
    PASSCODE_VALID_UNIT,
} from "../config/constants/passCode.js";
import { toJSON } from "./plugins/toJSON.js";

const PassCodeSchema = new mongoose.Schema({
    code: { type: String, required: true },
    valid_till: { type: Date, required: true },
    valid_unit: {
        type: String,
        required: true,
        enum: Object.values(PASSCODE_VALID_UNIT),
    },
    valid_in: { type: Number, required: true },
    method: {
        type: String,
        enum: Object.values(PASSCODE_METHOD),
        required: true,
    },
    format: { type: String, required: false },
    test_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Test",
    },
});

PassCodeSchema.plugin(toJSON);

export const PassCode = mongoose.model("PassCode", PassCodeSchema);
