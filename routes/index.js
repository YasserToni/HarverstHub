const authRoute = require("./authRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
};

module.exports = mountRoutes;
