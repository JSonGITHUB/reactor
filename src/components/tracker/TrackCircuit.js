import React, { useState, useEffect, useContext } from 'react';
import CircuitGroup from './CircuitGroup';
import getKey from '../utils/KeyGenerator';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import { CircuitContext } from '../context/CircuitContext';
import initCircuitTracking from './initCircuitTracking';
import initializeData from '../utils/InitializeData';
import icons from '../site/icons';
import Selector from '../forms/FunctionalSelector';

const TrackCircuit = () => {

    const {
        circuits,
        setCircuits,
        sort,
        setSort,
        activeIndex,
        setActiveIndex,
        setActivated,
        ticker,
        setTicker,
        countdown,
        setCountdown,
        jumpToActive,
        videoId,
        videoActive,
        edit,
        setEdit,
        groupIndex,
        setGroupIndex,
        group,
        setGroup,
        groups,
        selectGroup
    } = useContext(CircuitContext);

    const [, forceUpdate] = useState();
    const [collapse, setCollapse] = useState();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        console.log(`TrackCircuit => group: ${group}`);
        if (!initialized) {
            setInitialized(true);
        } else {
            localStorage.setItem('circuitGroup', group);
        }
    }, [group]);
    useEffect(() => {
        console.log(`TrackCircuit => groups: ${JSON.stringify(groups, null, 2)}`);
    }, [groups]);
    useEffect(() => {
        console.log(`TrackCircuit => groupIndex: ${groupIndex}`);
    }, [groupIndex]);
    useEffect(() => {
        console.log(`TrackCircuit => circuits update`);
        //forceUpdate(Math.random());
        localStorage.setItem('circuitTracking', JSON.stringify(circuits));
    }, [circuits]);
    useEffect(() => {
    }, [activeIndex]);
    useEffect(() => {
        console.log(`TrackCircuit => videoActive: ${videoActive} videoId: ${videoId}`);
    }, [videoId]);
    
    useEffect(() => {
        if (collapse !== undefined) {
            const newCircuits = [...circuits];
            newCircuits.map((circuitGroup) => {
                    return {
                        ...circuitGroup,
                        isCollapsed: collapse,
                        circuits: circuitGroup.circuits.map((circuit) => {
                            circuit.isCollapsed = collapse
                        }) 
                    }
            });        
            //console.log(`Circuits => newCircuits: ${JSON.stringify(newCircuits, null, 2)}`);
            localStorage.setItem('circuitsCollapsed', collapse);
            setCircuits(newCircuits);
        } else {
            setCollapse(initializeData('circuitsCollapsed', true));
        }
    }, [collapse]);
    const toggleEdit = () => {
        setEdit(!edit);
    }

    const reset = () => {
        const newCircuits = [...circuits];
        console.log(`newCircuits: ${JSON.stringify(newCircuits, null, 2)}`);
        newCircuits.map((circuitGroup) => {
            return {
                ...circuitGroup,
                circuits: circuitGroup.circuits.map((circuit) => {
                    return {
                        ...circuit,
                        isCollapsed: collapse
                    };
                })
            };
        });
        newCircuits.map((circuitGroup) => {
            return {
                ...circuitGroup,
                circuits: circuitGroup.circuits.map((circuit) => {
                    return {
                        ...circuit,
                        display: true,
                        excersizes: circuit.excersizes.map((excersize) => {
                            return {
                                ...excersize,
                                complete: false,
                                activated: false,
                                display: true,
                                currentTime: circuit.time,
                                restTime: circuit.restTime,
                                elapsedTime: 0
                            };
                        })
                    };
                })
            };
        });
        setCircuits(newCircuits);
        setActivated(false);
        setActiveIndex(null)
    }
    const tickerToggleButton = () => {
        return <div
            title='timer bell'
            className='containerBox bg-lite centerVertical p-20 color-yellow button scrollSnapRight'
            onClick={() => setTicker(!ticker)}
        >
            {icons.track} {(ticker) ? icons.soundOn : icons.soundOff}
        </div>
    }
    const countdownToggleButton = () => {
        return <div
            title='countdown bell'
            className='containerBox bg-lite centerVertical p-20 color-yellow button scrollSnapRight'
            onClick={() => setCountdown(!countdown)}
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
                onClick={() => setCollapse(!collapse)} 
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
        <div key={getKey('circuitGroupContainer')} className='pb-100'>
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
                        <div key={getKey('circuitGroups')}>
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
            <div key={getKey('circuitGroups')}>
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