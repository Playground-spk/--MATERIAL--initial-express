const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please define tag name's tag"],
  },

  description: {
    type: String,
    required: [true, "please atached description"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required:[true,'tag must belong to user !']
  },
});

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
