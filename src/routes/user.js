const userRoute = require("express").Router();
const {
  createUser,
  login,
  getAllUsers,
  getAccessToken,
  setPassword,
} = require("../controllers/userController");
const middleware = require("../middleware/authentication");

userRoute.post("/createUser", middleware, createUser);
userRoute.post("/login", login);
userRoute.post("/setPassword", setPassword);
userRoute.get("/getAllUsers", middleware, getAllUsers);
userRoute.post(
  "/getAccessToken",
  middleware.refreshAccessToken,
  getAccessToken
);
module.exports = userRoute;
