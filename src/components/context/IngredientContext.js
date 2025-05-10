import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';

export const IngredientContext = createContext();

const IngredientParent = ({
    children,
    targetElementRef
}) => {

    const intervalRef = useRef(null);
    const [ingredients, setIngredients] = useState();
    
    const removeDuplicates = (array) => [...new Set(array)];
    
    useEffect(() => {
        setIngredients(removeDuplicates(initializeData('ingredients', [])));
    }, []);
    useEffect(() => {
        if ((validate(ingredients) !== null) && (ingredients !== undefined)) {
            localStorage.setItem('ingredients', JSON.stringify(ingredients));
        } else {
            localStorage.setItem('ingredients', '[]');
        }
    }, [ingredients]);
    return (

        <IngredientContext.Provider value={{
            ingredients,
            setIngredients,
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