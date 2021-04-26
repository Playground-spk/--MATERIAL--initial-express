class KeysApp {
  constructor(database, databasePassword, accessTokenKey, accessTokenEXP, refreshTokenKey, refreshTokenEXP) {
    this.database = database;
    this.databasePassword = databasePassword;
    this.accessTokenKey = accessTokenKey;
    this.accessTokenEXP = accessTokenEXP;
    this.refreshTokenKey = refreshTokenKey;
    this.refreshTokenEXP = refreshTokenEXP;
  }
}
if (process.env.NODE_ENV === "development") {
  console.log("keys ===> development");
  module.exports = new KeysApp(
    process.env.DATABASE,
    process.env.DATABASE_PASSWORD,
    "accessKey",
    "30",
    "refreshKey",
    "90"
  );
} else if (process.env.NODE_ENV === "production") {
  console.log("keys ===> production");
  module.exports = new KeysApp(
    process.env.DATABASE,
    process.env.DATABASE_PASSWORD,
    process.env.ACCESS_TOKEN_KEY,
    process.env.ACCESS_TOKEN_EXPIRES_IN,
    process.env.REFRESH_TOKEN_KEY,
    process.env.REFRESH_TOKEN_EXPIRES_IN
  );
} else {
  console.log("keys dont match any environment", process.env.NODE_ENV);
  throw new Error("keys dont match any environment");
}
