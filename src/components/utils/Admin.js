import React, { useState, useEffect } from 'react';
import initializeData from '../utils/InitializeData';

const Admin = () => {

    const [key, setKey] = useState('');
    const [action, setAction] = useState('view');
    const [data, setData] = useState(null);
    const [message, setMessage] = useState(null);
    const [editableData, setEditableData] = useState('');

    const localDataItems = [
        'Select a key',
        'tideChart',
        'wind',
        'isWind',
        'isTide',
        'isSwell1',
        'isSwell2',
        'swell1Direction',
        'swell2Direction',
        'tideNow',
        'tide',
        'tideDirection',
        'heightTime',
        'swellData',
        'swellCollapse',
        'windSpeed',
        'height',
        'sunset',
        'sunrise',
        'logId',
        'locations',
        'postDirectory',
        'tides',
        'spots',
        'spot',
        'tideData',
        'waterTemp',
        'airTemp',
        'edit',
        'elapsedTime',
        'stopwatchStartTime',
        'stopwatchPause',
        'distance',
        'latitude',
        'longitude',
        'TripFuelTracker',
        'usdPerGallon',
        'gallons',
        'location',
        'odometer',
        'trainingElapsedTime',
        'trainingActiveIndex',
        'trainingStartTime',
        'activeTimers',
        'goalData',
        'trainingData',
        'waveTracking',
        'projects',
        'recipeTracking',
        'noteTracking',
        'journalTracking',
        'journalSort',
        'eventTracking',
        'tracking',
        'chargeTracking',
        'taskTracking',
        'linkTracking',
        'vueTodosRevert',
        'vueTodosSaved',
        'aisles',
        'vueTodos',
        'tax',
        'longitude',
        'latitude',
        'pausedTodos',
        'localTimedItems',
        'todos',
        'standardWinner',
        'ping pongWinner',
        'golfWinner',
        'cornholeWinner',
        'dartsWinner',
        'horseWinner',
        'horseshoesWinner',
        'bocciWinner',
        'dominosWinner',
        'surfWinner',
        'heatLog',
        'winner',
        'surfWinner',
        'game',
        'gameStatus',
        'golfPars',
        'players',
        'timerTimeRemaining',
        'timerStartTime',
        'timerPause',
        'time',
        'timeLeft',
        'notes',
        'expenses',
        'exchangeRates',
        'circuitTracking',
        'circuitSort',
        'activeCircuitTime',
        'activeIndex',
        'activated',
        'countdown',
        'ticker',
        'breathing'
    ];
    
    const defaultData = [
        {
            'skill': 'Surfing',
            'time': '00:00:00',
            'percentage': '0'
        }
    ];

    useEffect(() => {
        console.log(`editableData: ${editableData}`);
    }, [editableData]);

    useEffect(() => {
        console.log(`data: ${data}`);
    }, [data]);

    const handleView = () => {
        const storedData = initializeData(key, null);
        let allData = [];
        if (key === '*') {
             allData = localStorage;
        }
        const startsWithBracket = (str) => String(str).charAt(0) === '[' || String(str).charAt(0) === '{';
        if (storedData) {
            const displayData = (startsWithBracket(storedData))
            ? JSON.stringify(storedData, null, 2)
            : storedData;
            //const formattedData = storedData
            /*const formattedData = displayData
                .replace(/,/g, ',\n')
                .replace(/}/g, '\n}')
                .replace(/{/g, '\n{\n')
                .replace(/]/g, ']\n')
                .replace(/\[/g, '[\n');
            */
            //setData(formattedData);
            setMessage(null);
            setData(displayData);
        } else {
            setMessage(`No data found for ${key}.`);
        }
    };
    const handleNew = () => {
        const storedData = initializeData(key, null);
        if (storedData) {
            setMessage(`Data already exists for ${key}.`);
        } else {
            const displayData = JSON.stringify(defaultData, null, 2);
            setMessage(null);
            setData(displayData);
        }
    };

    const handleRemove = () => {
        localStorage.removeItem(key);
        setMessage(`Data for key '${key}' has been removed.`);
        setData(null);
        setEditableData('');
    };

    const handleEdit = () => {
        localStorage.setItem(key, data);
        setData(null);
        setEditableData('');
        setMessage(`Changes have been saved to ${key}`);
    };
    const handleAdd = () => {
        localStorage.setItem(key, data);
        setData(null);
        setEditableData('');
        setMessage(`${key} has been added to localStorage`);
    };
    const handleActionChange = (e) => {
        setAction(e.target.value);
        setData(null);
        setMessage(null);
        setEditableData('');
    };
    const handleKeyChange = (e) => {
        setKey(e.target.value);
        setData(null);
        setMessage(null);
        setEditableData('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (key.trim() === '') {
            alert('Please enter a localStorage key.');
            return;
        }
        if (action === 'view') {
            handleView();
        } else if (action === 'remove') {
            handleRemove();
        } else if (action === 'edit') {
            handleView(); // Load data for editing
        } else if (action === 'add') {
            handleNew();
        }
    };
    return (
        <div className='containerBox'>
            <div className='containerBox bg-lite'>
                <h2>Admin Tool</h2>
            </div>
            <form className='containerBox' onSubmit={handleSubmit}>
                <div>
                    <div className='containerBox p-20 bold'>LocalStorage</div>
                    <label>
                        <select
                            className='containerBox'
                            value={key}
                            onChange={handleKeyChange}
                        >
                            {
                                localDataItems.map((key) => <option value={key}>{key}</option>)
                            }
                        </select>
                        <div className='flexContainer'>
                            <div className='containerBox flex2Column contentRight'>
                                Key:
                            </div>
                            <input
                                id='key'
                                name='key'
                                className='containerBox flex2Column'
                                type='text'
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                            />
                        </div>
                    </label>
                </div>
                <label className='flexContainer'>
                    <div className='containerBox flex2Column contentRight'>
                        Action:
                    </div>
                    <select
                        className='containerBox flex2Column'
                        value={action}
                        onChange={handleActionChange}
                    >
                        <option value='view'>View</option>
                        <option value='edit'>Edit</option>
                        <option value='add'>Add</option>
                        <option value='remove'>Remove</option>
                    </select>
                </label>
                <button className='containerBox button width-100-percent bg-green' type='submit'>Select</button>
            </form>

            {action === 'view' && data && (
                <div className='containerBox width-100-percent'>
                    <h3>View Data</h3>
                    <pre className='containerBox width-100-percent contentLeft'>
                        {data}
                    </pre>
                </div>
            )}

            {action === 'edit' && data && (
                <div className='containerBox width-100-percent'>
                    <h3>Edit Data</h3>
                    <textarea
                        className='containerBox width-100-percent' 
                        rows='10'
                        cols='50'
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                    <br />
                    <div className='containerBox button width-100-percent bg-green' onClick={handleEdit}>Save Changes</div>
                </div>
            )}
            {action === 'add' && data && (
                <div className='containerBox width-100-percent' >
                    <h3>Add Data</h3>
                    <textarea
                        className='containerBox width-100-percent' 
                        rows='10'
                        cols='50'
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                    <br />
                    <div className='containerBox button width-100-percent bg-green'  onClick={handleAdd}>Add Data</div>
                </div>
            )}
            {message && (
                <div className='containerBox width-100-percent color-neogreen'>
                    <h3>{message}</h3>
                </div>
            )}
        </div>
    );
};

export default Admin;