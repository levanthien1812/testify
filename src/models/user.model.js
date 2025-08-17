import mongoose from "mongoose";
import { ROLES } from "../config/constants/roles.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import { toJSON } from "./plugins/toJSON.js";

const userSchema = mongoose.Schema(
    {
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
            enum: ROLES,
            default: ROLES.MAKER,
        },
        photo: {
            type: String,
            default: "",
        },
        blocked_users: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "User",
            },
        ],
        blocked_by: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "User",
            },
        ],
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        birthday: {
            type: Date,
        },
        phone_number: {
            type: String,
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
        verification_code: {
            type: String,
        },
        verification_code_expires: {
            type: Date,
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

userSchema.pre("findOneAndUpdate", async function (next) {
    const user = this;
    if (user.getUpdate().password) {
        user.getUpdate().password = await bcrypt.hash(
            user.getUpdate().password,
            8
        );
    }
    next();
});

export const User = mongoose.model("User", userSchema);
