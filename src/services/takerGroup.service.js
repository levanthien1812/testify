import TakerGroup from "../models/takerGroup.model.js";

const createTakerGroup = async (body) => {
    const takerGroup = await TakerGroup.create(body);
    return takerGroup;
};

const getTakerGroups = async (makerId) => {
    const takerGroups = await TakerGroup.find({ maker_id: makerId });
    return takerGroups;
};

const getTakersInGroup = async (takerGroupId) => {
    const takerGroup = await TakerGroup.findById(takerGroupId);
    return takerGroup.takers;
};

const addTakerToGroup = async (takerGroupId, takerId) => {
    const updatedGroup = await TakerGroup.findByIdAndUpdate(
        takerGroupId,
        { $addToSet: { takers: takerId } },
        { new: true }
    );
    return updatedGroup;
};

const removeTakerFromGroup = async (takerGroupId, takerId) => {
    const updatedGroup = await TakerGroup.findByIdAndUpdate(
        takerGroupId,
        { $pull: { takers: takerId } },
        { new: true }
    );
    return updatedGroup;
};

export default {
    createTakerGroup,
    getTakerGroups,
    getTakersInGroup,
    addTakerToGroup,
    removeTakerFromGroup,
};
