import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import EditableTextField from '../utils/EditableTextField';
import IngredientDialog from '../utils/IngredientDialog';
import validate from '../utils/validate';
import VulgarFractions from '../utils/VulgarFractions';
import Sounds from '../sound/Sounds';

const Recipe = ({
    recipes,
    setRecipes,
    recipeGroupIndex,
    recipeIndex,
    recipe,
    setCollapseAll
}) => {

    const [collapsed, setCollapsed] = useState(recipe.collapsed);
    const [editTitle, setEditTitle] = useState(false);
    const [editRecipe, setEditRecipe] = useState(false);
    const [editIngredients, setEditIngredients] = useState(false);
    const [editInstructions, setEditInstructions] = useState(false);
    const [editedRecipe, setEditedRecipe] = useState(null);
    const [editedRecipeTitle, setEditedRecipeTitle] = useState(null);
    const [editedIngredients, setEditedIngredients] = useState(null);
    const [editedInstructions, setEditedInstructions] = useState(null);
    const [edit, setEdit] = useState(false);
    const [collapseIngredients, setCollapseIngredients] = useState(recipe.collapseIngredients);
    const [collapseInstructions, setCollapseInstructions] = useState(recipe.collapseInstructions);
    const [category, setCategory] = useState();
    const [index, setIndex] = useState();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState();
    const [help, setHelp] = useState(false);

    const unitsOfMeasure = [
        'no unit label', 'unit', 'teaspoon', 'tablespoon', 'cup', 'milliliter', 'liter', 'fluid ounce',
        'pint', 'quart', 'gallon', 'gram', 'kilogram', 'ounce', 'pound', 'pinch', 'bunch', 'clove', 'stalk', 'leave', 'handful'
    ];

    const closeDialog = () => setDialogOpen(false);
    const valuesArray = [0, .25, .5, .75, 1];
    const refreshPage = () => {
        // Store the recipe that was just edited before refresh
        localStorage.setItem('lastEditedRecipe', JSON.stringify({
            recipeGroupIndex,
            recipeIndex,
            recipeName: recipe.dish
        }));
        window.location.reload();
    };

    const createListItemId = (prefix = 'item') => {
        return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    };

    const ensureIngredientId = (ingredient, prefix = 'ingredient') => {
        if (!Array.isArray(ingredient)) return ingredient;
        const normalizedIngredient = [...ingredient];
        if (typeof normalizedIngredient[3] !== 'boolean') {
            normalizedIngredient[3] = Boolean(normalizedIngredient[3]);
        }
        if (!normalizedIngredient[4]) {
            normalizedIngredient[4] = createListItemId(prefix);
        }
        return normalizedIngredient;
    };

    const ensureInstructionId = (instruction, prefix = 'instruction') => {
        if (typeof instruction === 'string') {
            return {
                id: createListItemId(prefix),
                step: instruction,
                ingredients: []
            };
        }

        if (!instruction || typeof instruction !== 'object') {
            return {
                id: createListItemId(prefix),
                step: '',
                ingredients: []
            };
        }

        return {
            ...instruction,
            id: instruction.id || createListItemId(prefix),
            ingredients: (Array.isArray(instruction.ingredients) ? instruction.ingredients : []).map((ingredient) =>
                ensureIngredientId(ingredient, `${prefix}-ingredient`)
            )
        };
    };

    const roundToNearest = (value) => {
        const wholePart = Math.floor(value);
        const decimalPart = value - wholePart;
        const nearestDecimal = valuesArray.reduce((prev, curr) =>
            Math.abs(curr - decimalPart) < Math.abs(prev - decimalPart) ? curr : prev
        );
        return wholePart + nearestDecimal;
    };
    useEffect(() => {
        if (editRecipe && editedRecipe !== null) {
            setEdit(true);
        }
    }, [editRecipe, editedRecipe])
    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        let dataUpdated = false;
        if (validate(selectedNewRecipe.ingredients) === null) {
            selectedNewRecipe.ingredients = [];
            dataUpdated = true;
        } else if (typeof selectedNewRecipe.ingredients === 'string') {
            selectedNewRecipe.ingredients = [selectedNewRecipe.ingredients];
            dataUpdated = true;
        } else if (Array.isArray(selectedNewRecipe.ingredients)) {
            const validIngredients = selectedNewRecipe.ingredients.filter((item) => {
                if (!Array.isArray(item)) return false;
                const ingredientLabel = item[2];
                if (validate(ingredientLabel) === null) return false;
                const normalized = String(ingredientLabel).trim().toLowerCase();
                return normalized !== '' && normalized !== 'undefined';
            });
            const normalizedIngredients = validIngredients.map((item) => ensureIngredientId(item));
            const hadInvalidIngredients = validIngredients.length !== selectedNewRecipe.ingredients.length;
            const hadMissingIngredientIds = normalizedIngredients.some((item, itemIndex) => item[4] !== validIngredients[itemIndex]?.[4]);
            if (hadInvalidIngredients || hadMissingIngredientIds) {
                selectedNewRecipe.ingredients = normalizedIngredients;
                dataUpdated = true;
            }
        }
        if (validate(selectedNewRecipe.instructions) === null) {
            //selectedNewRecipe.instructions = [];
            selectedNewRecipe.instructions = [];
            dataUpdated = true;
        } else if (typeof selectedNewRecipe.instructions === 'string') {
            selectedNewRecipe.instructions = [
                {
                    id: createListItemId('instruction'),
                    step: selectedNewRecipe.instructions,
                    ingredients: []
                }
            ];
            dataUpdated = true;
        } else if (Array.isArray(selectedNewRecipe.instructions)) {
            const normalizedInstructions = selectedNewRecipe.instructions.map((instruction) =>
                ensureInstructionId(instruction)
            );
            const hadInstructionShapeChanges = normalizedInstructions.some((instruction, instructionIndex) => {
                const originalInstruction = selectedNewRecipe.instructions[instructionIndex];
                if (typeof originalInstruction === 'string') return true;
                if (!originalInstruction?.id) return true;
                const originalIngredients = Array.isArray(originalInstruction?.ingredients) ? originalInstruction.ingredients : [];
                return originalIngredients.some((ingredient, ingredientIndex) => {
                    const normalizedIngredient = instruction.ingredients?.[ingredientIndex];
                    return Array.isArray(ingredient) && normalizedIngredient?.[4] !== ingredient?.[4];
                });
            });
            if (hadInstructionShapeChanges) {
                selectedNewRecipe.instructions = normalizedInstructions;
                dataUpdated = true;
            }
        }
        if (selectedNewRecipe.discription) {
            selectedNewRecipe.description = selectedNewRecipe.discription;
            dataUpdated = true;
        }
        if (dataUpdated) {
            setRecipes(newRecipes);
        }
        if (selectedNewRecipe.description === '') {
            //setEdit(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        selectedNewRecipe.collapseIngredients = collapseIngredients;
        localStorage.setItem('recipeTracking', JSON.stringify(newRecipes));
    }, [collapseIngredients, recipeGroupIndex, recipeIndex, recipes]);

    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        selectedNewRecipe.collapseInstructions = collapseInstructions;
        localStorage.setItem('recipeTracking', JSON.stringify(newRecipes));
    }, [collapseInstructions, recipeGroupIndex, recipeIndex, recipes]);

    useEffect(() => {
        setRecipes((previousRecipes) => {
            if (!Array.isArray(previousRecipes)
                || !previousRecipes[recipeGroupIndex]
                || !Array.isArray(previousRecipes[recipeGroupIndex].recipes)
                || !previousRecipes[recipeGroupIndex].recipes[recipeIndex]) {
                return previousRecipes;
            }

            const currentRecipe = previousRecipes[recipeGroupIndex].recipes[recipeIndex];
            if (currentRecipe.isCollapsed === collapsed && currentRecipe.collapsed === collapsed) {
                return previousRecipes;
            }

            const updatedRecipes = [...previousRecipes];
            const updatedGroupRecipes = [...updatedRecipes[recipeGroupIndex].recipes];
            updatedGroupRecipes[recipeIndex] = {
                ...currentRecipe,
                isCollapsed: collapsed,
                collapsed: collapsed
            };
            updatedRecipes[recipeGroupIndex] = {
                ...updatedRecipes[recipeGroupIndex],
                recipes: updatedGroupRecipes
            };
            localStorage.setItem('recipeTracking', JSON.stringify(updatedRecipes));
            return updatedRecipes;
        });
    }, [collapsed, recipeGroupIndex, recipeIndex, setRecipes]);

    useEffect(() => {
        setCollapsed(recipe.isCollapsed ?? recipe.collapsed ?? true);
    }, [recipe.isCollapsed, recipe.collapsed]);

    const toggleEditTitle = () => {
        const toggleTitle = (editTitle)
            ? false
            : true;
        const wasRecipeTitleEdited = (recipe.category !== editedRecipeTitle) ? true : false;
        setEditTitle(toggleTitle);
        setEditedRecipeTitle((toggleTitle) ? recipe.category : '');
        if (!toggleTitle && wasRecipeTitleEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
            selectedNewRecipe.dish = (wasRecipeTitleEdited) ? editedRecipeTitle : selectedNewRecipe.dish;
            setRecipes(newRecipes);
        }
    }
    const parseRecipeDescription = (input, currentRecipe = {}) => {
        if (!input || typeof input !== 'string') {
            return {
                dish: currentRecipe.dish || '',
                description: currentRecipe.description || '',
                ingredients: currentRecipe.ingredients || [],
                instructions: currentRecipe.instructions || '',
                nutrition: currentRecipe.nutrition || ''
            };
        }

        const lines = input.split('\n').map(line => line.trim());
        let dish = undefined;
        let description = '';
        let ingredients = [];
        let instructions = '';
        let nutrition = '';

        let section = '';
        let buffer = [];
        let foundSection = false;

        const flushBuffer = () => {
            if (section === 'Ingredients') {
                ingredients = buffer
                    .map(line => {
                        const parts = line.trim().split(/\s+/); // split by whitespace
                        if (parts.length >= 3) {
                            const [quantity, unit, ...rest] = parts;
                            const name = rest.join(' ');
                            // Skip if any part is literally 'undefined'
                            if (
                                quantity.toLowerCase() === 'undefined' ||
                                unit.toLowerCase() === 'undefined' ||
                                name.toLowerCase() === 'undefined'
                            ) {
                                return null;
                            }
                            return [quantity, unit, name, false, createListItemId('ingredient')];
                        }

                        // Optional: also skip single-word lines like just 'undefined'
                        if (line.toLowerCase() === 'undefined') return null;

                        return null; // skip malformed entries
                    })
                    .filter(Boolean); // remove nulls
            } else if (section === 'Cooking Instructions') {
                description = buffer
                    .join('\n')
                    .replace(/None required\./gi, '')
                    .replace(/\n{2,}/g, '\n')
                    .trim();
            } else if (section === 'Serving Instructions') {
                instructions = buffer
                    .filter(Boolean)
                    .map(line => ({
                        id: createListItemId('instruction'),
                        step: line,
                        ingredients: [] // or extract matched ingredients here if needed
                    }));

                const servingText = buffer
                    .join('\n')
                    .replace(/None required\./gi, '')
                    .replace(/\n{2,}/g, '\n')
                    .trim();

                // Append serving instructions text to description
                if (servingText) {
                    description += (description ? '\n\n' : '') + servingText;
                }
            } else if (section === 'Nutritional Value') {
                nutrition = buffer.join('\n').trim();
            }
            buffer = [];
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Match headers
            const isDishHeader = /^Dish:?(.*)$/i.exec(line);
            const isIngredientsHeader = /^Ingredients:?$/i.test(line);
            const isCookingHeader = /^Cooking Instructions:?$/i.test(line);
            const isServingHeader = /^Serving Instructions:?$/i.test(line);
            const isNutritionHeader = /^Nutritional Value:?$/i.test(line);

            if (isDishHeader) {
                flushBuffer();
                section = 'Dish';
                foundSection = true;

                const inlineDish = isDishHeader[1].trim();
                if (inlineDish) {
                    dish = inlineDish;
                } else if (i + 1 < lines.length && lines[i + 1].trim()) {
                    dish = lines[i + 1].trim();
                    i++; // Skip the next line since it was used for the dish
                }
                continue;
            }

            if (isIngredientsHeader || isCookingHeader || isServingHeader || isNutritionHeader) {
                flushBuffer();
                if (isIngredientsHeader) section = 'Ingredients';
                if (isCookingHeader) section = 'Cooking Instructions';
                if (isServingHeader) section = 'Serving Instructions';
                if (isNutritionHeader) section = 'Nutritional Value';
                foundSection = true;
                continue;
            }

            buffer.push(line);
        }

        flushBuffer();

        // If no known sections found, assign all to description
        if (!foundSection) {
            return {
                dish: currentRecipe.dish || '',
                description: input.trim(),
                ingredients: currentRecipe.ingredients || [],
                instructions: currentRecipe.instructions || '',
                nutrition: currentRecipe.nutrition || ''
            };
        }

        return {
            dish: dish === undefined ? currentRecipe.dish : (dish || currentRecipe.dish || ''),
            description: description || currentRecipe.description || '',
            ingredients: ingredients.length > 0 ? ingredients : currentRecipe.ingredients || [],
            instructions: instructions || currentRecipe.instructions || '',
            nutrition: nutrition || currentRecipe.nutrition || ''
        };
    };
    const toggleEditRecipe = () => {
        const toggleRecipe = (editRecipe)
            ? false
            : true;
        const wasRecipeEdited = (recipe.description !== editedRecipe) ? true : false;
        setEditRecipe(toggleRecipe);
        setEditedRecipe((toggleRecipe) ? recipe.description : '');
        if (!toggleRecipe && wasRecipeEdited) {
            const newRecipes = [...recipes];
            const updatedRecipe = wasRecipeEdited
                ? parseRecipeDescription(editedRecipe, newRecipes[recipeGroupIndex].recipes[recipeIndex])
                : newRecipes[recipeGroupIndex].recipes[recipeIndex];
            const updatedGroupRecipes = [...newRecipes[recipeGroupIndex].recipes];
            updatedGroupRecipes[recipeIndex] = updatedRecipe;
            newRecipes[recipeGroupIndex] = {
                ...newRecipes[recipeGroupIndex],
                recipes: updatedGroupRecipes
            };
            setRecipes(newRecipes);
            refreshPage();
        }
    }

    const toggleEditIngredients = () => {
        const toggleIngredients = (editIngredients)
            ? false
            : true;
        const wasIngredientsEdited = (recipe.ingredients !== editedIngredients) ? true : false;
        setEditIngredients(toggleIngredients);
        setEditedIngredients((toggleIngredients) ? recipe.ingredients : '');
        if (!toggleIngredients && wasIngredientsEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
            selectedNewRecipe.ingredients = (wasIngredientsEdited) ? editedIngredients : selectedNewRecipe.ingredients;
            setRecipes(newRecipes);
        }
    }
    const toggleEditInstructions = () => {
        const toggleInstructions = (editInstructions)
            ? false
            : true;
        const wasInstructionsEdited = (recipe.instructions !== editedInstructions) ? true : false;
        setEditInstructions(toggleInstructions);
        setEditedInstructions((toggleInstructions) ? recipe.instructions : '');
        if (!toggleInstructions && wasInstructionsEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
            selectedNewRecipe.instructions = (wasInstructionsEdited) ? editedInstructions : selectedNewRecipe.instructions;
            setRecipes(newRecipes);
        }
    }

    const deleteRecipe = () => {
        const toggle = window.confirm(`Are you sure you want to remove recipe: ${recipe.dish}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                //console.error("Index out of range");
            }
        };
        if (toggle) {
            const newRecipes = [...recipes];
            removeItemByIndex(newRecipes[recipeGroupIndex].recipes, recipeIndex);
            setRecipes(newRecipes);
        }
    }
    const ifUndefinedArray = (value) => (validate(value) === null) ? [] : value;
    const addIngredient = (newIngredient) => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        const { ingredient, unit, quantity } = newIngredient;
        const unitLabel = (unit.includes('no unit label')) ? '' : unit;
        const existingIngredientId = (category.toLowerCase().includes('ingredient') && dialogType === 'edit')
            ? selectedNewRecipe.ingredients?.[index]?.[4]
            : null;
        const ingredientData = [
            Number(quantity),
            unitLabel,
            ingredient,
            false,
            existingIngredientId || createListItemId('ingredient')
        ];
        if (category.toLowerCase().includes('ingredient')) {
            if (dialogType === 'edit') {
                selectedNewRecipe.ingredients[index] = ingredientData;
            } else {
                selectedNewRecipe.ingredients.push(ingredientData);
            }
        } else if (category.toLowerCase().includes('instruction')) {
            selectedNewRecipe.instructions[index].ingredients.push(ingredientData);
        }
        setRecipes(newRecipes);

    }
    const condenseArray  = (originalArray) => {
        if (originalArray.length < 3) {
            return originalArray;
        }
        const condensedArray = [
            originalArray[0],
            originalArray[1],
            originalArray.slice(2).join(' ')
        ];
        return condensedArray;
    }

    const addIngredients = (newIngredients) => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        const ingredientData = newIngredients.split('\n').map((ingredient) => {
            const normalizedIngredient = condenseArray(ingredient.split(' '));
            return [
                normalizedIngredient[0],
                normalizedIngredient[1],
                normalizedIngredient[2],
                false,
                createListItemId('ingredient')
            ];
        });
        selectedNewRecipe.ingredients = ingredientData;
        selectedNewRecipe.isCollapsed = false;
        selectedNewRecipe.collapsed = false;
        setRecipes(newRecipes);
    }

    const addCheckbox = (category, index) => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        if (category.toLowerCase().includes('ingredient')) {
            setDialogType('add');
            setCategory(category);
            setIndex(index);
            setDialogOpen(true);
        } else if (category.toLowerCase().includes('instruction')) {
            if (index === null) {
                const newInstruction = prompt(`Add a new instruction:`, '');
                const step = {
                    id: createListItemId('instruction'),
                    step: newInstruction,
                    ingredients: []
                }
                selectedNewRecipe.instructions.push(step);
                setRecipes(newRecipes);
            } else {
                setDialogType('add');
                setCategory(category);
                setIndex(index);
                setDialogOpen(true);
            }
        }
    }
    const toggleCheckbox = (category, index, ingredientIndex) => {
        setCollapseAll(false);
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        if (category === 'ingredients') {
            const ingredientPrepared = (selectedNewRecipe.ingredients[index][3]) ? false : true;
            selectedNewRecipe.ingredients[index][3] = ingredientPrepared;
            setRecipes(newRecipes);
            //refreshPage();
        } else if (category === 'instructions') {
            const ingredient = selectedNewRecipe.instructions[index].ingredients[ingredientIndex];
            const ingredientAdded = (ingredient[3]) ? false : true;
            ingredient[3] = ingredientAdded;
            setRecipes(newRecipes);
            //refreshPage();
        }
        playSound();
    }
    const editIngredient = (category, index) => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        if (category === 'ingredients') {
            setDialogType('edit');
            setCategory(category);
            setIndex(index);
            setDialogOpen(true);
        } else if (category === 'instructions') {
            const editedInstruction = prompt(`Edit step #${index + 1}:`, selectedNewRecipe.instructions[index].step);
            selectedNewRecipe.instructions[index].step = editedInstruction;
            setRecipes(newRecipes);
        }
    }

    const editSubItem = (category, index, subIndex) => {
        const editItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error("Index out of range");
            }
        };
        const newRecipes = [...recipes];
        if (subIndex === null) {
            editItemByIndex(newRecipes[recipeGroupIndex].recipes[recipeIndex][category], index);
        } else {
            const array = newRecipes[recipeGroupIndex].recipes[recipeIndex][category][index].ingredients
            editItemByIndex(array, subIndex);
        }
        setRecipes(newRecipes);
    }
    const deleteSubItem = (category, index, subIndex) => {
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error("Index out of range");
            }
        };
        const newRecipes = [...recipes];
        if (subIndex === null) {
            removeItemByIndex(newRecipes[recipeGroupIndex].recipes[recipeIndex][category], index);
        } else {
            const array = newRecipes[recipeGroupIndex].recipes[recipeIndex][category][index].ingredients
            removeItemByIndex(array, subIndex);
        }
        setRecipes(newRecipes);
    }

    const resetCheckboxes = (category) => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        
        if (category.toLowerCase().includes('ingredient')) {
            // Reset all ingredient checkboxes
            selectedNewRecipe.ingredients.forEach(ingredient => {
                ingredient[3] = false;
            });
        } else if (category.toLowerCase().includes('instruction')) {
            // Reset all instruction checkboxes
            selectedNewRecipe.instructions.forEach(instruction => {
                instruction.ingredients.forEach(ingredient => {
                    ingredient[3] = false;
                });
            });
        }
        setRecipes(newRecipes);
    };

    const recipeHeader = (category, toggleFunction, isEdit) => {

        return <div className='containerDetail m-5 flexContainer bg-lite centerVertical'>
            <div className='flex2Column containerDetail color-yellow size20 bg-tinted pt-10 pb-10 mr-5'>
                <CollapseToggleButton
                    title={category}
                    isCollapsed={(category.toLowerCase().includes('ingredient')) ? collapseIngredients : collapseInstructions}
                    setCollapse={(category.toLowerCase().includes('ingredient')) ? setCollapseIngredients : setCollapseInstructions}
                    align='left'
                />
            </div>
            <div className='flexColumn'>
                {
                    (edit)
                        ? <div title='save' className='r-10 p-20 bg-lite color-neogreen button bold' onClick={() => setEdit(prev => !prev)}>save</div>
                        : <div title='edit' className='r-10 pt-20 pb-20 pl-15 pr-15 bg-lite button size25' onClick={() => setEdit(prev => !prev)}>{icons.edit}</div>
                }
            </div>
            <div className='flexColumn'>
                <div
                    title={`add ${String(category.replace(':', '')).endsWith('s') 
                                ? String(category.replace(':', '')).slice(0, -1).replace(':','').toLocaleLowerCase()
                                : category.replace(':', '').toLocaleLowerCase()}
                            `}
                    className='ml-5 r-10 p-20 bg-lite button color-lite centeredContent w-50'
                    onClick={() => addCheckbox(category, null)}
                >
                    <div className='text-outline-light size25'>
                        {icons.plus}
                    </div>
                </div>
            </div>
            <div className='flexColumn'>
                <div
                    title={`reset all ${category.toLowerCase().replace(':', '')}`}
                    className='ml-5 r-10 p-20 bg-lite button color-lite centeredContent w-50'
                    onClick={() => resetCheckboxes(category)}
                >
                    <div className='size35 mt--5 text-outline-dark'>
                        ↺
                    </div>
                </div>
            </div>
        </div>
    }

    const getItemQuantityDisplay = (item) => {
        let quantity = item[0];
        let newQuantity = 0;
        quantity = (quantity === '4/5') ? .8 : quantity;
        quantity = (quantity === '2/3') ? .6 : quantity;
        quantity = (quantity === '1/2') ? .5 : quantity;
        quantity = (quantity === '2/5') ? .4 : quantity;
        quantity = (quantity === '1/3') ? .3 : quantity;
        quantity = (quantity === '1/4') ? .25 : quantity;
        quantity = (quantity === '1/5') ? .2 : quantity;
        quantity = (quantity === '1/6') ? .16 : quantity;
        quantity = (quantity === '1/7') ? .14 : quantity;
        quantity = (quantity === '1/8') ? .12 : quantity;
        quantity = (quantity === '1/9') ? .11 : quantity;
        quantity = (quantity === '1/10') ? .1 : quantity;

        let units = String(item[1]);
        units = units.toLowerCase();
        if (units === 'stalks' || units === 'stalk') {
            units = 'stalk'; 
        }
        if (units === 'leaves' || units === 'leaf') {
            units = 'leave'; 
        }
        if (units === 'handful' || units === 'handfuls') {
            units = 'handful';
        }
        if (units === 'mls' || units === 'ml' || units === 'milliliter' || units === 'milliliters') {
            units = 'teaspoon';
            newQuantity = Number(quantity / 4.929);
            quantity = (isNaN(newQuantity)) ? quantity : newQuantity;
            if (quantity >= 3) {
                units = 'tablespoon';
                quantity = (quantity / 3)
            }
        }
        if (units === 'tablespoons' || units === 'tblsp' || units === 'tblsps' || units === 'tbsp' || units === 'tbsps') {
            units = 'tablespoon';
        }
        if (units === 'g' || units === 'gs' || units === 'gram' || units === 'grams') {
            units = 'teaspoon';
            newQuantity = Number(quantity / 5.69);
            quantity = (isNaN(newQuantity)) ? quantity : newQuantity;
            if (quantity >= 3) {
                units = 'tablespoon';
                quantity = (quantity / 3)
            }
        }
        if ((units === 'tablespoons' || units === 'tablespoon') && Number(quantity) > 4) {
            units = 'cup';
            newQuantity = Number(quantity / 16);
            quantity = (isNaN(newQuantity)) ? quantity : newQuantity;
        }
        
        if (!String(quantity).includes('/')) {
            if (!Number.isInteger(quantity)) {
                quantity = roundToNearest(quantity);
            }
        }
        
        newQuantity = Number(String(quantity).replace('0.', '.'));
        quantity = (isNaN(newQuantity)) ? item[0] : newQuantity;
        units = units.replace('tsp', 'teaspoon');
        units = units.replace('tbsp', 'tablespoon');
        units = units.replace('tbs', 'tablespoon');
        units = units.replace('Tbsp', 'tablespoon');
        units = units.replace('tbls', 'tablespoon');
        units = units.replace('lb', 'pound');
        let unitsDisplay = '';
        if (unitsOfMeasure.includes(units)) {
            unitsDisplay = `${units}${(item[0] > 1 && units !== '' && (units[units.length - 1] !== 's')) ? 's' : ''}`;
        } else {
            unitsDisplay = units;
        }
        return <div className='width-100-percent'>
            {
                (quantity === 0 || quantity === '0' || quantity === '' || quantity === undefined || quantity === null || Number.isNaN(quantity))
                ? null
                : <VulgarFractions value={quantity} />
            }
            <span className='mr-10 fl-left'>
            {
                (unitsDisplay === 0 || unitsDisplay === '0' || unitsDisplay === '' || unitsDisplay === undefined || unitsDisplay === null || Number.isNaN(unitsDisplay))
                    ? null
                    : unitsDisplay
            }
            </span>
        </div>
    }
    const getIngredientDisplay = (item, index, category) => <div
        key={item?.[4] || `${category || 'ingredient'}-${String(item?.[2] || 'item')}-${index}`}
        className={`containerDetail m-5 flexContainer centerVertical ${(item[3]) ? 'bg-lite' : ''}`}
    >
        <div className='containerDetail size20 p-25 flex2Column'>
            <div
                title='edit ingredient'
                className=''
                onClick={() => editIngredient(category, index)}
            >
                {getItemQuantityDisplay(item)} {item[2]}
            </div>
        </div>
        <div className='flexColumn contentRight'>
            {
                (!edit)
                    ? <div
                        title='toggle checkbox'
                        className='containerDetail m-5 bg-lite p-20 button'
                        onClick={() => toggleCheckbox(category, index, 0)}
                    >
                        <input
                            name='completed'
                            className='regular-checkbox button'
                            checked={item[3]}
                            type='checkbox'
                            onChange={() => {}}
                        />
                    </div>
                    : <div className='containerDetail flexContainer'>
                        <div
                            title='edit'
                            className='containerDetail flexColumn bg-lite p-20 button centeredContent m-5'
                            onClick={() => editSubItem(category, index, null)}
                        >
                            {icons.edit}
                        </div>
                        <div
                            title='delete'
                            className='containerDetail flexColumn bg-lite p-20 button centeredContent m-5'
                            onClick={() => deleteSubItem(category, index, null)}
                        >
                            {icons.delete}
                        </div>
                    </div>
            }
        </div>
    </div>
    const getStep = (item) => {
        if (typeof item === 'string') {
            return item;
        }
        if (item !== undefined) {
            return item.step
        }
        return 'noone';
    }
    const playSound = () => {
        if (typeof Sounds.playSoftBell === 'function') {
            Sounds.playSoftBell();
            return;
        }
        if (typeof Sounds.softBell === 'function') {
            Sounds.softBell(250);
            return;
        }
        if (typeof Sounds.boop === 'function') {
            Sounds.boop(0, 1);
        }
    };
    const getInstructionsDisplay = (item, index, category) => {
        return (item !== undefined)
            ? <div key={item?.id || `${category || 'instruction'}-${index}`} className=''>
                <div className='containerDetail m-5 p-20 flexContainer centerVertical color-yellow size20 bold'>
                    <div className='flex2Column'>
                        <div 
                            title='edit ingredient'
                            className='' 
                            onClick={() => editIngredient(category, index)}>{index + 1}. {getStep(item)}
                        </div>
                    </div>
                    <div className='flexColumn contentRight'>
                        {
                            (!edit)
                            ? <div
                                title='add item'
                                className='r-10 p-20 bg-lite button color-lite centeredContent w-70 flexContainer'
                                onClick={() => addCheckbox(category, index)}
                            >
                                <div className='flex2Column text-outline-light size15'>{icons.plus}</div>
                                <div className='ml-5 flex2Column size20'>{icons.chili}</div>
                            </div>
                            : <div className='containerDetail flexContainer'>
                                <div
                                    title='edit'
                                    className='containerDetail flexColumn bg-lite p-20 button centeredContent m-5'
                                    onClick={() => editSubItem(category, index, null)}
                                >
                                    {icons.edit}
                                </div>
                                <div
                                    title='delete'
                                    className='containerDetail flexColumn bg-lite p-20 button centeredContent m-5'
                                    onClick={() => deleteSubItem(category, index, null)}
                                >
                                    {icons.delete}
                                </div>
                            </div>
                        }
                    </div>
                </div>
                {
                    (item !== undefined)
                        ? <div className='height-400'>
                            {
                                (Array.isArray(item?.ingredients) ? item.ingredients : []).map((ingredient, ingredientIndex) => <div key={ingredient?.[4] || `${item?.id || `${category || 'instruction'}-${index}`}-ingredient-${ingredientIndex}-${String(ingredient?.[2] || 'item')}`} className={`containerDetail m-5 flexContainer centerVertical ${(ingredient[3]) ? 'bg-lite' : ''}`}>
                                    <div className='flex2Column'>
                                        <div className='containerDetail size20 p-25' /* onClick={() => editIngredient(category, ingredientIndex)} */>{ingredient[0]} {ingredient[1]} {ingredient[2]}</div>
                                    </div>
                                    <div className='flexColumn contentRight'>
                                        {
                                            (!edit)
                                            ? <div
                                                title='select'
                                                className='containerDetail m-5 bg-lite p-20 button'
                                                onClick={() => toggleCheckbox(category, index, ingredientIndex)}
                                            >
                                                <input
                                                    className='regular-checkbox button'
                                                    checked={ingredient[3]}
                                                    type='checkbox'
                                                    onChange={() => {}}
                                                />
                                            </div>
                                            : <div className='containerDetail flexContainer'>
                                                <div
                                                    title='edit'
                                                    className='containerDetail flexColumn bg-lite p-20 button centeredContent m-5'
                                                    onClick={() => editSubItem(category, index, ingredientIndex)}
                                                >
                                                    {icons.edit}
                                                </div>
                                                <div
                                                    title='delete'
                                                    className='containerDetail flexColumn bg-lite p-20 button centeredContent m-5'
                                                    onClick={() => deleteSubItem(category, index,ingredientIndex)}
                                                >
                                                    {icons.delete}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                )
                            }
                        </div>
                    : null
                }
            </div>
            : null

    }
    const recipeField = (isEdit, setEdited, edited, data, toggleEdit, category) => {
        const isValidIngredientItem = (item) => {
            if (!Array.isArray(item)) return false;
            const ingredientLabel = item[2];
            if (validate(ingredientLabel) === null) return false;
            const normalized = String(ingredientLabel).trim().toLowerCase();
            return normalized !== '' && normalized !== 'undefined';
        };
        return <div className=''>
            <div className='color-soft height-400'>
                {
                    (isEdit)
                        ? <textarea
                            className='inputField size20 r-10 height-200'
                            onChange={(e) => setEdited(e.target.value)}
                            value={edited !== null ? edited : ifUndefinedArray(data)}
                            placeholder={edited}
                        >
                            {edited}
                        </textarea>
                        : (typeof data === 'string')
                            ? <div onClick={() => toggleEdit()}>
                                {ifUndefinedArray(data).map((line, index) => (
                                    <React.Fragment key={`data-${index}`}>
                                        {line}
                                        {<br />}
                                    </React.Fragment>
                                ))}
                            </div>
                            : ifUndefinedArray(data).map((item, index) => {
                                return (category.toLowerCase().includes('ingredient'))
                                    ? (!collapseIngredients)
                                        ? (isValidIngredientItem(item)
                                            ? getIngredientDisplay(item, index, category)
                                            : null)
                                        : null
                                    : (!collapseInstructions)
                                        ? getInstructionsDisplay(item, index, category)
                                        : null
                            })
                }
            </div>
        </div>
    }
    const editDish = () => {
        const newRecipeName = prompt('Enter new recipe name: ', recipe.dish);
        const wasRecipeRecipeNameEdited = (newRecipeName && recipe.dish !== newRecipeName) ? true : false;
        if (wasRecipeRecipeNameEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
            selectedNewRecipe.dish = newRecipeName;
            setRecipes(newRecipes);
        }
    }
    const scrollToActiveRecipe = (groupIndex, recipeIndex) => {
        const lastEditedRecipe = localStorage.getItem('lastEditedRecipe');
        if (lastEditedRecipe) {
            try {
                const edited = JSON.parse(lastEditedRecipe);
                // If this is the recipe that was edited, expand it
                if (edited.recipeGroupIndex === groupIndex && edited.recipeIndex === recipeIndex) {
                    setCollapsed(false);
                    // Scroll to this recipe after a brief delay to allow render
                    setTimeout(() => {
                        const recipeElement = document.getElementById(`recipe-${groupIndex}-${recipeIndex}`);
                        if (recipeElement) {
                            recipeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 300);
                    // Clear the localStorage flag
                    localStorage.removeItem('lastEditedRecipe');
                }
            } catch (error) {
                console.error('Error parsing lastEditedRecipe:', error);
            }
        }
    }
    useEffect(() => {
        // On component mount, check if this recipe was just edited
        scrollToActiveRecipe(recipeGroupIndex, recipeIndex);
    }, [recipes, recipeGroupIndex, recipeIndex]);

    return <div key={`recipe${recipeIndex}`} id={`recipe-${recipeGroupIndex}-${recipeIndex}`} className='lowerBorder contentLeft'>
        <div className='containerDetail m-5 flexContainer bg-lite'>
            <div className='flex1Auto contentLeft'>
                {
                    (editTitle)
                    ? <textarea
                        className='inputField ht-55 size20 r-10 bold color-lite'
                        onChange={(e) => setEditedRecipeTitle(e.target.value)}
                        value={(editedRecipeTitle !== null) ? editedRecipeTitle : recipe.dish}
                        placeholder={recipe.dish}
                    >
                        {recipe.dish}
                    </textarea>
                    : <div>
                        <div className='containerDetail bg-lite'>
                            <div className='containerDetail color-yellow size20 bg-tinted p-20'>
                                <CollapseToggleButton
                                    title={recipe.dish}
                                    isCollapsed={collapsed}
                                    setCollapse={setCollapsed}
                                    align='left'
                                    editTitle={editDish}
                                />
                            </div>
                        </div>
                        {
                            (collapsed)
                            ? null
                            : <div>
                                <div className='containerDetail flexContainer'>
                                    <div className='flex2Column contentRight'>
                                        {
                                            (help)
                                            ? <div className='containerDetail pt-10 pb-10 pr-10 pl-20 color-orange size12 flex2Column contentLeft m-5'>
                                                    Use the following headers for easy parsing:
                                                    Ingredients:, Cooking Instructions:, Serving Instructions:, Nutritional Value:
                                                </div>
                                            : <div className='containerDetail w-100 button p-30 bg-lite size30 ml-auto mr-5 contentCenter' onClick={() => setHelp(true)}>
                                                ❓
                                                </div>
                                        }
                                    </div>
                                    <div
                                        title='delete'
                                        className='flexColumn r-10 p-30 bg-lite button ml-10'
                                        onClick={() => deleteRecipe()}
                                    >
                                        {icons.delete}
                                    </div>
                                </div>
                                <div className=''>
                                    <EditableTextField
                                        title='Recipe:'
                                        data={recipe.description}
                                        toggle={toggleEditRecipe}
                                        edit={editRecipe}
                                        setEdited={setEditedRecipe}
                                        edited={editedRecipe}
                                    />
                                    <IngredientDialog
                                        isOpen={isDialogOpen}
                                        dialogType={dialogType}
                                        recipe={recipe}
                                        index={index}
                                        category={category}
                                        onClose={closeDialog}
                                        onSubmitIngredient={addIngredient}
                                        onSubmitIngredients={addIngredients}
                                        unitsOfMeasure={unitsOfMeasure}
                                    />
                                    {recipeHeader('Ingredients:', toggleEditIngredients, editIngredients)}
                                    {recipeField(editIngredients, setEditedIngredients, editedIngredients, recipe.ingredients, toggleEditIngredients, 'ingredients')}
                                    {recipeHeader('Instructions:', toggleEditInstructions, editInstructions)}
                                    {recipeField(editInstructions, setEditedInstructions, editedInstructions, recipe.instructions, toggleEditInstructions, 'instructions')}
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
            {
                (editTitle)
                ? <div
                    title='save'
                    className={`rt-25 t-0 ml-5 mt-5 r-10 size15 button pl-20 contentRight`}
                    onClick={() => toggleEditTitle()}
                >
                    <div className='r-10 p-20 bg-neogreen color-dark bold'>
                        save
                    </div>
                </div>
                : null
            }
        </div>
    </div>
};
export default Recipe;