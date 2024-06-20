const allRoles = {
    taker: ["getTest", "getTests", "getSubmission", "submitAnswers"],
    maker: [
        "getTests",
        "getTest",
        "createTest",
        "updateTest",
        "deleteTest",
        "addPart",
        "updatePart",
        "validateParts",
        "createQuestion",
        "updateQuestion",
        "addAnswer",
        "createTaker",
        "assignTakers",
        "createTakersForTest",
        "getAvailableTakers",
        "validateQuestions",
        "getSubmissions",
        "getTakerSubmission",
    ],
    admin: ["getUsers", "manageUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
