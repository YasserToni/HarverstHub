const nodemailer = require("nodemailer");
// Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)

  // transporter using gmail service

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "altonyyasser2@gmail.com",
      pass: "rmwi tvav dnrh igpb",
    },
  });

  // 2) Define email options (like from, to, subject, email content)
  const mailOpts = {
    from: "altonyyasser@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
