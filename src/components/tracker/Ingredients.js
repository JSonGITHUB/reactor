import React, { useMemo, useState } from 'react';
import KitchenInventoryProvider, {
    KITCHEN_INVENTORY_MIGRATION_NOTICE_KEY,
    getCookIngredientNamesFromStorage,
    getShopItemNamesFromStorage,
    useKitchenInventory,
} from '../context/KitchenInventoryContext';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const CATEGORY_OPTIONS = [
    'refrigerator',
    'freezer',
    'spice rack',
    'pantry',
    'cabinet',
    'counter',
    'other'
];

const emptyForm = {
    name: '',
    purchaseDate: '',
    expirationDate: '',
    lifespanDays: '',
    nutritionInfo: '',
    quantity: '',
    category: 'pantry'
};

const formatDateToMDY = (value) => {
    if (!value) return 'N/A';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const year = `${date.getFullYear()}`;
    return `${month}-${day}-${year}`;
};

const parseDateOnly = (value) => {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateInput = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const buildExpirationFromLifespan = (lifespanValue, purchaseDateValue) => {
    const lifespanDays = Number(String(lifespanValue || '').trim());
    if (!Number.isFinite(lifespanDays) || lifespanDays <= 0) return '';

    const purchaseDate = parseDateOnly(purchaseDateValue) || new Date();
    purchaseDate.setHours(0, 0, 0, 0);
    const expiration = new Date(purchaseDate);
    expiration.setDate(expiration.getDate() + Math.floor(lifespanDays));

    return formatDateInput(expiration);
};

const deriveLifespanFromDates = (purchaseDateValue, expirationDateValue) => {
    const purchaseDate = parseDateOnly(purchaseDateValue);
    const expirationDate = parseDateOnly(expirationDateValue);
    if (!purchaseDate || !expirationDate) return '';

    const days = Math.ceil((expirationDate.getTime() - purchaseDate.getTime()) / (24 * 60 * 60 * 1000));
    return days > 0 ? String(days) : '';
};

const cleanIngredientLabel = (value) => {
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
        clove: 'clove',
        cloves: 'clove',
        sprig: 'sprig',
        sprigs: 'sprig',
        pinch: 'pinch',
        pinches: 'pinch',
        bunch: 'bunch',
        bunches: 'bunch',
        stalk: 'stalk',
        stalks: 'stalk',
        handful: 'handful',
        handfuls: 'handful'
    };

    const unitLabels = new Set([
        'teaspoon', 'tablespoon', 'cup', 'milliliter', 'liter', 'fluid', 'ounce',
        'pint', 'quart', 'gallon', 'gram', 'kilogram', 'pound', 'pinch', 'bunch',
        'clove', 'stalk', 'leaf', 'leaves', 'sprig', 'green', 'greens', 'handful', 'unit'
    ]);

    const preservableTrailingUnitWords = new Set(['leaf', 'leaves', 'sprig', 'green', 'greens']);

    const descriptorWords = new Set([
        'and', 'or', 'coarse', 'ground', 'fresh', 'freshly', 'finely', 'thinly',
        'chopped', 'minced', 'diced', 'sliced', 'optional', 'to', 'taste', 'for',
        'of', 'about'
    ]);

    const base = String(value || '')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, ' ')
        .replace(/[^a-z0-9\s/.,]/g, ' ')
        .replace(/\b\d+([.,]\d+)?\b/g, ' ')
        .replace(/\b\d+[/]\d+\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const normalizedTokens = base
        .split(/\s+/)
        .map((token) => token.replace(/^[.,]+|[.,]+$/g, ''))
        .map((token) => unitAliases[token] || token)
        .filter(Boolean);

    const tokens = normalizedTokens.filter((token, tokenIndex) => {
        if (descriptorWords.has(token)) {
            return false;
        }

        if (!unitLabels.has(token)) {
            return true;
        }

        // Preserve names like "bay leaves", "thyme sprig", and "mustard greens".
        const isTrailingPreservableWord = preservableTrailingUnitWords.has(token);
        if (isTrailingPreservableWord && tokenIndex > 0 && tokenIndex === normalizedTokens.length - 1) {
            return true;
        }

        return false;
    });

    return tokens.join(' ').replace(/\s+/g, ' ').trim();
};

const IngredientsContent = () => {
    const {
        inventoryItems,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        importSourceNamesIntoInventory,
    } = useKitchenInventory();

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState('');
    const [isFormCollapsed, setFormCollapsed] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('expirationDate');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedSortCategory, setSelectedSortCategory] = useState('all');
    const [expirationFilter, setExpirationFilter] = useState('all');
    const [importFeedback, setImportFeedback] = useState('');

    const cleanedPreviewName = cleanIngredientLabel(form.name);

    const normalizeLabel = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    const importLabelsIntoInventory = (labels, sourceLabel, transformLabel) => {
        const cleanedLabels = (Array.isArray(labels) ? labels : [])
            .map((item) => {
                const normalized = normalizeLabel(item);
                if (!transformLabel) return normalized;
                return normalizeLabel(transformLabel(normalized));
            })
            .filter(Boolean);

        if (cleanedLabels.length === 0) {
            setImportFeedback(`No ${sourceLabel} items found to import`);
            return;
        }

        const additionsCount = importSourceNamesIntoInventory(cleanedLabels);
        if (additionsCount === 0) {
            setImportFeedback(`All ${sourceLabel} items are already in inventory`);
            return;
        }

        setImportFeedback(`Imported ${additionsCount} item${additionsCount === 1 ? '' : 's'} from ${sourceLabel}`);
    };

    const importFromShop = () => {
        // Import all relevant fields from shop todos, updating existing inventory items if present
        const shopTodos = (typeof window !== 'undefined' && window.localStorage)
            ? JSON.parse(localStorage.getItem('vueTodos') || '[]')
            : [];
        if (!Array.isArray(shopTodos) || shopTodos.length === 0) {
            setImportFeedback('No Shop items found to import');
            return;
        }
        let additionsCount = 0;
        let updatesCount = 0;
        shopTodos.forEach(todo => {
            const name = cleanIngredientLabel(todo.title || todo.name || '');
            if (!name) return;
            // Convert purchaseDate and expirationDate to yyyy-mm-dd if present and not already in that format
            let purchaseDate = todo.purchaseDate || '';
            if (purchaseDate && purchaseDate.length > 10) {
                const d = new Date(purchaseDate);
                if (!isNaN(d.getTime())) {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    purchaseDate = `${yyyy}-${mm}-${dd}`;
                }
            }
            let expirationDate = todo.expiration || todo.expirationDate || '';
            if (expirationDate && expirationDate.length > 10) {
                const d = new Date(expirationDate);
                if (!isNaN(d.getTime())) {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    expirationDate = `${yyyy}-${mm}-${dd}`;
                }
            }
            const payload = {
                name,
                purchaseDate,
                expirationDate,
                lifespanDays: todo.lifespanDays || '',
                nutritionInfo: todo.nutritionInfo || '',
                quantity: (todo.quantity !== undefined ? String(todo.quantity) : ''),
                category: todo.category || 'pantry',
            };
            // Check if already in inventory
            const existing = inventoryItems.find(item => cleanIngredientLabel(item.name) === name);
            if (existing) {
                // Update properties if any are different
                const updatedFields = {};
                if (payload.purchaseDate && payload.purchaseDate !== existing.purchaseDate) updatedFields.purchaseDate = payload.purchaseDate;
                if (payload.expirationDate && payload.expirationDate !== existing.expirationDate) updatedFields.expirationDate = payload.expirationDate;
                if (payload.lifespanDays && payload.lifespanDays !== existing.lifespanDays) updatedFields.lifespanDays = payload.lifespanDays;
                if (payload.nutritionInfo && payload.nutritionInfo !== existing.nutritionInfo) updatedFields.nutritionInfo = payload.nutritionInfo;
                if (payload.quantity && payload.quantity !== existing.quantity) updatedFields.quantity = payload.quantity;
                if (payload.category && payload.category !== existing.category) updatedFields.category = payload.category;
                if (Object.keys(updatedFields).length > 0) {
                    updateInventoryItem(existing.id, updatedFields);
                    updatesCount++;
                }
            } else {
                addInventoryItem(payload);
                additionsCount++;
            }
        });
        if (additionsCount === 0 && updatesCount === 0) {
            setImportFeedback('All Shop items are already in inventory');
        } else {
            let msg = '';
            if (additionsCount > 0) msg += `Imported ${additionsCount} item${additionsCount === 1 ? '' : 's'}`;
            if (updatesCount > 0) msg += `${additionsCount > 0 ? ' and ' : ''}updated ${updatesCount} item${updatesCount === 1 ? '' : 's'}`;
            msg += ' from Shop';
            setImportFeedback(msg);
        }
    };

    const importFromCook = () => {
        importLabelsIntoInventory(getCookIngredientNamesFromStorage(), 'Cook', cleanIngredientLabel);
    };

    const importFromShopAndCook = () => {
        const shopLabels = getShopItemNamesFromStorage();
        const cookLabels = getCookIngredientNamesFromStorage().map((label) => cleanIngredientLabel(label) || label);
        importLabelsIntoInventory([...shopLabels, ...cookLabels], 'Shop/Cook');
    };

    const cleanupDisplayedLabels = () => {
        if (!Array.isArray(sortedItems) || sortedItems.length === 0) {
            setImportFeedback('No displayed items to clean');
            return;
        }

        let cleanedCount = 0;
        sortedItems.forEach((item) => {
            const currentName = normalizeLabel(item?.name || '');
            const cleanedName = normalizeLabel(cleanIngredientLabel(currentName) || currentName);

            if (cleanedName && cleanedName !== currentName) {
                updateInventoryItem(item.id, { name: cleanedName });
                cleanedCount += 1;
            }
        });

        if (cleanedCount === 0) {
            setImportFeedback('Displayed labels are already clean');
            return;
        }

        setImportFeedback(`Cleaned ${cleanedCount} displayed label${cleanedCount === 1 ? '' : 's'}`);
    };

    const sortedItems = useMemo(() => {
        if (!Array.isArray(inventoryItems)) return [];

        const query = searchQuery.trim().toLowerCase();
        const filteredItems = !query
            ? [...inventoryItems]
            : inventoryItems.filter((item) => {
                const searchableText = [
                    item?.name,
                    item?.category,
                    item?.quantity,
                    item?.nutritionInfo,
                    item?.purchaseDate,
                    item?.expirationDate
                ]
                    .map((value) => String(value || '').toLowerCase())
                    .join(' ');

                return searchableText.includes(query);
            });

        const filteredByExpiration = filteredItems.filter((item) => {
            const status = getExpirationStatus(item?.expirationDate);
            if (expirationFilter === 'expired') return status === 'expired';
            if (expirationFilter === 'expiring-soon') return status === 'expiring-soon';
            return true;
        });

        const categoryFilteredItems = sortBy === 'category' && selectedSortCategory !== 'all'
            ? filteredByExpiration.filter((item) => String(item?.category || '').toLowerCase() === selectedSortCategory)
            : filteredByExpiration;

        const direction = sortDirection === 'desc' ? -1 : 1;
        const sortValue = (item) => {
            switch (sortBy) {
                case 'name':
                    return String(item?.name || '').toLowerCase();
                case 'category':
                    return String(item?.category || '').toLowerCase();
                case 'purchaseDate':
                    return item?.purchaseDate || '9999-12-31';
                case 'expirationDate':
                default:
                    return item?.expirationDate || '9999-12-31';
            }
        };

        return categoryFilteredItems.sort((a, b) => {
            const valueA = sortValue(a);
            const valueB = sortValue(b);
            return valueA.localeCompare(valueB) * direction;
        });
    }, [inventoryItems, searchQuery, sortBy, sortDirection, expirationFilter, selectedSortCategory]);

    const updateFormField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId('');
        setFormCollapsed(true);
    };

    React.useEffect(() => {
        if (!importFeedback) return;

        const timer = setTimeout(() => {
            setImportFeedback('');
        }, 2200);

        return () => clearTimeout(timer);
    }, [importFeedback]);

    React.useEffect(() => {
        try {
            const migrationNotice = JSON.parse(localStorage.getItem(KITCHEN_INVENTORY_MIGRATION_NOTICE_KEY) || 'null');
            if (migrationNotice && migrationNotice.currentCount !== undefined) {
                setImportFeedback(`Inventory migration complete: ${migrationNotice.previousCount} to ${migrationNotice.currentCount} items normalized`);
                localStorage.removeItem(KITCHEN_INVENTORY_MIGRATION_NOTICE_KEY);
            }
        } catch (error) {
            localStorage.removeItem(KITCHEN_INVENTORY_MIGRATION_NOTICE_KEY);
        }
    }, []);

    const onSubmit = (event) => {
        event.preventDefault();
        const cleanedName = cleanIngredientLabel(form.name) || form.name.trim();
        if (!cleanedName) return;

        const derivedExpirationDate = form.expirationDate || buildExpirationFromLifespan(form.lifespanDays, form.purchaseDate);

        const payload = {
            name: cleanedName,
            purchaseDate: form.purchaseDate,
            expirationDate: derivedExpirationDate,
            nutritionInfo: form.nutritionInfo.trim(),
            quantity: form.quantity.trim(),
            category: form.category,
        };

        if (editingId) {
            updateInventoryItem(editingId, payload);
        } else {
            addInventoryItem(payload);
        }

        resetForm();
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name || '',
            purchaseDate: item.purchaseDate || '',
            expirationDate: item.expirationDate || '',
            lifespanDays: deriveLifespanFromDates(item.purchaseDate || '', item.expirationDate || ''),
            nutritionInfo: item.nutritionInfo || '',
            quantity: item.quantity || '',
            category: item.category || 'pantry',
        });
        setFormCollapsed(false);
    };

    function getExpirationStatus(expirationDateValue) {
        const expirationDate = parseDateOnly(expirationDateValue);
        if (!expirationDate) return 'none';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expirationDate.getTime() < today.getTime()) return 'expired';

        const threshold = new Date(today);
        threshold.setDate(threshold.getDate() + 30);
        if (expirationDate.getTime() <= threshold.getTime()) return 'expiring-soon';

        return 'none';
    }
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'refrigerator':
                return '🧊';
            case 'freezer':
                return '❄️';
            case 'spice rack':
                return '🌶️';
            case 'pantry':
                return '🥫';
            case 'cabinet':
                return '🗄️';
            case 'counter':
                return '🔪';
            case 'other':
                return '❓';
            default:
                return '❓';
        }
    };
    const getCategoryColor = (item) => {
        console.log(`getCategoryColor => category: ${item.category}`);
        switch (item.category) {
            case 'refrigerator':
                return 'bg-blue';
            case 'freezer':
                return 'bg-soft';
            case 'spice rack':
                return 'bg-dkRed';
            case 'pantry':
                return 'bg-dkYellow';
            case 'cabinet':
                return 'bg-brown';
            case 'counter':
                return 'bg-dkGreen';
            case 'other':
                return 'bg-gray';
            default:
                return 'bg-lite';
        }
    };

    const addEditTitle = <div className='color-yellow size20'><span className='p-5 r-20 brdr-green bg-green size20 mr-5 text-outline-yellow'>{editingId ? '✏️' : '➕'}</span>{editingId ? 'Update' : 'Add'} Ingredient</div>;

    return (
        <div className='containerDetail mt--30 width-100-percent bg-lite'>
            <div className='containerDetail color-yellow bg-lite m-5 p-20 size30 contentLeft'>
                <span className='size40 ml--10 mr-5'>🥫</span>Ingredients Inventory
            </div>

            <form className='containerDetail bg-lite m-5 contentLeft color-lite' onSubmit={onSubmit}>
                <div className='containerDetail bg-dkYellow pt-10 pb-10'>
                    <CollapseToggleButton
                        title={addEditTitle}
                        isCollapsed={isFormCollapsed}
                        setCollapse={setFormCollapsed}
                        align='left'
                    />
                </div>
                {
                    isFormCollapsed
                        ? null
                        : <>
                            <div className='containerDetail bg-lite flexContainer mt-5 mb-5'>
                                <div className='containerDetail flexColumn size15 color-yellow p-10 contentRight w-100'>
                                    Item:
                                </div>
                                <div className='flex2Column'>
                                    <input
                                        className='containerDetail p-10 ml-5 color-lite width-100-percent'
                                        placeholder='Ingredient name'
                                        value={form.name}
                                        onChange={(event) => updateFormField('name', event.target.value)}
                                    />
                                    {
                                        form.name.trim() && cleanedPreviewName
                                            ? <div className='containerDetail ml-5 mt-5 size12 color-soft'>Will save as: {cleanedPreviewName}</div>
                                            : null
                                    }
                                </div>
                                <button
                                    type='button'
                                    className='containerDetail button bg-soft color-yellow ml-5 p-10'
                                    title='Remove quantities and unit words from ingredient label'
                                    onClick={() => updateFormField('name', cleanIngredientLabel(form.name) || form.name)}
                                >
                                    Cleanup Label
                                </button>
                            </div>
                            <div className='containerDetail bg-lite flexContainer mb-5'>
                                <div className='containerDetail flexColumn size15 color-yellow p-10 contentRight w-100'>
                                    Purchased:
                                </div>
                                <input
                                    className='containerDetail flex2Column p-10 ml-5 color-lite width-100-percent'
                                    type='date'
                                    value={form.purchaseDate}
                                    onChange={(event) => updateFormField('purchaseDate', event.target.value)}
                                />
                            </div>
                            <div className='containerDetail bg-lite flexContainer mb-5'>
                                <div className='containerDetail flexColumn size15 color-yellow p-10 contentRight w-100'>
                                    Expiration:
                                </div>
                                <input
                                    className='containerDetail flex2Column p-10 ml-5 color-lite width-100-percent'
                                    type='date'
                                    value={form.expirationDate}
                                    onChange={(event) => updateFormField('expirationDate', event.target.value)}
                                />
                            </div>
                            <div className='containerDetail bg-lite flexContainer mb-5'>
                                <div className='containerDetail flexColumn size15 color-yellow p-10 contentRight w-100'>
                                    Lifespan:
                                </div>
                                <input
                                    className='containerDetail flex2Column p-10 ml-5 color-lite width-100-percent'
                                    type='number'
                                    min='1'
                                    placeholder='Lifespan in days (optional)'
                                    value={form.lifespanDays}
                                    onChange={(event) => {
                                        const nextLifespan = event.target.value;
                                        const calculatedExpiration = buildExpirationFromLifespan(nextLifespan, form.purchaseDate);
                                        setForm((previous) => ({
                                            ...previous,
                                            lifespanDays: nextLifespan,
                                            expirationDate: calculatedExpiration || previous.expirationDate,
                                        }));
                                    }}
                                />
                            </div>
                            <div className='containerDetail flexContainer bg-lite'>
                                <div className='containerDetail flexColumn size15 color-yellow p-10 contentRight w-100'>
                                    Quantity:
                                </div>
                                <input
                                    className='containerDetail flex2Column p-10 ml-5 color-lite width-100-percent'
                                    placeholder='Quantity (e.g. 2 jars, 1.5 lb, 8 oz)'
                                    value={form.quantity}
                                    onChange={(event) => updateFormField('quantity', event.target.value)}
                                />
                            </div>
                            <select
                                className='containerDetail bg-lite p-15 mb-10 mt-10 color-lite width--5'
                                value={form.category}
                                onChange={(event) => updateFormField('category', event.target.value)}
                            >
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <textarea
                                className='containerDetail bg-lite p-10 mb-5 color-lite width-100-percent'
                                placeholder='Nutrition info (calories, protein, etc.)'
                                value={form.nutritionInfo}
                                onChange={(event) => updateFormField('nutritionInfo', event.target.value)}
                                rows={3}
                            />

                            <div className='containerDetail bg-lite flexContainer mb-5'>
                                <div type='submit' className='containerDetail bg-green button size20 mr-5 p-10 color-yellow flex2Column contentCenter' onClick={onSubmit}>
                                    {editingId ? 'Update Ingredient' : 'Add Ingredient'}
                                </div>
                                <div type='button' className='containerDetail bg-red button size20 color-yellow p-10 flex2Column contentCenter' onClick={resetForm}>Cancel</div>
                            </div>
                        </>
                }
            </form>

            <div className='containerDetail bg-lite m-5 color-lite contentLeft'>
                <div className='containerDetail flexContainer size20 color-yellow mb-5 p-20 bg-lite noScroll'>
                    <div className='flexColumn'>
                        Inventory 
                        <div className='size10 color-lite'>{sortedItems.length}</div>
                    </div>
                    <div className='flexColumn ml-20'>
                        <input
                            className='containerDetail p-10 color-white w-200'
                            placeholder='Search inventory (name, category, qty, nutrition, dates)'
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </div>
                </div>
                <div className='containerDetail bg-lite flexContainer mb-5'>
                    <select
                        className='containerDetail flex2Column p-10 ml-5 color-lite'
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        title='Sort inventory by field'
                    >
                        <option value='expirationDate'>Sort: Expiration</option>
                        <option value='purchaseDate'>Sort: Purchase Date</option>
                        <option value='name'>Sort: Name</option>
                        <option value='category'>Sort: Category</option>
                    </select>
                    {
                        sortBy === 'category'
                            ? <select
                                className='containerDetail flex2Column p-10 ml-5 color-lite'
                                value={selectedSortCategory}
                                onChange={(event) => setSelectedSortCategory(event.target.value)}
                                title='Filter by category'
                            >
                                <option value='all'>All Categories</option>
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={`sort-${option}`} value={option}>{option}</option>
                                ))}
                            </select>
                            : <select
                                className='containerDetail flex2Column p-10 ml-5 color-lite'
                                value={sortDirection}
                                onChange={(event) => setSortDirection(event.target.value)}
                                title='Sort direction'
                            >
                                <option value='asc'>Asc</option>
                                <option value='desc'>Desc</option>
                            </select>
                    }
                </div>
                <div className='containerDetail bg-lite flexContainer mb-5'>
                    <button
                        type='button'
                        className={`containerDetail button size15 p-10 mr-5 ${expirationFilter === 'all' ? 'bg-green color-yellow' : 'bg-lite color-soft'}`}
                        onClick={() => setExpirationFilter('all')}
                        title='Show all inventory items'
                    >
                        All
                    </button>
                    <button
                        type='button'
                        className={`containerDetail button size15 p-10 mr-5 ${expirationFilter === 'expired' ? 'bg-red color-yellow' : 'bg-lite color-soft'}`}
                        onClick={() => setExpirationFilter('expired')}
                        title='Show only expired inventory items'
                    >
                        Expired
                    </button>
                    <button
                        type='button'
                        className={`containerDetail button size15 p-10 ${expirationFilter === 'expiring-soon' ? 'bg-dkYellow color-dark' : 'bg-lite color-soft'}`}
                        onClick={() => setExpirationFilter('expiring-soon')}
                        title='Show items expiring within 30 days'
                    >
                        Expiring &lt;= 30d
                    </button>
                </div>
                <div className='containerDetail bg-lite flexContainer mb-5'>
                    <div
                        type='button'
                        className='containerDetail bg-tintedMedium button size15 p-10 color-yellow mr-5'
                        onClick={cleanupDisplayedLabels}
                        title='Clean labels for currently displayed inventory items'
                    >
                        <span className='size30 ml-5'>🧹</span>
                        Clean Inventory
                    </div>
                    <div
                        type='button'
                        className='containerDetail bg-tintedMedium button size15 p-10 color-yellow mr-5'
                        onClick={importFromShop}
                        title='Import all Shop items into inventory'
                    >
                        <span className='size30'>🛒</span>
                        Import
                    </div>
                    <div
                        type='button'
                        className='containerDetail bg-tintedMedium button size15 p-10 color-yellow contentCenter'
                        onClick={importFromCook}
                        title='Import all Cook ingredients into inventory'
                    >
                        <span className='size30'>🧑‍🍳</span>
                        Import
                    </div>
                    {/*
                    <div
                        type='button'
                        className='containerDetail bg-green button size15 p-10 color-yellow'
                        onClick={importFromShopAndCook}
                        title='Import all Shop items and Cook ingredients into inventory'
                    >
                        Import Shop + Cook to Inventory
                    </div>
                    */}
                    {
                        importFeedback
                            ? <div className='containerDetail ml-10 p-10 color-neogreen size15'>{importFeedback}</div>
                            : null
                    }
                </div>
                <div className={`containerDetail mt-20 width--5 ml--5 ${(isFormCollapsed) ? 'height--550' : 'height--550'}`}>
                {
                    !sortedItems.length
                        ? <div>No ingredients in inventory yet.</div>
                        : sortedItems.map((item) => {
                            const expirationStatus = getExpirationStatus(item.expirationDate);
                            const statusStyle = expirationStatus === 'expired'
                                ? { outline: '2px solid #ef4444', boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.45)' }
                                : expirationStatus === 'expiring-soon'
                                    ? { outline: '2px solid #f59e0b', boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.45)' }
                                    : {};

                            return <div key={item.id} className={`containerDetail ${getCategoryColor(item)} mb-5`} style={statusStyle}>
                                <div className='containerDetail flexContainer bg-lite'>
                                    <div className='flex2Column color-yellow size20 pt-10'>
                                        <span className='size25 mr-5'>
                                            {getCategoryIcon(item.category) || 'N/A'}
                                        </span>
                                         <span className=''>
                                            {item.name}
                                        </span>
                                        {
                                            expirationStatus === 'expired'
                                                ? <span className='ml-10 size12 color-yellow bg-red p-5 r-10'>Expired</span>
                                                : expirationStatus === 'expiring-soon'
                                                    ? <span className='ml-10 size12 color-dark bg-dkYellow p-5 r-10'>Expires in &lt;= 30d</span>
                                                    : null
                                        }
                                    </div>
                                    <div 
                                        className='containerDetail color-dark button size20 p-10 contentCenter lite flexColumn w-50 m-2' 
                                        onClick={() => startEdit(item)}
                                    >
                                        ✏️
                                    </div>
                                    <div 
                                        className='containerDetail button size20 p-10 contentCenter flexColumn w-50 m-2' 
                                        onClick={() => removeInventoryItem(item.id)}
                                    >
                                        🗑️
                                    </div>
                                </div>
                                <div className='flexContainer'>
                                    <div className='p-10 flexColumn'>
                                        <span className='color-yellow copyright'>
                                            count:
                                        </span> {((item.quantity === 'infinity') ? '∞' : item.quantity) || 'N/A'}
                                    </div>
                                    <div className='p-10 flexColumn'>
                                        <span className='mr-5'>
                                            🛒
                                        </span>
                                        <span className='copyright color-yellow'>
                                            {formatDateToMDY(item.purchaseDate) === 'N/A' ? 'N/A' : `${formatDateToMDY(item.purchaseDate)}`}
                                        </span>
                                    </div>
                                    <div className='p-10 flexColumn'>
                                        <span className='color-yellow mr-5'>
                                            ⏳
                                        </span>
                                        <span className='copyright'>
                                            {formatDateToMDY(item.expirationDate) === 'N/A' ? 'N/A' : `${formatDateToMDY(item.expirationDate)}`}
                                        </span> 
                                    </div>
                                    <div className='p-10 flex3Column'>
                                        <span className='color-yellow p-10 flex4Column'>
                                            📊 <span className='copyright'>{item.nutritionInfo || 'N/A'}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>;
                        })
                }
                </div>
            </div>
        </div>
    );
};

const Ingredients = () => (
    <KitchenInventoryProvider>
        <IngredientsContent />
    </KitchenInventoryProvider>
);

export default Ingredients;
