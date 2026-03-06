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
        handleTideCheck,
        handleTideSelection
    } = useContext(OceanContext);
    
    const isTideSelected = () => (status.isTide === true) ? 'bg-veryLite fadeInFaded brdr-green' : 'bg-tinted fadeOutFaded';
    const tideClass = () => `${isTideSelected()} containerDetail flex2Column contentCenter size20 mt-5 mb-5`;
    
    return (
        <div className={tideClass()}>
            <div className='size20'>
                <div className='containerDetail bg-lite contentLeft p-15 color-yellow'>
                    <img src={tide} className='mt--5 mb--5 ht-25 w-25' alt='icon' /> Tide
                </div>
                <div className='size20'>{tideDisplay('narrow')}</div>
                <div className='mb-5'>
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
                <div className='containerDetail button size40 p-20' onClick={handleTideCheck}>
                    {((status.isTide) === true) ? icons.good : icons.bad }
                </div>
            </div>
        </div>
    );
}
export default TideSelector;