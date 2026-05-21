import React, { useContext, useEffect, useState } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import EditableTextField from '../utils/EditableTextField';
import IngredientDialog from '../utils/IngredientDialog';
import validate from '../utils/validate';
import VulgarFractions from '../utils/VulgarFractions';
import Sounds from '../sound/Sounds';
import { IngredientContext } from '../context/IngredientContext';
import {
    getInventoryMatchDebugByNameFromStorage,
    getInventoryStateByNameFromStorage,
    queueCookRequiredNames,
} from '../context/KitchenInventoryContext';
import { parseIngredientLine } from './ingredientParsing';

const Recipe = ({
    recipes,
    setRecipes,
    recipeGroupIndex,
    recipeIndex,
    recipe,
    setCollapseAll
}) => {
    const { 
        setIngredients, 
        toggleIngredientStatus 
    } = useContext(IngredientContext);

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
    const [factor, setFactor] = useState(1);
    const [cartFeedback, setCartFeedback] = useState('');
    const [showInventoryDebug, setShowInventoryDebug] = useState(false);
    const [autoCheckUnknownQuantity, setAutoCheckUnknownQuantity] = useState(() => {
        try {
            return localStorage.getItem('recipeAutoCheckUnknownQuantity') === 'true';
        } catch (error) {
            return false;
        }
    });
    const inventoryStateCacheRef = React.useRef(new Map());
    const inventoryDebugCacheRef = React.useRef(new Map());

    useEffect(() => {
        if (!cartFeedback) return;

        const timeoutId = setTimeout(() => {
            setCartFeedback('');
        }, 1800);

        return () => clearTimeout(timeoutId);
    }, [cartFeedback]);

    useEffect(() => {
        localStorage.setItem('recipeAutoCheckUnknownQuantity', String(autoCheckUnknownQuantity));
    }, [autoCheckUnknownQuantity]);

    useEffect(() => {
        inventoryStateCacheRef.current.clear();
        inventoryDebugCacheRef.current.clear();
    }, [recipes]);

    const getInventoryLookupKey = (ingredientName) => {
        const normalized = normalizeIngredientKey(ingredientName);
        return String(normalized || ingredientName || '').trim().toLowerCase();
    };

    const getCachedInventoryState = (ingredientName) => {
        const cacheKey = getInventoryLookupKey(ingredientName);
        if (!cacheKey) {
            return getInventoryStateByNameFromStorage('');
        }

        const stateCache = inventoryStateCacheRef.current;
        if (stateCache.has(cacheKey)) {
            return stateCache.get(cacheKey);
        }

        const nextState = getInventoryStateByNameFromStorage(ingredientName);
        stateCache.set(cacheKey, nextState);
        return nextState;
    };

    const getCachedInventoryDebug = (ingredientName) => {
        const cacheKey = getInventoryLookupKey(ingredientName);
        if (!cacheKey) {
            return getInventoryMatchDebugByNameFromStorage('');
        }

        const debugCache = inventoryDebugCacheRef.current;
        if (debugCache.has(cacheKey)) {
            return debugCache.get(cacheKey);
        }

        const nextDebug = getInventoryMatchDebugByNameFromStorage(ingredientName);
        debugCache.set(cacheKey, nextDebug);
        return nextDebug;
    };

    const unitsOfMeasure = [
        'no unit label', 'unit', 'teaspoon', 'tablespoon', 'cup', 'milliliter', 'liter', 'fluid ounce',
        'pint', 'quart', 'gallon', 'gram', 'kilogram', 'ounce', 'pound', 'pinch', 'bunch', 'clove', 'stalk', 'leave', 'handful'
    ];

    const closeDialog = () => setDialogOpen(false);
    const valuesArray = [0, .25, .5, .75, 1];

    const normalizeIngredientKey = (ingredientValue) => {
        const unitAliases = {
            tsp: 'teaspoon',
            tsps: 'teaspoon',
            teaspoon: 'teaspoon',
            teaspoons: 'teaspoon',
            tbsp: 'tablespoon',
            tbsps: 'tablespoon',
            tablespoon: 'tablespoon',
            tablespoons: 'tablespoon',
            cup: 'cup',
            cups: 'cup',
            oz: 'ounce',
            ounce: 'ounce',
            ounces: 'ounce',
            lb: 'pound',
            lbs: 'pound',
            pound: 'pound',
            pounds: 'pound',
            g: 'gram',
            gram: 'gram',
            grams: 'gram',
            kg: 'kilogram',
            kilogram: 'kilogram',
            kilograms: 'kilogram',
            ml: 'milliliter',
            milliliter: 'milliliter',
            milliliters: 'milliliter',
            l: 'liter',
            liter: 'liter',
            liters: 'liter',
            bunch: 'bunch',
            bunches: 'bunch',
            handful: 'handful',
            handfull: 'handful',
            handfuls: 'handful',
            handfulls: 'handful',
            clove: 'clove',
            cloves: 'clove',
            stalk: 'stalk',
            stalks: 'stalk',
            pinch: 'pinch',
            pinches: 'pinch'
        };
        const unitLabels = new Set(Object.values(unitAliases));
        const descriptorWords = new Set([
            'and',
            'or',
            'coarse',
            'ground',
            'fresh',
            'freshly',
            'finely',
            'thinly',
            'chopped',
            'minced',
            'diced',
            'sliced',
            'optional',
            'to',
            'taste'
        ]);

        const normalized = String(ingredientValue || '')
            .toLowerCase()
            .replace(/[_-]/g, ' ')
            .replace(/[^a-z0-9\s/.,⁄-]/g, ' ')
            .trim();

        const sanitized = normalized
            .replace(/\b\d+([.,]\d+)?\b/g, ' ')
            .replace(/\b\d+[/⁄]\d+\b/g, ' ')
            .replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, ' ');

        const tokens = normalized
            .split(/\s+/)
            .map(token => token.replace(/^[.,]+|[.,]+$/g, ''))
            .map(token => unitAliases[token] || token)
            .filter(Boolean);

        const isNumberToken = (token) => {
            return /^\d*\.?\d+$/.test(token)
                || /^\d+\/\d+$/.test(token)
                || /^[¼½¾⅓⅔⅛⅜⅝⅞]$/.test(token);
        };

        const sanitizedTokens = sanitized
            .split(/\s+/)
            .map(token => token.replace(/^[.,]+|[.,]+$/g, ''))
            .map(token => unitAliases[token] || token)
            .filter(Boolean);

        const ingredientNameTokens = sanitizedTokens.filter(
            token => !isNumberToken(token) && !unitLabels.has(token) && !descriptorWords.has(token)
        );
        const normalizedName = ingredientNameTokens.join(' ').replace(/\s+/g, ' ').trim();
        return normalizedName || tokens
            .filter(token => !isNumberToken(token) && !unitLabels.has(token) && !descriptorWords.has(token))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim() || normalized;
    };

    const mergeIngredients = (previousIngredients, nextIngredients) => {
        const current = Array.isArray(previousIngredients) ? previousIngredients : [];
        const incoming = Array.isArray(nextIngredients) ? nextIngredients : [];
        const merged = [...current, ...incoming];
        const uniqueByIngredient = new Map();

        merged.forEach(item => {
            const key = normalizeIngredientKey(item);
            if (!uniqueByIngredient.has(key)) {
                uniqueByIngredient.set(key, item);
            }
        });

        return Array.from(uniqueByIngredient.values());
    };

    const getUniqueIngredientLabels = (ingredientValues) => {
        const labels = Array.isArray(ingredientValues)
            ? ingredientValues.map((item) => String(item || '').trim()).filter(Boolean)
            : [];
        const uniqueByNormalizedKey = new Map();

        labels.forEach((label) => {
            const key = normalizeIngredientKey(label);
            if (!uniqueByNormalizedKey.has(key)) {
                uniqueByNormalizedKey.set(key, label);
            }
        });

        return Array.from(uniqueByNormalizedKey.values());
    };

    const ingredientRowToLabel = (ingredientRow) => {
        if (!Array.isArray(ingredientRow)) return '';

        let quantity = ingredientRow[0] ?? '';
        let unit = ingredientRow[1] ?? '';
        let name = ingredientRow[2] ?? '';

        // Handle malformed legacy rows that look like ["lemon", false, "ingredient-..."]
        if (
            typeof quantity === 'string'
            && typeof unit === 'boolean'
            && typeof name === 'string'
            && name.startsWith('ingredient-')
        ) {
            name = quantity;
            quantity = '';
            unit = '';
        }

        if (typeof unit === 'boolean') unit = '';
        if (typeof name === 'boolean') name = '';
        if (typeof name === 'string' && name.startsWith('ingredient-')) name = '';

        const quantityStr = (typeof quantity === 'number' && Number.isNaN(quantity)) ? '' : String(quantity ?? '').trim();
        const cleanQuantity = (quantityStr === 'NaN' || quantityStr === 'null' || quantityStr === 'undefined') ? '' : quantityStr;
        return [cleanQuantity, String(unit).trim(), String(name).trim()]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const getIngredientDisplayFields = (item) => {
        if (!Array.isArray(item)) {
            return { quantity: '', unit: '', name: '' };
        }

        let quantity = item[0] ?? '';
        let unit = item[1] ?? '';
        let name = item[2] ?? '';

        if (
            typeof quantity === 'string'
            && typeof unit === 'boolean'
            && typeof name === 'string'
            && name.startsWith('ingredient-')
        ) {
            name = quantity;
            quantity = '';
            unit = '';
        }

        if (typeof unit === 'boolean') unit = '';
        if (typeof name === 'boolean') name = '';
        if (typeof name === 'string' && name.startsWith('ingredient-')) name = '';

        if (!name && typeof quantity === 'string' && quantity.trim() !== '' && Number.isNaN(Number(quantity))) {
            name = quantity;
            quantity = '';
            unit = '';
        }

        return { quantity, unit, name };
    };

    const extractUncheckedIngredientLabels = (value) => {
        if (!Array.isArray(value)) return [];

        return value.flatMap((item) => {
            // Direct recipe ingredient row: [qty, unit, name, checked, id]
            if (Array.isArray(item)) {
                const isChecked = Boolean(item[3]);
                if (isChecked) {
                    return [];
                }
                const label = ingredientRowToLabel(item);
                return label ? [label] : [];
            }

            // Instruction step with nested ingredient rows.
            if (item && typeof item === 'object' && Array.isArray(item.ingredients)) {
                return item.ingredients
                    .filter((ingredientRow) => !Boolean(ingredientRow?.[3]))
                    .map(ingredientRowToLabel)
                    .filter(Boolean);
            }

            return [];
        });
    };

    const getUncheckedIngredientCount = (value) => {
        const uncheckedLabels = getUniqueIngredientLabels(extractUncheckedIngredientLabels(value));
        return uncheckedLabels.length;
    };

    const addIngredientsToCart = (value) => {
        const ingredientLabels = extractUncheckedIngredientLabels(value);

        if (!ingredientLabels.length) {
            setCartFeedback('No unchecked ingredients to add');
            return;
        }

        const normalizedIngredientLabels = getUniqueIngredientLabels(ingredientLabels);
        if (normalizedIngredientLabels.length === 0) {
            setCartFeedback('No ingredients were added');
            return;
        }

        const uncheckedIngredientLabels = normalizedIngredientLabels;

        // Ensure added items are not auto-marked checked from persisted stale status.
        uncheckedIngredientLabels.forEach((ingredientName) => {
            toggleIngredientStatus(ingredientName, false);
        });

        setIngredients((previousIngredients) => mergeIngredients(previousIngredients, uncheckedIngredientLabels));

        const requiredIngredientNames = uncheckedIngredientLabels
            .map((label) => normalizeIngredientKey(label))
            .map((label) => String(label || '').trim())
            .filter(Boolean);
        const addedCount = queueCookRequiredNames(requiredIngredientNames);

        if (addedCount > 0) {
            setCartFeedback(`Added ${addedCount} ingredient${addedCount === 1 ? '' : 's'} to cart`);
        } else {
            setCartFeedback('All ingredients are already in the cart');
        }
    };

    const getInventoryBadge = (ingredientName) => {
        const state = getCachedInventoryState(ingredientName);
        const debug = showInventoryDebug ? getCachedInventoryDebug(ingredientName) : null;

        const debugLabel = debug
            ? `dbg: lookup="${debug.comparableLookupName || debug.normalizedLookupName || debug.lookup}" match="${debug.comparableMatchedName || debug.matchedName || 'none'}" id="${debug.matchedId || 'none'}" qty="${debug.state?.quantityValue ?? 'unknown'}" expired=${Boolean(debug.state?.expired)} out=${Boolean(debug.state?.outOfStock)} unknown=${Boolean(debug.state?.unknownQuantity)}`
            : '';

        let statusLabel = 'not in stock';
        let statusClass = 'ml-10 size15 color-yellow';

        if (state.inStock) {
            statusLabel = 'in stock';
            statusClass = 'ml-10 size15 color-neogreen';
        } else if (state.expired) {
            statusLabel = 'expired - needs purchase';
        } else if (state.exists && state.unknownQuantity) {
            statusLabel = 'quantity unknown';
        } else if (state.exists && state.outOfStock) {
            statusLabel = 'out of stock';
        }

        return <span className={statusClass}>
            {statusLabel}
            <span
                className='ml-5 button size12 color-soft'
                title='toggle inventory debug details'
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setShowInventoryDebug((previous) => !previous);
                }}
            >
                🐞
            </span>
            {
                showInventoryDebug
                    ? <span className='ml-10 size10 color-soft'>{debugLabel}</span>
                    : null
            }
        </span>;
    };

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
                    .map((line) => {
                        const parsed = parseIngredientLine(line);
                        if (!parsed) {
                            return null;
                        }
                        return [parsed.quantity, parsed.unit, parsed.name, false, createListItemId('ingredient')];
                    })
                    .filter(Boolean);
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
        setEditedIngredients((toggleIngredients) ? ingredientsToEditorText(recipe.ingredients) : '');
        if (!toggleIngredients && wasIngredientsEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
            selectedNewRecipe.ingredients = (wasIngredientsEdited)
                ? parseIngredientEditorText(editedIngredients)
                : selectedNewRecipe.ingredients;
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
        const unitLabel = (unit && unit.includes('no unit label')) ? '' : (unit || '');
        const existingIngredientId = (category.toLowerCase().includes('ingredient') && dialogType === 'edit')
            ? selectedNewRecipe.ingredients?.[index]?.[4]
            : null;
        const parsedQty = typeof quantity === 'number' ? quantity : parseFloat(String(quantity ?? ''));
        const safeQuantity = Number.isFinite(parsedQty) ? parsedQty : '';
        const ingredientData = [
            safeQuantity,
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
    const sanitizeIngredientEditorText = (value) => {
        return String(value || '')
            .replace(/\b(?:true|false)\b/gi, '')
            .replace(/ingredient-[a-z0-9-]+/gi, '')
            .replace(/,+/g, ',')
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .trim();
    };

    const ingredientRowToEditorLine = (row) => {
        const { quantity, unit, name } = getIngredientDisplayFields(row);
        return `${quantity || ''} ${unit || ''} ${name || ''}`.replace(/\s+/g, ' ').trim();
    };

    const ingredientsToEditorText = (rows) => {
        if (!Array.isArray(rows)) {
            return '';
        }
        return rows
            .map(ingredientRowToEditorLine)
            .filter(Boolean)
            .join('\n');
    };

    const parseIngredientEditorText = (value) => {
        const sanitized = sanitizeIngredientEditorText(value);
        if (!sanitized) {
            return [];
        }

        let lines = sanitized
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        // Recover from legacy comma-flattened array output by splitting into separate entries.
        if (lines.length === 1 && lines[0].includes(',')) {
            lines = lines[0]
                .split(',')
                .map((token) => token.trim())
                .filter(Boolean);
        }

        return lines
            .map((line) => {
                const parsed = parseIngredientLine(line);
                if (!parsed) {
                    return null;
                }

                const parsedQuantity = Number(parsed.quantity);
                return [
                    parsed.quantity === '' || Number.isNaN(parsedQuantity) ? parsed.quantity : parsedQuantity,
                    parsed.unit,
                    parsed.name,
                    false,
                    createListItemId('ingredient')
                ];
            })
            .filter(Boolean);
    };

    const addIngredients = (newIngredients) => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        const ingredientData = parseIngredientEditorText(newIngredients);
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
    const toggleCheckbox = (category, index, ingredientIndex, options = {}) => {
        setCollapseAll(undefined);
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes?.[recipeGroupIndex]?.recipes?.[recipeIndex];
        if (!selectedNewRecipe) {
            return;
        }

        if (category.toLowerCase().includes('ingredient')) {
            const ingredientPrepared = selectedNewRecipe.ingredients[index][3] ? false : true;
            selectedNewRecipe.ingredients[index][3] = ingredientPrepared;
        } else if (category.toLowerCase().includes('instruction')) {
            const ingredientPrepared = selectedNewRecipe.instructions[index].ingredients[ingredientIndex][3] ? false : true;
            selectedNewRecipe.instructions[index].ingredients[ingredientIndex][3] = ingredientPrepared;
        }

        setRecipes(newRecipes);
        if (options.playSound !== false) {
            playSound();
        }
    }

    useEffect(() => {
        setRecipes((previousRecipes) => {
            if (!Array.isArray(previousRecipes)
                || !previousRecipes[recipeGroupIndex]
                || !previousRecipes[recipeGroupIndex].recipes
                || !previousRecipes[recipeGroupIndex].recipes[recipeIndex]) {
                return previousRecipes;
            }

            const currentRecipe = previousRecipes[recipeGroupIndex].recipes[recipeIndex];
            if (!Array.isArray(currentRecipe.ingredients) || currentRecipe.ingredients.length === 0) {
                return previousRecipes;
            }

            let changed = false;
            const updatedIngredients = currentRecipe.ingredients.map((ingredientRow) => {
                if (!Array.isArray(ingredientRow)) return ingredientRow;
                if (Boolean(ingredientRow[3])) return ingredientRow;

                const { name } = getIngredientDisplayFields(ingredientRow);
                const normalizedName = String(name || '').trim();
                if (!normalizedName) return ingredientRow;

                const inventoryState = getCachedInventoryState(normalizedName);
                const treatUnknownAsInStock = autoCheckUnknownQuantity && Boolean(inventoryState?.unknownQuantity);
                const shouldAutoCheck = Boolean(inventoryState?.inStock) || treatUnknownAsInStock;

                if (!shouldAutoCheck) {
                    return ingredientRow;
                }

                changed = true;
                const nextRow = [...ingredientRow];
                nextRow[3] = true;
                return nextRow;
            });

            if (!changed) {
                return previousRecipes;
            }

            const updatedRecipes = [...previousRecipes];
            const updatedGroupRecipes = [...updatedRecipes[recipeGroupIndex].recipes];
            updatedGroupRecipes[recipeIndex] = {
                ...currentRecipe,
                ingredients: updatedIngredients
            };
            updatedRecipes[recipeGroupIndex] = {
                ...updatedRecipes[recipeGroupIndex],
                recipes: updatedGroupRecipes
            };

            return updatedRecipes;
        });
    }, [autoCheckUnknownQuantity, recipeGroupIndex, recipeIndex, setRecipes]);
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
        const newRecipes = [...recipes];
        const selectedRecipe = newRecipes?.[recipeGroupIndex]?.recipes?.[recipeIndex];
        if (!selectedRecipe) {
            return;
        }

        if (category === 'ingredients' && subIndex === null) {
            const ingredientRow = selectedRecipe.ingredients?.[index];
            if (!Array.isArray(ingredientRow)) {
                return;
            }

            const currentQuantity = ingredientRow[0] ?? '';
            const currentUnit = ingredientRow[1] ?? '';
            const currentName = ingredientRow[2] ?? '';

            const nextQuantityInput = prompt('Edit quantity:', String(currentQuantity));
            if (nextQuantityInput === null) return;

            const nextUnitInput = prompt('Edit unit:', String(currentUnit));
            if (nextUnitInput === null) return;

            const nextNameInput = prompt('Edit ingredient name:', String(currentName));
            if (nextNameInput === null) return;

            const parsedQuantity = Number(nextQuantityInput);
            selectedRecipe.ingredients[index] = [
                Number.isNaN(parsedQuantity) ? nextQuantityInput : parsedQuantity,
                nextUnitInput,
                nextNameInput,
                Boolean(ingredientRow[3]),
                ingredientRow[4] || createListItemId('ingredient')
            ];
            setRecipes(newRecipes);
            return;
        }

        if (category === 'instructions' && subIndex === null) {
            const instruction = selectedRecipe.instructions?.[index];
            if (!instruction) {
                return;
            }

            const currentStep = typeof instruction === 'string' ? instruction : (instruction.step ?? '');
            const nextStep = prompt(`Edit step #${index + 1}:`, String(currentStep));
            if (nextStep === null) return;

            if (typeof instruction === 'string') {
                selectedRecipe.instructions[index] = {
                    id: createListItemId('instruction'),
                    step: nextStep,
                    ingredients: []
                };
            } else {
                selectedRecipe.instructions[index] = {
                    ...instruction,
                    step: nextStep
                };
            }
            setRecipes(newRecipes);
            return;
        }

        if (category === 'instructions' && subIndex !== null) {
            const ingredientRow = selectedRecipe.instructions?.[index]?.ingredients?.[subIndex];
            if (!Array.isArray(ingredientRow)) {
                return;
            }

            const currentQuantity = ingredientRow[0] ?? '';
            const currentUnit = ingredientRow[1] ?? '';
            const currentName = ingredientRow[2] ?? '';

            const nextQuantityInput = prompt('Edit quantity:', String(currentQuantity));
            if (nextQuantityInput === null) return;

            const nextUnitInput = prompt('Edit unit:', String(currentUnit));
            if (nextUnitInput === null) return;

            const nextNameInput = prompt('Edit ingredient name:', String(currentName));
            if (nextNameInput === null) return;

            const parsedQuantity = Number(nextQuantityInput);
            selectedRecipe.instructions[index].ingredients[subIndex] = [
                Number.isNaN(parsedQuantity) ? nextQuantityInput : parsedQuantity,
                nextUnitInput,
                nextNameInput,
                Boolean(ingredientRow[3]),
                ingredientRow[4] || createListItemId('ingredient')
            ];
            setRecipes(newRecipes);
            return;
        }
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
        const showIngredientCount = String(category || '').toLowerCase().includes('ingredients');
        const ingredientCount = Array.isArray(recipe?.ingredients) ? recipe.ingredients.length : 0;
        const headerTitle = showIngredientCount
            ? `${category} ${ingredientCount}`
            : category;

        return <div className='containerDetail m-5 flexContainer bg-lite centerVertical'>
            <div className='flex2Column containerDetail color-yellow size20 bg-tinted pt-10 pb-10 mr-5'>
                <CollapseToggleButton
                    title={headerTitle}
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
                    <div className='text-outline-lite size25'>
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
        const fields = getIngredientDisplayFields(item);
        let quantity = fields.quantity;
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

        let units = String(fields.unit ?? '');
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
    const getIngredientDisplay = (item, index, category) => {
        const { name } = getIngredientDisplayFields(item);

        return <div
        key={item?.[4] || `${category || 'ingredient'}-${String(item?.[2] || 'item')}-${index}`}
        className={`containerDetail m-5 flexContainer centerVertical ${(item[3]) ? 'bg-lite' : ''}`}
    >
        <div className='containerDetail size20 p-25 flex2Column'>
            <div
                title='edit ingredient'
                className=''
                onClick={() => editIngredient(category, index)}
            >
                {getItemQuantityDisplay(item)} {name} {getInventoryBadge(name)}
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
    }
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
                                <div className='flex2Column text-outline-lite size15'>{icons.plus}</div>
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
                                (Array.isArray(item?.ingredients) ? item.ingredients : []).map((ingredient, ingredientIndex) => {
                                    const ingredientFields = getIngredientDisplayFields(ingredient);
                                    return <div key={ingredient?.[4] || `${item?.id || `${category || 'instruction'}-${index}`}-ingredient-${ingredientIndex}-${String(ingredient?.[2] || 'item')}`} className={`containerDetail m-5 flexContainer centerVertical ${(ingredient[3]) ? 'bg-lite' : ''}`}>
                                    <div className='flex2Column'>
                                        <div className='containerDetail size20 p-25' /* onClick={() => editIngredient(category, ingredientIndex)} */>
                                            {getItemQuantityDisplay(ingredient)} {ingredientFields.name} {getInventoryBadge(ingredientFields.name)}
                                        </div>
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
                                })
                            }
                        </div>
                    : null
                }
            </div>
            : null

    }

    const parseIngredientQuantity = (value) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        const raw = String(value ?? '').trim();
        if (!raw) {
            return Number.NaN;
        }

        if (/^-?\d+(\.\d+)?$/.test(raw)) {
            return Number(raw);
        }

        const mixedFractionMatch = raw.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
        if (mixedFractionMatch) {
            const whole = Number(mixedFractionMatch[1]);
            const numerator = Number(mixedFractionMatch[2]);
            const denominator = Number(mixedFractionMatch[3]);
            if (denominator !== 0) {
                const sign = whole < 0 ? -1 : 1;
                return whole + sign * (numerator / denominator);
            }
        }

        const fractionMatch = raw.match(/^(-?\d+)\/(\d+)$/);
        if (fractionMatch) {
            const numerator = Number(fractionMatch[1]);
            const denominator = Number(fractionMatch[2]);
            if (denominator !== 0) {
                return numerator / denominator;
            }
        }

        const vulgarMap = {
            '¼': 1 / 4,
            '½': 1 / 2,
            '¾': 3 / 4,
            '⅓': 1 / 3,
            '⅔': 2 / 3,
            '⅛': 1 / 8,
            '⅜': 3 / 8,
            '⅝': 5 / 8,
            '⅞': 7 / 8,
            '⅕': 1 / 5,
            '⅖': 2 / 5,
            '⅗': 3 / 5,
            '⅘': 4 / 5,
            '⅙': 1 / 6,
            '⅚': 5 / 6,
            '⅐': 1 / 7,
            '⅑': 1 / 9,
            '⅒': 1 / 10
        };

        const vulgarOnlyMatch = raw.match(/^(-?\d+)?([¼½¾⅓⅔⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚⅐⅑⅒])$/);
        if (vulgarOnlyMatch) {
            const whole = vulgarOnlyMatch[1] ? Number(vulgarOnlyMatch[1]) : 0;
            const fraction = vulgarMap[vulgarOnlyMatch[2]];
            if (typeof fraction === 'number') {
                const sign = whole < 0 ? -1 : 1;
                return whole + sign * fraction;
            }
        }

        return Number.NaN;
    };

    const scaleIngredientRowQuantity = (ingredientRow, factor) => {
        if (!Array.isArray(ingredientRow)) {
            return ingredientRow;
        }

        const scaledRow = [...ingredientRow];
        const parsedQuantity = parseIngredientQuantity(scaledRow[0]);
        if (Number.isFinite(parsedQuantity)) {
            const scaledValue = Number((parsedQuantity * factor).toFixed(4));
            scaledRow[0] = Number.isInteger(scaledValue) ? Math.trunc(scaledValue) : scaledValue;
        }

        return scaledRow;
    };

    const getRowScaleKey = (ingredientRow, fallbackKey) => {
        const rowId = Array.isArray(ingredientRow) ? ingredientRow[4] : '';
        return rowId ? String(rowId) : fallbackKey;
    };

    const buildMealScaleBase = (selectedRecipe) => {
        const ingredientQuantities = {};
        const instructionIngredientQuantities = {};

        (Array.isArray(selectedRecipe?.ingredients) ? selectedRecipe.ingredients : []).forEach((ingredientRow, index) => {
            if (!Array.isArray(ingredientRow)) return;
            const key = getRowScaleKey(ingredientRow, `ingredient-${index}`);
            ingredientQuantities[key] = ingredientRow[0];
        });

        (Array.isArray(selectedRecipe?.instructions) ? selectedRecipe.instructions : []).forEach((instruction, instructionIndex) => {
            if (!instruction || typeof instruction !== 'object') return;
            const instructionKey = instruction.id || `instruction-${instructionIndex}`;
            const instructionMap = {};

            (Array.isArray(instruction.ingredients) ? instruction.ingredients : []).forEach((ingredientRow, ingredientIndex) => {
                if (!Array.isArray(ingredientRow)) return;
                const key = getRowScaleKey(ingredientRow, `instruction-${instructionIndex}-ingredient-${ingredientIndex}`);
                instructionMap[key] = ingredientRow[0];
            });

            instructionIngredientQuantities[String(instructionKey)] = instructionMap;
        });

        return {
            ingredientQuantities,
            instructionIngredientQuantities
        };
    };

    const hasMealScaleBase = (selectedRecipe) => {
        const base = selectedRecipe?.mealScaleBase;
        return Boolean(base && typeof base === 'object');
    };

    const applyScaleWithBase = (ingredientRow, factor, baseQuantity) => {
        if (!Array.isArray(ingredientRow)) {
            return ingredientRow;
        }

        const scaledRow = [...ingredientRow];
        const sourceQuantity = baseQuantity !== undefined ? baseQuantity : scaledRow[0];
        const parsedQuantity = parseIngredientQuantity(sourceQuantity);

        if (Number.isFinite(parsedQuantity)) {
            const scaledValue = Number((parsedQuantity * factor).toFixed(4));
            scaledRow[0] = Number.isInteger(scaledValue) ? Math.trunc(scaledValue) : scaledValue;
        }

        return scaledRow;
    };

    const scaleMealIngredients = (factor) => {
        setFactor(factor);
        if (!Number.isFinite(factor) || factor <= 0) {
            return;
        }

        const newRecipes = [...recipes];
        const selectedRecipe = newRecipes?.[recipeGroupIndex]?.recipes?.[recipeIndex];
        if (!selectedRecipe) {
            return;
        }

        if (!hasMealScaleBase(selectedRecipe)) {
            selectedRecipe.mealScaleBase = buildMealScaleBase(selectedRecipe);
        }

        const mealScaleBase = selectedRecipe.mealScaleBase || { ingredientQuantities: {}, instructionIngredientQuantities: {} };

        selectedRecipe.ingredients = Array.isArray(selectedRecipe.ingredients)
            ? selectedRecipe.ingredients.map((ingredientRow, ingredientIndex) => {
                const key = getRowScaleKey(ingredientRow, `ingredient-${ingredientIndex}`);
                const baseQuantity = mealScaleBase.ingredientQuantities?.[key];
                return applyScaleWithBase(ingredientRow, factor, baseQuantity);
            })
            : selectedRecipe.ingredients;

        selectedRecipe.instructions = Array.isArray(selectedRecipe.instructions)
            ? selectedRecipe.instructions.map((instruction, instructionIndex) => {
                if (!instruction || typeof instruction !== 'object') {
                    return instruction;
                }

                const instructionKey = String(instruction.id || `instruction-${instructionIndex}`);
                const instructionBaseQuantities = mealScaleBase.instructionIngredientQuantities?.[instructionKey] || {};

                return {
                    ...instruction,
                    ingredients: Array.isArray(instruction.ingredients)
                        ? instruction.ingredients.map((ingredientRow, ingredientIndex) => {
                            const key = getRowScaleKey(ingredientRow, `instruction-${instructionIndex}-ingredient-${ingredientIndex}`);
                            const baseQuantity = instructionBaseQuantities[key];
                            return applyScaleWithBase(ingredientRow, factor, baseQuantity);
                        })
                        : instruction.ingredients
                };
            })
            : selectedRecipe.instructions;

        setRecipes(newRecipes);
    };

    const recipeField = (isEdit, setEdited, edited, data, toggleEdit, category) => {
        const isValidIngredientItem = (item) => {
            if (!Array.isArray(item)) return false;
            const ingredientLabel = item[2];
            if (validate(ingredientLabel) === null) return false;
            const normalized = String(ingredientLabel).trim().toLowerCase();
            return normalized !== '' && normalized !== 'undefined';
        };
        return <div className=''>
            {
                (category.toLowerCase().includes('ingredient') && !isEdit)
                    ? <div className='containerDetail flexContainer m-5'>
                        <div className='containerDetail p-10 size15 color-yellow mr-5'>Meal Size:</div>
                        <div
                            className={`containerDetail bg-lite button p-10 size15 color-lite mr-5 ${factor === 1 ? 'bg-green' : ''} `}
                            title='Restore ingredient amounts to full meal quantities'
                            onClick={() => scaleMealIngredients(1)}
                        >
                            Full Meal
                        </div>
                        <div
                            className={`containerDetail bg-lite button p-10 size15 color-lite mr-5 ${factor === 0.5 ? 'bg-green' : ''} `}
                            title='Scale all ingredient amounts to half'
                            onClick={() => scaleMealIngredients(0.5)}
                        >
                            1/2 Meal
                        </div>
                        <div
                            className={`containerDetail bg-lite button p-10 size15 color-lite ${factor === 0.25 ? 'bg-green' : ''} `}
                            title='Scale all ingredient amounts to quarter'
                            onClick={() => scaleMealIngredients(0.25)}
                        >
                            1/4 Meal
                        </div>
                        {
                            /*
                            <div
                                className={`containerDetail bg-lite button p-10 size15 color-lite ml-5 ${autoCheckUnknownQuantity ? 'bg-green' : ''}`}
                                title='When enabled, quantity unknown ingredients are auto-checked as in stock'
                                onClick={() => setAutoCheckUnknownQuantity((previous) => !previous)}
                            >
                                Unknown Qty: {autoCheckUnknownQuantity ? 'Auto-check ON' : 'Auto-check OFF'}
                            </div>
                            */
                        }
                    </div>
                    : null
            }
                 <div className='containerDetail p-20 bg-yellow size20 color-lite contentCenter m-5 button' onClick={() => addIngredientsToCart(ifUndefinedArray(data))}>
                     <div className='size25 color-dark'>➕🛒 {getUncheckedIngredientCount(ifUndefinedArray(data))}</div>
            </div>
            {
                cartFeedback
                    ? <div className='containerDetail p-10 size15 color-neogreen contentCenter m-5'>
                        {cartFeedback}
                    </div>
                    : null
            }
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
                                    {
                                        recipe.description && String(recipe.description).trim()
                                            ? <div
                                                title='Split description into numbered instructions'
                                                className='containerDetail p-10 bg-lite button color-yellow size15 contentCenter m-5'
                                                onClick={() => {
                                                    const lines = String(recipe.description)
                                                        .split(/\n/)
                                                        .map((line) => line.trim())
                                                        .filter(Boolean);

                                                    if (lines.length === 0) return;

                                                    const confirmed = window.confirm(
                                                        `Parse ${lines.length} line${lines.length === 1 ? '' : 's'} from description into instructions?\n\nThis will replace existing instructions.`
                                                    );
                                                    if (!confirmed) return;

                                                    const newInstructions = lines.map((line) =>
                                                        ensureInstructionId({ step: line, ingredients: [] }, 'instruction')
                                                    );

                                                    const newRecipes = [...recipes];
                                                    newRecipes[recipeGroupIndex].recipes[recipeIndex].instructions = newInstructions;
                                                    setRecipes(newRecipes);
                                                }}
                                            >
                                                📋 Parse Description → Instructions
                                            </div>
                                            : null
                                    }
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