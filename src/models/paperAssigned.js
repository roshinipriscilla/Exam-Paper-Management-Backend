var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const paperAssignedSchema = new mongoose.Schema(
  {
    department: {
      type: ObjectId,
      ref: "department",
    },
    course: String,
    subject: String,
    setterId: {
      type: ObjectId,
      ref: "staffs",
    },
    checkerId: {
      type: ObjectId,
      ref: "staffs",
    },
    examinerId: {
      type: ObjectId,
      ref: "staffs",
    },
    questionPaperId: {
      type: ObjectId,
      ref: "paper",
    },
    status: String,
    dueDate: Date,
    assignedDate: Date,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("paperAssigned", paperAssignedSchema);
