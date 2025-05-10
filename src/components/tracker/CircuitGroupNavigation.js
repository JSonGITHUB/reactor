import React, { useContext } from 'react';
import icons from '../site/icons';
import { CircuitContext } from '../context/CircuitContext';

const CircuitGroupNavigation = ({
    circuitGroupIndex,
    addToGroup,
    deleteGroup
}) => {

    const {
        targetElementRef,
        edit,
        setEdit
    } = useContext(CircuitContext);

    return <div className='containerBox'>
                <div className='flexContainer contentRight'>
                    <div
                        title='add group'
                        className='containerBox flex2Column button bg-lite centeredContent'
                        onClick={() => addToGroup(circuitGroupIndex, targetElementRef)}
                    >
                        <div className='flexContainer'>
                            <div className='flex2Column text-outline-light size20 mt-5'>
                                {icons.plus}
                            </div>
                            <div className='flex2Column p-5 size25'>
                                {icons.session}
                            </div>
                        </div>
                    </div>
                    <div
                        title='delete group'
                        className='containerBox p-15 flex2Column button bg-lite centeredContent'
                        onClick={() => deleteGroup(circuitGroupIndex)}
                    >
                        {icons.delete}
                    </div>
                </div>
            </div>
}
export default CircuitGroupNavigation;