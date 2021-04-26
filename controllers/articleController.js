const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const keys = require("../keys");
const factory = require("./handlerFactory");

const Article = require("../models/article.model");

exports.getAllArticles = (req, res) => {
  console.log('hello')
  res.json(req.user);

};

exports.createArticlel = factory.createOne(Article);
