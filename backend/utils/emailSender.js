const nodemailer = require("nodemailer");
const fs = require("fs");

const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "unknown-email";
  return `${name.slice(0, 2)}***@${domain}`;
};

const buildHtmlTemplate = ({ employee, salary }) => `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:28px 0;">
        <tr>
          <td align="center">
            <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d8dee9;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#172033;padding:24px 30px;color:#ffffff;">
                  <div style="font-size:22px;font-weight:bold;">Nippon Toyota Pvt Ltd</div>
                  <div style="font-size:13px;color:#dbeafe;margin-top:6px;">Human Resources Department</div>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <p style="font-size:16px;margin:0 0 16px;">Dear ${employee.name},</p>
                  <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
                    Please find attached your salary slip for <strong>${salary.month} ${salary.year}</strong>.
                  </p>
                  <p style="font-size:15px;line-height:1.6;margin:0 0 22px;">
                    Kindly download the attached PDF for your records. If you find any mismatch in the salary details, please contact the HR team.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;background:#f9fafb;">
                    <tr>
                      <td style="padding:12px;border:1px solid #e5e7eb;color:#6b7280;">Employee ID</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-weight:bold;">${employee.employeeId}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px;border:1px solid #e5e7eb;color:#6b7280;">Designation</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-weight:bold;">${employee.designation}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px;border:1px solid #e5e7eb;color:#6b7280;">Net Salary</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-weight:bold;">Rs. ${Number(salary.netSalary || 0).toFixed(2)}</td>
                    </tr>
                  </table>
                  <p style="font-size:15px;line-height:1.6;margin:0;">
                    Regards,<br />
                    <strong>HR Team</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 30px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">
                  This is an automated email. Please do not reply to this message.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const buildEmailPayload = ({ employee, salary }) => ({
  to: employee.email,
  subject: `Salary Slip for ${salary.month} ${salary.year}`,
  text: `Dear ${employee.name},\n\nPlease find attached your salary slip for ${salary.month} ${salary.year}.\n\nRegards,\nHR Team`,
  html: buildHtmlTemplate({ employee, salary })
});

const sendWithResend = async ({ employee, salary, pdfPath }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "HR Team <onboarding@resend.dev>";
  const emailPayload = buildEmailPayload({ employee, salary });
  const attachmentContent = fs.readFileSync(pdfPath).toString("base64");

  console.log(`Sending salary email with Resend API to ${maskEmail(employee.email)} from ${fromEmail}`);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [emailPayload.to],
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
      attachments: [
        {
          filename: `Salary-Slip-${salary.month}-${salary.year}.pdf`,
          content: attachmentContent
        }
      ]
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || "Resend email API failed");
  }

  return result;
};

const sendWithSmtp = async ({ employee, salary, pdfPath }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required to send emails");
  }

  const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.EMAIL_PORT || 587);
  const smtpSecure = String(process.env.EMAIL_SECURE || "false") === "true";

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, "")
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  });

  console.log(
    `Preparing salary email for ${employee.employeeId} to ${maskEmail(employee.email)} using ${smtpHost}:${smtpPort} as ${maskEmail(process.env.EMAIL_USER)}`
  );

  try {
    await transporter.verify();
  } catch (error) {
    if (error.code === "ETIMEDOUT" || error.command === "CONN") {
      throw new Error(
        `SMTP connection timed out while connecting to ${smtpHost}:${smtpPort}. Check Render environment variables, Gmail app password, and try EMAIL_PORT=587 with EMAIL_SECURE=false.`
      );
    }

    throw error;
  }

  const emailPayload = buildEmailPayload({ employee, salary });

  return transporter.sendMail({
    from: `"HR Team" <${process.env.EMAIL_USER}>`,
    to: emailPayload.to,
    subject: emailPayload.subject,
    text: emailPayload.text,
    html: emailPayload.html,
    attachments: [
      {
        filename: `Salary-Slip-${salary.month}-${salary.year}.pdf`,
        path: pdfPath
      }
    ]
  });
};

const sendSalaryEmail = async ({ employee, salary, pdfPath }) => {
  if (process.env.EMAIL_PROVIDER === "resend") {
    return sendWithResend({ employee, salary, pdfPath });
  }

  return sendWithSmtp({ employee, salary, pdfPath });
};

module.exports = sendSalaryEmail;
