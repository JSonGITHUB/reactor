import React, { useEffect } from 'react';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initSession from './initSession';
import initTask from './initTask';
import ChargeProject from './ChargeProject';
import getKey from '../utils/KeyGenerator';
import initializeData from '../utils/InitializeData';

const TrackCharge = ({
    charges,
    setCharges,
    newProjectDescription,
    getProjectTime,
    searchTerm
}) => {

    useEffect(() => {
        const templateData = [
            { 
                "description": "Big Day", 
                "createdDate": "3/11/2024, 3:53:03 PM", 
                "startTime": 1710197583479, 
                "tasks": [
                    { 
                        "startTime": 1710292955824, 
                        "endTime": "", 
                        "description": "b + s: 50-100%", 
                        "sessions": [
                            { 
                                "startDate": "3/12/2024, 6:22:35 PM", 
                                "startTime": 1710292955824, "endDate": "3/19/2024, 9:44:45 AM", 
                                "endTime": 1710866685699, "totalTime": "159:22:09", 
                                "runningTime": 573729875, "runningTimeDisplay": "159:22:09" }], "isRunning": false, "runningTime": 573729875, "runningTimeDisplay": "159:22:09", 
                                "totalTime": null, "isCollapsed": false 
                            }, 
                            {
                                "startTime": 1710197605280, 
                                "endTime": "", 
                                "description": "z + z: 30-100%", 
                                "sessions": [
                                    { 
                                        "startDate": "3/11/2024, 3:53:25 PM", 
                                        "startTime": 1710197605280, 
                                        "endDate": "3/11/2024, 3:53:32 PM", 
                                        "endTime": 1710197612430, "totalTime": "00:00:07", 
                                        "runningTime": 7150, "runningTimeDisplay": "00:00:07" 
                                    }, 
                                    { 
                                        "startDate": "3/11/2024, 3:53:35 PM", 
                                        "startTime": 1710197615862, "endDate": "3/11/2024, 3:53:40 PM", 
                                        "endTime": 1710197620626, "totalTime": "00:00:04", 
                                        "runningTime": 4764, "runningTimeDisplay": "00:00:04" 
                                    }
                                ], 
                                "isRunning": false, 
                                "runningTime": 11914, 
                                "runningTimeDisplay": "00:00:11", 
                                "totalTime": null, 
                                "timerId": 31, 
                                "isCollapsed": false
                            }, 
                            { 
                                "startTime": 1710197594584, 
                                "endTime": "", 
                                "description": "b + z: 50-100%",
                                "sessions": [
                                    { 
                                        "startDate": "3/11/2024, 3:53:14 PM", 
                                        "startTime": 1710197594583, 
                                        "endDate": "3/11/2024, 3:53:28 PM", 
                                        "endTime": 1710197608594, 
                                        "totalTime": "00:00:14", 
                                        "runningTime": 14011, 
                                        "runningTimeDisplay": "00:00:14" 
                                    }, 
                                    { 
                                        "startDate": "3/11/2024, 3:53:30 PM", 
                                        "startTime": 1710197610893, 
                                        "endDate": "3/11/2024, 3:53:38 PM", 
                                        "endTime": 1710197618411, 
                                        "totalTime": "00:00:07", 
                                        "runningTime": 7518, 
                                        "runningTimeDisplay": "00:00:07" 
                                    }
                                ], 
                                "isRunning": false, 
                                "runningTime": 21529, 
                                "runningTimeDisplay": "00:00:21", 
                                "totalTime": null, 
                                "timerId": 30, 
                                "isCollapsed": true 
                            }
                        ], 
                        "totalTime": null, 
                        "isCollapsed": false 
                    }
                ]
        const storedCharges = initializeData('chargeTracking', null);
        if (storedCharges && (JSON.stringify(storedCharges) !== '[null]')) {
            setCharges(storedCharges);
        } else {
            setCharges([initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0)]);                
        }
    }, []);

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
            <div className='containerBox'>
                <div className='containerBox bold size30 bg-lite'>Charge Log</div>
            </div>
        }
        <div>
            {
                (charges !== null)
                ? charges.map((chargeProject, chargeProjectIndex) => (
                    (searchTerm === '' || (chargeProject.description && chargeProject.description.toLowerCase().includes(searchTerm.toLowerCase())) || (chargeProject.tasks && chargeProject.tasks.some(task => task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))))
                    ? <div key={getKey(`chargeProject${chargeProjectIndex}`)}>
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