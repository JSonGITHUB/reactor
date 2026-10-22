import { useRef } from 'react';
import '../../assets/css/shop.css';
import IngredientParent from '../context/IngredientContext';
import KitchenInventoryProvider from '../context/KitchenInventoryContext';
import List from './List';

const Shop = () => {

    const targetElementRef = useRef(null);

    return (
        <KitchenInventoryProvider>
            <IngredientParent targetElementRef={targetElementRef}>
                <List />
            </IngredientParent>
        </KitchenInventoryProvider>
    )
}

export default Shop;