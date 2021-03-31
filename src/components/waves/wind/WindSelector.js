import React, { useState } from 'react';
import Selector from '../../forms/FunctionalSelector.js';
import WindDirection from '../WindDirection.js';
import directions from '../Directions.js';
import thumbsUp from '../../../assets/images/ThumbsUp.png';
import thumbsDown from '../../../assets/images/ThumbsDown.png';

const WindSelector = ({windDirection, pause, setWind, isWind, setStatus, handleWindCheck}) => {
    //console.log(`WindSelector => isWind: ${isWind}`);
    const [filterByWind, setFilterByWind] = useState(isWind);
    const backgroundColorClass = (isWind === true) ? 'bg-lite glassy' : 'glassy';
    const windClass = () => `${backgroundColorClass} flex2Column r-10 m-5 p-15`;
    const handleWindSelection = (groupTitle, label, selected) => {
        setStatus(selected)
    }

    return (
        <div className={windClass()} onMouseDown={pause}>
            {/*console.log(`windSelector => windDirection: ${status.windDirection}`)*/}
            Wind<br/>
            <div className="pt-10">
                <WindDirection columns="1" setWind={setWind} height='150px'/>
            </div>
            <Selector
                groupTitle="Wind" 
                selected={windDirection} 
                label="Direction"
                items={directions}
                onChange={handleWindSelection}
                fontSize='20'
                padding='5px'
                width='93%'
            />
            <div className="button mt-15" onClick={handleWindCheck}>
                {(isWind === true) ? <img src={thumbsUp} alt='wind' className='p-10 r-20' /> : <img src={thumbsDown} alt='wind' className='p-10 r-20' /> }
            </div>
        </div>
    );
}
export default WindSelector;