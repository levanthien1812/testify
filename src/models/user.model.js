import mongoose from "mongoose";
import { roles } from "../config/roles.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import { toJSON } from "./plugins/toJSON.js";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: false,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email");
                }
            },
        },
        password: {
            type: String,
            required: false,
            trim: true,
            minLength: 8,
            validate(value) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error(
                        "Password must contain at least one letter and one number"
                    );
                }
            },
            private: true,
        },
        role: {
            type: String,
            enum: roles,
            default: "maker",
        },
        maker_ids: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "User",
            },
        ],
        photo: {
            type: String,
            default: "",
        },
    },
    {
        timestamp: true,
    }
);

userSchema.plugin(toJSON);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

export const User = mongoose.model("User", userSchema);
