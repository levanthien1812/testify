import makerService from "../services/maker.service.js";
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

export default {
    createTakerGroup,
    updateTakerGroup,
    deleteTakerGroup,
    getTakerGroups,
};
