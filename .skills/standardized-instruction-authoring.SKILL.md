---
description: "Reusable workflow for creating project instructions in the standardized format used for SOLID and accessibility guidance. Ensures all new instructions are clear, actionable, and agent-compatible."
applyTo:
  - "**/instructions/*.md"
---

# Standardized Instruction Authoring Skill

This skill guides the creation of new instruction files using the following format:
- YAML frontmatter with a description and applyTo fields
- Clear markdown headings for principles, enforcement, and examples
- Actionable, specific rules and examples
- Project-wide or file-type-specific scope

## Workflow
1. **Extract Requirements:**
   - Review conversation or user request for rules, patterns, or conventions to enforce.
   - Clarify scope (project-wide, file types, strictness) if not explicit.
2. **Draft Instruction:**
   - Use the standardized format: description, applyTo, markdown sections (Principles, Enforcement, Examples).
   - Write actionable, concise rules and at least one example.
3. **Review & Iterate:**
   - Identify ambiguous or weak parts and clarify with the user if needed.
   - Revise for clarity, completeness, and agent compatibility.
4. **Finalize:**
   - Save the instruction file in the project.
   - Summarize what the instruction enforces and suggest example prompts for users.

## Example Output
- See `.instructions.solid.md` and `.instructions.accessibility.md` for reference.

> Always use this workflow when creating or updating project instructions.
