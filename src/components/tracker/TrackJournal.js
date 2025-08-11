import React, { useState, useEffect } from 'react';
import initJournalTracking from './initJournalTracking';
import JournalGroup from './JournalGroup';
import getKey from '../utils/KeyGenerator';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';

const TrackJournal = ({
    journals,
    setJournals,
    targetElementRef,
    scrollToBottom
}) => {

    const storedSort = initializeData('journalSort', 'false');
    const initialSort = storedSort ? storedSort === 'true' : true;
    const [sort, setSort] = useState(initialSort);

    useEffect(() => {
        if ((journals === null || journals === undefined || journals === 'undefined') && (initializeData('journalSort', null) === null)) {
            setJournals(initJournalTracking);
        } else {
            if (journals !== null && journals !== undefined && journals !== 'undefined') {
                console.log(`TrackJournal => useEffect => journals: ${JSON.stringify(journals, null, 2)}`);
                localStorage.setItem('journalTracking', JSON.stringify(journals));
            }
        }
    }, [journals]);

    useEffect(() => {
        const storedJournals = (journals !== null && journals !== undefined) 
                                ? journals 
                                : initializeData('journalTracking', initJournalTracking)
        console.log(`TrackJournal => useEffect => storedJournals: ${JSON.stringify(storedJournals, null, 2)}`);
        setJournals(storedJournals);
    }, []);

    useEffect(() => {
        localStorage.setItem('journalSort', sort);
    }, [sort]);

    const notNull = (value) => (value !== null) ? true : false;
    const notEmpty = (value) => (value !== "") ? true : false;
    const isGood = (value) => (notNull(value) && notEmpty(value)) ? true : false;

    const addJournal = (journalGroupIndex, journalIndex) => {
        const updatedJournals = [...journals];
        const journalDescription = prompt('Journal description:', '');
        const newJournal = {
            description: journalDescription,
            journal: ''
        }
        if (isGood(journalDescription)) {
            updatedJournals[journalGroupIndex].journals.push(newJournal)
            setJournals(updatedJournals);
        }

    };
    const deleteGroup = (journalGroupIndex) => {
        const toggle = window.confirm(`Are you sure you want to remove journal group ${journals[journalGroupIndex].title}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error("Index out of range");
            }
        };
        if (toggle) {
            const newJournals = [...journals];
            removeItemByIndex(newJournals, journalGroupIndex);
            setJournals(newJournals);
        }
    }
    return (
        <div key={getKey('journalGroupContainer')}>
            <div className='containerBox'>
                <CollapseToggleButton
                    title={'Sort'}
                    isCollapsed={sort}
                    setCollapse={setSort}
                    align='left'
                />
            </div>
            {
                (sort && journals)
                ? <div className='containerBox'>
                    {
                        journals.slice().reverse().map((journal,j) => <div key={getKey(j)} className='containerBox'>{journal.title}</div>)
                    }
                    {
                        journals.slice().reverse().map((journalGroup, journalGroupIndex, array) => <div key={getKey('journalGroups')} className='containerBox'>
                                <JournalGroup
                                    journals={journals}
                                    setJournals={setJournals}
                                    journalGroup={journalGroup}
                                    journalGroupIndex={(array.length - 1 - journalGroupIndex)}
                                    deleteGroup={deleteGroup}
                                    addJournal={addJournal}
                                    targetElementRef={targetElementRef}
                                    scrollToBottom={scrollToBottom}
                                    sort={sort}
                                />
                            </div>
                        )
                    }
                    </div>
                : (journals)
                    ? journals.map((journalGroup, journalGroupIndex) => (
                        (journalGroup.display && journalGroup.display === true)
                            ? <div key={getKey('journalGroups')} className='containerBox'>
                                <JournalGroup
                                    journals={journals}
                                    setJournals={setJournals}
                                    journalGroup={journalGroup}
                                    journalGroupIndex={journalGroupIndex}
                                    deleteGroup={deleteGroup}
                                    addJournal={addJournal}
                                    targetElementRef={targetElementRef}
                                    scrollToBottom={scrollToBottom}
                                />
                            </div>
                            : null
                    ))
                    : null
            }
        </div>
    )
}

export default TrackJournal