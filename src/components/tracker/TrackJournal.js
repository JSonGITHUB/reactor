import React, { useState, useEffect } from 'react';
import initJournalTracking from './initJournalTracking';
import JournalGroup from './JournalGroup';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';

const TrackJournal = ({
    journals,
    setJournals,
    targetElementRef,
    scrollToBottom
}) => {
    const normalizeJournalGroups = (groups) => {
        if (!Array.isArray(groups)) return [];

        return groups.map((group) => ({
            ...group,
            display: group?.display !== false,
            journals: Array.isArray(group?.journals) ? group.journals : Array.isArray(group?.journal) ? group.journal : [],
            journal: Array.isArray(group?.journal) ? group.journal : Array.isArray(group?.journals) ? group.journals : [],
        }));
    };

    const storedSort = initializeData('journalSort', 'false');
    const initialSort = storedSort ? storedSort === 'true' : true;
    const [sort, setSort] = useState(initialSort);

    useEffect(() => {
        if ((journals === null || journals === undefined || journals === 'undefined') && (initializeData('journalSort', null) === null)) {
            //setJournals(initJournalTracking);
        } else {
            if (journals !== null && journals !== undefined && journals !== 'undefined' && journals[0] !== undefined) {
                localStorage.setItem('journalTracking', JSON.stringify(normalizeJournalGroups(journals)));
            }
        }
    }, [journals]);

    useEffect(() => {
        if (!Array.isArray(journals)) {
            setJournals(initializeData('journalTracking', initJournalTracking));
            return;
        }

        const needsNormalization = journals.some((group) => (
            group?.display === undefined
            || !Array.isArray(group?.journals)
            || !Array.isArray(group?.journal)
        ));

        if (needsNormalization) {
            setJournals(normalizeJournalGroups(journals));
        }
    }, [journals, setJournals]);

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
            updatedJournals[journalGroupIndex].journal.push(newJournal)
            setJournals(normalizeJournalGroups(updatedJournals));
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
            setJournals(normalizeJournalGroups(newJournals));
        }
    }
    return (
        <div key='journal-group-container' className='containerDetail bg-lite m-5'>
            <div className='containerDetail color-lite size20 mb-5'>
                <CollapseToggleButton
                    title={'Sort'}
                    isCollapsed={sort}
                    setCollapse={setSort}
                    align='left'
                />
            </div>
        {
            (sort && journals)
            ? <div className='containerDetail color-lite size20 mb-5'>
                {
                    normalizeJournalGroups(journals).slice().reverse().map((journalGroup, journalGroupIndex, array) => <div key={`journal-group-sorted-${array.length - 1 - journalGroupIndex}-${String(journalGroup?.title || 'group')}`} className=''>
                        <JournalGroup
                            journals={normalizeJournalGroups(journals)}
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
                ? normalizeJournalGroups(journals).map((journalGroup, journalGroupIndex) => (
                    (journalGroup.display !== false)
                        ? <div key={`journal-group-${journalGroupIndex}-${String(journalGroup?.title || 'group')}`} className=''>
                            <JournalGroup
                                journals={normalizeJournalGroups(journals)}
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