const paperManagementRoute = require("express").Router();
const {
  assignPaper,
  getAllAssignedPapers,
  getPapersByStaffId,
  setNewPaper,
  getQuestions,
} = require("../controllers/paperManagement");
const middleware = require("../middleware/authentication");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

paperManagementRoute.post("/assignPaper", middleware, assignPaper);
paperManagementRoute.get(
  "/papersAssigned/:staffId",
  middleware,
  getPapersByStaffId
);
paperManagementRoute.get(
  "/getAllAssignedPaper",
  middleware,
  getAllAssignedPapers
);
paperManagementRoute.post(
  "/setNewPaper",
  middleware,
  upload.single("file"),
  setNewPaper
);
paperManagementRoute.get(
  "/getQuestions/:paperAssignedId",
  middleware,
  getQuestions
);

module.exports = paperManagementRoute;
