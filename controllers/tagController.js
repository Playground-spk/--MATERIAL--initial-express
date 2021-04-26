const factory = require("./handlerFactory");
const Tag = require("../models/tag.model");

exports.getAllTags = factory.getAll(Tag);

exports.createTag = factory.createOne(Tag);
