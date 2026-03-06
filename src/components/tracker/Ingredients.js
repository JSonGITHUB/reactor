import React, { useMemo, useState } from 'react';
import KitchenInventoryProvider, { useKitchenInventory } from '../context/KitchenInventoryContext';

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

const IngredientsContent = () => {
    const {
        inventoryItems,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
    } = useKitchenInventory();

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState('');

    const sortedItems = useMemo(() => {
        if (!Array.isArray(inventoryItems)) return [];
        return [...inventoryItems].sort((a, b) => {
            const dateA = a.expirationDate || '9999-12-31';
            const dateB = b.expirationDate || '9999-12-31';
            return dateA.localeCompare(dateB);
        });
    }, [inventoryItems]);

    const updateFormField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId('');
    };

    const onSubmit = (event) => {
        event.preventDefault();
        if (!form.name.trim()) return;

        const payload = {
            name: form.name.trim(),
            purchaseDate: form.purchaseDate,
            expirationDate: form.expirationDate,
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
            nutritionInfo: item.nutritionInfo || '',
            quantity: item.quantity || '',
            category: item.category || 'pantry',
        });
    };
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

    return (
        <div className='containerDetail mt--30 width-100-percent'>
            <div className='containerDetail color-yellow bg-lite m-5 p-20 size30 contentLeft'>
                <span className='size40 mr-5'>🥫</span>Ingredients Inventory
            </div>

            <form className='containerDetail bg-lite m-5 contentLeft color-lite' onSubmit={onSubmit}>
                <div className='containerDetail size20 color-yellow mb-5 p-20 bg-lite'>
                    Add / Update Ingredient
                </div>
                <div className='containerDetail flexContainer mb-5'>
                    <div className='containerDetail flexColumn size15 color-yellow p-10 contentRight w-100'>
                        Item:
                    </div>
                    <input
                        className='containerDetail flex2Column p-10 ml-5 color-lite width-100-percent'
                        placeholder='Ingredient name'
                        value={form.name}
                        onChange={(event) => updateFormField('name', event.target.value)}
                    />
                </div>
                <div className='containerDetail flexContainer mb-5'>
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
                <div className='containerDetail flexContainer mb-5'>
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
                <div className='containerDetail flexContainer'>
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
                    className='containerDetail p-15 mb-10 mt-10 color-lite width--5'
                    value={form.category}
                    onChange={(event) => updateFormField('category', event.target.value)}
                >
                    {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <textarea
                    className='containerDetail p-10 mb-5 color-lite width-100-percent'
                    placeholder='Nutrition info (calories, protein, etc.)'
                    value={form.nutritionInfo}
                    onChange={(event) => updateFormField('nutritionInfo', event.target.value)}
                    rows={3}
                />

                <div className='containerDetail flexContainer mb-5'>
                    <div type='submit' className='containerDetail bg-green button size15 mr-5 p-10 flex2Column contentCenter' onClick={onSubmit}>
                        {editingId ? 'Update Ingredient' : 'Add Ingredient'}
                    </div>
                    <div type='button' className='containerDetail bg-red button size15 p-10 flex2Column contentCenter' onClick={resetForm}>Cancel</div>
                </div>
            </form>

            <div className='containerDetail bg-lite m-5 color-lite contentLeft'>
                <div className='containerDetail size20 color-yellow mb-5 p-20 bg-lite'>
                    Inventory ({sortedItems.length})
                </div>
                {
                    !sortedItems.length
                        ? <div>No ingredients in inventory yet.</div>
                        : sortedItems.map((item) => (
                            <div key={item.id} className={`containerDetail ${getCategoryColor(item)} mb-5`}>
                                <div className='containerDetail flexContainer bg-lite'>
                                    <div className='flex2Column color-yellow size20 pt-10'>
                                        <span className='size25 mr-5'>
                                            {getCategoryIcon(item.category) || 'N/A'}
                                        </span>
                                         <span className=''>
                                            {item.name}
                                        </span>
                                    </div>
                                    <div 
                                        className='containerDetail color-dark button size15 p-10 contentCenter lite flexColumn w-50 m-2' 
                                        onClick={() => startEdit(item)}
                                    >
                                        ✏️
                                    </div>
                                    <div 
                                        className='containerDetail button size15 p-10 contentCenter flexColumn w-50 m-2' 
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
                            </div>
                        ))
                }
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
