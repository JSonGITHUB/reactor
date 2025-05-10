import React, { useState, useEffect } from 'react';
import EditableTextField from './EditableTextField';
import { validate } from 'uuid';

const itemsAmount = ['single item', 'multiple items'];

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
    const [ingredients, setIngredients] = useState('');
    const [recipeIngredients, setRecipeIngredients] = useState();
    const [unit, setUnit] = useState('');
    const [quantity, setQuantity] = useState('');
    const [items, setItems] = useState(itemsAmount[0]);

    const handleIngredientChange = (e) => setIngredient(e.target.value);
    const handleUnitChange = (e) => setUnit(e.target.value);
    const handleQuantityChange = (e) => setQuantity(e.target.value);

    const modifyArray = (arr) => {
        return arr.map(item => {
            console.log(`IngredientDialog => item: ${item}`)
            if ((Number(item[0]) > 1) && (item[1][item[1].length - 1] !== 's')) item[1] += 's';
            if (item[item.length - 1] === true || item[item.length - 1] === false) item.pop();
            return item.join(' ');
        });
    };

    useEffect(() => {
        if (items === 'multiple items') {
            const ingredientDisplay = modifyArray(recipe.ingredients).join('\n');
            console.log(`IngredientDialog => ingredientDisplay: ${ingredientDisplay}`)
            setIngredients(ingredientDisplay);
        }
    }, [items]);
    useEffect(() => {
        if (isOpen && dialogType === 'edit') {
            setIngredient(recipe.ingredients[index][2]);
            setUnit(recipe.ingredients[index][1]);
            setQuantity(recipe.ingredients[index][0]);
        }
    }, [isOpen]);
    
    useEffect(() => {
        const newRecipeIngredients = [];
        setRecipeIngredients(ingredients);
    }, [ingredients]);

    const handleItemsChange = (e) => {
        setItems(e.target.value)
    };

    const handleSubmit = () => {

        console.log(`handleSubmit => ${items} recipeIngredients: ${JSON.stringify(recipeIngredients, null, 2)}`);

        if (items === 'single item') {
            const ingredientData = {
                ingredient,
                unit,
                quantity: parseFloat(quantity)
            };
            onSubmitIngredient(ingredientData);
            onClose();
        } else {
            console.log(`handleSubmit => recipeIngredients: ${JSON.stringify(recipeIngredients, null, 2)}`);
            onSubmitIngredients(recipeIngredients);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    const editRecipe = () => alert(`IngredientDialog => editRecipe`);

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
                        className='containerBox 
                                flex2Column'
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
                                    className='containerBox 
                                            flex2Column'
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
                        : <div>
                            <EditableTextField
                                title='Ingredients:'
                                data={recipe.ingredients}
                                toggle={handleSubmit}
                                edit={editRecipe}
                                setEdited={setIngredients}
                                edited={ingredients}
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