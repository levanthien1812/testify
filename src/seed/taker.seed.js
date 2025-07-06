import { ROLES } from "../config/constants/roles.js";
import { User } from "../models/user.model.js";
import takerService from "../services/taker.service.js";
import testService from "../services/test.service.js";
import { generateRandomUser } from "./user.seed.js";

export const seedTakersForMaker = async (makerId, count) => {
    const newTakers = await Promise.all(
        Array.from({ length: count }, async () => {
            const user = await User.create(generateRandomUser(ROLES.TAKER));
            const taker = await takerService.createTaker({
                name: user.name,
                user_id: user.id,
                maker_id: makerId,
            });

            return taker;
        })
    );
    return newTakers;
};
