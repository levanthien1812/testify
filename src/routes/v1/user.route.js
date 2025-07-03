import express from "express";
import { auth } from "../../middlewares/auth.js";
import userController from "../../controllers/user.controller.js";
import { RIGHTS } from "../../config/constants/roles.js";
import { upload } from "../../config/multer.js";

const router = express.Router();

router.route("/").get(auth("getUsers"), userController.getUsers);

router
    .route("/takers")
    .post(
        auth(RIGHTS.CREATE_TAKER),
        upload.single("file"),
        userController.createTaker
    )
    .get(auth(RIGHTS.GET_TAKERS), userController.getTakersByMaker);

router
    .route("/takers/statistics")
    .get(
        auth(RIGHTS.GET_TAKERS_STATISTICS),
        userController.getTakersWithStatistics
    );

router
    .route("/block/:blockedUserId")
    .patch(auth(RIGHTS.BLOCK_USER), userController.blockUser);

router
    .route("/unblock/:blockedUserId")
    .patch(auth(RIGHTS.BLOCK_USER), userController.unblockUser);

router
    .route("/block/")
    .get(auth(RIGHTS.GET_BLOCKED_INFO), userController.getBlockedInfo);

export default router;
