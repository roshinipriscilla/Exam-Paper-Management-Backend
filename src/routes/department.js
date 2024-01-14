const departmentRoute = require("express").Router();
const {
  getAllDepartments,
  addDepartment,
} = require("../controllers/department");
const middleware = require("../middleware/authentication");

departmentRoute.get("/getAllDepartments", middleware, getAllDepartments);
departmentRoute.post("/addDepartments", middleware, addDepartment);

module.exports = departmentRoute;
