const express = require("express");
const router = express.Router();
const articleRouter = require("./articleRouter");
const { authenticate, setUserToBody } = require("../controllers/authController");
const { createTag, getAllTags } = require("../controllers/tagController");

router.use("/:tagId/articles", articleRouter);

router.route("/").get(getAllTags).post(authenticate, setUserToBody, createTag);


module.exports = router;