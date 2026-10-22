import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import Journal from './Journal';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';

const JournalGroup = ({
    journals,
    setJournals,
    journalGroup,
    journalGroupIndex,
    deleteGroup,
    addJournal,
    targetElementRef,
    scrollToBottom,
    sort
}) => {

    const [isCollapsed, setIsCollapsed] = useState(journalGroup.isCollapsed);
    const [edit, setEdit] = useState(false);
    const isEditedJournalGroupTitle = () => (edit) ? true : false;
    const [editedJournalGroupTitle, setEditedJournalGroupTitle] = useState(null);
        
    useEffect(() => {
        let dataUpdated = false;
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex];
        //if (selectedNewJournal.journals === undefined) {
        if (selectedNewJournal?.journals && validate(selectedNewJournal?.journals) === null) {
            selectedNewJournal.journals = [];
            dataUpdated = true;
        }
        if (dataUpdated) {
            setJournals(newJournals);
        }

    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const newJournals = [...journals];
        const selectedJournalGroup = newJournals[journalGroupIndex];
        if (selectedJournalGroup) {
            selectedJournalGroup.isCollapsed = isCollapsed;
        }
        const stringifiedData = JSON.stringify(newJournals);
        
        if (stringifiedData !== 'undefined' && stringifiedData !== undefined && stringifiedData !== '[null]') {
            localStorage.setItem('journalTracking', stringifiedData);
        }
    }, [isCollapsed, journalGroupIndex, journals]);
    
    const toggleEdit = () => {
        const toggle = (edit)
            ? false
            : true;
        const wasJournalGroupTitleEdited = (journalGroup.title !== editedJournalGroupTitle) ? true : false;
        setEdit(toggle);
        setEditedJournalGroupTitle((toggle) ? journalGroup.title : '');
        if (!toggle && wasJournalGroupTitleEdited) {
            const newJournals = [...journals];
            const selectedNewJournalGroup = newJournals[journalGroupIndex];
            selectedNewJournalGroup.title = (wasJournalGroupTitleEdited) ? editedJournalGroupTitle : selectedNewJournalGroup.title;
            setJournals(newJournals);
        }
    }
    const addToGroup = (journalGroupIndex, elementRef) => {
        addJournal(journalGroupIndex)
        //setScroll(journalGroupIndex * 50);
        scrollToBottom(elementRef);
    }
    return <div key={`journal-group-${journalGroupIndex}-${String(journalGroup?.title || 'group')}`} className='mt-5' ref={targetElementRef}>
                {/*<div className='containerDetail'>*/}
                    <div className='containerDetail flexContainer'>
                        <div className='flex1Auto'>
                            {
                                (isEditedJournalGroupTitle())
                                ? <div className='flexContainer'>
                                    <div className='flex2Column'>
                                        <textarea
                                            className='inputField ht-55 size25 r-10 color-yellow'
                                            onChange={(e) => setEditedJournalGroupTitle(e.target.value)}
                                            value={(editedJournalGroupTitle !== null) ? editedJournalGroupTitle : journalGroup.title}
                                            placeholder={editedJournalGroupTitle}
                                        >
                                            {editedJournalGroupTitle}
                                        </textarea>
                                    </div>
                                    <div className='flexColumn'>
                                        <span>
                                            <div
                                                title='save' 
                                                className='containerDetail bg-neogreen color-dark bold button p-15' 
                                                onClick={() => toggleEdit(journalGroupIndex)}
                                            >
                                                save
                                            </div>
                                        </span>
                                    </div>
                                </div>
                                : <div className='centerVertical color-yellow'>
                                    <CollapseToggleButton
                                        title={journalGroup?.title}
                                        isCollapsed={isCollapsed}
                                        setCollapse={setIsCollapsed}
                                        align='left'
                                        editTitle={toggleEdit}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                    {
                        (isCollapsed) 
                        ? null 
                        : <div className='containerDetail mt-5 mb-5'>
                            <div className='flexContainer contentRight'>
                                <div
                                    title='add to group'
                                    className='containerDetail flex2Column button bg-lite centeredContent p-10 mr-5'
                                    onClick={() => addToGroup(journalGroupIndex, targetElementRef)}
                                >
                                    <div className='flexContainer'>
                                        <div className='flex2Column text-outline-lite size20 mt-5'>
                                            {icons.plus}
                                        </div>
                                        <div className='flex2Column p-5 size25'>
                                            {icons.session}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    title='delete group' 
                                    className='containerDetail p-15 flex2Column button bg-lite centeredContent' 
                                    onClick={() => deleteGroup(journalGroupIndex)}
                                >
                                    {icons.delete}
                                </div>
                            </div>
                        </div>
                    }
                    <div className=''>
                        {
                            (isCollapsed) 
                            ? null
                            : (sort)
                                ? journalGroup.journal.slice().reverse().map((journal, journalIndex, array) => (
                                        <div key={`journal-container-sorted-${journalGroupIndex}-${array.length - 1 - journalIndex}-${String(journal?.description || 'journal')}`}>
                                            <Journal
                                                journals={journals}
                                                setJournals={setJournals}
                                                journalGroupIndex={journalGroupIndex} 
                                                journalIndex={journalIndex}
                                                journal={journal}
                                            />
                                        </div>
                                    ))
                                : journalGroup.journals.map((journal, journalIndex) => (
                                    <div key={`journal-container-${journalGroupIndex}-${journalIndex}-${String(journal?.description || 'journal')}`}>
                                        <Journal
                                            journals={journals}
                                            setJournals={setJournals}
                                            journalGroupIndex={journalGroupIndex} 
                                            journalIndex={journalIndex}
                                            journal={journal}
                                        />
                                    </div>
                                ))
                        }
                    </div>
                {/*</div>*/}
        </div>
}
export default JournalGroup;