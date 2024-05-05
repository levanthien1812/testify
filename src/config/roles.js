const allRoles = {
    taker: ["saveAnswer", "getTest"],
    maker: [
        "getTests",
        "getTest",
        "createTest",
        "addParts",
        "updateQuestion",
        "addAnswer",
        "createTaker",
        "assignTakers",
    ],
    admin: ["getUsers", "manageUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
