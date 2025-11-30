import mongoose from "mongoose";
import { toJSON } from "./plugins/toJSON.js";

const TakerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    maker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Maker",
        required: true,
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TakerGroup",
        required: false,
    },
});

TakerSchema.virtual("user", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});

TakerSchema.virtual("group", {
    ref: "TakerGroup",
    localField: "group_id",
    foreignField: "_id",
    justOne: true,
});

// TakerSchema.pre(/^find/, function (next) {
//     this.populate("user");
//     this.populate("group");
//     next();
// });

TakerSchema.plugin(toJSON);

export const Taker = mongoose.model("Taker", TakerSchema);
