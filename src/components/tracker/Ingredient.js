import React, { useState, useEffect } from 'react'
import icons from '../site/icons';
import { useIngredient } from '../context/IngredientContext';
import Sounds from '../sound/Sounds';

const Ingredient = ({
    ingredient
}) => {
    const { getIngredientStatus, toggleIngredientStatus, removeIngredient } = useIngredient();
    const [check, setCheck] = useState(false);

    // Initialize checkbox from context on mount
    useEffect(() => {
        const savedStatus = getIngredientStatus(ingredient);
        setCheck(savedStatus);
    }, [ingredient, getIngredientStatus]);
    const playSound = () => {
        if (typeof Sounds.playSoftBell === 'function') {
            Sounds.playSoftBell();
            return;
        }
        if (typeof Sounds.softBell === 'function') {
            Sounds.softBell(250);
            return;
        }
        if (typeof Sounds.boop === 'function') {
            Sounds.boop(0, 1);
        }
    };
    const toggleIngredient = () => {
        const newStatus = !check;
        setCheck(newStatus);
        toggleIngredientStatus(ingredient, newStatus);
        playSound();
    };

    const getCheckBox = (item) => <input
        id={`${item}`}
        name={`${item}`}
        className='regular-checkbox button glassy m-5'
        checked={check}
        type='checkbox'
        onChange={toggleIngredient}
    />
    const onRemoveIngredient = (ingredient) => () => {
        removeIngredient(ingredient);
    }
    return (
        <div className='containerDetail m-5 size20 color-lite bg-lite flexContainer button'>
            <div className='containerDetail p-10 size20 color-lite flexColumn columnRightAlign bold color-yellow'>
                {getCheckBox(ingredient)}
            </div>
            <div className='containerDetail p-10 ml-5 mr-5 size20 color-lite flex2Column columnLeftAlign p-15'>
                {ingredient}
            </div>
            <div className='containerDetail p-15 button flexColumn columnRightAlign' title='remove' onClick={onRemoveIngredient(ingredient)}>
               {icons.delete}
            </div>
        </div>
    )
}

export default Ingredient