import React, { useEffect } from 'react';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initSession from './initSession';
import initTask from './initTask';
import ChargeProject from './ChargeProject';
import initializeData from '../utils/InitializeData';

const TrackCharge = ({
    charges,
    setCharges,
    newProjectDescription,
    getProjectTime,
    searchTerm
}) => {

    useEffect(() => {
        const storedCharges = initializeData('chargeTracking', null);
        if (storedCharges && (JSON.stringify(storedCharges) !== '[null]')) {
            setCharges(storedCharges);
        } else {
            setCharges([initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0)]);                
        }
    }, [setCharges]);

    const addCharge = (index) => {

        const batteryDescription = prompt('Battery Type:');
        const batteryLevel = prompt('Battery Level:');
        const chargeDescription = prompt('Solar Type:');
        const chargeLogDescription = `${batteryDescription} + ${chargeDescription}: ${batteryLevel}-100%`
        if (batteryDescription) {
            const sessions = [];
            sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0));
            const task = initTask(chargeLogDescription, sessions);
            const updatedCharges = [...charges];
            updatedCharges[index].tasks.unshift(task);
            updatedCharges[index].isCollapsed = false;
            setCharges(updatedCharges);
        }
    };
    
    const handleDeleteCharges = (index) => {
        const updatedCharges = [...charges];
        updatedCharges.splice(index, 1);
        setCharges(updatedCharges);
    };

    return <div>
        {
                <div className='containerDetail p-20 m-10 color-yellow bold size30 bg-lite'>Charge Log</div>
        }
        <div className='containerDetail bg-lite m-5'>
            {
                (charges !== null)
                ? charges.map((chargeProject, chargeProjectIndex) => (
                    (searchTerm === '' || (chargeProject.description && chargeProject.description.toLowerCase().includes(searchTerm.toLowerCase())) || (chargeProject.tasks && chargeProject.tasks.some(task => task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))))
                    ? <div key={`charge-project-${chargeProjectIndex}-${String(chargeProject?.description || 'project')}`}>
                        <ChargeProject
                            charges={charges}
                            setCharges={setCharges}
                            chargeProject={chargeProject}
                            chargeProjectIndex={chargeProjectIndex}
                            newProjectDescription={newProjectDescription}
                            handleDeleteCharges={handleDeleteCharges}
                            addCharge={addCharge}
                            getProjectTime={getProjectTime}
                        >
                        </ChargeProject>
                    </div>
                    : null
                ))
                : <div className='containerBox'>No Charges Recorded</div>
            }
        </div>
    </div>
}

export default TrackCharge