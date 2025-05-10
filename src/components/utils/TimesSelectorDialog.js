import React from 'react';
import ScrollingTimePicker from './ScrollingTimePicker';

const TimeSelectorDialog = ({
    index,
    data,
    handleTimeChange,
    isOpen,
    setIsOpen,
    categoryStyle    
}) => {

    if (!isOpen) return null;

    const cancel = () => setIsOpen(false);
    return <div className='modal-overlay bg-tintedDark'>
                <div className='containerBox modal p-20 color-lite bg-lite'>
                    <ScrollingTimePicker 
                        index={index}
                        data={data}
                        handleSubmit={handleTimeChange}
                        handleCancel={cancel}
                        categoryStyle={categoryStyle}
                    />
                </div>
            </div>
};

export default TimeSelectorDialog;