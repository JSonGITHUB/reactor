---
description: Describe when these instructions should be loaded
paths:
. - "src/**/*.ts"
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

1. Always sanitize user inputs to prevent security vulnerabilities such as SQL injection, cross-site scripting (XSS), and other forms of attacks.
2. Use parameterized queries or prepared statements when interacting with databases to ensure that user inputs are treated as data rather than executable code.
3. Validate and sanitize all user inputs on both the client and server sides to ensure that they meet the expected format and do not contain malicious content.
4. Use libraries or frameworks that provide built-in sanitization functions to help mitigate risks associated with user inputs.
5. Regularly update and patch your software to ensure that any known vulnerabilities related to input sanitization are addressed.
6. Educate developers and team members about the importance of input sanitization and best practices for implementing it effectively in their code.
7. Implement logging and monitoring to detect and respond to any suspicious activities related to user inputs in a timely manner.
