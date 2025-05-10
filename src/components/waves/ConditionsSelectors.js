import React, { useState, useEffect, useContext } from 'react';
import WindSelector from './wind/WindSelector.js';
import TideSelector from './tide/TideSelector.js';
import SwellSelector from './SwellSelector.js';
import Selector from '../forms/FunctionalSelector.js';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons.js';
import initializeData from '../utils/InitializeData';
import { OceanContext } from '../context/OceanContext';

const ConditionsSelectors = ({
    tideDisplay
}) => {

    const {
        status,
        handleStarSelection,
        handleDistanceSelection
    } = useContext(OceanContext);

    const refresh = () => window.location.pathname = '/reactor/Waves';
    const getLocalData = (localItem) => initializeData(localItem, null);
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [conditionsCollapse, setConditionsCollapse] = useState(collapseStateInit('conditionsCollapse'));

    useEffect(() => {
        localStorage.setItem('conditionsCollapse', conditionsCollapse);
    }, [conditionsCollapse]);

    const starSelector = (stars) => <div className='containerBox flex2Column mt-5' >
        <div className='containerBox bg-lite'>
            Match
        </div>
        <div className='size20 width-auto mr-10'>
            <Selector
                groupTitle='Matches'
                selected={stars}
                label='Quality'
                items={[0, 1, 2, 3, 4, 5]}
                onChange={handleStarSelection}
                fontSize='20'
                padding='5px'
                width='93%'
            />
        </div>
    </div>
    const milesInput = (distance) => <div className='containerBox flex2Column mt-5'>
        <label>
            <div className='containerBox bg-lite'>
                Miles
            </div>
            <input className='containerBox width--10'
                id='distance'
                name='distance'
                type='number'
                value={isNaN(Number(distance) || distance === '' || Number(distance) < 1) ? 10 : Number(distance)}
                onChange={handleDistanceSelection}
            />
        </label>
    </div>

    return <div>
        <div className='containerBox bold color-yellow bg-lite p-20'>
            <CollapseToggleButton
                title={`${icons.save} SELECT CONDITIONS`}
                isCollapsed={conditionsCollapse}
                setCollapse={setConditionsCollapse}
                align='left'
            />
        </div>
        {
            (conditionsCollapse)
                ? <div></div>
                : <div className='containerBox'>
                    <div className='flexContainer'>
                        <SwellSelector
                            id='1'
                            swellDirection={status.swell1Direction}
                        >
                        </SwellSelector>
                        <SwellSelector
                            id='2'
                            swellDirection={status.swell2Direction}
                        >
                        </SwellSelector>
                    </div>
                    <div className='flexContainer'>
                        <TideSelector
                            tideDisplay={tideDisplay}
                        />
                        <WindSelector
                            windDirection={status.windDirection}
                        />
                    </div>
                    <div className='flexContainer'>
                        {milesInput(status.distance)}
                        {starSelector(status.stars)}
                    </div>
                </div>
        }
        <div className='button bg-neogreen r-10 m-5 p-15 color-black bold' onClick={refresh}>
            Refresh
        </div>
    </div>
}
export default ConditionsSelectors;
