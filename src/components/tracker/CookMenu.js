import React, { useEffect, useMemo, useState } from 'react';
import { useKitchenInventory, SHOP_AISLES } from '../context/KitchenInventoryContext';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const MEASUREMENT_PATTERN = /^\s*[-*•]?\s*(?:\d+(?:\.\d+)?|\.\d+|\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])\s*(?:to\s+(?:\d+(?:\.\d+)?|\.\d+|\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞]))?\s*(?:(?:cups?|cup|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|l|liters?|pinch|pinches|dash|dashes|clove|cloves|can|cans|package|packages|pkg|slice|slices)\b\s*)?(?:of\s+)?/i;

const normalizeText = (value) => String(value || '').toLowerCase();
const normalizeIngredientCacheKey = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

const cleanDescriptionMeasurements = (value) => {
    const parts = String(value || '')
        .split(/[\n,]+/)
        .map((part) => part.trim())
        .filter(Boolean);

    const cleaned = parts
        .map((part) => part.replace(MEASUREMENT_PATTERN, '').trim())
        .filter(Boolean);

    return cleaned.join(', ');
};

const getIngredientName = (entry) => {
    if (Array.isArray(entry)) {
        return String(entry?.[2] || entry?.[0] || '').trim();
    }

    if (entry && typeof entry === 'object') {
        return String(entry?.name || '').trim();
    }

    return String(entry || '').trim();
};

const safeQtyStr = (val) => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number') return Number.isNaN(val) ? '' : String(val);
    const s = String(val).trim();
    return (s === 'NaN' || s === 'null' || s === 'undefined') ? '' : s;
};

const getIngredientDisplayText = (entry) => {
    if (Array.isArray(entry)) {
        const quantity = safeQtyStr(entry?.[0]);
        const unit = String(entry?.[1] || '').trim();
        const name = String(entry?.[2] || '').trim();
        return [quantity, unit, name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    }

    if (entry && typeof entry === 'object') {
        const quantity = safeQtyStr(entry?.quantity);
        const unit = String(entry?.unit || '').trim();
        const name = String(entry?.name || '').trim();
        return [quantity, unit, name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    }

    return String(entry || '').trim();
};

const getInstructionText = (instruction) => {
    if (typeof instruction === 'string') {
        return instruction.trim();
    }

    if (instruction && typeof instruction === 'object') {
        return String(instruction.step || instruction.description || '').trim();
    }

    return '';
};

const normalizeRecipeGroupName = (groupName) => {
    const base = String(groupName || '').replace(/\s+/g, ' ').trim() || 'Other';
    const withoutMealsPrefix = base
        .replace(/^meals?\s*&\s*/i, '')
        .replace(/^meals?\s+and\s+/i, '')
        .trim();

    return withoutMealsPrefix || base;
};

const toMenuItems = (recipeGroups = []) => {
    const flattenedItems = [];

    recipeGroups.forEach((group) => {
        const groupCategoryRaw = String(group?.category || '').trim() || 'Other';
        const groupCategory = normalizeRecipeGroupName(groupCategoryRaw);
        const recipes = Array.isArray(group?.recipes) ? group.recipes : [];

        recipes.forEach((recipe, index) => {
            const dish = String(recipe?.dish || '').trim();
            if (!dish) return;

            const topLevelIngredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
            const instructionIngredients = Array.isArray(recipe?.instructions)
                ? recipe.instructions.flatMap((instruction) => Array.isArray(instruction?.ingredients) ? instruction.ingredients : [])
                : [];

            const ingredientNames = [...topLevelIngredients, ...instructionIngredients]
                .map((entry) => getIngredientName(entry))
                .map((name) => name.replace(/\s+/g, ' ').trim())
                .filter(Boolean);

            const uniqueIngredients = Array.from(new Set(ingredientNames));

            flattenedItems.push({
                id: `${groupCategoryRaw}-${dish}-${index}`,
                dish,
                description: String(recipe?.description || '').trim(),
                groupCategory,
                ingredients: uniqueIngredients,
                recipeIngredients: topLevelIngredients,
                instructions: Array.isArray(recipe?.instructions) ? recipe.instructions : [],
            });
        });
    });

    return flattenedItems;
};

const CookMenu = ({ recipes }) => {
    const { getInventoryStateByName, queueShoppingTodosFromNames } = useKitchenInventory();
    const [shopFeedback, setShopFeedback] = useState('');
        // Handler to add missing ingredients to Shop
        const handleAddMissingToShop = (missingIngredients) => {
            if (!Array.isArray(missingIngredients) || missingIngredients.length === 0) {
                setShopFeedback('No missing ingredients to add.');
                return;
            }
            const addedCount = queueShoppingTodosFromNames(missingIngredients, SHOP_AISLES.INVENTORY_NEEDS);
            setShopFeedback(addedCount > 0
                ? `Added ${addedCount} missing item${addedCount === 1 ? '' : 's'} to Shop.`
                : 'All missing ingredients are already in Shop.');
        };
    const [selectedSection, setSelectedSection] = useState('All');
    const [showMakeableOnly, setShowMakeableOnly] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);
    const [ingredientsCollapsedById, setIngredientsCollapsedById] = useState({});
    const [openRecipeId, setOpenRecipeId] = useState(null);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 250);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const menuItems = useMemo(() => toMenuItems(recipes), [recipes]);

    const recipeGroupOptions = useMemo(() => {
        const uniqueGroups = Array.from(new Set(
            (Array.isArray(recipes) ? recipes : [])
                .map((group) => normalizeRecipeGroupName(group?.category))
                .filter(Boolean)
        ));

        return uniqueGroups.sort((left, right) => left.localeCompare(right));
    }, [recipes]);

    const sectionFilteredItems = useMemo(() => {
        if (selectedSection === 'All') {
            return menuItems;
        }

        return menuItems.filter((item) => item.groupCategory === selectedSection);
    }, [menuItems, selectedSection]);

    const searchFilteredItems = useMemo(() => {
        const query = normalizeText(debouncedSearchQuery).trim();
        if (!query) return sectionFilteredItems;

        return sectionFilteredItems.filter((item) => {
            const dishText = normalizeText(item.dish);
            const descriptionText = normalizeText(item.description);
            const ingredientText = normalizeText(
                item.ingredients.join(' ') + ' ' + item.recipeIngredients.map(getIngredientDisplayText).join(' ')
            );
            const instructionText = normalizeText(item.instructions.map(getInstructionText).join(' '));

            return (
                dishText.includes(query) ||
                descriptionText.includes(query) ||
                ingredientText.includes(query) ||
                instructionText.includes(query)
            );
        });
    }, [debouncedSearchQuery, sectionFilteredItems]);

    const menuWithAvailability = useMemo(() => {
        const availabilityCache = new Map();

        const isIngredientInStock = (ingredientName) => {
            const cacheKey = normalizeIngredientCacheKey(ingredientName);
            if (!cacheKey) {
                return false;
            }

            if (availabilityCache.has(cacheKey)) {
                return availabilityCache.get(cacheKey);
            }

            const state = getInventoryStateByName(ingredientName);
            const inStock = Boolean(state?.inStock);
            availabilityCache.set(cacheKey, inStock);
            return inStock;
        };

        return searchFilteredItems.map((item) => {
            const ingredientStatus = item.ingredients.map((ingredientName) => {
                return {
                    name: ingredientName,
                    inStock: isIngredientInStock(ingredientName),
                };
            });

            const missingIngredients = ingredientStatus
                .filter((ingredient) => !ingredient.inStock)
                .map((ingredient) => ingredient.name);

            const requiredCount = ingredientStatus.length;
            const availableCount = requiredCount - missingIngredients.length;
            const isMakeable = requiredCount > 0 && missingIngredients.length === 0;

            return {
                ...item,
                requiredCount,
                availableCount,
                isMakeable,
                missingIngredients,
            };
        });
    }, [searchFilteredItems, getInventoryStateByName]);

    const filteredItems = useMemo(() => {
        let visible = [...menuWithAvailability];

        if (showMakeableOnly) {
            visible = visible.filter((item) => item.isMakeable);
        }

        return visible.sort((left, right) => {
            if (left.isMakeable !== right.isMakeable) {
                return left.isMakeable ? -1 : 1;
            }

            return left.dish.localeCompare(right.dish);
        });
    }, [menuWithAvailability, showMakeableOnly]);

    const summary = useMemo(() => {
        const total = searchFilteredItems.length;
        const makeable = menuWithAvailability.filter((item) => item.isMakeable).length;
        return { total, makeable };
    }, [menuWithAvailability, searchFilteredItems]);

    const isIngredientsCollapsed = (itemId) => ingredientsCollapsedById[itemId] !== false;

    const setIngredientsCollapse = (itemId) => (nextValueOrUpdater) => {
        setIngredientsCollapsedById((previousState) => {
            const currentValue = previousState[itemId] !== false;
            const nextValue = typeof nextValueOrUpdater === 'function'
                ? nextValueOrUpdater(currentValue)
                : nextValueOrUpdater;
            return {
                ...previousState,
                [itemId]: Boolean(nextValue)
            };
        });
    };
    
    const addToShopButton = (item) => {
        if (item.missingIngredients.length > 0) {
            return (
                <div
                    className='containerDetail button bg-green brdr-yellow color-yellow size12 mt--5 mb--5'
                    onClick={() => handleAddMissingToShop(item.missingIngredients)}
                >
                    Add Missing to Shop
                </div>
            );
        }
        return null;
    };

    const menuIngredientsHeader = (item) => {
        if (item.missingIngredients.length > 0) {
            return (
                <div className='size12 color-red flexContainer'>
                    <div className='flex2Column contentLeft'>
                        Missing {item.missingIngredients.length} ingredient{item.missingIngredients.length > 1 ? 's' : ''}
                    </div>
                    <div className='flexColumn contentRight pr-20'>
                        {addToShopButton(item)}
                    </div>
                </div>
            );
        }
        return <div className='size12 color-neogreen'>All required ingredients are in stock</div>;
    };

    return (
        <div className='containerDetail bg-lite m-5 color-lite contentLeft'>
            <div className='containerDetail bg-lite color-lite p-10'>
                <CollapseToggleButton
                    component={<div className='size25 color-yellow'>🍽️ Menu<span className='copyright ml-5 color-yellow'>
                        {`${summary.makeable}/${summary.total}`}
                    </span></div>}
                    isCollapsed={isMenuCollapsed}
                    setCollapse={setIsMenuCollapsed}
                    align='left'
                />
            </div>
            {
                !isMenuCollapsed 
                ? <div>
                    <div className='containerDetail mb-5'>
                        <label className='containerDetail bg-lite color-yellow size20 flexContainer'>
                            <select
                                className='containerDetail flex2Column p-10 bg-tintedMedium color-lite size20 width--5 mb-5 mt-5'
                                value={selectedSection}
                                onChange={(event) => setSelectedSection(event.target.value)}
                            >
                                <option value='All'>All Groups</option>
                                {
                                    recipeGroupOptions.map((groupName) => (
                                        <option key={groupName} value={groupName}>{groupName}</option>
                                    ))
                                }
                            </select>
                            <div
                                className={`containerDetail flex2Column ml-5 button mt-5 mb-5 pt-12 pl-10 ${showMakeableOnly ? 'bg-green color-lite' : 'bg-lite color-lite'}`}
                                onClick={() => setShowMakeableOnly((prev) => !prev)}
                            >
                                {showMakeableOnly ? '✅ Makeable Only' : '☑️ Makeable Only'}
                            </div>
                        </label>
                    </div>
                    <div className='containerDetail bg-lite p-20 color-yellow size20 mb-5'>
                            <label className='flexContainer'>
                            <div className='flexColumn'>
                                Search:
                            </div>
                            <input
                                type='text'
                                className='containerDetail p-10 ml-5 bg-tintedMedium color-lite flex2Column'
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder='Recipe, ingredient, or instruction'
                            />
                        </label>
                    </div>
                </div>
                : null
            }
            {
                !isMenuCollapsed
                ? filteredItems.length === 0
                    ? <div className='containerDetail bg-lite p-15  size15'>
                        No menu items match this filter.
                    </div>
                    : <div className='containerDetail ht-400' style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {
                            filteredItems.map((item) => {
                                const cleanedDescription = cleanDescriptionMeasurements(item.description);

                                return <div key={item.id} className='containerDetail bg-veryLite width-100-percent'>
                                    <div className='containerDetail p-10' style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                        <div>
                                            <div className='size20 color-yellow'>{item.dish}</div>
                                            <div className='size12 color-mediumDark'>{item.groupCategory}</div>
                                        </div>
                                        {
                                            item.isMakeable
                                                ? <button
                                                    type='button'
                                                    className='containerDetail button bg-green color-lite p-10 size12'
                                                    onClick={() => setOpenRecipeId((currentValue) => currentValue === item.id ? null : item.id)}
                                                >
                                                    {openRecipeId === item.id ? 'Hide Recipe' : 'Make Now'}
                                                </button>
                                                : <div className='size12 color-red'>
                                                    {`Missing ${item.missingIngredients.length}`}
                                                </div>
                                        }
                                    </div>
                                    {
                                        openRecipeId === item.id
                                            ? <div className='containerDetail bg-lite p-10 mt-5 mb-5 color-lite'>
                                                {
                                                    item.recipeIngredients.length > 0
                                                        ? <>
                                                            <div className='size15 color-yellow mb-5'>Recipe Ingredients</div>
                                                            <div className='size12 ml-5 mb-10'>
                                                                {
                                                                    item.recipeIngredients.map((entry, ingredientIndex) => {
                                                                        const ingredientLabel = getIngredientDisplayText(entry);
                                                                        return ingredientLabel
                                                                            ? <div key={`${item.id}-recipe-ingredient-${ingredientIndex}`} className='color-lite'>
                                                                                {ingredientLabel}
                                                                            </div>
                                                                            : null;
                                                                    })
                                                                }
                                                            </div>
                                                        </>
                                                        : null
                                                }

                                                {
                                                    item.instructions.length > 0
                                                        ? <>
                                                            <div className='size15 color-yellow mb-5'>Instructions</div>
                                                            <ol className='size12 '>
                                                                {
                                                                    item.instructions.map((instruction, instructionIndex) => {
                                                                        const instructionText = getInstructionText(instruction);
                                                                        return instructionText
                                                                            ? <li key={`${item.id}-instruction-${instructionIndex}`} className='color-lite mb-5 ml--20'>
                                                                                {instructionText}
                                                                            </li>
                                                                            : null;
                                                                    })
                                                                }
                                                            </ol>
                                                        </>
                                                        : <div className='size12 color-mediumDark'>{`${(cleanedDescription) ? cleanedDescription : 'No instructions available.'}`}</div>
                                                }
                                            </div>
                                            : null
                                    }
                                    <div className='containerDetail size15 mt-5 mb-5 color-lite ht-100'>
                                        {
                                            cleanedDescription
                                                ? cleanedDescription.split(', ').map((line, index) => <div key={index} className='containerDetail size12 m-5 color-lite bg-lite'>
                                                    {line}
                                                </div>)
                                                : null
                                        }
                                    </div>

                                    <div className='size13 mt-5 ml-10 color-mediumDark'>
                                        {`Ingredients in stock: ${item.availableCount}/${item.requiredCount}`}
                                    </div>
                                    <div className='containerDetail bg-lite mt-5 mb-5'>
                                        <div className='containerDetail bg-lite'>
                                            <CollapseToggleButton
                                                component={menuIngredientsHeader(item)}
                                                isCollapsed={isIngredientsCollapsed(item.id)}
                                                setCollapse={setIngredientsCollapse(item.id)}
                                                align='left'
                                            />
                                        </div>

                                        {
                                            !isIngredientsCollapsed(item.id)
                                                ? <>
                                                    <ul className='size12'>
                                                        {
                                                            item.ingredients.map((ingredientName) => {
                                                                const isMissing = item.missingIngredients.includes(ingredientName);
                                                                return <li key={`${item.id}-${ingredientName}`} className={isMissing ? 'color-red' : 'color-lite'}>
                                                                    {ingredientName}
                                                                </li>;
                                                            })
                                                        }
                                                    </ul>
                                                    {shopFeedback && <div className='size12 color-green mt-5'>{shopFeedback}</div>}
                                                </>
                                                : null
                                        }
                                    </div>
                                </div>;
                            })
                        }
                    </div>
                    : null
            }
        </div>
    );
};

export default React.memo(CookMenu);
