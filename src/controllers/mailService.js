const getMailConfiguration = require("../config/mailConfig");

exports.triggerMail = async (toMail, subject, body) => {
  const mailOptions = {
    from: process.env.email,
    to: toMail,
    subject: subject,
    html: body,
  };
  const transporter = await getMailConfiguration();
  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
