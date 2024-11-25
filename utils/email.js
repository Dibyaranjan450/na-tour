const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

/*
const sendMail = async (props) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRP_PORT,
    secure: false,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  let mailOptions = {
    from: 'John Doe <johndoe@example.com>',
    to: props.email,
    subject: props.subject,
    text: props.text,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendMail;

*/

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.form = `John Doe <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        }
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRP_PORT,
        secure: false,
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });
    }
  }

  async send(template, subject) {
    // Render the HTML based upon the pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    // Define email options
    const mailOptions = {
      from: 'John Doe <johndoe@example.com>',
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // Create a transport and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
