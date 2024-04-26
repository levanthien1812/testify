import app from "./app.js";
import config from "./config/config.js";
import mongoose from "mongoose";

let server;
mongoose.connect(config.mongo.url, config.mongo.options).then(() => {
  console.log("Connected to MongoDB");
  server = app.listen(config.port, () => {
    console.log(`Testify app listening on port ${config.port}`);
  });
});
