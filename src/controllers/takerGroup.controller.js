import makerService from "../services/maker.service.js";
import takerService from "../services/taker.service.js";
import takerGroupService from "../services/takerGroup.service.js";
import catchAsync from "../utils/catchAsync.js";
import httpStatus from "http-status";

const createTakerGroup = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const body = {
        ...req.body,
        maker_id: maker.id,
    };

    const newGroup = await takerGroupService.createTakerGroup(body);

    return res.status(httpStatus.CREATED).send({ taker_group: newGroup });
});

const updateTakerGroup = catchAsync(async (req, res, next) => {});

const deleteTakerGroup = catchAsync(async (req, res, next) => {});

const getTakerGroups = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const groups = await takerGroupService.getTakerGroups(maker.id);

    return res.status(httpStatus.OK).send({ taker_groups: groups });
});

const getMakersWithGroup = catchAsync(async (req, res, next) => {
    const makers = await makerService.getMakersByTakerUserId(req.user.id);

    const makersWithGroup = await Promise.all(
        makers.map(async (maker) => {
            const taker = await takerService.getTakerByUserIdAndMakerId(
                req.user.id,
                maker.id
            );

            const group = await takerGroupService.getGroupByMakerIdAndTakerId(
                maker.id,
                taker.id
            );

            return { maker, group };
        })
    );

    return res.status(httpStatus.OK).send({ makers: makersWithGroup });
});

export default {
    createTakerGroup,
    updateTakerGroup,
    deleteTakerGroup,
    getTakerGroups,
    getMakersWithGroup,
};
