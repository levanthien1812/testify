import { Strategy, ExtractJwt } from "passport-jwt";
import config from "./config.js";
import tokenTypes from "./tokens.js";
import { User } from "../models/user.model.js";
import { logger } from "./logger.js";

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  // payload is jwt_payload: an object literal containing the decoded JWT payload
  // done is a passport error first callback accepting arguments done(error, user, info)
  try {
    if (payload.type != tokenTypes.ACCESS) {
      throw new Error("Invalid token type");
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new Strategy(jwtOptions, jwtVerify);
