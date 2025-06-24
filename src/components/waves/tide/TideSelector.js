import { useContext } from 'react';
import Selector from '../../forms/FunctionalSelector.js';
import icons from '../../site/icons.js';
import tide from '../../../assets/images/tide.png';

import { OceanContext } from '../../context/OceanContext';

const TideSelector = ({
    /* status, 
    pause,  */
    tideDisplay
    /* handleTideCheck, 
    handleTideSelection */
}) => {

    const {
        status,
        setStatus,
        setTide,
        setWind,
        setWindStatus,
        handleTideCheck,
        handleTideSelection,
        handleWindCheck,
        handleSwellCheck,
        handleSwell1Selection,
        handleSwell2Selection,
        handleSwell1LiveSelection,
        handleSwell2LiveSelection,
        handleSwell1Angle,
        handleSwell2Angle,
        handleSwell1Height,
        handleSwell2Height,
        handleSwell1Interval,
        handleSwell2Interval,
        handleStarSelection,
        handleDistanceSelection,
        pause
    } = useContext(OceanContext);

    const isTideSelected = () => (status.isTide === true) ? 'bg-veryLite fadeInFaded' : 'bg-tinted fadeOutFaded';
    const tideClass = () => `${isTideSelected()} containerBox flex2Column contentCenter`;
    
    return (
        <div className={tideClass()}>
            <div className='containerBox'>
                <div className='containerBox bg-lite'>
                    Tide <img src={tide} className='ml-5 mt--5 mb--5 ht-25 w-25' alt='icon' />
                </div>
                <div className='size20 pt-10'>{tideDisplay('narrow')}</div>
                <div className='mr-10 mb-5'>
                    <Selector 
                        groupTitle='Tide'
                        selected={status.tide} 
                        label='current' 
                        items={['low', 'medium', 'high']}
                        onChange={handleTideSelection}
                        fontSize='20'
                        padding='5px'
                        width='93%'
                    />
                </div>
            </div>
            <div className='containerBoxDetail button size40 p-20' onClick={handleTideCheck}>
                {((status.isTide) === true) ? icons.good : icons.bad }
            </div>
        </div>
    );
}
export default TideSelector;