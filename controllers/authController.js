const catchAsync = require("../utils/catchAsync");
const bcryptjs = require("bcryptjs");
const keys = require("../keys");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../server.js");

const { promisify } = require("util");

const AppError = require("../utils/AppError");

const User = require("../models/user.model");

const signAccessToken = (id) => {
  return jwt.sign({ id }, keys.accessTokenKey, {
    expiresIn: 10,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, keys.refreshTokenKey, {
    expiresIn: keys.refreshTokenEXP + "d",
  });
};

const signCookieHttpOnly = (res, req, name, value) => {
  res.cookie(name, value, {
    expires: new Date(Date.now() + keys.refreshTokenEXP * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });
};

const validateRedisKeyChain = (id, refresh, access) => {
  return new Promise((resolve, reject) => {
    redisClient.hmget(JSON.stringify(id).trim(), refresh, function (err, result) {
      if (err) reject(err);

      resolve(result[0] === access);
    });
  });
};

const createSendToken = async (user, statusCode, req, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  redisClient.hmset(JSON.stringify(user._id).trim(), refreshToken, accessToken, function (err, res) {});

  signCookieHttpOnly(res, req, "access", accessToken);
  signCookieHttpOnly(res, req, "refresh", refreshToken);
};

exports.setUserToBody = async (req, res, next) => {
  if (req.user.id) req.body.user = req.user.id;
  next();
};

exports.signUp = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({ name, email, password, passwordConfirm });

  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    user: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password").select("+active");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.active) {
    return next(new AppError("user not active please tell admin", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);

  res.status(200).json({ status: "success" });
});

exports.logout = catchAsync(async (req, res, next) => {
  const { access, refresh } = req.cookies;
  const { id } = await promisify(jwt.verify)(refresh, keys.refreshTokenKey);
});

exports.authenticate = catchAsync(async (req, res, next) => {
  console.log("=============================================");
  console.log("[MIDDLEWARE] authenticate ");
  const { access, refresh } = req.cookies;

  try {
    const { id } = await promisify(jwt.verify)(access, keys.accessTokenKey);
    console.log(" access token still alive");
    const isCorrectOwnerToken = await validateRedisKeyChain(id, refresh, access);
    if (isCorrectOwnerToken) {
      console.log("everything ok then next");
      req.user = req.user ? req.user : {};
      req.user.id = id;
      console.log("=============================================");
      next();
    } else {
      res.clearCookie("access");
      res.clearCookie("refresh");
      console.log("=============================================");
      next(new AppError("your token wrong please login", 401));
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("access token expired ");
      let isCorrectOwnerToken;
      let idForSign;
      try {
        const { id } = await promisify(jwt.verify)(refresh, keys.refreshTokenKey);
        idForSign = id;
        isCorrectOwnerToken = await validateRedisKeyChain(id, refresh, access);
        console.log("is correct owner token", isCorrectOwnerToken);
        // ANCHOR note for by pass check is owner token  development always true    
        if (process.env.NODE_ENV === "development") isCorrectOwnerToken = true;
      } catch (error) {
        console.log(error.name);
        console.log("=============================================");
        res.clearCookie("access");
        res.clearCookie("refresh");
        return next(new AppError("your Token Expired pelase login", 401));
      }
      if (isCorrectOwnerToken) {
        console.log(0);
        const newAccessToken = signAccessToken(idForSign);
        console.log(1);
        signCookieHttpOnly(res, req, "access", newAccessToken);
        console.log(2);

        redisClient.hmset(JSON.stringify(idForSign).trim(), refresh, newAccessToken);
        console.log(3);

        req.user = req.user ? req.user : {};
        req.user.id = idForSign;
        console.log("set new access then go next");
        console.log("=============================================");
        next();
      } else {
        res.clearCookie("access");
        res.clearCookie("refresh");

        console.log("=============================================");
        return next(new AppError("your token wrong please login", 401));
      }
    } else {
      res.clearCookie("access");
      res.clearCookie("refresh");

      console.log("=============================================");
      return next(new AppError("your token wrong please login", 401));
    }
  }
});
