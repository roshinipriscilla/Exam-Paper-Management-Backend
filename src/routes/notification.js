const notificationRoute = require("express").Router();
const {
  getNotificationsByStaffId,
  updateNotificationStatusByStaffId,
} = require("../controllers/notification");
const middleware = require("../middleware/authentication");

notificationRoute.get("/:staffId", middleware, getNotificationsByStaffId);
notificationRoute.get(
  "/update/:staffId",
  middleware,
  updateNotificationStatusByStaffId
);

module.exports = notificationRoute;
