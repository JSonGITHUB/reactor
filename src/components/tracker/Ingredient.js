import React, { useState } from 'react'
import getKey from '../utils/KeyGenerator';

const Ingredient = ({
    ingredient
}) => {
    const [check, setCheck] = useState(false);
    const toggleIngredient = () => setCheck(!check);
    const getCheckBox = (item) => <input
        id={`${item}`}
        name={`${item}`}
        className='regular-checkbox button glassy m-5'
        checked={check}
        type='checkbox'
        onChange={toggleIngredient}
    />
    //console.log(`Ingredient => ingredient: ${JSON.stringify(ingredient, null, 2)}`);
    return (
        <div key={getKey(ingredient)} className='containerBox flexContainer button' onClick={toggleIngredient}>
            <div className='containerBox flexColumn columnRightAlign bold color-yellow'>
                {getCheckBox(ingredient)}
            </div>
            <div className='containerBox flex2Column columnLeftAlign p-15'>
                {ingredient}
            </div>
        </div>
    )
}

export default Ingredient