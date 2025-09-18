import mongoose from "mongoose";
import config from "../config/config.js";
import { addUsersToGroups, seedUsers } from "./user.seed.js";
import { seedTests } from "./test.seed.js";
import { logger } from "../config/logger.js";

const seedData = async () => {
    try {
        await mongoose
            .connect(process.env.MONGODB_URL, config.mongo.options)
            .then(() => {
                console.log("Connected to MongoDB");
            });

        // const db = mongoose.connection;

        // logger.info("Dropping database");

        // await db.dropDatabase();

        // logger.info("Database dropped");
        // logger.info("Start seeding database");

        // await seedUsers();
        // await seedTests();

        // logger.info("Database seeded");

        await addUsersToGroups();

        // await db.close();
    } catch (error) {
        console.log(error);
    }
};

seedData();
