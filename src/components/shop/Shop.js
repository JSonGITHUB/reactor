import React, { useRef } from 'react';
import '../../assets/css/shop.css';
import IngredientParent from '../context/IngredientContext';
import List from './List';

const Shop = () => {

    const targetElementRef = useRef(null);

    return (
        <IngredientParent targetElementRef={targetElementRef}>
            <List />
        </IngredientParent>
    )
}

export default Shop;