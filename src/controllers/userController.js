const staffs = require("../models/staff");
var CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { triggerMail } = require("./mailService");

exports.createUser = async (req, res) => {
  try {
    const { email, role, userName, department } = req.body;
    if (req.user.isAdmin) {
      if (email && role && userName) {
        staffs
          .find({ email: email })
          .then(async (data) => {
            if (!data.length) {
              const staff = new staffs({
                email: email,
                role: role,
                userName: userName,
                department: department,
                enabled: false,
              });
              await staff
                .save()
                .then(async (data) => {
                  let mailSubject = `ACCOUNT CREATION FOR ${role}`;
                  let body = `<h3>Hi ${userName},</h3><p> New Account Registration for Exam Paper Management System for the role ${role} has been registered with your mail.Kindly Reset your password by <a href="http://localhost:4200/session/set-password/?email=${email}">clicking here</a>.</p>`;
                  await triggerMail(email, mailSubject, body);
                  res.status(200).json({ status: "success" });
                })
                .catch((error) => {
                  res.status(400).json({ error, status: "failed" });
                });
            } else {
              res
                .status(400)
                .json({ status: "failed", error: "USER ALREADY EXISTS" });
            }
          })
          .catch((error) => {
            res.status(500).json({ status: "failed", error });
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email && password) {
      staffs.findOne({ email: email }).then(async (data) => {
        if (data) {
          if (data?.enabled) {
            let encryptedPassword = CryptoJS.SHA256(password).toString();
            if (encryptedPassword == data?.password) {
              const accessToken = jwt.sign(
                {
                  email: data.email,
                  role: data.role,
                },
                "accessToken",
                {
                  expiresIn: 3600,
                }
              );
              const refreshToken = jwt.sign(
                {
                  email: data.email,
                  role: data.role,
                },
                "refreshToken",
                {
                  expiresIn: 64000,
                }
              );

              res.status(200).json({
                status: "success",
                accessToken: accessToken,
                refreshToken: refreshToken,
                userId: data._id,
                role: data.role,
                userName: data?.userName,
              });
            } else {
              res.status(400).json({
                status: "failed",
                error: "INVALID USERNAME OR PASSWORD",
              });
            }
          } else {
            res
              .status(400)
              .json({ status: "failed", error: "USER NOT ENABLED" });
          }
        } else {
          res.status(400).json({ status: "failed", error: "USER NOT FOUND" });
        }
      });
    } else {
      res
        .status(400)
        .json({ error: "EMAIL OR PASSWORD MISSING", status: "Failed" });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const role = jwt.verify(req.headers.authorization, "accessToken").role;
    if (req.user.isAdmin) {
      staffs
        .find()
        .populate("department")
        .then((data) => {
          if (data.length) {
            res.status(200).json({ status: "success", data: data });
          } else {
            res
              .status(400)
              .json({ status: "failed", error: "NO USERS AVAILABLE" });
          }
        });
    } else {
      res.status(400).json({ status: "failed", error: "USER RESTRICTED" });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.getAccessToken = (req, res) => {
  try {
    const refreshToken = req.headers.token;
    if (!refreshToken) {
      throw new Error("Invalid Refresh Token");
    }
    const body = req.body.accessToken;

    const decodedRefreshToken = jwt.verify(refreshToken, "refreshToken");
    const decodedAccessToken = jwt.verify(body, "accessToken", {
      ignoreExpiration: true,
    });
    if (decodedAccessToken.email !== decodedRefreshToken.email) {
      throw new Error("Invalid Access or Refresh Token");
    }
    let newAccessToken = jwt.sign(
      {
        email: decodedAccessToken.email,
      },
      "accessToken",
      {
        expiresIn: 3600,
      }
    );
    return res.send({ accessToken: newAccessToken });
  } catch (error) {
    throw error;
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { password, email } = req.body;
    if (password && email) {
      let encryptedPassword = CryptoJS.SHA256(password).toString();
      staffs.findOne({ email: email }).then(async (data) => {
        if (data) {
          if (data.enabled) {
            res
              .status(400)
              .json({ status: "Failed", error: "Password Already Set" });
          } else {
            data.password = encryptedPassword;
            data.enabled = true;
            await data.save();
            res.status(200).json({ status: "Success" });
          }
        } else {
          res.status(400).json({ status: "failed", error: "USER NOT FOUND" });
        }
      });
    } else {
      res.status(400).json({ status: "Failed", error: "FIELDS MISSING" });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};
