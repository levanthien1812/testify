import { faker } from "@faker-js/faker";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { logger } from "../config/logger.js";
import { ROLES } from "../config/constants/roles.js";
import userService from "../services/user.service.js";
import makerService from "../services/maker.service.js";
import { seedTakersForMaker } from "./taker.seed.js";
import { seedGroupsForMaker } from "./group.seed.js";

export const generateRandomUser = (role) => {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "18122002abc",
        photo: faker.image.avatar(),
        role: role,
        birthday: faker.date.birthdate(),
        phone_number: faker.phone.number(),
        gender: faker.helpers.arrayElement(["male", "female"]),
    };
};

export const seedUsers = async () => {
    logger.info("Seeding users...");

    await Promise.all(
        [...Array(3)].map(async () => {
            const randomMakerUser = generateRandomUser(ROLES.MAKER);
            const makerUser = await User.create(randomMakerUser);

            const maker = await makerService.createMaker({
                user_id: makerUser.id,
                name: makerUser.name,
            });

            await seedTakersForMaker(
                maker.id,
                faker.number.int({ min: 5, max: 40 })
            );
            await seedGroupsForMaker(
                maker.id,
                faker.number.int({ min: 5, max: 40 })
            );
        })
    );

    logger.info("Seed users done");
};
