import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import Recipe from './Recipe';
import getKey from '../utils/KeyGenerator';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';

const RecipeGroup = ({
    recipes,
    setRecipes,
    recipeGroup,
    recipeGroupIndex,
    deleteGroup,
    addRecipe,
    targetElementRef,
    scrollToBottom
}) => {
    const [collapsed, setCollapsed] = useState(recipeGroup.isCollapsed);
    const [edit, setEdit] = useState(false);
    const isEditedRecipeGroupTitle = () => (edit) ? true : false;
    const [editedRecipeGroupTitle, setEditedRecipeGroupTitle] = useState(null);

    useEffect(() => {
        let dataUpdated = false;
        const newRecipes = [...recipes];
        const selectedNewRecipeGroup = newRecipes[recipeGroupIndex];
        //if (selectedNewRecipeGroup.recipes === undefined) {
        if (validate(selectedNewRecipeGroup.recipes) === null) {
            selectedNewRecipeGroup.recipes = [];
            dataUpdated = true;
        }
        if (dataUpdated) {
            setRecipes(newRecipes);
        }
    }, []);

    useEffect(() => {
        const newRecipes = [...recipes];
        const selectedNewRecipeGroup = newRecipes[recipeGroupIndex];
        selectedNewRecipeGroup.isCollapsed = collapsed;
        localStorage.setItem('recipeTracking', JSON.stringify(newRecipes));
        //setRecipes(newRecipes);
    }, [collapsed]);
    
    const toggleEdit = () => {
        const toggle = (edit)
            ? false
            : true;
        const wasRecipeGroupTitleEdited = (recipeGroup.category !== editedRecipeGroupTitle) ? true : false;
        setEdit(toggle);
        setEditedRecipeGroupTitle((toggle) ? recipeGroup.category : '');
        if (!toggle && wasRecipeGroupTitleEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipeGroup = newRecipes[recipeGroupIndex];
            selectedNewRecipeGroup.category = (wasRecipeGroupTitleEdited) ? editedRecipeGroupTitle : selectedNewRecipeGroup.category;
            setRecipes(newRecipes);
        }
    }
    const toggleCollapse = () => {
        const collapse = !collapsed;
        const newRecipes = [...recipes];
        const selectedNewRecipeGroup = newRecipes[recipeGroupIndex];
        selectedNewRecipeGroup.isCollapsed = collapse;
        setRecipes(newRecipes);
        setCollapsed(collapse);
    }
    const addToGroup = (recipeGroupIndex, elementRef) => {
        if (collapsed) {
            toggleCollapse();
        }
        addRecipe(recipeGroupIndex)
        //setScroll(recipeGroupIndex * 50);
        scrollToBottom(elementRef);
    }
    const editRecipeGroupTitle = () => {
        const newGroupTitle = prompt('Enter new recipe category: ', recipeGroup.category);
        /* const toggle = (edit)
            ? false
            : true; */
        const wasRecipeGroupTitleEdited = (newGroupTitle && recipeGroup.category !== newGroupTitle) ? true : false;
        /* setEdit(toggle); */
        /* setEditedRecipeGroupTitle((toggle) ? recipeGroup.category : ''); */
        if (/* !toggle &&  */wasRecipeGroupTitleEdited) {
            const newRecipes = [...recipes];
            const selectedNewRecipeGroup = newRecipes[recipeGroupIndex];
            selectedNewRecipeGroup.category = (wasRecipeGroupTitleEdited) ? newGroupTitle : selectedNewRecipeGroup.category;
            setRecipes(newRecipes);
        }

    }
    return <div key={getKey(`recipe${recipeGroupIndex}`)} className='containerBox' ref={targetElementRef}>
            <div className='containerBox'>
                <div className='flexContainer'>
                    <div className='bold size25 color-yellow flex1Auto contentLeft'>
                        {
                            (isEditedRecipeGroupTitle())
                                ? <textarea
                                    className='inputField ht-55 size25 r-10 color-yellow bold'
                                    onChange={(e) => setEditedRecipeGroupTitle(e.target.value)}
                                    value={(editedRecipeGroupTitle !== null) ? editedRecipeGroupTitle : recipeGroup.category}
                                    placeholder={editedRecipeGroupTitle}
                                >
                                    {editedRecipeGroupTitle}
                                </textarea>
                                : <div className='containerBox bg-lite centerVertical'>
                                        <div className='containerDetail color-yellow bg-tinted p-20'>
                                            <CollapseToggleButton
                                                title={recipeGroup.category}
                                                isCollapsed={collapsed}
                                                setCollapse={setCollapsed}
                                                align='left'
                                                editTitle={editRecipeGroupTitle}
                                            />
                                        </div>
                                    </div>
                        }
                    </div>
                </div>
                {
                    (collapsed) 
                    ? null 
                    : <div className='containerBox'>
                        <div className='flexContainer contentRight'>
                            <div
                                title='add recipe'
                                className='containerBox flex4Column button bg-lite centeredContent'
                                onClick={() => addToGroup(recipeGroupIndex, targetElementRef)}
                            >
                                <div className='flexContainer'>
                                    <div className='flex2Column text-outline-light size20 mt-5'>
                                        {icons.plus}
                                    </div>
                                    <div className='flex2Column p-5 size25'>
                                        {icons.session}
                                    </div>
                                </div>
                            </div>
                            <div
                                title={(isEditedRecipeGroupTitle())?'save category':'edit category'}
                                className={`containerBox flex4Column button bg-lite centeredContent ${(isEditedRecipeGroupTitle()) ? '' : ' bg-lite'}`}
                            >
                                {
                                    (isEditedRecipeGroupTitle())
                                    ? <div title='save' className='p-5 color-lite bold' onClick={() => toggleEdit(recipeGroupIndex)}>save</div>
                                    : <div title='edit' className='p-5' onClick={() => toggleEdit(recipeGroupIndex)}>{icons.edit}</div>
                                }
                            </div>
                            <div 
                                title='delete category'
                                className='containerBox flex4Column button bg-lite centeredContent p-15' 
                                onClick={() => deleteGroup(recipeGroupIndex)}
                            >
                                {icons.delete}
                            </div>
                        </div>
                    </div>
                }
                </div>
            <div>
                {
                    (collapsed) 
                    ? null 
                    : recipeGroup.recipes.map((recipe, recipeIndex) => {
                        console.log(`RecipeGroup => recipe: ${JSON.stringify(recipe, null, 2)}`);
                        if (recipe?.display === true || recipe?.display === 'true') {
                            return <div key={getKey(`recipeContainer${recipeIndex}`)}>
                                <Recipe
                                    recipes={recipes}
                                    setRecipes={setRecipes}
                                    recipeGroupIndex={recipeGroupIndex}
                                    recipeIndex={recipeIndex}
                                    recipe={recipe}
                                />
                            </div>
                        }
                        return null;
                    })
                }
            </div>
        </div>
}
export default RecipeGroup;