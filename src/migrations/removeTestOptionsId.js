import dotenv from "dotenv";
import mongoose from "mongoose";
import { Test } from "../models/test.model.js";

dotenv.config();

const removeTestOptionsId = async () => {
    try {
        // First, check how many documents have options._id
        const docsWithId = await Test.countDocuments({
            "options._id": { $exists: true },
        });

        console.log(`Found ${docsWithId} documents with options._id`);

        if (docsWithId === 0) {
            console.log("✓ No documents need updating");
            return { modifiedCount: 0 };
        }

        // Use $unset with empty object to remove the field
        const result = await Test.updateMany(
            { "options._id": { $exists: true } },
            { $unset: { "options._id": "" } },
        );

        console.log(
            `✓ Migration completed: ${result.modifiedCount} documents updated`,
        );
        return result;
    } catch (error) {
        console.error("✗ Migration failed:", error);
        throw error;
    }
};

// Run migration if called directly
if (process.argv[1].includes("removeTestOptionsId")) {
    mongoose
        .connect(process.env.MONGODB_URL)
        .then(() => removeTestOptionsId())
        .then(() => {
            mongoose.disconnect();
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export default removeTestOptionsId;
