export const resetPasswordEmailTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Password</title>
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
      p {
        color: #555555;
        line-height: 1.6;
      }
      a.button {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff !important;
        padding: 12px 24px;
        border-radius: 5px;
        text-decoration: none;
        margin: 20px 0;
        font-weight: bold;
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
      <h1>Reset Your Password</h1>
      <p>Hello {{NAME}},</p>
      <p>We received a request to reset your password. Click the button below to choose a new password:</p>
      <p style="text-align: center;">
        <a class="button" href="{{RESET_PASSWORD_URL}}" target="_blank">Reset Password</a>
      </p>
      <p>If you didn’t request this, please ignore this email. This link will expire in 10 minutes for your security.</p>
      <p>Best regards,<br />Testify Team</p>
    </div>
    <div class="footer">
      &copy; 2025 Your Company. All rights reserved.
    </div>
  </body>
</html>
`;
