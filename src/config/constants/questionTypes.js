export const QUESTION_TYPE = {
    MULTIPLE_CHOICES: "MULTIPLE_CHOICES",
    FILL_IN_THE_GAPS: "FILL_IN_THE_GAPS",
    TRUE_FALSE: "TRUE_FALSE",
    MATCHING: "MATCHING",
    RESPONSE: "RESPONSE",
};

export const QUESTION_TYPE_LABEL = {
    [QUESTION_TYPE.MULTIPLE_CHOICES]: "Multiple Choice",
    [QUESTION_TYPE.FILL_IN_THE_GAPS]: "Fill in the Gaps",
    [QUESTION_TYPE.TRUE_FALSE]: "True/False",
    [QUESTION_TYPE.MATCHING]: "Matching",
    [QUESTION_TYPE.RESPONSE]: "Response",
};

export const QUESTION_INSTRUCTIONS = {
    MULTIPLE_CHOICES: "Select the correct answer from the given options.",
    FILL_IN_THE_GAPS:
        "Fill in the blank(s) with the most appropriate word or phrase.",
    TRUE_FALSE: "Select whether the statement is true or false.",
    MATCHING:
        "Match each item in the left column with the correct item in the right column.",
    RESPONSE: "Write your answer in the text box provided.",
};
