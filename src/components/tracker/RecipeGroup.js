import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import Recipe from './Recipe';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';

const RecipeGroup = ({
    
    recipes,
    setRecipes,
    setCollapseAll,
    recipeGroup,
    recipeGroupIndex,
    deleteGroup,
    addRecipe,
    targetElementRef,
    scrollToBottom

}) => {
    
    const [collapsed, setCollapsed] = useState(recipeGroup.isCollapsed ?? true);
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
        setCollapsed(recipeGroup.isCollapsed ?? false)
        if (dataUpdated) {
            setRecipes(newRecipes);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setCollapsed(recipeGroup.isCollapsed ?? recipeGroup.collapsed ?? true);
    }, [recipeGroup.isCollapsed, recipeGroup.collapsed]);

    useEffect(() => {
        setRecipes((previousRecipes) => {
            if (!Array.isArray(previousRecipes) || !previousRecipes[recipeGroupIndex]) {
                return previousRecipes;
            }

            const currentGroup = previousRecipes[recipeGroupIndex];
            if (currentGroup.isCollapsed === collapsed && currentGroup.collapsed === collapsed) {
                return previousRecipes;
            }

            const updatedRecipes = [...previousRecipes];
            updatedRecipes[recipeGroupIndex] = {
                ...currentGroup,
                isCollapsed: collapsed,
                collapsed: collapsed
            };
            localStorage.setItem('recipeTracking', JSON.stringify(updatedRecipes));
            return updatedRecipes;
        });
    }, [collapsed, recipeGroupIndex, setRecipes]);
    
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
        selectedNewRecipeGroup.collapsed = collapse;
        setRecipes(newRecipes);
        setCollapsed(collapse);
        setCollapseAll(undefined);
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
    const visibleRecipeCount = Array.isArray(recipeGroup.recipes)
        ? recipeGroup.recipes.filter((recipe) => recipe?.display === true || recipe?.display === 'true').length
        : 0;
    const recipeGroupTitle = (recipeGroup.category) ? <>{recipeGroup.category} <span className='copyright color-lite'>{visibleRecipeCount}</span></> : 'New Category';

    if (visibleRecipeCount === 0) {
        return null;
    }
    
    return <div className=''>
            <div className=''>
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
                            : <div className='containerDetail m-5 bg-lite centerVertical'>
                                <div className='containerDetail color-yellow bg-tinted p-20'>
                                    <CollapseToggleButton
                                        title={recipeGroupTitle}
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
                    : <div className=''>
                        <div className='containerDetail mr-5 ml-5 mt--5 mb--5 flexContainer'>
                            <div
                                title='add recipe'
                                className='containerDetail flex3Column button bg-lite centeredContent'
                                onClick={() => addToGroup(recipeGroupIndex, targetElementRef)}
                            >
                                <div className='flexContainer'>
                                    <div className='flex2Column text-outline-lite size20 mt-5'>
                                        {icons.plus}
                                    </div>
                                    <div className='flex2Column p-5 size25'>
                                        {icons.session}
                                    </div>
                                </div>
                            </div>
                            <div
                                title={(isEditedRecipeGroupTitle())?'save category':'edit category'}
                                className={`containerDetail mr-5 ml-5 p-25 flex3Column button bg-lite centeredContent ${(isEditedRecipeGroupTitle()) ? '' : ' bg-lite'}`}
                            >
                                {
                                    (isEditedRecipeGroupTitle())
                                    ? <div title='save' className='size25 color-lite bold' onClick={() => toggleEdit(recipeGroupIndex)}>save</div>
                                    : <div title='edit' className='size25' onClick={() => toggleEdit(recipeGroupIndex)}>{icons.edit}</div>
                                }
                            </div>
                            <div 
                                title='delete category'
                                className='containerDetail flex3Column button bg-lite centeredContent p-20 size25 ' 
                                onClick={() => deleteGroup(recipeGroupIndex)}
                            >
                                {icons.delete}
                            </div>
                        </div>
                        <div>
                            {
                                (collapsed)
                                ? null
                                : (recipeGroup.recipes && recipeGroup.recipes.length > 0)
                                    ? recipeGroup.recipes.map((recipe, recipeIndex) => {
                                        if (recipe?.display === true || recipe?.display === 'true') {
                                            return <div key={`${recipe?.dish || 'recipe'}-${recipeIndex}`} ref={(el) => (recipeIndex === 0 ? targetElementRef : null)}>
                                                <Recipe
                                                    recipes={recipes}
                                                    setRecipes={setRecipes}
                                                    recipeGroupIndex={recipeGroupIndex}
                                                    recipeIndex={recipeIndex}
                                                    recipe={recipe}
                                                    setCollapseAll={setCollapseAll}
                                                />
                                            </div>
                                        }
                                        return null;
                                    })
                                    : null
                            }
                        </div>
                    </div>
                }
                </div>
        </div>
}
export default RecipeGroup;