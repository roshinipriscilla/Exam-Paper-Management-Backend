module.exports = function (app) {
  app.use("/api/user", require("./user"));
  app.use("/api/paper", require("./paperManagement"));
  app.use("/api/department", require("./department"));
  app.use("/api/notification", require("./notification"));
  app.use("/api/review", require("./reviewManagement"));
};
