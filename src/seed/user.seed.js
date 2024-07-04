import { faker } from "@faker-js/faker";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { logger } from "../config/logger.js";

const createRandomUser = async ({ role }) => {
    if (role === "maker") {
        const defaultMaker = await User.findOne({
            email: "levanthienabc@gmail.com",
        });
        if (!defaultMaker)
            return {
                name: "Le Van Thien",
                email: "levanthienabc@gmail.com",
                username: "levanthienabc",
                password: "18122002abc",
                photo: faker.image.avatar(),
                role: "maker",
            };
        else
            return {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                username: faker.internet.userName(),
                password: "18122002abc",
                photo: faker.image.avatar(),
                role: role,
            };
    }
    if (role === "taker") {
        const defaultTaker = await User.findOne({
            email: "20521947@gm.uit.edu.vn",
        });
        if (!defaultTaker)
            return {
                name: "Thien Le",
                email: "20521947@gm.uit.edu.vn",
                username: "thienle123",
                password: "18122002abc",
                photo: faker.image.avatar(),
                role: "taker",
            };

        const maker = await User.aggregate([
            {
                $match: {
                    role: "maker",
                },
            },
            {
                $sample: {
                    size: 1,
                },
            },
        ]);

        return {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: "18122002abc",
            photo: faker.image.avatar(),
            maker_ids: [maker[0]._id],
            role: role,
        };
    }
};

export const seedUsers = async () => {
    logger.info("Seeding users...");

    const defaultMaker = await createRandomUser({ role: "maker" });
    const defaultTaker = await createRandomUser({ role: "taker" });

    await User.create(defaultMaker);
    await User.create(defaultTaker);

    await Promise.all(
        [...Array(3)].map(async () => {
            const maker = await createRandomUser({ role: "maker" });
            await User.create(maker);
        })
    );

    await Promise.all(
        [...Array(60)].map(async () => {
            const taker = await createRandomUser({ role: "taker" });
            await User.create(taker);
        })
    );

    logger.info("Seed users done");
};
