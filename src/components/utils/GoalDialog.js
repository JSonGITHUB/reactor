import React, { useState, useEffect } from 'react';

const GoalDialog = ({
    goal,
    isOpen,
    onClose,
    submitGoal,
    deleteGoal
}) => {

    const [editedGoalTitle, setEditedGoalTitle] = useState(null);

    const handleSubmit = () => {
        console.log('GoalDialog => handleSubmit')
        submitGoal((editedGoalTitle !== null) ? editedGoalTitle : goal)
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return <div className='modal-overlay bg-tintedDark'>
        <div className='containerBox modal p-20 color-lite bg-lite'>
            <div className='containerBox form-group'>
                <div className='containerBox bold'>
                    Edit Goal:
                </div>
                <div className='containerBox'>
                    <textarea
                        className='inputField ht-55 size20 r-10 color-lite'
                        onChange={(e) => setEditedGoalTitle(e.target.value)}
                        value={(editedGoalTitle !== null) ? editedGoalTitle : goal}
                        placeholder={goal}
                    >
                    </textarea>
                </div>
            </div>
            <div className='containerBox form-actions p-20 contentCenter'>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={handleSubmit}
                >
                    Submit
                </button>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={deleteGoal}
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
};

export default GoalDialog;