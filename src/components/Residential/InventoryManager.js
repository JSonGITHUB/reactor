import React, { useState } from 'react';

const InventoryManager = ({ inventory, setInventory }) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [category, setCategory] = useState(''); // new item category
    const [filterCategory, setFilterCategory] = useState(''); // filter by category
    const [searchTerm, setSearchTerm] = useState(''); // filter by search


    const handleAddItem = () => {
        if (!newItemName.trim()) return;
        const existingIndex = inventory.findIndex(
            (item) => item.name.toLowerCase() === newItemName.toLowerCase()
        );

        let updatedInventory;
        if (existingIndex >= 0) {
            // Update quantity if item exists
            updatedInventory = [...inventory];
            updatedInventory[existingIndex].quantity += Number(newItemQuantity);
        } else {
            updatedInventory = [
                ...inventory,
                { name: newItemName.trim(), quantity: Number(newItemQuantity) },
            ];
        }

        setInventory(updatedInventory);
        setNewItemName('');
        setNewItemQuantity(1);
    };

    const handleRemoveItem = (index) => {
        const updatedInventory = [...inventory];
        updatedInventory.splice(index, 1);
        setInventory(updatedInventory);
    };

    return (
        <div>
            <div className='containerBox'>
                <input
                    type='text'
                    placeholder='Item name'
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className='containerBox width--10'
                />
                <input
                    type='number'
                    min='1'
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className='containerBox width--10'
                />
                <div
                    onClick={handleAddItem}
                    className='containerBox width--10 button bg-blue'
                >
                    Add
                </div>
            </div>
            <ul>
                {inventory.map((item, index) => (
                    <li
                        key={index}
                        className='flex justify-between border-b py-1'
                    >
                        <span>
                            {item.name} ({item.quantity})
                        </span>
                        <button
                            onClick={() => handleRemoveItem(index)}
                            className='text-red-600'
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InventoryManager;