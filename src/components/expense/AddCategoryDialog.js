import React, { useState } from 'react';

const AddCategoryDialog = ({ suggestedIcons, onSave, onCancel }) => {
    const [categoryName, setCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('📦');
    const [customIcon, setCustomIcon] = useState('');

    const handleSave = () => {
        if (!categoryName.trim()) {
            alert('Please enter a category name');
            return;
        }
        
        const iconToUse = customIcon.trim() || selectedIcon;
        
        onSave({
            name: categoryName.trim(),
            icon: iconToUse
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
                <div className='color-yellow size20 mb-20'>➕ Add New Category</div>
                
                {/* Category Name Input */}
                <div className='containerDetail mt-10'>
                    <label className='color-yellow size15 mb-5'>Category Name</label>
                    <input
                        type='text'
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className='containerDetail p-10 bg-dark color-lite size18'
                        style={{ 
                            border: '2px solid #4a5568',
                            borderRadius: '6px',
                            outline: 'none'
                        }}
                        placeholder='e.g., Gym, Pets, Coffee'
                    />
                </div>

                {/* Icon Selector */}
                <div className='containerDetail mt-15'>
                    <label className='color-yellow size15 mb-10'>Select Icon</label>
                    <div className='containerDetail flexContainer p-10 bg-dark' style={{ 
                        flexWrap: 'wrap', 
                        gap: '8px',
                        borderRadius: '6px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {suggestedIcons.map((icon, idx) => {
                            const isSelected = icon === selectedIcon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedIcon(icon);
                                        setCustomIcon('');
                                    }}
                                    className='containerDetail button'
                                    style={{
                                        fontSize: '24px',
                                        padding: '10px',
                                        backgroundColor: isSelected ? '#4a5568' : '#1a202c',
                                        border: isSelected ? '2px solid #f59e0b' : '2px solid #2d3748',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        minWidth: '45px',
                                        minHeight: '45px'
                                    }}
                                >
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Icon Input */}
                <div className='containerDetail mt-15'>
                    <label className='color-yellow size15 mb-5'>Or Enter Custom Emoji</label>
                    <input
                        type='text'
                        value={customIcon}
                        onChange={(e) => {
                            setCustomIcon(e.target.value);
                            if (e.target.value) setSelectedIcon('');
                        }}
                        className='containerDetail p-10 bg-dark color-lite size18'
                        style={{ 
                            border: '2px solid #4a5568',
                            borderRadius: '6px',
                            outline: 'none'
                        }}
                        placeholder='Paste any emoji here...'
                        maxLength='2'
                    />
                </div>

                {/* Preview */}
                <div className='containerDetail mt-15 p-15 bg-dark' style={{ borderRadius: '6px' }}>
                    <div className='color-lite size14 mb-5'>Preview:</div>
                    <div className='flexContainer' style={{ alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '32px' }}>{customIcon || selectedIcon}</span>
                        <span className='color-yellow size18'>{categoryName || 'Category Name'}</span>
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
                        💾 Save Category
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryDialog;
