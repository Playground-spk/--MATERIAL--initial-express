const express = require("express");
const { getAllArticles, createArticlel } = require("../controllers/articleController");
const { authenticate, setUserToBody } = require("../controllers/authController");
const { uploadSinglePhoto } = require("../controllers/handlerMultipart");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authenticate, getAllArticles)
  .post(
    authenticate,
    setUserToBody,
    uploadSinglePhoto,
    (req, res, next) => {
      console.log("body===>", req.body);
      console.log("buffer ==>", req.file.buffer);
    },
    createArticlel
  );

module.exports = router;
