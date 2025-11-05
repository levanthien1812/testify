export const testAssignmentEmailTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Test Assignment</title>
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
      <h1>Test Assignment</h1>
      <p>Hello {{NAME}},</p>
      <p>You have been assigned a new test: <strong>{{TEST_TITLE}}</strong>.</p>
      <p>Please log in to your account <a href=${process.env.CLIENT_URL}>here</a> to take the test.</p>
      <p>Best regards,<br />Testify Team</p>
    </div>
    <div class="footer">
      &copy; 2025 Your Company. All rights reserved.
    </div>
  </body>
</html>`;
