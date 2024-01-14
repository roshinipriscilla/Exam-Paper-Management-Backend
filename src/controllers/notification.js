const notification = require("../models/notification");
const { emitMsgFn } = require("./socket");

exports.storeNotification = async (staffId, message) => {
  try {
    const newNotification = new notification({
      staffId: staffId,
      message: message,
      isViewed: false,
    });
    await newNotification
      .save()
      .then(async (data) => {
        emitMsgFn({ staffId: staffId });
        return data;
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    throw error;
  }
};

exports.getNotificationsByStaffId = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    notification
      .find({ staffId: staffId })
      .then((data) => {
        res.status(200).json({ status: "success", data });
      })
      .catch((error) => {
        console.error("Error finding notifications:", error);
        res.status(400).json({ status: "failure", error: error });
      });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.updateNotificationStatusByStaffId = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    notification
      .updateMany({ staffId: staffId }, { $set: { isViewed: true } })
      .then((data) => {
        res.status(200).json({ status: "success", data });
      })
      .catch((error) => {
        console.error("Error finding notifications:", error);
        res.status(400).json({ status: "failure", error: error });
      });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};
