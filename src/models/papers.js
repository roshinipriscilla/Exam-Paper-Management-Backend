var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const paperSchema = new mongoose.Schema(
  {
    paperAssignedId: {
      type: ObjectId,
      ref: "paperAssigned",
    },
    questions: String,
    version: Number,
    reviewRaised: Boolean,
    reviewStatus: String,
    questionFile: String,
    fileName: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("paper", paperSchema);
