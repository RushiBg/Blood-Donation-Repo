const nodemailer = require('nodemailer');
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });
};

async function sendEmail(email, subject, message, recipientName = 'User') {
  try {
    // Check if credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EMAIL DEMO] To: ${email} | Subject: ${subject} | Message: ${message}`);
      console.log('⚠️  Email not sent: EMAIL_USER and EMAIL_PASS environment variables not configured');
      return true;
    }

    const transporter = createTransporter();
    
    // Check if the message is a verification code (numeric) or a regular message
    let messageContent;
    if (/^\d+$/.test(message)) {
      // It's a verification code
      messageContent = `
        <p>Hello ${recipientName},</p>
        <p>Your verification code is:</p>
        <div style="font-size: 28px; font-weight: bold; color: #ffffff; background-color: #e74c3c; display: inline-block; padding: 10px 20px; border-radius: 8px; margin: 15px 0;">
          ${message}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `;
    } else {
      // It's a regular message
      messageContent = `
        <p>Hello ${recipientName},</p>
        <p>${message}</p>
        <p>Thank you for using our Blood Donation System.</p>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; text-align: center; margin-bottom: 30px;">Blood Donation System</h2>
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60;">
              <h3 style="color: #27ae60; margin-top: 0;">${subject}</h3>
              <div style="color: #2c3e50; line-height: 1.6; margin-bottom: 20px;">${messageContent}</div>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; font-size: 14px;">
                Thank you for using our Blood Donation System.<br>
                This is an automated message, please do not reply.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.log(`[EMAIL DEMO] To: ${email} | Subject: ${subject} | Message: ${message}`);
    return false;
  }
}

module.exports = sendEmail;
