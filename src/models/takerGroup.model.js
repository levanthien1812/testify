import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const TakerGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    maker_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
    takers: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
            required: true,
        },
    ],
});

TakerGroupSchema.plugin(toJSON);

const TakerGroup = mongoose.model("TakerGroup", TakerGroupSchema);

export default TakerGroup;
