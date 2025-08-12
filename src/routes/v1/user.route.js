import express from "express";
import { auth } from "../../middlewares/auth.js";
import userController from "../../controllers/user.controller.js";
import { RIGHTS } from "../../config/constants/roles.js";
import { upload } from "../../config/multer.js";
import { validate } from "../../middlewares/validate.js";
import takerGroupController from "../../controllers/takerGroup.controller.js";
import takerGroupValidation from "../../validations/takerGroup.validation.js";
import userValidation from "../../validations/user.validation.js";

const router = express.Router();

router
    .route("/")
    .get(auth(RIGHTS.GET_USERS), userController.getUsers)
    .patch(
        auth(RIGHTS.UPDATE_USER),
        upload.single("file"),
        validate(userValidation.updateUser),
        userController.updateUser
    );

router
    .route("/takers")
    .post(
        auth(RIGHTS.CREATE_TAKER),
        upload.single("file"),
        userController.createTaker
    )
    .get(auth(RIGHTS.GET_TAKERS), userController.getTakersByMaker);

router
    .route("/takers/groups")
    .post(
        auth(RIGHTS.CREATE_TAKER_GROUP),
        validate(takerGroupValidation.createTakerGroup),
        takerGroupController.createTakerGroup
    )
    .get(auth(RIGHTS.GET_TAKER_GROUPS), takerGroupController.getTakerGroups);

router
    .route("/takers/add-to-group")
    .patch(
        auth(RIGHTS.ADD_TAKERS_TO_GROUP),
        validate(takerGroupValidation.addTakersToGroup),
        userController.addTakersToGroup
    );

router
    .route("/takers/statistics")
    .get(
        auth(RIGHTS.GET_TAKERS_STATISTICS),
        userController.getTakersWithStatistics
    );

router
    .route(`/takers/:id`)
    .patch(
        auth(RIGHTS.UPDATE_TAKER),
        upload.single("file"),
        userController.updateTaker
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

router
    .route("/search")
    .get(
        auth(RIGHTS.GET_USERS_BY_EMAIL_SEARCH),
        validate(userValidation.searchUsers),
        userController.getTakerUsersByEmailSearch
    );

router
    .route("/makers-group")
    .get(
        auth(RIGHTS.GET_MAKERS_WITH_GROUP),
        takerGroupController.getMakersWithGroup
    );

export default router;
