import mongoose from "mongoose";
import { PASSCODE_METHOD } from "../config/constants/passCode.js";
import { toJSON } from "./plugins/toJSON.js";

const PassCodeSchema = new mongoose.Schema({
    code: { type: String, required: true },
    valid_till: { type: Date, required: false },
    method: { type: Object.values(PASSCODE_METHOD), required: true },
    format: { type: String, required: false },
    test_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Test",
    },
});

PassCodeSchema.plugin(toJSON);

export const PassCode = mongoose.model("PassCode", PassCodeSchema);
