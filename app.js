const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not " + "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(helmet());

console.log("this is " + process.env.NODE_ENV + " environment");

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10000kb" }));
app.use(express.urlencoded({ extended: true, limit: "10000kb" }));
app.use(cookieParser());

app.use(xss());

const whitelist = [];

if (whitelist.length > 0) app.use(hpp({ whitelist }));

app.use(compression());

// Serving static files
app.use(express.static(`${__dirname}/public`));

const userRouter = require("./routes/userRouter");
const articleRouter = require("./routes/articleRouter");
const tagRouter = require("./routes/tagRouter");

const baseURLV1 = "/api/v1";

app.use(baseURLV1 + "/users", userRouter);
app.use(baseURLV1 + "/articles", articleRouter);
app.use(baseURLV1 + "/tags", tagRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
