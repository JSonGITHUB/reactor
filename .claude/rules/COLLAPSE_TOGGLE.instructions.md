# Collapse Toggle Usage

When building or modifying any interface that includes a collapsible section, use the shared `CollapseToggleButton` component instead of creating a custom collapse control.

## Required pattern

- Use `CollapseToggleButton` for any expandable/collapsible panel, drawer, section, or grouped content area.
- Match the established app pattern: a full-width header row with the collapse control, and the expandable content rendered directly below it.
- Keep the toggle header visually consistent with other components in the app.
- When a section needs a header action such as Add, Save, or Upload, embed that action inside the header content area rather than hiding it behind the collapsed state.

## Preferred structure

```jsx
<div className='containerDetail mt-10 bg-lite'>
  <CollapseToggleButton
    component={(
      <div className='flexContainer centerVertical'>
        <div className='mr-10'>Photos (3)</div>
        <label
          htmlFor='photo-input'
          className='containerDetail flexColumn bg-yellow button bg-lite color-dark size12 p-10'
          data-collapse-ignore='true'
        >
          ➕📷
          <input id='photo-input' type='file' style={{ display: 'none' }} />
        </label>
      </div>
    )}
    isCollapsed={isPhotoPanelCollapsed}
    setCollapse={setIsPhotoPanelCollapsed}
    align='left'
  />

  {!isPhotoPanelCollapsed && (
    <div className='p-10 pt-0'>
      {/* expanded content */}
    </div>
  )}
</div>
```

## Rules

1. Prefer `CollapseToggleButton` over custom collapse markup.
2. Keep the header and content separated in the same way other screens use it.
3. Use the `component` prop when the header needs custom content or action buttons.
4. Add `data-collapse-ignore="true"` to interactive controls inside the header so clicking them does not collapse the section unintentionally.
5. Keep all collapsible sections independent and full-width when the design pattern requires it.
6. Do not create new one-off collapse UI when the shared component already exists.
7. If the interface is generated and a collapsible display is required, default to `CollapseToggleButton` before considering anything custom.

## Accessibility and consistency

- Ensure the header remains keyboard reachable.
- Keep action buttons visible and accessible even while collapsed.
- Preserve the same naming, spacing, and structure used by the rest of the application.
- Do not mix custom toggle logic with the shared component unless there is a strong project-specific reason.

> This rule applies to all new UI generation and refactoring work in the project.
