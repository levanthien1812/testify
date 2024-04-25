import { createPool } from "mysql2";
import app from "./app.js";
import config from "./config/config.js";

const port = 3000;

app.get("/", (req, res, next) => {
  return res.json({
    status: "success",
  });
});

export const pool = createPool({
  host: config.db.host,
  user:  config.db.user,
  password:  config.db.password,
  database:  config.db.database,
}).promise();

if (pool) console.log("DB connected successfully!");

app.listen(port, () => {
  console.log(`Testify app listening on port ${port}`);
});
