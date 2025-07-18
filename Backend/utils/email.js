async function sendEmail(email, subject, message) {
  // For demo, just log
  console.log(`[EMAIL] To: ${email} | Subject: ${subject} | Message: ${message}`);
  return true;
}

module.exports = sendEmail; 