import { questionTypes } from "./questionTypes.js";

export const autoScoreTypes = [
    questionTypes.FILL_GAPS,
    questionTypes.MATCHING,
    questionTypes.MULITPLE_CHOICES,
];

export const chatOptions = {
    INDIVIDUAL: "individual",
    GROUP: "group",
};

export const manualScoreTypes = [questionTypes.RESPONSE];
