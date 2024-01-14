var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const staffSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    role: String,
    userName: String,
    enabled: Boolean,
    department: {
      type: ObjectId,
      ref: "department",
    },
    papersAssigned: [
      {
        type: ObjectId,
        ref: "paperAssigned",
      },
    ],
    papersForReview: [
      {
        type: ObjectId,
        ref: "paperAssigned",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("staffs", staffSchema);
