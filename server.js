require("dotenv").config();
const mongoose = require("mongoose");
const redis = require("redis");

console.log(process.env.REDIS_URI);
exports.redisClient = redis.createClient(process.env.REDIS_URI || null);

const keys = require("./keys");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");

const DB = keys.database.replace("<password>", keys.databasePassword);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION! 💥 Shutting down...");
//   if (process.env.NODE_ENV === "production") {
//     server.close(() => {
//       process.exit(1);
//     });
//   }
//   console.log(err.name, err.message);
// });
