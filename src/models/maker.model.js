import mongoose, { mongo } from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const MakerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
});

MakerSchema.virtual("user", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});

MakerSchema.pre(/^find/, function (next) {
    this.populate("user");
    next();
});

MakerSchema.plugin(toJSON);

export const Maker = mongoose.model("Maker", MakerSchema);
