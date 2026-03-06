import React, { createContext, useContext, useEffect, useState } from 'react';
import initializeData from '../utils/InitializeData';

export const KitchenInventoryContext = createContext();

const KitchenInventoryProvider = ({ children }) => {
    const [inventoryItems, setInventoryItems] = useState([]);

    useEffect(() => {
        const savedInventory = initializeData('kitchenInventory', []);
        if (Array.isArray(savedInventory)) {
            setInventoryItems(savedInventory);
        } else {
            setInventoryItems([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('kitchenInventory', JSON.stringify(inventoryItems));
        } catch (error) {
            console.error('Error saving kitchen inventory state:', error);
        }
    }, [inventoryItems]);

    const addInventoryItem = (item) => {
        const now = new Date().toISOString();
        const newItem = {
            id: item?.id || `inventory-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: item?.name || '',
            purchaseDate: item?.purchaseDate || '',
            expirationDate: item?.expirationDate || '',
            nutritionInfo: item?.nutritionInfo || '',
            quantity: item?.quantity || '',
            category: item?.category || '',
            createdAt: item?.createdAt || now,
            updatedAt: now,
        };

        setInventoryItems((prev) => [...prev, newItem]);
        return newItem;
    };

    const updateInventoryItem = (itemId, updates) => {
        setInventoryItems((prev) => prev.map((item) => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }));
    };

    const removeInventoryItem = (itemId) => {
        setInventoryItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const clearInventoryItems = () => {
        setInventoryItems([]);
    };

    const upsertInventoryFromIngredients = (ingredientNames = []) => {
        if (!Array.isArray(ingredientNames) || !ingredientNames.length) return;

        setInventoryItems((prev) => {
            const existingNames = new Set(prev.map((item) => String(item.name || '').trim().toLowerCase()));
            const additions = ingredientNames
                .map((name) => String(name || '').trim())
                .filter((name) => name !== '')
                .filter((name) => !existingNames.has(name.toLowerCase()))
                .map((name) => ({
                    id: `inventory-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name,
                    purchaseDate: '',
                    expirationDate: '',
                    nutritionInfo: '',
                    quantity: '',
                    category: 'pantry',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }));

            return [...prev, ...additions];
        });
    };

    return (
        <KitchenInventoryContext.Provider value={{
            inventoryItems,
            addInventoryItem,
            updateInventoryItem,
            removeInventoryItem,
            clearInventoryItems,
            upsertInventoryFromIngredients,
        }}>
            {children}
        </KitchenInventoryContext.Provider>
    );
};

export const useKitchenInventory = () => useContext(KitchenInventoryContext);

export default KitchenInventoryProvider;
