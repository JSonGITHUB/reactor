import { useState, useEffect, useRef } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackNote from './TrackNote';
import initNoteTracking from './initNoteTracking';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';

const Notes = () => {

    const [notes, setNotes] = useState(initializeData('noteTracking', initNoteTracking));
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    
    const targetElementRef = useRef(null);

    const scrollToBottom = () => {
        //alert(`scrollToBottom`);
        if (targetElementRef.current) {
            //targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };
    useEffect(() => {
        if (initialized) {
            const updatedTrackingData = Array.isArray(notes)
                ? notes.map((group) => ({
                    ...group,
                    isCollapsed: isCollapsed
                }))
                : notes;
            setNotes(updatedTrackingData);
        } else {
            setInitialized(true);
        }
    }, [isCollapsed, initialized]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (notes !== undefined || notes !== '') {
            localStorage.setItem('noteTracking', JSON.stringify(notes));
        }
    }, [notes]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('WorkOutSearch', searchTerm);
            if (notes && notes !== undefined) {
                const inNoteGroupTitle = (noteGroup) => noteGroup.title.toLowerCase().includes(searchTerm);
                const inNotes = (noteGroup) => {
                    if (noteGroup.notes && noteGroup.notes.length > 0) {
                        return noteGroup.notes.some((note) => {
                            return (
                                (note.description && note.description.toLowerCase().includes(searchTerm)) ||
                                (note.note && note.note.toLowerCase().includes(searchTerm))
                            );
                        });
                    }
                    return false;
                };
                const filteredNotes = [...notes];
                filteredNotes.forEach((noteGroup) => {
                    noteGroup.display = false;
                    if ((inNoteGroupTitle(noteGroup) || inNotes(noteGroup) || searchTerm === '' || searchTerm === ' ' || searchTerm === null)) {
                        noteGroup.display = true;
                    }
                });
                setNotes(filteredNotes);
            }
        }
    }, [newProjectDescription]); // eslint-disable-line react-hooks/exhaustive-deps

    const addProject = () => {
        const addNoteGroup = () => {
            const updatedNotes = [...notes];
            const title = newProjectDescription;
            if (title) {
                const noteGroup = {
                    title: title,
                    notes: [],
                    isCollapsed: false
                };
                updatedNotes.push(noteGroup)
                setNotes(updatedNotes);
            }
        };
        addNoteGroup();
        setNewProjectDescription('');
    };

    return <div className='mt--30'>
        <div className='containerDetail color-lite bg-lite m-5 p-22 size30 contentLeft'>
            <span className='size40 m-5'>{icons.notes}</span> Notes
        </div>
        <div className='pt-5'>
            <AddProjectInterface
                newProjectDescription={newProjectDescription}
                setNewProjectDescription={setNewProjectDescription}
                addProject={addProject}
                tracking={'notes'}
            />
        </div>
        <div className=''>
            <div className='containerDetail mb-5 size20 color-yellow p-10 bg-lite m-5'>
                <CollapseToggleButton
                    title={isCollapsed ? `Expand All` : `Collapse All`}
                    isCollapsed={isCollapsed}
                    setCollapse={setIsCollapsed}
                    align='left'
                />
            </div>
            <TrackNote
                notes={notes}
                setNotes={setNotes}
                targetElementRef={targetElementRef}
                scrollToBottom={scrollToBottom}
            />
        </div>
    </div>
};

export default Notes