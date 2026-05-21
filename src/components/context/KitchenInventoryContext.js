import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import initializeData from '../utils/InitializeData';

export const KitchenInventoryContext = createContext();

export const SHOP_AISLES = {
    INVENTORY_NEEDS: 'Inventory Needs',
    COOK_REQUIRED: 'Cook Required',
    RECIPES_LEGACY: 'Recipes',
};

export const KITCHEN_INVENTORY_MIGRATION_NOTICE_KEY = 'kitchenInventoryMigrationNotice';

let inventoryIdCounter = 0;

const createInventoryId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `inventory-${crypto.randomUUID()}`;
    }

    inventoryIdCounter += 1;
    return `inventory-${Date.now().toString(36)}-${inventoryIdCounter.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizeInventoryIds = (items) => {
    if (!Array.isArray(items)) return [];

    const usedIds = new Set();
    return items.map((item) => {
        let nextId = String(item?.id || '').trim();

        if (!nextId || usedIds.has(nextId)) {
            do {
                nextId = createInventoryId();
            } while (usedIds.has(nextId));
        }

        usedIds.add(nextId);
        return {
            ...item,
            id: nextId,
        };
    });
};

export const normalizeInventoryName = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

const tokenizeInventoryName = (value) => {
    return normalizeInventoryName(value)
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);
};

const getComparableIngredientKey = (value) => {
    const unitAliases = {
        tsp: 'teaspoon',
        tsps: 'teaspoon',
        tbsp: 'tablespoon',
        tbsps: 'tablespoon',
        oz: 'ounce',
        lb: 'pound',
        lbs: 'pound',
        g: 'gram',
        kg: 'kilogram',
        ml: 'milliliter',
        l: 'liter',
    };

    const unitLabels = new Set([
        'teaspoon', 'teaspoons', 'tablespoon', 'tablespoons', 'cup', 'cups',
        'milliliter', 'milliliters', 'liter', 'liters', 'fluid', 'ounce', 'ounces',
        'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons', 'gram', 'grams',
        'kilogram', 'kilograms', 'pound', 'pounds', 'pinch', 'pinches', 'bunch',
        'bunches', 'clove', 'cloves', 'stalk', 'stalks', 'leaf', 'leaves', 'handful',
        'handfuls', 'unit', 'units'
    ]);

    const descriptorWords = new Set([
        'and', 'or', 'coarse', 'ground', 'fresh', 'freshly', 'finely', 'thinly',
        'chopped', 'minced', 'diced', 'sliced', 'optional', 'to', 'taste', 'for'
    ]);

    const tokens = tokenizeInventoryName(value)
        .map((token) => unitAliases[token] || token)
        .filter((token) => {
            const isNumberToken = /^\d*\.?\d+$/.test(token) || /^\d+\/\d+$/.test(token);
            if (isNumberToken) return false;
            if (unitLabels.has(token)) return false;
            if (descriptorWords.has(token)) return false;
            return true;
        });

    return tokens.join(' ').trim();
};

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const containsWholeTerm = (haystack, needle) => {
    const normalizedHaystack = normalizeInventoryName(haystack);
    const normalizedNeedle = normalizeInventoryName(needle);
    if (!normalizedHaystack || !normalizedNeedle) return false;

    const pattern = new RegExp(`(^|\\s)${escapeRegex(normalizedNeedle)}(\\s|$)`, 'i');
    return pattern.test(normalizedHaystack);
};

const singularizeToken = (token) => {
    const value = String(token || '').trim().toLowerCase();
    if (!value) return '';
    if (value.length <= 2) return value;

    if (value.endsWith('ies') && value.length > 3) {
        return `${value.slice(0, -3)}y`;
    }

    // tomatoes -> tomato, potatoes -> potato
    if (value.endsWith('oes') && value.length > 3) {
        return value.slice(0, -2);
    }

    // classes -> class, dishes -> dish, boxes -> box
    if (/(ses|xes|zes|ches|shes)$/.test(value) && value.length > 4) {
        return value.slice(0, -2);
    }

    // avocados -> avocado, onions -> onion
    if (value.endsWith('s') && !value.endsWith('ss') && value.length > 3) {
        return value.slice(0, -1);
    }

    return value;
};

const normalizeComparableNameForMatch = (value) => {
    return tokenizeInventoryName(value)
        .map((token) => singularizeToken(token))
        .filter(Boolean)
        .join(' ')
        .trim();
};

const normalizeDisplayName = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const parseJsonArrayFromStorage = (key) => {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

export const getShopTodosFromStorage = () => {
    const currentTodos = initializeData('vueTodos', []);
    if (Array.isArray(currentTodos) && currentTodos.length > 0) {
        return currentTodos;
    }

    const legacySavedTodos = initializeData('vueTodosSaved', []);
    if (Array.isArray(legacySavedTodos) && legacySavedTodos.length > 0) {
        saveShopTodosToStorage(legacySavedTodos);
        return legacySavedTodos;
    }

    return Array.isArray(currentTodos) ? currentTodos : [];
};

export const saveShopTodosToStorage = (todos = []) => {
    const safeTodos = Array.isArray(todos) ? todos : [];
    localStorage.setItem('vueTodos', JSON.stringify(safeTodos));
    localStorage.setItem('vueTodosSaved', JSON.stringify(safeTodos));
};

const parseQuantityValue = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized || normalized === 'n/a') {
        return {
            quantityValue: null,
            unknownQuantity: true,
        };
    }
    if (normalized === 'infinity' || normalized === '∞') {
        return {
            quantityValue: Number.POSITIVE_INFINITY,
            unknownQuantity: false,
        };
    }

    const match = normalized.match(/\d+(\.\d+)?/);
    if (!match) {
        return {
            quantityValue: null,
            unknownQuantity: true,
        };
    }

    const parsed = Number(match[0]);
    return {
        quantityValue: Number.isFinite(parsed) ? parsed : null,
        unknownQuantity: !Number.isFinite(parsed),
    };
};

const isExpiredDate = (dateString) => {
    if (!dateString) return false;
    const parsed = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed.getTime() < today.getTime();
};

const getInventoryStateFromItem = (item) => {
    const { quantityValue, unknownQuantity } = parseQuantityValue(item?.quantity);
    const expired = isExpiredDate(item?.expirationDate);
    const outOfStock = Boolean(item) && !unknownQuantity && quantityValue !== Number.POSITIVE_INFINITY && Number(quantityValue) <= 0;
    const inStock = Boolean(item) && !unknownQuantity && quantityValue !== null && (quantityValue === Number.POSITIVE_INFINITY || Number(quantityValue) > 0);

    return {
        exists: Boolean(item),
        inStock,
        expired,
        outOfStock,
        unknownQuantity,
        quantityValue,
        item: item || null,
    };
};

const scoreInventoryState = (state) => {
    if (!state.exists) return 0;
    if (state.inStock) return 5;
    if (state.exists && state.outOfStock) return 4;
    if (state.exists && state.expired) return 3;
    if (state.exists && state.unknownQuantity) return 2;
    return 1;
};

const scoreInventoryNameMatch = (itemName, lookupName) => {
    const normalizedItemName = normalizeInventoryName(itemName);
    const normalizedLookupName = normalizeInventoryName(lookupName);
    const comparableItemName = getComparableIngredientKey(itemName) || normalizedItemName;
    const comparableLookupName = getComparableIngredientKey(lookupName) || normalizedLookupName;
    const comparableItemNameSingular = normalizeComparableNameForMatch(comparableItemName);
    const comparableLookupNameSingular = normalizeComparableNameForMatch(comparableLookupName);

    if (!comparableItemName || !comparableLookupName) return 0;
    if (comparableItemName === comparableLookupName) return 100;
    if (comparableItemNameSingular && comparableLookupNameSingular && comparableItemNameSingular === comparableLookupNameSingular) return 99;

    // Prefer direct contains-style phrase matches for cases like
    // "1 teaspoon garlic" (cook) vs "garlic" (inventory).
    if (containsWholeTerm(comparableLookupName, comparableItemName)) return 95;
    if (containsWholeTerm(comparableItemName, comparableLookupName)) return 90;
    if (containsWholeTerm(comparableLookupNameSingular, comparableItemNameSingular)) return 89;
    if (containsWholeTerm(comparableItemNameSingular, comparableLookupNameSingular)) return 88;

    const itemTokens = tokenizeInventoryName(comparableItemNameSingular || comparableItemName);
    const lookupTokens = tokenizeInventoryName(comparableLookupNameSingular || comparableLookupName);
    if (itemTokens.length === 0 || lookupTokens.length === 0) return 0;

    const lookupTokenSet = new Set(lookupTokens);
    const overlapCount = itemTokens.reduce((total, token) => total + (lookupTokenSet.has(token) ? 1 : 0), 0);
    if (overlapCount === 0) return 0;

    // Single-token names (e.g., garlic) can match descriptive variants (e.g., garlic minced).
    if (itemTokens.length === 1 || lookupTokens.length === 1) {
        return 60 + overlapCount;
    }

    // For multi-token labels, require stronger overlap to avoid loose false positives.
    return overlapCount >= 2 ? 50 + overlapCount : 0;
};

const selectBestInventoryItemByName = (inventoryItems, lookupName) => {
    if (!Array.isArray(inventoryItems) || !lookupName) return null;

    let bestItem = null;
    let bestNameScore = 0;
    let bestStateScore = 0;
    let bestCombinedScore = 0;

    inventoryItems.forEach((item) => {
        const nameScore = scoreInventoryNameMatch(item?.name, lookupName);
        if (nameScore <= 0) return;

        const stateScore = scoreInventoryState(getInventoryStateFromItem(item));
        const combinedScore = (nameScore * 10) + (stateScore * 15);
        if (
            bestItem === null
            || combinedScore > bestCombinedScore
            || (combinedScore === bestCombinedScore && nameScore > bestNameScore)
            || (combinedScore === bestCombinedScore && nameScore === bestNameScore && stateScore > bestStateScore)
        ) {
            bestItem = item;
            bestNameScore = nameScore;
            bestStateScore = stateScore;
            bestCombinedScore = combinedScore;
        }
    });

    return bestItem;
};

const hasValue = (value) => String(value ?? '').trim() !== '';

const pickPreferredValue = (items, fieldName) => {
    for (let index = 0; index < items.length; index += 1) {
        const value = items[index]?.[fieldName];
        if (hasValue(value)) {
            return value;
        }
    }
    return '';
};

const dedupeAndMergeInventoryByName = (inventoryItems) => {
    if (!Array.isArray(inventoryItems)) return [];

    const groupsByName = new Map();
    inventoryItems.forEach((item) => {
        const normalizedName = normalizeInventoryName(item?.name);
        if (!normalizedName) return;

        if (!groupsByName.has(normalizedName)) {
            groupsByName.set(normalizedName, []);
        }
        groupsByName.get(normalizedName).push(item);
    });

    const mergedItems = [];
    groupsByName.forEach((groupItems, normalizedName) => {
        if (!Array.isArray(groupItems) || groupItems.length === 0) {
            return;
        }

        const sortedByQuality = [...groupItems].sort((left, right) => {
            const leftScore = scoreInventoryState(getInventoryStateFromItem(left));
            const rightScore = scoreInventoryState(getInventoryStateFromItem(right));
            if (leftScore !== rightScore) {
                return rightScore - leftScore;
            }

            const leftUpdated = new Date(left?.updatedAt || left?.createdAt || 0).getTime();
            const rightUpdated = new Date(right?.updatedAt || right?.createdAt || 0).getTime();
            return rightUpdated - leftUpdated;
        });

        const bestItem = selectBestInventoryItemByName(sortedByQuality, normalizedName) || sortedByQuality[0];
        mergedItems.push({
            ...bestItem,
            name: pickPreferredValue(sortedByQuality, 'name') || bestItem?.name || normalizedName,
            quantity: pickPreferredValue(sortedByQuality, 'quantity') || bestItem?.quantity || '',
            expirationDate: pickPreferredValue(sortedByQuality, 'expirationDate') || bestItem?.expirationDate || '',
            purchaseDate: pickPreferredValue(sortedByQuality, 'purchaseDate') || bestItem?.purchaseDate || '',
            nutritionInfo: pickPreferredValue(sortedByQuality, 'nutritionInfo') || bestItem?.nutritionInfo || '',
            category: pickPreferredValue(sortedByQuality, 'category') || bestItem?.category || 'pantry',
        });
    });

    return sanitizeInventoryIds(mergedItems);
};

export const getInventoryStateByNameFromStorage = (name) => {
    const normalizedName = normalizeInventoryName(name);
    if (!normalizedName) {
        return getInventoryStateFromItem(null);
    }

    const inventory = initializeData('kitchenInventory', []);
    const found = selectBestInventoryItemByName(inventory, name);

    return getInventoryStateFromItem(found);
};

export const getInventoryMatchDebugByNameFromStorage = (name) => {
    const normalizedName = normalizeInventoryName(name);
    const comparableLookupName = getComparableIngredientKey(name) || normalizedName;
    const inventory = initializeData('kitchenInventory', []);
    const found = selectBestInventoryItemByName(inventory, name);
    const state = getInventoryStateFromItem(found);

    return {
        lookup: String(name || ''),
        normalizedLookupName: normalizedName,
        comparableLookupName,
        matchedId: found?.id || null,
        matchedName: found?.name || null,
        comparableMatchedName: found ? (getComparableIngredientKey(found?.name) || normalizeInventoryName(found?.name)) : null,
        state,
    };
};

export const getShopItemNamesFromStorage = () => {
    return parseJsonArrayFromStorage('vueTodos')
        .map((item) => normalizeDisplayName(item?.title || item?.name || ''))
        .filter(Boolean);
};

export const getCookIngredientNamesFromStorage = () => {
    const directCookIngredients = parseJsonArrayFromStorage('ingredients')
        .map((item) => normalizeDisplayName(item))
        .filter(Boolean);

    if (directCookIngredients.length > 0) {
        return directCookIngredients;
    }

    const recipeTracking = parseJsonArrayFromStorage('recipeTracking');
    const extracted = [];

    recipeTracking.forEach((group) => {
        const recipes = Array.isArray(group?.recipes) ? group.recipes : [];
        recipes.forEach((recipe) => {
            const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
            ingredients.forEach((entry) => {
                if (Array.isArray(entry)) {
                    const name = normalizeDisplayName(entry?.[2] || entry?.[0] || '');
                    if (name) extracted.push(name);
                } else {
                    const label = normalizeDisplayName(entry);
                    if (label) extracted.push(label);
                }
            });

            const instructions = Array.isArray(recipe?.instructions) ? recipe.instructions : [];
            instructions.forEach((instruction) => {
                const instructionIngredients = Array.isArray(instruction?.ingredients) ? instruction.ingredients : [];
                instructionIngredients.forEach((entry) => {
                    if (Array.isArray(entry)) {
                        const name = normalizeDisplayName(entry?.[2] || entry?.[0] || '');
                        if (name) extracted.push(name);
                    } else {
                        const label = normalizeDisplayName(entry);
                        if (label) extracted.push(label);
                    }
                });
            });
        });
    });

    return extracted;
};

export const getUnifiedSourceNamesFromStorage = () => {
    const merged = [...getShopItemNamesFromStorage(), ...getCookIngredientNamesFromStorage()]
        .map((name) => normalizeDisplayName(name))
        .filter(Boolean);

    const uniqueByNormalized = new Map();
    merged.forEach((name) => {
        const normalized = normalizeInventoryName(name);
        if (normalized && !uniqueByNormalized.has(normalized)) {
            uniqueByNormalized.set(normalized, name);
        }
    });

    return Array.from(uniqueByNormalized.values());
};

export const queueShoppingTodosFromNames = (names = [], aisle = SHOP_AISLES.INVENTORY_NEEDS) => {
    if (!Array.isArray(names) || names.length === 0) return 0;

    const uniqueByNormalized = new Map();
    names
        .map((name) => String(name || '').trim())
        .filter(Boolean)
        .forEach((name) => {
            const normalized = name.toLowerCase();
            if (!uniqueByNormalized.has(normalized)) {
                uniqueByNormalized.set(normalized, name);
            }
        });

    const uniqueNames = Array.from(uniqueByNormalized.values());
    if (uniqueNames.length === 0) return 0;

    const existingTodos = getShopTodosFromStorage();
    const safeTodos = Array.isArray(existingTodos) ? existingTodos : [];
    const existingTitles = new Set(
        safeTodos
            .map((todo) => normalizeInventoryName(todo?.title || todo?.name))
            .filter(Boolean)
    );

    const nowIso = new Date().toISOString();
    const additions = uniqueNames
        .filter((name) => !existingTitles.has(name.toLowerCase()))
        .map((name) => ({
            title: name,
            aisle,
            price: '0.00',
            quantity: 1,
            tax: false,
            cart: false,
            select: true,
            lastPurchase: nowIso,
            days: 1,
            color: '#b8e522',
            display: true,
        }));

    if (additions.length === 0) return 0;

    const updatedTodos = [...safeTodos, ...additions];
    saveShopTodosToStorage(updatedTodos);
    return additions.length;
};

export const queueCookRequiredNames = (names = []) => {
    return queueShoppingTodosFromNames(names, SHOP_AISLES.COOK_REQUIRED);
};

export const queueInventoryNeedsFromItems = (items = []) => {
    const namesToPurchase = getNeedsPurchaseNamesFromInventory(items);
    if (namesToPurchase.length === 0) return 0;
    return queueShoppingTodosFromNames(namesToPurchase, SHOP_AISLES.INVENTORY_NEEDS);
};

const getNeedsPurchaseNamesFromInventory = (items = []) => {
    if (!Array.isArray(items)) return [];

    return items
        .filter((item) => {
            const state = getInventoryStateFromItem(item);
            return state.exists && (state.expired || state.outOfStock);
        })
        .map((item) => String(item?.name || '').trim())
        .filter(Boolean);
};

const KitchenInventoryProvider = ({ children }) => {
    const [inventoryItems, setInventoryItems] = useState([]);

    const getInventoryStateByName = useCallback((name) => {
        const found = selectBestInventoryItemByName(inventoryItems, name);
        return getInventoryStateFromItem(found);
    }, [inventoryItems]);

    useEffect(() => {
        const savedInventory = initializeData('kitchenInventory', []);
        if (Array.isArray(savedInventory)) {
            const sanitized = sanitizeInventoryIds(savedInventory);
            const merged = dedupeAndMergeInventoryByName(sanitized);

            const summarize = (items) => (Array.isArray(items) ? items.map((item) => ({
                id: String(item?.id || ''),
                name: String(item?.name || ''),
                quantity: String(item?.quantity || ''),
                expirationDate: String(item?.expirationDate || ''),
                purchaseDate: String(item?.purchaseDate || ''),
                nutritionInfo: String(item?.nutritionInfo || ''),
                category: String(item?.category || ''),
            })) : []);

            const didMigrate = JSON.stringify(summarize(savedInventory)) !== JSON.stringify(summarize(merged));
            if (didMigrate) {
                localStorage.setItem(KITCHEN_INVENTORY_MIGRATION_NOTICE_KEY, JSON.stringify({
                    at: new Date().toISOString(),
                    previousCount: savedInventory.length,
                    currentCount: merged.length,
                }));
            }

            setInventoryItems(merged);
        } else {
            setInventoryItems([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('kitchenInventory', JSON.stringify(inventoryItems));
        } catch (error) {
            console.error('Error saving kitchen inventory state:', error);
        }

        queueInventoryNeedsFromItems(inventoryItems);
    }, [inventoryItems]);

    const addInventoryItem = (item) => {
        const now = new Date().toISOString();
        const newItem = {
            id: item?.id || createInventoryId(),
            name: item?.name || '',
            purchaseDate: item?.purchaseDate || '',
            expirationDate: item?.expirationDate || '',
            nutritionInfo: item?.nutritionInfo || '',
            quantity: item?.quantity || '',
            category: item?.category || '',
            createdAt: item?.createdAt || now,
            updatedAt: now,
        };

        setInventoryItems((prev) => [...prev, newItem]);
        return newItem;
    };

    const updateInventoryItem = (itemId, updates) => {
        setInventoryItems((prev) => prev.map((item) => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }));
    };

    const removeInventoryItem = (itemId) => {
        setInventoryItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const clearInventoryItems = () => {
        setInventoryItems([]);
    };

    const upsertInventoryFromIngredients = (ingredientNames = []) => {
        if (!Array.isArray(ingredientNames) || !ingredientNames.length) return;

        setInventoryItems((prev) => {
            const existingNames = new Set(prev.map((item) => String(item.name || '').trim().toLowerCase()));
            const additions = ingredientNames
                .map((name) => String(name || '').trim())
                .filter((name) => name !== '')
                .filter((name) => !existingNames.has(name.toLowerCase()))
                .map((name) => ({
                    id: createInventoryId(),
                    name,
                    purchaseDate: '',
                    expirationDate: '',
                    nutritionInfo: '',
                    quantity: '',
                    category: 'pantry',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }));

            return [...prev, ...additions];
        });
    };

    const importSourceNamesIntoInventory = (names = []) => {
        if (!Array.isArray(names) || names.length === 0) return 0;

        let addedCount = 0;
        setInventoryItems((prev) => {
            const existingNames = new Set(prev.map((item) => normalizeInventoryName(item?.name)));
            const additions = names
                .map((name) => normalizeDisplayName(name))
                .filter(Boolean)
                .filter((name) => !existingNames.has(normalizeInventoryName(name)))
                .map((name) => ({
                    id: createInventoryId(),
                    name,
                    purchaseDate: '',
                    expirationDate: '',
                    nutritionInfo: '',
                    quantity: '',
                    category: 'pantry',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }));

            addedCount = additions.length;
            return [...prev, ...additions];
        });

        return addedCount;
    };

    return (
        <KitchenInventoryContext.Provider value={{
            inventoryItems,
            addInventoryItem,
            updateInventoryItem,
            removeInventoryItem,
            clearInventoryItems,
            upsertInventoryFromIngredients,
            getInventoryStateByName,
            queueShoppingTodosFromNames,
            importSourceNamesIntoInventory,
        }}>
            {children}
        </KitchenInventoryContext.Provider>
    );
};

export const useKitchenInventory = () => useContext(KitchenInventoryContext);

export default KitchenInventoryProvider;
