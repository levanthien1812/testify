import { faker } from "@faker-js/faker";
import TakerGroup from "../models/takerGroup.model.js";
import { Taker } from "../models/taker.model.js";

export const createRandomGroup = async (makerId) => {
    const randomTakers = await Taker.aggregate([
        { $match: { maker_id: makerId } },
        {
            $sample: {
                size: faker.number.int({ min: 5, max: 20 }),
            },
        },
    ]);

    return {
        maker_id: makerId,
        name: faker.lorem.words({ min: 2, max: 10 }),
        description: faker.lorem.paragraph({ min: 2, max: 4 }),
        takers: randomTakers.map((taker) => taker._id),
    };
};

export const seedGroupsForMaker = async (makerId, numGroups) => {
    const groups = await Promise.all(
        Array(numGroups)
            .fill(0)
            .map(async () => await createRandomGroup(makerId))
    );

    const createdGroups = await TakerGroup.insertMany(groups);
    await Promise.all(
        createdGroups.map(async (group) => {
            await Promise.all(
                group.takers.map(async (takerId) => {
                    await Taker.findByIdAndUpdate(takerId, {
                        group_id: group._id,
                    });
                })
            );
        })
    );
};
