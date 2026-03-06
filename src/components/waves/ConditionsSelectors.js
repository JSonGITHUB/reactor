import React, { useState, useEffect, useContext, useRef } from 'react';
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

    const distanceInputIdRef = useRef(null);

    const {
        status,
        handleStarSelection,
        handleDistanceSelection
    } = useContext(OceanContext);

    const refresh = () => window.location.pathname = '/reactor/Waves';
    if (distanceInputIdRef.current === null) {
        distanceInputIdRef.current = `distance-${Math.random().toString(36).slice(2, 10)}`;
    }
    const distanceInputId = distanceInputIdRef.current;
    const getLocalData = (localItem) => initializeData(localItem, null);
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [conditionsCollapse, setConditionsCollapse] = useState(collapseStateInit('conditionsCollapse'));

    useEffect(() => {
        localStorage.setItem('conditionsCollapse', conditionsCollapse);
    }, [conditionsCollapse]);

    const starSelector = (stars) => <div className='containerDetail m-5 flex2Column size20' >
        <div className='containerDetail bg-lite color-yellow contentLeft p-10'>
            Match
        </div>
        <div className='width--5 mt--5'>
            <Selector
                groupTitle='Matches'
                selected={stars}
                label='Quality'
                items={[0, 1, 2, 3, 4, 5]}
                onChange={handleStarSelection}
                fontSize='30'
                padding='5px'
                width='93%'
            />
        </div>
    </div>
    const milesInput = (distance) => <div className='containerDetail m-5 flex2Column size20'>
        <label htmlFor={distanceInputId}>
            <div className='containerDetail bg-lite color-yellow contentLeft p-10'>
                Miles
            </div>
            <input className='containerDetail bg-dark p-10 color-lite mb-5 width--5 mt-5'
                id={distanceInputId}
                name={distanceInputId}
                type='number'
                value={isNaN(Number(distance) || distance === '' || Number(distance) < 1) ? 10 : Number(distance)}
                onChange={handleDistanceSelection}
            />
        </label>
    </div>

    return <div>
        <div className='containerDetail mb-5 mt-5 size20 color-yellow bg-lite p-20'>
            <CollapseToggleButton
                title={`${icons.save} Select Conditions`}
                isCollapsed={conditionsCollapse}
                setCollapse={setConditionsCollapse}
                align='left'
            />
        </div>
        {
            (conditionsCollapse)
                ? <div></div>
                : <div className=''>
                    <div className='flexContainer'>
                        <SwellSelector
                            id={String(1)}
                            swellDirection={status.swell1Direction}
                        >
                        </SwellSelector>
                        <SwellSelector
                            id={String(2)}
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
        <div className='button bg-green r-10 mt-5 mb-5 size20 p-20 color-white bold' onClick={refresh}>
            Refresh
        </div>
    </div>
}
export default ConditionsSelectors;
