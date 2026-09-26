import nodemailer from "nodemailer";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hahmad1178@gmail.com",
    pass: process.env.NEXT_GOOGLE_APP_PASSWORD,
  },
});


export const sendVerificationEmail = async (email: string, verificationCode: any) => {
  const mailOptions = {
    from: "Shuraim Data Subscription",
    to: email,
    subject: "Your Verification Code",
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationCode
    ),
  };
  try {
    transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

export const sendPasswordResetEmail = async (email: string, verificationCode: any) => {
  const mailOptions = {
    from: "Shuraim Data Subscription",
    to: email,
    subject: "Password Reset Code",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{verificationCode}", verificationCode),
  };
  try {
    transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

export const sendPasswordChangedEmail = async (email: string) => {
  const mailOptions = {
    from: "Shuraim Data Subscription",
    to: email,
    subject: "Password Changed Successfully",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  };
  try {
    transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};