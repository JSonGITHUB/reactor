import React, { useState, useEffect, useContext } from 'react';
import CircuitGroup from './CircuitGroup';
import { CircuitContext } from '../context/CircuitContext';
import initializeData from '../utils/InitializeData';
import icons from '../site/icons';
import Selector from '../forms/FunctionalSelector';

const TrackCircuit = () => {

    const {
        circuits,
        setCircuits,
        setActiveIndex,
        setActivated,
        ticker,
        setTicker,
        countdown,
        setCountdown,
        jumpToActive,
        setEdit,
        group,
        groups,
        selectGroup
    } = useContext(CircuitContext);

    const [collapse, setCollapse] = useState();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized) {
            setInitialized(true);
        } else {
            localStorage.setItem('circuitGroup', group);
        }
    }, [group, initialized]);

    useEffect(() => {
        localStorage.setItem('circuitTracking', JSON.stringify(circuits));
    }, [circuits]);
    
    useEffect(() => {
        if (collapse !== undefined) {
            setCircuits((previousCircuits) => previousCircuits.map((circuitGroup) => ({
                ...circuitGroup,
                isCollapsed: collapse,
                circuits: circuitGroup.circuits.map((circuit) => ({
                    ...circuit,
                    isCollapsed: collapse
                }))
            })));
            localStorage.setItem('circuitsCollapsed', collapse);
        } else {
            setCollapse(initializeData('circuitsCollapsed', true));
        }
    }, [collapse]); // eslint-disable-line react-hooks/exhaustive-deps
    const toggleEdit = () => {
        setEdit(prev => !prev);
    }

    const reset = () => {
        const newCircuits = circuits.map((circuitGroup) => ({
            ...circuitGroup,
            circuits: circuitGroup.circuits.map((circuit) => ({
                ...circuit,
                isCollapsed: collapse,
                display: true,
                excersizes: circuit.excersizes.map((excersize) => ({
                    ...excersize,
                    complete: false,
                    activated: false,
                    display: true,
                    currentTime: circuit.time,
                    restTime: circuit.restTime,
                    elapsedTime: 0
                }))
            }))
        }));
        setCircuits(newCircuits);
        setActivated(false);
        setActiveIndex(null)
    }
    const tickerToggleButton = () => {
        return <div
            title='timer bell'
            className='containerBox bg-lite centerVertical p-20 color-yellow button scrollSnapRight'
            onClick={() => setTicker(prev => !prev)}
        >
            {icons.track} {(ticker) ? icons.soundOn : icons.soundOff}
        </div>
    }
    const countdownToggleButton = () => {
        return <div
            title='countdown bell'
            className='containerBox bg-lite centerVertical p-20 color-yellow button scrollSnapRight'
            onClick={() => setCountdown(prev => !prev)}
        >
            {icons.alarmOn} {(countdown) ? icons.soundOn : icons.soundOff}
        </div>
    }
    const resetButton = () => {
        return (
            <div 
                title='reset' 
                onClick={() => reset()} 
                className='containerDetail m-5 bg-lite centerVertical p-20 size12 bold button scrollSnapRight'
            >
                Reset
            </div>
        )
    }
    const collapseButton = () => {
        return (
            <div 
                title={(collapse) ? 'Expand All' : 'Collapse All'}
                onClick={() => setCollapse(prev => !prev)} 
                className='containerDetail m-5 bg-lite centerVertical p-20 size12 bold button scrollSnapRight'
            >
                {(collapse) ? 'Expand All' : 'Collapse All'}
            </div>
        )
    }
    const jumpToActiveButton = () => {
        return (
            <div 
                title='scroll to current excersize'
                onClick={() => jumpToActive()} 
                className='containerDetail m-5 bg-lite centerVertical p-20 size12 bold button scrollSnapRight'
            >
                Current Excersize
            </div>
        )
    }
    const editButton = () => {
        return (
            <div 
                title='edit'
                onClick={() => toggleEdit()} 
                className='containerDetail m-5 bg-lite centerVertical p-20 size12 bold button scrollSnapRight'
            >
                {icons.edit}
            </div>
        )
    }

    return (
        <div key='circuit-group-container' className='pb-100'>
            <div className='containerBox pr-20'>
                <Selector
                    label='Circuit Groups'
                    items={groups}
                    selected={group}
                    setSelected={selectGroup}
                    onChange={selectGroup}
                />
            </div>
            {
                /*
                circuits.map((circuitGroup, circuitGroupIndex) => (
                        <div key='circuit-groups'>
                            <CircuitGroup
                                circuitGroup={circuitGroup}
                                circuitGroupIndex={circuitGroupIndex}
                                deleteGroup={deleteGroup}
                                addCircuit={addCircuit}
                            />
                        </div>
                    ))
                */
            }
            <div key='circuit-groups'>
                <CircuitGroup />
            </div>
            <div className={`containerDetail bt-5 ml-5 width--10 bg-tintedMediumDark size12 color-lite`}>
                <div className={`button-container`}>
                    <div title='current excersize' className='scrollSnapRight'>
                        {jumpToActiveButton()}
                    </div>
                    <div title='expand/collapse' className='scrollSnapRight'>
                        {collapseButton()}
                    </div>
                    <div title='reset' className='scrollSnapRight'>
                        {resetButton()}
                    </div>
                    <div title='edit' className='scrollSnapRight'>
                        {editButton()}
                    </div>
                    {tickerToggleButton()}
                    {countdownToggleButton()}
                </div>
            </div>
        </div>
    )
}

export default React.memo(TrackCircuit)