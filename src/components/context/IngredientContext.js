import React, { createContext, useContext, useEffect, useState } from 'react';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';

export const IngredientContext = createContext();

const IngredientParent = ({
    children,
    targetElementRef
}) => {

    const [ingredients, setIngredients] = useState();
    const [ingredientStatus, setIngredientStatus] = useState({});
    
    const removeDuplicates = (array) => [...new Set(array)];
    
    useEffect(() => {
        setIngredients(removeDuplicates(initializeData('ingredients', [])));
    }, []);
    useEffect(() => {
        try {
            const saved = localStorage.getItem('ingredientCheckboxStatus');
            if (saved) {
                setIngredientStatus(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading ingredient checkbox state:', error);
        }
    }, []);
    useEffect(() => {
        //console.log('Saving ingredients to localStorage:', JSON.stringify(ingredients, null, 2));
        if ((validate(ingredients) !== null) && (ingredients !== undefined)) {
            localStorage.setItem('ingredients', JSON.stringify(ingredients));
        } else {
            localStorage.setItem('ingredients', '[]');
        }
    }, [ingredients]);
    useEffect(() => {
        try {
            localStorage.setItem('ingredientCheckboxStatus', JSON.stringify(ingredientStatus));
        } catch (error) {
            console.error('Error saving ingredient checkbox state:', error);
        }
    }, [ingredientStatus]);

    const toggleIngredientStatus = (ingredientName, checked) => {
        setIngredientStatus(prev => ({
            ...prev,
            [ingredientName]: checked
        }));
    };

    const getIngredientStatus = (ingredientName) => ingredientStatus[ingredientName] ?? false;

    const removeIngredient = (ingredientName) => {
        setIngredients(prev => (Array.isArray(prev) ? prev.filter(item => item !== ingredientName) : []));
        setIngredientStatus(prev => {
            const updated = { ...prev };
            delete updated[ingredientName];
            return updated;
        });
    };

    const clearIngredientStatuses = () => {
        setIngredientStatus({});
    };
    return (

        <IngredientContext.Provider value={{
            ingredients,
            setIngredients,
            ingredientStatus,
            toggleIngredientStatus,
            getIngredientStatus,
            removeIngredient,
            clearIngredientStatuses,
            targetElementRef
        }}>
            {
                (validate(ingredients) !== null)
                    ? children
                    : <div>
                        WHOOOPSIE!
                    </div>
            }
        </IngredientContext.Provider>
    );
};
export const useIngredient = () => useContext(IngredientContext);

export default IngredientParent;