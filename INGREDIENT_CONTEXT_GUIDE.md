# Ingredient Context Integration Guide

## Overview
The `IngredientContext` manages persistent ingredient checkbox state across the Cook and Shop components. When an ingredient is marked as checked (purchased/used) in Cook, it's automatically hidden from the Shop component for that recipe.

## Setup

### 1. Wrap Your App with IngredientProvider
In your main app file (likely App.js or a parent component):

```jsx
import { IngredientProvider } from './components/tracker/IngredientContext';

function App() {
  return (
    <IngredientProvider>
      {/* Your other components */}
    </IngredientProvider>
  );
}
```

### 2. Update Ingredient Component
The Ingredient component now requires a `recipeId` prop:

```jsx
<Ingredient 
  ingredient="Garlic"
  recipeId="recipe-123" 
/>
```

### 3. Update Shop Component to Filter Checked Ingredients

```jsx
import { useIngredientContext } from './tracker/IngredientContext';

const Shop = ({ recipeId, ingredients }) => {
  const { getCheckedIngredients } = useIngredientContext();
  
  // Get list of checked (already bought) ingredients
  const checkedIngredients = getCheckedIngredients(recipeId);
  
  // Filter out checked ingredients from the list
  const availableIngredients = ingredients.filter(
    ingredient => !checkedIngredients.includes(ingredient)
  );
  
  return (
    <div>
      {availableIngredients.map(ingredient => (
        <div key={ingredient}>{ingredient}</div>
      ))}
    </div>
  );
};
```

## API Reference

### `useIngredientContext()`
Hook to access ingredient status management.

#### Methods:
- **`toggleIngredientStatus(recipeId, ingredientName, checked)`**
  - Sets the checkbox status for an ingredient
  - `recipeId`: Unique identifier for the recipe
  - `ingredientName`: Name of the ingredient
  - `checked`: Boolean value

- **`getIngredientStatus(recipeId, ingredientName)`**
  - Returns the checkbox state for an ingredient
  - Returns `false` if not found

- **`getCheckedIngredients(recipeId)`**
  - Returns array of all checked ingredient names for a recipe
  - Useful for filtering in Shop component

- **`resetRecipeIngredients(recipeId)`**
  - Clears all checkboxes for a specific recipe
  - Call this if user resets the recipe

- **`ingredientStatus`**
  - Full state object: `{ recipeId: { ingredientName: boolean } }`
  - For debugging or advanced use

## Data Persistence

Ingredient checkbox states are automatically saved to localStorage under the key:
- `ingredientCheckboxStatus`

Format:
```json
{
  "recipe-123": {
    "Garlic": true,
    "Onion": false,
    "Salt": true
  },
  "recipe-456": {
    "Flour": true
  }
}
```

## Example: Complete Cook to Shop Flow

```jsx
// Cook Component
const Cook = ({ recipe }) => {
  return (
    <div>
      <h2>{recipe.dish}</h2>
      {recipe.ingredients.map(ingredient => (
        <Ingredient 
          key={ingredient}
          ingredient={ingredient}
          recipeId={recipe.id}
        />
      ))}
    </div>
  );
};

// Shop Component
const Shop = ({ recipe }) => {
  const { getCheckedIngredients } = useIngredientContext();
  const checkedItems = getCheckedIngredients(recipe.id);
  
  const missingIngredients = recipe.ingredients.filter(
    ing => !checkedItems.includes(ing)
  );
  
  return (
    <div>
      <h3>Shopping List for {recipe.dish}</h3>
      {missingIngredients.length === 0 ? (
        <p>All ingredients checked! Ready to cook.</p>
      ) : (
        <ul>
          {missingIngredients.map(ing => (
            <li key={ing}>{ing}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Notes
- Each recipe should have a unique `recipeId` 
- The context automatically persists to localStorage
- Checkbox states persist across browser sessions
- Use the reset button in Recipe component to clear all checkboxes
