import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import Journal from './Journal';
import getKey from '../utils/KeyGenerator';
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
    const [collapsed, setCollapsed] = useState(journalGroup.isCollapsed);
    const [edit, setEdit] = useState(false);
    const isEditedJournalGroupTitle = () => (edit) ? true : false;
    const [editedJournalGroupTitle, setEditedJournalGroupTitle] = useState(null);
    //console.log(`JournalGroup => journals: ${JSON.stringify(journals,null,2)}`)
        
    useEffect(() => {
        let dataUpdated = false;
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex];
        //if (selectedNewJournal.journals === undefined) {
        if (validate(selectedNewJournal.journals) === null) {
            selectedNewJournal.journals = [];
            dataUpdated = true;
        }
        if (dataUpdated) {
            setJournals(newJournals);
        }
    }, []);
    useEffect(() => {
        const newJournals = [...journals];
        const selectedJournalGroup = newJournals[journalGroupIndex];
        selectedJournalGroup.isCollapsed = collapsed;
        const stringifiedData = JSON.stringify(newJournals);
        //console.log(`Journal => stringifiedData: ${stringifiedData}`);
        localStorage.setItem('journalTracking', stringifiedData);
    }, [collapsed]);
    
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
    return <div key={getKey(`journal${journalGroupIndex}`)} className='containerBox' ref={targetElementRef}>
                {/*<div className='containerBox'>*/}
                    <div className='containerBox flexContainer bg-lite'>
                        <div className='flex1Auto'>
                            {
                                (isEditedJournalGroupTitle())
                                ? <div className='flexContainer'>
                                    <div className='flex2Column'>
                                        <textarea
                                            className='inputField ht-55 size25 r-10 color-yellow bold'
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
                                                className='containerBox bg-neogreen color-dark bold button p-15' 
                                                onClick={() => toggleEdit(journalGroupIndex)}
                                            >
                                                save
                                            </div>
                                        </span>
                                    </div>
                                </div>
                                : <div className='centerVertical color-yellow bold'>
                                    <CollapseToggleButton
                                        title={journalGroup.title}
                                        isCollapsed={collapsed}
                                        setCollapse={setCollapsed}
                                        align='left'
                                        editTitle={toggleEdit}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                    {
                        (collapsed) 
                        ? null 
                        : <div className='containerBox'>
                            <div className='flexContainer contentRight'>
                                <div
                                    title='add to group'
                                    className='containerBox flex2Column button bg-lite centeredContent'
                                    onClick={() => addToGroup(journalGroupIndex, targetElementRef)}
                                >
                                    <div className='flexContainer'>
                                        <div className='flex2Column text-outline-light size20 mt-5'>
                                            {icons.plus}
                                        </div>
                                        <div className='flex2Column p-5 size25'>
                                            {icons.session}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    title='delete group' 
                                    className='containerBox p-15 flex2Column button bg-lite centeredContent' 
                                    onClick={() => deleteGroup(journalGroupIndex)}
                                >
                                    {icons.delete}
                                </div>
                            </div>
                        </div>
                    }
                    <div>
                        {
                            (collapsed) 
                            ? null 
                            : (sort)
                                ? journalGroup.journals.slice().reverse().map((journal, journalIndex, array) => (
                                        <div key={getKey(`journalContainer${journalIndex}`)}>
                                            <Journal
                                                journals={journals}
                                                setJournals={setJournals}
                                                journalGroupIndex={journalGroupIndex} 
                                                journalIndex={(array.length - 1 - journalIndex)}
                                                journal={journal}
                                            />
                                        </div>
                                    ))
                                : journalGroup.journals.map((journal, journalIndex) => (
                                    <div key={getKey(`journalContainer${journalIndex}`)}>
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