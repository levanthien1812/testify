import express from "express";
import { auth } from "../../middlewares/auth.js";
import userController from "../../controllers/user.controller.js";
import { RIGHTS } from "../../config/constants/roles.js";
import { upload } from "../../config/multer.js";
import { validate } from "../../middlewares/validate.js";
import takerGroupController from "../../controllers/takerGroup.controller.js";
import takerGroupValidation from "../../validations/takerGroup.validation.js";

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
    .route(`/takers/:id`)
    .patch(
        auth(RIGHTS.UPDATE_TAKER),
        upload.single("file"),
        userController.updateTaker
    );

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

router
    .route("/takers/groups")
    .post(
        auth(RIGHTS.CREATE_TAKER_GROUP),
        validate(takerGroupValidation.createTakerGroup),
        takerGroupController.createTakerGroup
    )
    .get(auth(RIGHTS.GET_TAKER_GROUPS), takerGroupController.getTakerGroups);

router
    .route("/takers/groups/:id")
    .patch(
        auth(RIGHTS.UPDATE_TAKER_GROUP),
        validate(takerGroupValidation.updateTakerGroup),
        takerGroupController.updateTakerGroup
    )
    .delete(
        auth(RIGHTS.DELETE_TAKER_GROUP),
        takerGroupController.deleteTakerGroup
    );

export default router;
