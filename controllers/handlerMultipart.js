const multer = require("multer");

const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadSinglePhoto = upload.single("image");

exports.resizeSinglePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) next();

  
});
