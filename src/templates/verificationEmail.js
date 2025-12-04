export const verificationEmailTemplate = (
    verificationCode,
    expiresInMinutes
) => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Email verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f4f6;
        margin: 0;
        padding: 0;
      }
      .container {
        background-color: #ffffff;
        max-width: 600px;
        margin: 40px auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }
      h1 {
        color: #333333;
      }
      .code {
        font-size: 32px;
        font-weight: bold;
        background-color: #f0f0f0;
        padding: 15px 25px;
        display: inline-block;
        margin: 20px 0;
        border-radius: 6px;
        letter-spacing: 4px;
      }
      p {
        color: #555555;
        line-height: 1.6;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #888888;
        margin-top: 40px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verification</h1>
      <p>Hi there,</p>
      <p>Thank you for signing up. Please use the following verification code to complete your registration:</p>
      <div class="code">${verificationCode}</div>
      <p>This code will expire in ${expiresInMinutes} minutes. If you did not request this, you can safely ignore this email.</p>
      <p>Best regards,<br />Testify Team</p>
    </div>
    <div class="footer">
      &copy; 2025 Your Company. All rights reserved.
    </div>
  </body>
</html>`;
};
