const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please define name's article"],
  },

  material: {
    type: String,
    require: [true, "please atached material"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "article must belong to user !"],
  },
  tag: {
    type: mongoose.Schema.ObjectId,
    ref: "Tag",
    require: [true, "article must belong to tag !"],
  },
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
