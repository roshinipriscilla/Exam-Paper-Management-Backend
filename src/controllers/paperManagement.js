const paperAssigned = require("../models/paperAssigned");
const papers = require("../models/papers");
const staffs = require("../models/staff");
const { triggerMail } = require("./mailService");
const { storeNotification } = require("./notification");
const CryptoJS = require("crypto-js");

exports.assignPaper = async (req, res) => {
  try {
    const {
      department,
      course,
      subject,
      setterId,
      checkerId,
      examinerId,
      dueDate,
    } = req.body;
    if (req.user.isAdmin) {
      if (
        department &&
        course &&
        subject &&
        setterId &&
        checkerId &&
        examinerId &&
        dueDate
      ) {
        const paper = new paperAssigned({
          department: department,
          course: course,
          subject: subject,
          setterId: setterId,
          checkerId: checkerId,
          examinerId: examinerId,
          status: "TODO",
          dueDate: dueDate,
          assignedDate: new Date(),
        });
        await paper
          .save()
          .then(async (data) => {
            const staffIds = [setterId, checkerId, examinerId];
            const staffData = await staffs.find({ _id: { $in: staffIds } });
            staffData.forEach(async (staff) => {
              if (staff._id.equals(setterId)) {
                staff.papersAssigned.push(data._id);
                let mailSubject = "PAPER ASSIGNED FOR SETTING";
                let body = `<h3>Hi ${staff.userName},</h3><p> You have been assigned to set the examination paper for the course ${course} - ${subject} that needs to be completed within ${dueDate}.</p><p>Please login and check your account to set the examination paper.</p>`;
                await triggerMail(staff.email, mailSubject, body);
                let notificationMessage = `You have been assigned to set the examination paper for the course ${course} - ${subject}.`;
                await storeNotification(staff._id, notificationMessage);
              } else {
                staff.papersForReview.push(data._id);
                let mailSubject = "PAPER ASSIGNED FOR REVIEW";
                let body = `<h3>Hi ${staff.userName},</h3><p> You have been assigned to review the examination paper for the course ${course} - ${subject}.</p><p>Please review the paper once the setter is done with setting the examination paper.</p>`;
                await triggerMail(staff.email, mailSubject, body);
                let notificationMessage = `You have been assigned to review the examination paper for the course ${course} - ${subject}.`;
                await storeNotification(staff._id, notificationMessage);
              }
              await staff.save();
            });
            res.status(200).json({ status: "success" });
          })
          .catch((error) => {
            res.status(400).json({ error, status: "failed" });
          });
      } else {
        res
          .status(400)
          .json({ error: "REQUIRED FIELDS MISSING", status: "Failed" });
      }
    } else {
      res.status(400).json({ status: "failed", error: "USER RESTRICTED" });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.getAllAssignedPapers = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      paperAssigned
        .find()
        .populate("department")
        .populate("setterId")
        .populate("checkerId")
        .populate("examinerId")
        .exec()
        .then((data) => {
          res.status(200).json({ status: "success", data: data });
        })
        .catch((error) => {
          res.status(400).json({ error, status: "failed" });
        });
    } else {
      res.status(400).json({ status: "failed", error: "USER RESTRICTED" });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.getPapersByStaffId = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    paperAssigned
      .find({
        $or: [
          { setterId: staffId },
          { checkerId: staffId },
          { examinerId: staffId },
        ],
      })
      .populate("department")
      .populate("setterId")
      .populate("checkerId")
      .populate("examinerId")
      .exec()
      .then((data) => {
        res.status(200).json({ status: "success", data: data });
      })
      .catch((error) => {
        res.status(400).json({ error, status: "failed" });
      });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.setNewPaper = async (req, res) => {
  try {
    const {
      questions,
      paperAssignedId,
      questionPaperId,
      previousVersion,
      isReviewCorrection,
      isFile,
    } = JSON.parse(req.body.reqBody);
    let question;
    if (questionPaperId) {
      await papers
        .findById(questionPaperId)
        .then(async (data) => {
          let encryptedQuestions = questions
            ? CryptoJS.AES.encrypt(
                JSON.stringify(questions),
                "questionPaper"
              ).toString()
            : null;
          let questionDoc = isFile
            ? `data:${req.file.mimetype};base64,${req.file.buffer.toString(
                "base64"
              )}`
            : null;
          let fileName = isFile ? req?.file?.originalname : null;

          data.questionFile = questionDoc;
          data.questions = encryptedQuestions;
          data.reviewRaised = false;
          data.fileName = fileName;
          await data.save();
          res.status(200).json({ data: data, status: "success" });
        })
        .catch((error) => {
          res.status(400).json({ error, status: "failed" });
        });
    } else {
      let encryptedQuestions = questions
        ? CryptoJS.AES.encrypt(
            JSON.stringify(questions),
            "questionPaper"
          ).toString()
        : null;
      let questionDoc = isFile
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString(
            "base64"
          )}`
        : null;
      let fileName = isFile ? req?.file?.originalname : null;
      question = new papers({
        paperAssignedId: paperAssignedId,
        questions: encryptedQuestions,
        questionFile: questionDoc,
        version: isReviewCorrection ? previousVersion + 1 : 1,
        reviewRaised: false,
        fileName: fileName,
      });
    }
    if (question) {
      await question
        .save()
        .then(async (questionData) => {
          await paperAssigned.findById(paperAssignedId).then(async (data) => {
            data.questionPaperId = questionData._id;
            data.status = isReviewCorrection
              ? "REVIEW CORRECTIONS"
              : "IN PROGRESS";
            await data.save();
            res.status(200).json({ data: questionData, status: "success" });
          });
        })
        .catch((error) => {
          res.status(400).json({ error, status: "failed" });
        });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const paperAssignedId = req.params.paperAssignedId;
    await papers
      .findOne({ paperAssignedId: paperAssignedId })
      .sort({ version: -1 })
      .exec()
      .then((data) => {
        res.status(200).json({ data: data, status: "success" });
      })
      .catch((error) => {
        res.status(400).json({ error, status: "failed" });
      });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};
