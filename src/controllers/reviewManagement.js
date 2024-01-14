const paperAssigned = require("../models/paperAssigned");
const feedback = require("../models/feedback");
const { triggerMail } = require("./mailService");
const { storeNotification } = require("./notification");
const papers = require("../models/papers");

exports.createReviewRequest = async (req, res) => {
  try {
    const paperAssignedId = req.params.paperAssignedId;
    await paperAssigned
      .findById(paperAssignedId)
      .populate("checkerId")
      .populate("questionPaperId")
      .then(async (data) => {
        let mailSubject = "PAPER RAISED FOR REVIEW";
        let body = `<h3>Hi ${data.checkerId.userName},</h3><p> You have been requested to review the examination paper for the course ${data.course} - ${data.subject}.Please login to your account to review.</p>`;
        await triggerMail(data.checkerId.email, mailSubject, body);
        let notificationMessage = `You have been requested to review the examination paper for the course ${data.course} - ${data.subject}.`;
        await storeNotification(data.checkerId._id, notificationMessage);
        data.status = "IN CHECKER REVIEW";
        const questionData = data.questionPaperId;
        questionData.reviewRaised = true;
        questionData.reviewStatus = "REVIEW PENDING";
        await data.save();
        await questionData.save();
        res.status(200).json({ status: "success" });
      });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.approvePaper = async (req, res) => {
  try {
    const { questionPaperId, isApproved, isExaminer } = req.body;
    if (isApproved) {
      await papers
        .findById(questionPaperId)
        .populate({
          path: "paperAssignedId",
          populate: [{ path: "setterId" }, { path: "examinerId" }],
        })
        .exec()
        .then(async (data) => {
          data.reviewStatus = isExaminer
            ? "APPROVED BY EXAMINER"
            : "APPROVED BY CHECKER";
          const paperAssigned = data.paperAssignedId;
          paperAssigned.status = isExaminer ? "DONE" : "IN EXAMINER REVIEW";
          await paperAssigned.save();
          await data.save();
          let mailSubject = `PAPER APPROVED BY ${
            isExaminer ? "EXAMINER" : "CHECKER"
          }`;
          let body = `<h3>Hi ${
            paperAssigned.setterId.userName
          },</h3><p> Your review request has been approved by ${
            isExaminer ? "examiner" : "checker"
          } for the examination paper for the course ${
            paperAssigned.course
          } - ${
            paperAssigned.subject
          }.Please login to your account to view.</p>`;
          await triggerMail(paperAssigned.setterId.email, mailSubject, body);
          let notificationMessage = `Your review request has been approved by ${
            isExaminer ? "examiner" : "checker"
          } for the examination paper for the course ${
            paperAssigned.course
          } - ${paperAssigned.subject}.`;
          await storeNotification(
            paperAssigned.setterId._id,
            notificationMessage
          );
          if (!isExaminer) {
            let examinerMailSubject =
              "PAPER APPROVED BY CHECKER AND RAISED FOR REVIEW";
            let examinerMailBody = `<h3>Hi ${paperAssigned.examinerId.userName},</h3><p>You have been requested to review the examination paper for the course ${paperAssigned.course} - ${paperAssigned.subject} and is approved by checker.You can login to your account and verify.</p>`;
            await triggerMail(
              paperAssigned.examinerId.email,
              examinerMailSubject,
              examinerMailBody
            );
            let examinerNotificationMessage = `You have been requested to review the examination paper for the course ${paperAssigned.course} - ${paperAssigned.subject} and is approved by checker.`;
            await storeNotification(
              paperAssigned.examinerId._id,
              examinerNotificationMessage
            );
          }

          res.status(200).json({ status: "Success", data: data });
        });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.storeFeedback = async (req, res) => {
  try {
    const { questionPaperId, reviewerId, comment, paperAssignedId } = req.body;
    const review = new feedback({
      questionPaperId: questionPaperId,
      paperAssignedId: paperAssignedId,
      reviewerId: reviewerId,
      feedback: comment,
    });
    await review
      .save()
      .then(async (data) => {
        await data
          .populate({
            path: "questionPaperId",
            populate: [
              { path: "paperAssignedId", populate: [{ path: "setterId" }] },
            ],
          })
          .then(async (paper) => {
            let questionPaperData = paper.questionPaperId;
            questionPaperData.reviewStatus = "FEEDBACK RAISED";
            questionPaperData.reviewRaised = false;
            let paperAssignedData = questionPaperData.paperAssignedId;
            paperAssignedData.status = "REVIEW CORRECTIONS";
            paperAssignedData.save();
            questionPaperData.save();
            let mailSubject = "CHANGE REQUEST";
            let body = `<h3>Hi ${paperAssignedData.setterId.userName},</h3><p> Feedback has been raised for the course ${paperAssignedData.course} - ${paperAssignedData.subject}.Please ogin to your account to view it and make the necessary changes.</p>`;
            await triggerMail(
              paperAssignedData.setterId.email,
              mailSubject,
              body
            );
            let notificationMessage = `Feedback has been raised for the course ${paperAssignedData.course} - ${paperAssignedData.subject}`;
            await storeNotification(
              paperAssignedData.setterId._id,
              notificationMessage
            );
          });
        res.status(200).json({ data: data, status: "success" });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({ error, status: "failed" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Failed", error });
  }
};
exports.feedbacksbyPaperAssignedId = async (req, res) => {
  try {
    const paperAssignedId = req.params.paperAssignedId;
    await feedback
      .find({ paperAssignedId: paperAssignedId })
      .sort({ updatedAt: -1 })
      .populate("reviewerId")
      .exec()
      .then((data) => {
        res.status(200).json({ status: "success", data: data });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({ error, status: "failed" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Failed", error });
  }
};
exports.getLatestComment = async (req, res) => {
  try {
    const paperAssignedId = req.params.paperAssignedId;
    await feedback
      .find({ paperAssignedId: paperAssignedId })
      .sort({ updatedAt: -1 })
      .populate("reviewerId")
      .exec()
      .then((data) => {
        res.status(200).json({ status: "success", data: data[0] });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({ error, status: "failed" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Failed", error });
  }
};

exports.getPaperByFeedbackId = async (req, res) => {
  try {
    const { questionPaperId } = req.body;
    papers
      .findById(questionPaperId)
      .then((data) => {
        res.status(200).json({ status: "success", data: data });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({ error, status: "failed" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Failed", error });
  }
};
