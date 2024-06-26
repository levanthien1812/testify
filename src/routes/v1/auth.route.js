import express from "express";
import authValidation from "../../validations/auth.validation.js";
import authController from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe123@
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johnmike@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@$$wOrd
 *     responses:
 *       201:
 *         description: User registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: "#/components/schemas/Tokens"
 */
router.post(
    "/register",
    validate(authValidation.register),
    authController.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johnmike@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@$$wOrd
 *     responses:
 *       200:
 *         description: User login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   $ref: "#/components/schemas/Tokens"
 *                 user:
 *                   $ref: "#/components/schemas/User"
 */
router.post("/login", validate(authValidation.login), authController.login);

/**
 * @openapi
 * /auth/loginGoogle:
 *   post:
 *     summary: Login a user by google account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3NGRiYmE4ZmFlZTY5YWNhZTFiYzFiZTE5MDQ1MzY3OGY0NzI4MDMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NjY5ODI5MDY3NjgtdWtiZzkzN2FuNGU0ZTVvMXY4OGxnNThvY3YyZDZ1b2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NjY5ODI5MDY3NjgtdWtiZzkzN2FuNGU0ZTVvMXY4OGxnNThvY3YyZDZ1b2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYyNDgzNzk4MDIxMjA3NDM2MjYiLCJoZCI6ImdtLnVpdC5lZHUudm4iLCJlbWFpbCI6IjIwNTIxOTQ3QGdtLnVpdC5lZHUudm4iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzE3NDMxMDg5LCJuYW1lIjoiVGhp4buHbiBMw6ogVsSDbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJeGlTbTJ0ZkpOUnI4WDJmbHg4WjBtRXNNQ1NWQm8tVFByQlM5LWtyTEw1eWNoWVE9czk2LWMiLCJnaXZlbl9uYW1lIjoiVGhp4buHbiIsImZhbWlseV9uYW1lIjoiTMOqIFbEg24iLCJpYXQiOjE3MTc0MzEzODksImV4cCI6MTcxNzQzNDk4OSwianRpIjoiYTY2ZTk0YjI4ODljM2JhMTEzYzllMTc4ZWQ4ZWEzOGU3NThhZTVhNCJ9.KAhhnhGFdfUE8E3w36sIYUP0RQjK-9qNX29ICEXcZQIpIr7zpR0vtJa28o-kNEAhZdIMoHmuU_UxFizREnDBdOHtpuc4Ihahe26RefVqAtEeLaUtgMYVEZXTxhX7mP7c_RthU3t_3bwEvwY3ItM0F1lGu_Bdu4aZ2AN7Xq-mEelkGcxRgyPRM8wByQuRCLRrQ8eHCLbN4TVv7qoB7Ts8NTi5pfXhqHtPSKEz233PwOqoXdl12nQe58vD-9yDgaiDGS9xlTXv2Q-R2q7jVDHTDO7s6yOak6nMpt3CEH1BMMpR46ZyLSup1SgwcRP6Ueksp2q_2Fy1lxJBDV_6feP22w
 *     responses:
 *       200:
 *         description: User login by google account successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   $ref: "#/components/schemas/Tokens"
 *                 user:
 *                   $ref: "#/components/schemas/User"
 */
router.post(
    "/loginGoogle",
    validate(authValidation.loginGoogle),
    authController.loginGoogle
);
router.post("/refresh", authController.refresh);
router.post("/logout", auth(), authController.logout);

export default router;
