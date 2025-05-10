import React, { useRef } from 'react';
import StepsParent from '../context/StepContext';
import ScheduleSelector from './ScheduleSelector';
import StepsDisplay from './StepsDisplay';

const StepTimer = React.memo(() => {

    const targetElementRef = useRef(null);
    
    return (
        <StepsParent targetElementRef={targetElementRef}>
            <ScheduleSelector />
            <div className='containerBox'>
                <StepsDisplay />
            </div>
        </StepsParent>
    );
});

export default StepTimer;