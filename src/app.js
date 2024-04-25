import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "dotenv";
import routes from "./routes/v1/index.js";
import passport from "passport";
import { jwtStrategy } from "./config/passport.js";

const app = express();

app.use(express.static("public"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use(cors());
app.options("*", cors());

app.use("/v1", routes);

export default app;
