var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const feedbackSchema = new mongoose.Schema(
  {
    questionPaperId: {
      type: ObjectId,
      ref: "paper",
    },
    reviewerId: {
      type: ObjectId,
      ref: "staffs",
    },
    feedback: String,
    paperAssignedId: {
      type: ObjectId,
      ref: "paperAssigned",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("feedback", feedbackSchema);
