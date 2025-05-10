import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import getKey from '../utils/KeyGenerator';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import EditableTextField from '../utils/EditableTextField';
import IngredientDialog from '../utils/IngredientDialog';
import validate from '../utils/validate';
import VulgarFractions from '../utils/VulgarFractions';

const Recipe = ({

    recipes,
    setRecipes,
    recipeGroupIndex,
    recipeIndex,
    recipe

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

    const unitsOfMeasure = [
        'no unit label', 'unit', 'teaspoon', 'tablespoon', 'cup', 'milliliter', 'liter', 'fluid ounce',
        'pint', 'quart', 'gallon', 'gram', 'kilogram', 'ounce', 'pound', 'pinch', 'bunch', 'clove', 'stalk', 'leave', 'handful'
    ];

    const closeDialog = () => setDialogOpen(false);
    const valuesArray = [0, .25, .5, .75, 1];
    const roundToNearest = (value) => {
        const wholePart = Math.floor(value);
        const decimalPart = value - wholePart;
        const nearestDecimal = valuesArray.reduce((prev, curr) =>
            Math.abs(curr - decimalPart) < Math.abs(prev - decimalPart) ? curr : prev
        );
        return wholePart + nearestDecimal;
    };

    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        let dataUpdated = false;
        if (validate(selectedNewRecipe.ingredients) === null) {
            console.log(`[] => selectedNewRecipe: ${JSON.stringify(selectedNewRecipe, null, 2)}`);
            selectedNewRecipe.ingredients = [
                []
            ];
            dataUpdated = true;
        } else if (typeof selectedNewRecipe.ingredients === 'string') {
            console.log(`[] => String => selectedNewRecipe.ingredients: ${JSON.stringify(selectedNewRecipe.ingredients, null, 2)}`);
            selectedNewRecipe.ingredients = [selectedNewRecipe.ingredients];
            dataUpdated = true;
        }
        if (validate(selectedNewRecipe.instructions) === null) {
            //selectedNewRecipe.instructions = [];
            selectedNewRecipe.instructions = [
                {
                    step: "Add the following ingredients to a bowl.",
                    ingredients: [
                        [
                            1,
                            "tsp",
                            "Garlic"
                        ]
                    ]
                }
            ];
            dataUpdated = true;
        } else if (typeof selectedNewRecipe.instructions === 'string') {
            selectedNewRecipe.instructions = [selectedNewRecipe.instructions];
            dataUpdated = true;
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
    }, []);

    useEffect(() => {
        const stringifiedRecipes = JSON.stringify(recipes);
        localStorage.setItem('recipeTracking', stringifiedRecipes);
    }, [recipes]);

    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        selectedNewRecipe.collapseIngredients = collapseIngredients;
        localStorage.setItem('recipeTracking', JSON.stringify(newRecipes));
    }, [collapseIngredients]);

    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        selectedNewRecipe.collapseInstructions = collapseInstructions;
        localStorage.setItem('recipeTracking', JSON.stringify(newRecipes));
    }, [collapseInstructions]);

    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        selectedNewRecipe.isCollapsed = collapsed;
        selectedNewRecipe.collapsed = collapsed;
        localStorage.setItem('recipeTracking', JSON.stringify(newRecipes));
    }, [collapsed]);

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
    const toggleEditRecipe = () => {
        const toggleRecipe = (editRecipe)
            ? false
            : true;
        const wasRecipeEdited = (recipe.description !== editedRecipe) ? true : false;
        setEditRecipe(toggleRecipe);
        setEditedRecipe((toggleRecipe) ? recipe.description : '');
        if (!toggleRecipe && wasRecipeEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
            selectedNewRecipe.description = (wasRecipeEdited) ? editedRecipe : selectedNewRecipe.description;
            setRecipes(newRecipes);
        }
    }

    const toggleEditIngredients = () => {
        console.log(`toggleEditIngredients => editedIngredients: ${JSON.stringify(editedIngredients, null, 2)}`);
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
                console.error("Index out of range");
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
        console.log(`addIngredient=> newIngredient: ${JSON.stringify(newIngredient, null, 2)}`);
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        const { ingredient, unit, quantity } = newIngredient;
        const unitLabel = (unit.includes('no unit label')) ? '' : unit;
        const ingredientData = [Number(quantity), unitLabel, ingredient, false];
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
    const splitAndCombine = (value) => {
        const originalIndex = value.split(' ');
        const newIndex = [];
        newIndex.push(originalIndex[0]);
        newIndex.push(originalIndex[1]);
        if (originalIndex.length > 2) {
            newIndex.push(originalIndex.slice(2).join(' '));
        }
        return newIndex;
    }
    const formatIngredient = (newIngredients) => {
        const ingredients = [];
        const ingredientConfig = String(newIngredients).split('\n').map(
            (ingredient, index) => {
                const ingredientArray = condenseArray(ingredient.split(' '));
                const newIngredient = splitAndCombine(ingredientArray)
                ingredients.push(newIngredient);
            }
        );
        console.log(`formatIngredient => ingredientConfig: ${JSON.stringify(ingredientConfig, null, 2)}`);
    };
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
        //
        console.log(`addIngredients => newIngredients1: ${JSON.stringify(newIngredients, null, 2)}`);
        const ingredientArray = newIngredients.split('\n').map((ingredient) => {
            return {
                ingredients: [
                    condenseArray(ingredient.split(' '))
                ]
            }
        });
        console.log(`addIngredients => ingredientArray: ${JSON.stringify(ingredientArray, null, 2)}`);
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        const ingredientData = newIngredients.split('\n').map((ingredient) => condenseArray(ingredient.split(' ')));
        console.log(`addIngredients => ingredientData: ${JSON.stringify(ingredientData, null, 2)}`);
        selectedNewRecipe.ingredients = ingredientData;
        console.log(`addIngredients => newRecipes: ${JSON.stringify(newRecipes, null, 2)}`);
        setRecipes(newRecipes);
    }

    const addCheckbox = (category, index) => {
        //console.log(`addCheckbox => category: ${category}`)
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        //console.log(`addCheckbox => selectedNewRecipe: ${JSON.stringify(selectedNewRecipe, null, 2)}`)
        if (category.toLowerCase().includes('ingredient')) {
            setDialogType('add');
            setCategory(category);
            setIndex(index);
            setDialogOpen(true);
        } else if (category.toLowerCase().includes('instruction')) {
            if (index === null) {
                const newInstruction = prompt(`Add a new instruction:`, '');
                const step = {
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
        const newRecipes = [...recipes];
        const selectedNewRecipe = newRecipes[recipeGroupIndex].recipes[recipeIndex];
        if (category === 'ingredients') {
            const ingredientPrepared = (selectedNewRecipe.ingredients[index][3]) ? false : true;
            selectedNewRecipe.ingredients[index][3] = ingredientPrepared;
            setRecipes(newRecipes);
        } else if (category === 'instructions') {
            const ingredient = selectedNewRecipe.instructions[index].ingredients[ingredientIndex];
            const ingredientAdded = (ingredient[3]) ? false : true;
            ingredient[3] = ingredientAdded;
            setRecipes(newRecipes);
        }
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

    const deleteSubItem = (category, index, subIndex) => {
        const removeItemByIndex = (array, index) => {
            //console.log(`removeItemByIndex => array: ${array} index: ${index}`)
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

    const recipeHeader = (category, toggleFunction, isEdit) => {

        return <div className='containerBox flexContainer bg-lite centerVertical '>
            <div className='flex2Column containerBox color-yellow bg-tinted p-20'>
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
                    ? <div title='save' className='r-10 p-20 bg-lite color-neogreen button bold' onClick={() => setEdit(!edit)}>save</div>
                        : <div title='edit' className='r-10 pt-20 pb-20 pl-15 pr-15 bg-lite button' onClick={() => setEdit(!edit)}>{icons.edit}</div>
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
                    <div className='text-outline-light size15'>
                        {icons.plus}
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
            //console.log(`mls => ${item[2]} quantity: ${quantity}`)
        }
        if (units === 'tablespoons' || units === 'tblsp' || units === 'tblsps' || units === 'tbsp' || units === 'tbsps') {
            units = 'tablespoon';
        }
        //console.log(`getItemQuantityDisplay => ${item[2]}  ${item[2]} units: ${units} quantity: ${quantity}`)
        if (units === 'g' || units === 'gs' || units === 'gram' || units === 'grams') {
            units = 'teaspoon';
            newQuantity = Number(quantity / 5.69);
            quantity = (isNaN(newQuantity)) ? quantity : newQuantity;
            if (quantity >= 3) {
                units = 'tablespoon';
                quantity = (quantity / 3)
            }
        }
        //console.log(`getItemQuantityDisplay => ${item[2]}  ${item[2]} units: ${units} quantity: ${quantity}`)
        if ((units === 'tablespoons' || units === 'tablespoon') && Number(quantity) > 4) {
            units = 'cup';
            newQuantity = Number(quantity / 16);
            quantity = (isNaN(newQuantity)) ? quantity : newQuantity;
            //console.log(`getItemQuantityDisplay => ${item[2]}  units: ${units} quantity: ${quantity}`)
        }
        //console.log(`getItemQuantityDisplay => ${item[2]}  ${item[2]} units: ${units} quantity: ${quantity}`)

        if (!String(quantity).includes('/')) {
            if (!Number.isInteger(quantity)) {
                //console.log(`getItemQuantityDisplay => ${item[2]}  ${item[2]} units: ${units} quantity: ${quantity}`)
                quantity = roundToNearest(quantity);
                //console.log(`getItemQuantityDisplay => ${item[2]}  ${item[2]} units: ${units} quantity: ${quantity}`)
            }
        }
        //console.log(`getItemQuantityDisplay => ${item[2]}  ${item[2]} units: ${units} quantity: ${quantity}`)
        
        newQuantity = Number(String(quantity).replace('0.', '.'));
        console.log(`getItemQuantityDisplay => item[0]: ${item[0]} quantity: ${quantity} newQuantity: ${newQuantity}`)
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
                (quantity === 0)
                ? null
                : <VulgarFractions value={quantity} />
            }
            <span className='mr-10 fl-left'>{unitsDisplay}</span>
        </div>
    }
    const getIngredientDisplay = (item, index, category) => <div
        key={getKey(`ingredient${index}`)}
        className={`containerBox flexContainer centerVertical ${(item[3]) ? 'bg-lite' : ''}`}
    >
        <div className='containerBox p-20 flex2Column'>
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
                        className='containerBox bg-lite p-20 button'
                        onClick={() => toggleCheckbox(category, index, 0)}
                    >
                        <input
                            id='completed'
                            name='completed'
                            className='regular-checkbox button'
                            checked={item[3]}
                            type='checkbox'
                            onChange={() => console.log(`category: ${category}, index: ${index}`)}
                        />
                    </div>
                    : <div
                        title='delete'
                        className='containerBox bg-lite p-20 button centeredContent'
                        onClick={() => deleteSubItem(category, index, null)}
                    >
                        {icons.delete}
                    </div>
            }
        </div>
    </div>
    const getStep = (item) => {
        if (item !== undefined) {
            console.log(`getStep => item: ${JSON.stringify(item, null, 2)}`);
            return item.step
        }
        return 'noone';
    }
    const getIngredients = (item) => {
        if (item !== undefined) {
            console.log(`getIngredients => item: ${JSON.stringify(item, null, 2)}`);
            return item.ingredients
        }
        return 'noone';
    }
    const getInstructionsDisplay = (item, index, category) => {

        return (item !== undefined)
            ? <div key={getKey(`instruction${index}${Math.random() * 100}`)} className=''>
                <div className='containerBox p-20 flexContainer centerVertical color-yellow bold'>
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
                            : <div
                                title='delete'
                                className='containerBox bg-lite p-20 button centeredContent'
                                onClick={() => deleteSubItem(category, index, null)}
                            >
                                {icons.delete}
                            </div>
                        }
                    </div>
                </div>
                {
                    (item !== undefined)
                    ? item.ingredients.map((ingredient, ingredientIndex) => <div key={getKey(`ingredient${ingredientIndex}`)} className={`containerBox flexContainer centerVertical ${(ingredient[3]) ? 'bg-lite' : ''}`}>
                        <div className='flex2Column'>
                            <div className='containerBox p-20' /* onClick={() => editIngredient(category, ingredientIndex)} */>{ingredient[0]} {ingredient[1]} {ingredient[2]}</div>
                        </div>
                        <div className='flexColumn contentRight'>
                            {
                                (!edit)
                                ? <div
                                    title='select'
                                    className='containerBox bg-lite p-20 button'
                                    onClick={() => toggleCheckbox(category, index, ingredientIndex)}
                                >
                                    <input
                                        className='regular-checkbox button'
                                        checked={ingredient[3]}
                                        type='checkbox'
                                        id='completed'
                                        onChange={() => console.log(`category: ${category}, index: ${index}`)}
                                    />
                                </div>
                                : <div
                                    title='delete'
                                    className='containerBox bg-lite p-20 button centeredContent'
                                    onClick={() => deleteSubItem(category, index, ingredientIndex)}
                                >
                                    {icons.delete}
                                </div>
                            }
                        </div>
                    </div>
                    )
                    : null
                }
            </div>
            : null

    }
    const recipeField = (isEdit, setEdited, edited, data, toggleEdit, category) => {
        return <div className=''>
            <div className='color-soft button'>
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
                                    <React.Fragment key={getKey(`data${index}`)}>
                                        {line}
                                        {<br />}
                                    </React.Fragment>
                                ))}
                            </div>
                            : ifUndefinedArray(data).map((item, index) => {
                                return (category.toLowerCase().includes('ingredient'))
                                    ? (!collapseIngredients)
                                        ? getIngredientDisplay(item, index, category)
                                        : null
                                    : (!collapseInstructions)
                                        ? getInstructionsDisplay()
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

    return <div key={`recipe${recipeIndex}`} className='containerBox lowerBorder contentLeft'>
        <div className='flexContainer'>
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
                            <div className='containerBox bg-lite centerVertical '>
                                <div className='containerDetail color-yellow bg-tinted p-20'>
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
                                    : <div className='containerBox flexContainer contentRight'>
                                        {
                                            (edit)
                                                ? <div title='save' className='ml-5 r-10 p-20 bg-lite color-neogreen button bold' onClick={() => setEdit(!edit)}>save</div>
                                                : <div title='edit' className='ml-5 r-10 pt-20 pb-20 pl-15 pr-15 bg-lite button' onClick={() => setEdit(!edit)}>{icons.edit}</div>
                                        }
                                        <div
                                            title='delete'
                                            className='ml-10 r-10 p-20 bg-lite buttonml-10 mr-10'
                                            onClick={() => deleteRecipe()}
                                        >
                                            {icons.delete}
                                        </div>
                                    </div>
                            }
                        </div>
                }
            </div>
            {(editTitle)
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
        {
            (collapsed)
                ? null
                : <div>
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
        }
    </div>
}
export default Recipe;