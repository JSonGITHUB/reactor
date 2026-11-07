<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

Always apply the SOLID design principles when writing or refactoring code:

1. **Single Responsibility Principle (SRP):**
   - Each module, class, or function should have only one reason to change.
   - Keep logic focused and avoid mixing unrelated concerns.

2. **Open/Closed Principle (OCP):**
   - Code should be open for extension, closed for modification.
   - Use abstractions, composition, or inheritance to add features without changing existing code.

3. **Liskov Substitution Principle (LSP):**
   - Subtypes must be usable in place of their base types without breaking functionality.
   - Ensure derived classes or implementations fully honor base contracts.

4. **Interface Segregation Principle (ISP):**
   - Favor many small, focused interfaces over large, general ones.
   - Do not require consumers to depend on unused methods.

5. **Dependency Inversion Principle (DIP):**
   - Depend on abstractions, not concrete implementations.
   - Inject dependencies via parameters or context/hooks, not by direct instantiation.

**How to enforce SOLID in this project:**
- Separate concerns into distinct modules, functions, or components.
- Use composition, interfaces, or higher-order functions to extend or customize behavior.
- Ensure all subclasses or implementations can be swapped for their base types without issues.
- Break up large interfaces or props into smaller, purpose-driven ones.
- Pass dependencies as arguments or via context/hooks—avoid direct imports or new instances inside modules.

**Examples:**
- Refactor functions or components that mix unrelated logic into smaller, focused units.
- Use dependency injection for services, APIs, or utilities.
- Prefer interface/type composition over inheritance for React props and state.

> This instruction applies to all JavaScript and TypeScript files in this project.
