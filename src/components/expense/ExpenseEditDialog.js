import React, { useState } from 'react';

const ExpenseEditDialog = ({ expense, categories, categoryIcons, onSave, onCancel }) => {
    const [amount, setAmount] = useState(expense.amount || 0);
    const [description, setDescription] = useState(expense.description || '');
    const [assignedCategory, setAssignedCategory] = useState(expense.assignedCategory || expense.category || 'Misc');

    const handleSave = () => {
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        onSave({
            amount: Number(amount),
            description,
            assignedCategory
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className='containerDetail bg-lite p-20' style={{ 
                maxWidth: '500px', 
                width: '90%',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
            }}>
                <div className='color-yellow size20 mb-20'>✏️ Edit Expense: {expense.category}</div>
                
                {/* Amount Input */}
                <div className='containerDetail mt-10'>
                    <label className='color-yellow size15 mb-5'>Amount ($)</label>
                    <input
                        type='number'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className='containerDetail p-10 bg-dark color-lite size18'
                        style={{ 
                            border: '2px solid #4a5568',
                            borderRadius: '6px',
                            outline: 'none'
                        }}
                        placeholder='0.00'
                        step='0.01'
                    />
                </div>

                {/* Description Input */}
                <div className='containerDetail mt-15'>
                    <label className='color-yellow size15 mb-5'>Description (optional)</label>
                    <input
                        type='text'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className='containerDetail p-10 bg-dark color-lite size16'
                        style={{ 
                            border: '2px solid #4a5568',
                            borderRadius: '6px',
                            outline: 'none'
                        }}
                        placeholder='Add a note...'
                    />
                </div>

                {/* Category Selector */}
                <div className='containerDetail mt-15'>
                    <label className='color-yellow size15 mb-10'>Assigned Category</label>
                    <div className='containerDetail flexContainer p-10 bg-dark' style={{ 
                        flexWrap: 'wrap', 
                        gap: '8px',
                        borderRadius: '6px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {categories.map((cat, idx) => {
                            const isSelected = cat === assignedCategory;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setAssignedCategory(cat)}
                                    className='containerDetail flexContainer p-8 button'
                                    style={{
                                        backgroundColor: isSelected ? '#4a5568' : '#1a202c',
                                        border: isSelected ? '2px solid #f59e0b' : '2px solid #2d3748',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        gap: '5px'
                                    }}
                                >
                                    <span>{categoryIcons[cat] || '📦'}</span>
                                    <span className={`size14 ${isSelected ? 'color-yellow' : 'color-lite'}`}>
                                        {cat}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='containerDetail flexContainer mt-20' style={{ gap: '10px' }}>
                    <button
                        onClick={onCancel}
                        className='containerDetail p-15 button bg-dark color-lite size16 flex2Column'
                        style={{ borderRadius: '6px' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className='containerDetail p-15 button bg-green color-yellow size16 flex2Column'
                        style={{ borderRadius: '6px' }}
                    >
                        💾 Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseEditDialog;
