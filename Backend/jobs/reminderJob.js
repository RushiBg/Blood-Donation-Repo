const Appointment = require("../models/Appointment");
const User = require("../models/User");
const sendEmail = require("../utils/email");

async function sendReminders() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    date: { $gte: tomorrow, $lt: dayAfter },
    status: { $in: ["scheduled", "rescheduled"] }
  }).populate("userId", "name email");

  let sentCount = 0;
  let failedCount = 0;

  for (const appt of appointments) {
    const user = appt.userId;
    if (!user || !user.email) continue;

    const subject = "Appointment Reminder";

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto; padding: 16px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #e74c3c; text-align: center; margin: 0 0 20px;">Blood Donation System</h2>
          <div style="background-color: #e8f5e9; padding: 16px; border-radius: 8px; border-left: 4px solid #27ae60;">
            <h3 style="color: #27ae60; margin: 0 0 12px;">Appointment Reminder</h3>
            <p style="color: #2c3e50; margin: 0 0 12px;">Dear ${user.name || "Donor"},</p>
            <p style="color: #2c3e50; margin: 0 0 12px;">
              This is a reminder that you have a blood donation appointment scheduled for
              <strong>${appt.date.toLocaleString()}</strong>.
            </p>
            <p style="color: #2c3e50; margin: 0 0 12px;">
              If you need to reschedule or cancel, please log in to your account.
            </p>
            <p style="color: #2c3e50; margin: 0;">Thank you for your life-saving contribution!</p>
          </div>
          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 13px;">
              Thank you for using our Blood Donation System.<br>
              <em>This is an automated message. Please do not reply.</em>
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail(user.email, subject, message, user.name || "Donor");
      console.log(`Reminder sent to ${user.email}`);
      sentCount++;
    } catch (err) {
      console.error(`Failed to send reminder to ${user.email}:`, err);
      failedCount++;
    }
  }

  return { message: `Reminders sent: ${sentCount}, failed: ${failedCount}` };
}

module.exports = { sendReminders };
