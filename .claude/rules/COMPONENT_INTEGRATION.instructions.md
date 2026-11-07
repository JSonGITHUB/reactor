# Component Integration Instructions

When asked to wire up a new component (such as a tool, utility, or feature) in this project, always follow these steps to ensure full integration and discoverability, matching the conventions used for existing components:

## 1. Import and Route Registration
- Add the necessary import statement for the new component at the top of `src/App.js`.
- Add a `<Route>` for the new component in the main router switch in `src/App.js`, using a path that matches the component name (e.g., `/MyComponent`).

## 2. Home Menu Integration
- Add the new component to the menu or quick-access list in `src/components/Home.js` (or equivalent), following the pattern used for other components.

## 3. Navigation and Search
- Add the component's name to the array in `src/components/site/NavItems.js`.
- Add a corresponding entry to the object in `src/components/site/NavItemsMeta.js`, including relevant keywords for search and discovery.

## 4. Icon Registration
- Add an appropriate icon entry for the component in `src/components/site/icons.js`, using a unique and relevant emoji or symbol.

## 5. Consistency and Accessibility
- Ensure all changes follow the project's accessibility and code quality standards (WCAG, SOLID, etc.).
- Use the same naming, casing, and structure as existing components for consistency.

---

**Example Prompt:**
> "Wire up a new component called WeatherWidget so it appears in the app navigation, search, and menu, just like other tools."

**Result:**
- Import and route added in App.js
- Menu/quick access added in Home.js
- Name added to NavItems.js
- Meta/keywords added to NavItemsMeta.js
- Icon added to icons.js

---

**Related Customizations to Consider:**
- Enforce accessibility and code quality checks for all new UI components.
- Require test coverage for all new features.
- Standardize keyword selection for NavItemsMeta entries.

> This instruction applies to all new component integrations in this project.
