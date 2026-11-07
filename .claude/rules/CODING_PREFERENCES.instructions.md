---
description: Describe when these instructions should be loaded
paths:
. - "src/**/*.ts"
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.
1. Favor functional programming paradigms arrow functions over object-oriented programming when possible.
2. Use descriptive variable and function names that clearly indicate their purpose.
3. Write pure functions that do not have side effects and always return the same output for the same input.
4. Avoid using global state and mutable data structures; prefer immutability.
5. Use higher-order functions and first-class functions to promote code reuse and modularity.
6. Follow the DRY (Don't Repeat Yourself) principle to minimize code duplication.
7. Write unit tests for all functions and ensure they cover edge cases.
8. Use consistent code formatting and adhere to the project's style guide.
9. Document functions and complex logic with clear comments and docstrings.
10. Regularly review and refactor code to improve readability and maintainability.
11. Avoid using magic numbers or hard-coded values; use constants or configuration files instead.
12. Handle errors gracefully and provide meaningful error messages.
13. Optimize for readability and maintainability over performance unless performance is a critical concern.
14. Use version control effectively, including meaningful commit messages and regular commits.
15. Stay updated with the latest best practices and language features to continuously improve code quality.
16. Avoid premature optimization; focus on writing clear and correct code first, then optimize as needed.
17. Use design patterns appropriately to solve common problems and improve code organization.
18. Ensure that code is modular and follows the Single Responsibility Principle, where each module or function has one responsibility or reason to change.
19. Avoid deep nesting of code; use early returns and break down complex functions into smaller, more manageable pieces.
20. Regularly update dependencies and ensure that the codebase is compatible with the latest versions of libraries and frameworks.
21. Use code linters and static analysis tools to catch potential issues early in the development process.
22. Prioritize security best practices, such as input validation and sanitization,to prevent vulnerabilities like SQL injection and cross-site scripting (XSS).
23. Write code that is easy to test and maintain, with clear separation of concerns and modular design.
24. Avoid using deprecated features and APIs; stay informed about the latest changes in the programming language and frameworks being used.
25. Always consider the user experience when writing code, ensuring that the application is responsive, accessible, and provides a seamless experience for users.
26. Always put import statements at the top of the file, followed by any necessary setup or configuration code, and then the main logic of the file.
27. Use consistent naming conventions for files, classes, functions, and variables to improve readability and maintainability across the codebase.
28. Avoid using inline styles or hard-coded values in the code; instead, use CSS classes or configuration files to manage styles and settings.
29. When working with asynchronous code, use async/await syntax for better readability and error handling, and avoid callback hell.
