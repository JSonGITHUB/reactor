import React, { useState, useEffect } from 'react';

const itemsAmount = ['single item', 'multiple items'];

const safeQuantityStr = (val) => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number') return Number.isNaN(val) ? '' : String(val);
    const s = String(val).trim();
    return (s === 'NaN' || s === 'null' || s === 'undefined') ? '' : s;
};

const formatIngredientsToText = (ingredientsArray) => {
    if (!Array.isArray(ingredientsArray)) return '';
    return ingredientsArray
        .map(item => {
            if (!Array.isArray(item)) return String(item || '').trim();
            const quantity = safeQuantityStr(item[0]);
            const unit = String(item[1] ?? '').trim();
            const name = String(item[2] ?? '').trim();
            return [quantity, unit, name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
        })
        .filter(Boolean)
        .join('\n');
};

const IngredientDialog = ({ 
    isOpen, 
    dialogType, 
    recipe, 
    index, 
    category, 
    onClose, 
    onSubmitIngredient, 
    onSubmitIngredients,
    unitsOfMeasure
}) => {

    const [ingredient, setIngredient] = useState('');
    const [ingredientsText, setIngredientsText] = useState('');
    const [unit, setUnit] = useState('');
    const [quantity, setQuantity] = useState('');
    const [items, setItems] = useState(itemsAmount[0]);

    const handleIngredientChange = (e) => setIngredient(e.target.value);
    const handleUnitChange = (e) => setUnit(e.target.value);
    const handleQuantityChange = (e) => setQuantity(e.target.value);

    useEffect(() => {
        if (items === 'multiple items') {
            setIngredientsText(formatIngredientsToText(recipe.ingredients));
        }
    }, [items, recipe.ingredients]);

    useEffect(() => {
        if (isOpen && dialogType === 'edit') {
            setIngredient(recipe.ingredients[index][2]);
            setUnit(recipe.ingredients[index][1]);
            setQuantity(recipe.ingredients[index][0]);
        }
    }, [isOpen, dialogType, index, recipe.ingredients]);

    const handleItemsChange = (e) => {
        setItems(e.target.value);
    };

    const handleSubmit = () => {
        if (items === 'single item') {
            const parsedQty = parseFloat(quantity);
            const ingredientData = {
                ingredient,
                unit,
                quantity: Number.isFinite(parsedQty) ? parsedQty : ''
            };
            onSubmitIngredient(ingredientData);
        } else {
            onSubmitIngredients(ingredientsText);
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return <div className='modal-overlay bg-tintedDark'>
        <div className='containerBox modal p-20 color-lite bg-lite'>
            <form className='containerBox'>
                <div className='p-20 color-yellow bold contentCenter'>
                    {dialogType} {category}
                </div>
                <div className='containerBox form-group flexContainer'>
                    <label
                        className='flex2Column p-20 width-50-percent'
                        htmlFor='amount'
                    >
                        Items
                    </label>
                    <select
                        className='containerBox flex2Column'
                        id='items'
                        value={items}
                        onChange={handleItemsChange}
                    >
                        {itemsAmount.map((items) => (
                            <option
                                key={items}
                                value={items}
                            >
                                {items}
                            </option>
                        ))}
                    </select>
                </div>
                {
                    (items === 'single item')
                        ? <div>
                            <div className='containerBox form-group flexContainer'>
                                <label
                                    className='flex2Column p-20'
                                    htmlFor='ingredient'
                                >
                                    Ingredient
                                </label>
                                <input
                                    id='ingredient'
                                    name='ingredient'
                                    className='containerBox flex2Column width-50-percent'
                                    type='text'
                                    value={ingredient}
                                    onChange={handleIngredientChange}
                                    required
                                />
                            </div>
                            <div className='containerBox form-group flexContainer'>
                                <label
                                    className='flex2Column p-20 width-50-percent'
                                    htmlFor='unit'
                                >
                                    Units
                                </label>
                                <select
                                    className='containerBox flex2Column'
                                    id='unit'
                                    value={unit}
                                    onChange={handleUnitChange}
                                >
                                    {unitsOfMeasure.map((unit) => (
                                        <option
                                            key={unit}
                                            value={unit}
                                        >
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='containerBox form-group flexContainer'>
                                <label
                                    className='flex2Column p-20'
                                    htmlFor='quantity'
                                >
                                    Quantity
                                </label>
                                <input
                                    id='quantity'
                                    name='quantity'
                                    className='containerBox flex2Column width-50-percent'
                                    type='number'
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    required
                                    inputMode='numeric'
                                    pattern='[0-9]*'
                                />
                            </div>
                        </div>
                        : <div className='p-10'>
                            <div className='p-10 color-yellow size15'>One ingredient per line (e.g. "1 cup flour")</div>
                            <textarea
                                className='containerBox width-100-percent'
                                rows={10}
                                value={ingredientsText}
                                onChange={(e) => setIngredientsText(e.target.value)}
                                placeholder={'1 cup flour\n2 tbsp butter\n0.5 teaspoon salt'}
                            />
                        </div>
                }

            </form>
            <div className='containerBox form-actions p-20 contentCenter'>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={handleSubmit}
                >
                    Submit
                </button>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
};

export default IngredientDialog;