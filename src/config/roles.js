const allRoles = {
    taker: ["saveAnswer", "getTest"],
    maker: [
        "getTests",
        "getTest",
        "createTest",
        "addPart",
        "validateParts",
        "createQuestion",
        "addAnswer",
        "createTaker",
        "assignTakers",
        "createTakersForTest",
        "getAvailableTakers",
        "validateQuestions",
    ],
    admin: ["getUsers", "manageUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
