import React, { useContext } from 'react';
import Selector from '../../forms/FunctionalSelector.js';
//import WindDirection from '../WindDirection.js';
import directions from '../Directions.js';
//import thumbsUp from '../../../assets/images/ThumbsUp.png';
//import thumbsDown from '../../../assets/images/ThumbsDown.png';
import icons from '../../site/icons.js';
import { OceanContext } from '../../context/OceanContext';

const WindSelector = ({
    //status, 
    windDirection, 
    /* 
    pause, 
    setWind, 
    isWind,  
    setStatus,
    handleWindCheck
    */ 
}) => {

    const {
        status,
        setStatus,
        handleWindCheck
    } = useContext(OceanContext);

    //console.log(`WindSelector => isWind: ${isWind}`);
    
    //const [filterByWind, setFilterByWind] = useState(isWind);
    const backgroundColorClass = (status.isWind === true) ? 'bg-veryLite fadeInFaded brdr-green' : 'bg-tinted fadeOutFaded';
    const windClass = () => `${backgroundColorClass} containerDetail flex2Column contentCenter mt-5 ml-5 mb-5`;
    const handleWindSelection = (groupTitle, label, selected) => {
        setStatus(selected)
    }

    return (
        <div className={windClass()}>
            {/*console.log(`windSelector => windDirection: ${status.windDirection}`)*/}
                <div className='size20'>
                    <div className='containerDetail bg-lite p-15 contentLeft color-yellow'>
                        {icons.wind} Wind
                    </div>
                    <div className='mb-5'>
                        <Selector
                            groupTitle='Wind' 
                            selected={windDirection} 
                            label='Direction'
                            items={directions}
                            onChange={handleWindSelection}
                            fontSize='20'
                            padding='5px'
                            width='93%'
                        />
                    </div>
                    <div className='containerBoxDetail button size40 p-20' onClick={handleWindCheck} >
                        {(status.isWind === true) ? icons.good : icons.bad }
                    </div>
                </div>
        </div>
    );
}
export default WindSelector;