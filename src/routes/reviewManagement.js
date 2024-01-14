const reviewManagementRoute = require("express").Router();
const {
  createReviewRequest,
  approvePaper,
  storeFeedback,
  feedbacksbyPaperAssignedId,
  getLatestComment,
  getPaperByFeedbackId,
} = require("../controllers/reviewManagement");
const middleware = require("../middleware/authentication");

reviewManagementRoute.post(
  "/reviewRequest/:paperAssignedId",
  middleware,
  createReviewRequest
);
reviewManagementRoute.post("/approve", middleware, approvePaper);
reviewManagementRoute.post("/storeFeedback", middleware, storeFeedback);
reviewManagementRoute.get(
  "/getFeedbackByPaperId/:paperAssignedId",
  middleware,
  feedbacksbyPaperAssignedId
);
reviewManagementRoute.get(
  "/getLatestComment/:paperAssignedId",
  middleware,
  getLatestComment
);
reviewManagementRoute.post(
  "/getPaperByFeedbackId",
  middleware,
  getPaperByFeedbackId
);

module.exports = reviewManagementRoute;
