import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import testRoute from "./test.route.js";
import express from "express";

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: John Doe
 *         username:
 *           type: string
 *           example: johndoe123@
 *         email:
 *           type: string
 *           example: johnmike@gmail.com
 *         role:
 *           type: string
 *           example: maker
 *         maker_id:
 *           type: string
 *           example: 6650d639ecc1b7b66d5efb6a
 *     Tokens:
 *       type: object
 *       properties:
 *         access:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *             expired:
 *               type: string
 *               example: 2024-06-26T05:26:01.169Z
 *         refresh:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *             expired:
 *               type: string
 *               example: 2024-06-26T05:26:01.169Z
 *     Test:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 667a3d36510aa5fa39f4db86
 *         title:
 *           type: string
 *           example: Hello test
 *         datetime:
 *           type: string
 *           format: date-time
 *           example: 2024-06-25T17:42:00.000Z
 *         max_score:
 *           type: integer
 *           example: 10
 *         duration:
 *           type: integer
 *           example: 15
 *         description:
 *           type: string
 *           example: Architecto et possimus rerum maiores qui placeat voluptatem.
 *         maker_id:
 *           type: string
 *           example: 6650d639ecc1b7b66d5efb6a
 *         level:
 *           type: string
 *           example: easy
 *         num_parts:
 *           type: integer
 *           example: 1
 *         num_questions:
 *           type: integer
 *           example: 3
 *         code:
 *           type: string
 *           example: ""
 *         status:
 *           type: string
 *           example: draft
 *         close_time:
 *           type: string
 *           format: date-time
 *           example: 2024-06-25T17:42:00.000Z
 *         public_answers_option:
 *           type: string
 *           example: specific date
 *         public_answers_date:
 *           type: string
 *           format: date-time
 *           example: 2024-06-25T17:42:00.000Z
 *         taker_ids:
 *           type: array
 *           items:
 *             type: string
 *         are_answers_provided:
 *           type: boolean
 *           example: false
 *         parts:
 *           type: array
 *           items:
 *             type: object
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *     TestResponse:
 *       type: object
 *       properties:
 *         test:
 *           $ref: '#/components/schemas/Test'
 *     Part:
 *       type: object
 *       properties:
 *         order:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Greeting
 *         score:
 *           type: integer
 *           example: 5
 *         description:
 *           type: string
 *           example: Architecto et possimus rerum maiores qui placeat voluptatem.
 *         num_questions:
 *           type: integer
 *           example: 3
 *         test_id:
 *           type: string
 *           example: 667b96ad3f3c65c1006fb1bd
 *         id:
 *           type: string
 *           example: 667b9873762c8fc0d9ed1922
 *     CreatePartBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Greeting
 *         order:
 *           type: integer
 *           example: 1
 *         description:
 *           type: string
 *           example: Architecto et possimus rerum maiores qui placeat voluptatem.
 *         score:
 *           type: integer
 *           example: 5
 *         num_questions:
 *           type: integer
 *           example: 3
 *     CreatePartResponse:
 *       type: object
 *       properties:
 *         part:
 *           $ref: '#/components/schemas/Part'
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized
 *     Forbidden:
 *       description: Forbidden
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const routes = [
    {
        path: "/auth",
        route: authRoute,
    },
    {
        path: "/users",
        route: userRoute,
    },
    {
        path: "/tests",
        route: testRoute,
    },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
