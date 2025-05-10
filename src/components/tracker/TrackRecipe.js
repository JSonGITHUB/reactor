import React, { useEffect, useState, useContext } from 'react';
import initRecipeTracking from './initRecipeTracking';
import mobileRecipeTracking from './data_mobile'; 
import RecipeGroup from './RecipeGroup';
import getKey from '../utils/KeyGenerator';
import initializeData from '../utils/InitializeData';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import Ingredient from './Ingredient';
import validate from '../utils/validate';
import { IngredientContext } from '../context/IngredientContext';
import Selector from '../forms/FunctionalSelector.js';

const TrackRecipe = ({

    targetElementRef,
    scrollToBottom,
    recipes,
    setRecipes,
    getIngredients
    
}) => {

    const {
        ingredients,
        setIngredients
    } = useContext(IngredientContext);
    
    const [ingredientsCollapse, setIngredientsCollapse] = useState(true);
    const [category, setCategory] = useState('all');
    
    useEffect(() => {
        //const storedRecipes = (recipes !== null) ? recipes : initializeData('recipeTracking', initRecipeTracking);
        //const storedRecipes = (recipes !== null) ? recipes : initializeData('recipeTracking', mobileRecipeTracking);
        //setRecipes(storedRecipes);
        if (recipes === null) setRecipes(mobileRecipeTracking);
        const storedCategory = localStorage.getItem('recipeCategory');
        if (storedCategory !== null) {
            setCategory(storedCategory);
        } else {
            setCategory('all');
        }
    }, []);
    useEffect(() => {
        if ((category === null) || (category === '') || (category === undefined)) {
            localStorage.setItem('recipeCategory', 'all');
        } else {
            localStorage.setItem('recipeCategory', category);
        }
        const newRecipes = [...recipes];
        newRecipes.map((recipeGroup) => {
            if (category === 'all' || recipeGroup.category === category) {
                recipeGroup.display = true;
                recipeGroup.isCollapsed = false;
            } else {
                recipeGroup.display = false;
            }
        });
        setRecipes(newRecipes);
    }, [category]);    
    useEffect(() => {
        if (!ingredientsCollapse) {
            setIngredients(getIngredients());
        }
    }, [ingredientsCollapse]);
    useEffect(() => {
        if (recipes !== undefined) {
            setIngredients(getIngredients());
        }
    }, [recipes]);

    const notNull = (value) => (value !== null) ? true : false;
    const notEmpty = (value) => (value !== "") ? true : false;
    const isGood = (value) => (notNull(value) && notEmpty(value)) ? true : false;

    const addRecipe = (recipeGroupIndex, recipeIndex) => {
        const updatedRecipes = [...recipes];
        const recipeDescription = prompt('Dish name:', '');
        const newRecipe = {
            dish: recipeDescription,
            //recipe: recipe
            description: '',
            display: true
        }
        if (isGood(recipeDescription)/* || isGood(recipe)*/) {
            updatedRecipes[recipeGroupIndex].recipes.push(newRecipe)
            setRecipes(updatedRecipes);
        }

    };
    const subtractRecipe = (recipeGroupIndex, recipeIndex) => {
        const updatedRecipes = [...recipes];
        const recipe = updatedRecipes[recipeGroupIndex].recipes[recipeIndex];
        recipe.sessions = recipe.sessions ?? [];
        recipe.isRunning = false;
        recipe.sessions.pop();
        setRecipes(updatedRecipes);
    };

    const deleteGroup = (recipeGroupIndex) => {
        const toggle = window.confirm(`Are you sure you want to remove recipe group ${recipes[recipeGroupIndex].category}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error("Index out of range");
            }
        };
        if (toggle) {
            const newRecipes = [...recipes];
            removeItemByIndex(newRecipes, recipeGroupIndex);
            setRecipes(newRecipes);
        }
    }
    const getCategories = () => {
        const categories = ['all'];
        recipes.forEach((recipeGroup) => {
            if (recipeGroup.category !== undefined && recipeGroup.category !== null) {
                categories.push(recipeGroup.category);
            }
        });
        return categories;
    }
    const updateCategory = (a, b, selected) => {
        setCategory(selected);
    }
    
    return (
        <div key={getKey('recipeGroupContainer')}>
            <div className='containerBox pr-20'>
                <Selector
                    groupTitle='Category'
                    selected={category}
                    label={'Category'}
                    items={getCategories()}
                    onChange={updateCategory}
                    padding='5px'
                    fontSize='15'
                />
            </div>
            <div className='containerBox color-yellow'>
                <CollapseToggleButton
                    title={'Ingredients'}
                    isCollapsed={ingredientsCollapse}
                    setCollapse={setIngredientsCollapse}
                    align='left'
                />
            </div>
            {
                (ingredientsCollapse)
                ? null
                : (ingredients === null || ingredients.length === 0)
                    ? <div className='containerBox'>Ingredients are added when recipes are active.</div>
                    : ingredients.map(ingredient => <div key={getKey(ingredient)}>
                                                    <Ingredient
                                                        ingredient={ingredient}
                                                    />
                                                </div>
                )
            }
            {
                recipes.map((recipeGroup, recipeGroupIndex) => {
                    if (recipeGroup.display === true || recipeGroup.display === 'true') {
                        return <div key={getKey('recipeGroups')}>
                            <RecipeGroup
                                recipes={recipes}
                                setRecipes={setRecipes}
                                recipeGroup={recipeGroup}
                                recipeGroupIndex={recipeGroupIndex}
                                deleteGroup={deleteGroup}
                                addRecipe={addRecipe}
                                //setScroll={setScroll}
                                targetElementRef={targetElementRef}
                                scrollToBottom={scrollToBottom}
                            />
                        </div>
                    }
        })}
        </div>
    )
}

export default TrackRecipe