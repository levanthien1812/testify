const allRoles = {
  taker: [],
  maker: [],
  admin: ["getUsers", "manageUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
