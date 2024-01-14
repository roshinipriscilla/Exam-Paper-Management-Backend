const nodemailer = require("nodemailer");
const getMailConfiguration = async () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.mailPassword,
    },
  });
  return transporter;
};
module.exports = getMailConfiguration;
