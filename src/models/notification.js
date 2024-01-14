var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const notificationSchema = new mongoose.Schema(
  {
    staffId: {
      type: ObjectId,
      ref: "staffs",
    },
    message: String,
    isViewed: Boolean,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("notification", notificationSchema);
