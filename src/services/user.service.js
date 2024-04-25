import { pool } from "../index.js";

const createUser = async (body) => {
  const { username, name, email, password } = body;
  const result = await pool.query(
    `insert into users (username, email, name, password, role, photo) values ('${username}', '${email}', '${name}', '${password}', 'maker', null);`
  );

  return result;
};

const getUser = async (id) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = ${id};`)
  return result[0];
}

export {
  createUser,
  getUser
}
