const allRoles = {
    taker: [],
    maker: ["getTests", "getTest", "createTest", "addParts", "updateQuestion"],
    admin: ["getUsers", "manageUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
