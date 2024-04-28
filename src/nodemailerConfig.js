const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuracion de Nodemailer
const transporter = nodemailer.createTransport({

  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'MAIL_USERNAME',
    pass: 'MAIL_PASSWORD'
  }
  // service: 'gmail',
  // auth: {
  //   type: 'OAuth2',
  //   user: process.env.MAIL_USERNAME,
  //   pass: process.env.MAIL_PASSWORD,
  //   clientSecret: process.env.OAUTH_CLIENT_SECRET,
  //   refreshToken: process.env.OAUTH_REFRESH_TOKEN
  // }
});

module.exports = transporter;



