var mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    department: String,
    courses: [
      {
        course: String,
        subjects: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("department", departmentSchema);
