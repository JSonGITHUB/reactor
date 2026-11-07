import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import initializeData from '../utils/InitializeData';
import LocalStorageImporter from './LocalStorageImporter';
import NavItems from '../site/NavItems';
import AppAppearanceDialog from './AppAppearanceDialog';

const Admin = () => {

    const history = useHistory();
    const demoActiveKey = 'reactorAdminDemoActive';
    const demoTimerKey = '__reactorAdminDemoTimer';
    const demoDelayMs = 10000;

    const [key, setKey] = useState('');
    const [action, setAction] = useState('view');
    const [data, setData] = useState(null);
    const [message, setMessage] = useState(null);
    const [editableData, setEditableData] = useState('');
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [showDataInterface, setShowDataInterface] = useState(false);
    const placeholderKey = 'Select a key';

    const localDataItems = [
        placeholderKey,
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
        'range',
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
        'breathing',
        'All Data'
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

    const clearDemoTimer = () => {
        if (window[demoTimerKey]) {
            window.clearTimeout(window[demoTimerKey]);
            window[demoTimerKey] = null;
        }
    };

    const stopDemo = () => {
        localStorage.removeItem(demoActiveKey);
        clearDemoTimer();
        setIsDemoRunning(false);
    };

    const startDemo = () => {
        const demoRoutes = NavItems.filter((item) => item && item !== 'Admin');
        if (!demoRoutes.length) {
            setMessage('No demo routes found.');
            return;
        }

        stopDemo();
        localStorage.setItem(demoActiveKey, 'true');
        setIsDemoRunning(true);
        setMessage(`▶️ Demo started (${demoRoutes.length} routes, ${demoDelayMs / 1000}s each).`);

        let demoIndex = 0;

        const runDemoStep = () => {
            if (localStorage.getItem(demoActiveKey) !== 'true') {
                stopDemo();
                return;
            }

            if (demoIndex >= demoRoutes.length) {
                stopDemo();
                return;
            }

            const routeLabel = demoRoutes[demoIndex];
            demoIndex += 1;
            history.push(`/${routeLabel}`);

            if (demoIndex < demoRoutes.length) {
                window[demoTimerKey] = window.setTimeout(runDemoStep, demoDelayMs);
            } else {
                stopDemo();
            }
        };

        runDemoStep();
    };

    const handleView = () => {
        const storedData = initializeData(key, null);
        if (key === '*' || key.toLowerCase() === 'all data') {
              const allData = Object.fromEntries(Object.entries(localStorage));
              setMessage(null);
              setData(JSON.stringify(allData, null, 2));
              return;
        }
        const startsWithBracket = (str) => String(str).charAt(0) === '[' || String(str).charAt(0) === '{';
        if (storedData) {
            const displayData = (startsWithBracket(storedData))
            ? JSON.stringify(storedData, null, 2)
            : storedData;
            setMessage(null);
            setData(displayData);
        } else {
            setData('');
            setMessage(`No data found for ${key}.`);
        }
    };
    const handleNew = () => {
        const storedData = initializeData(key, null);
        if (storedData) {
            setData('');
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
        setData('');
        setEditableData('');
    };
    
    const handleRemoveMenuSystem = () => {
        localStorage.removeItem('menus');
        localStorage.removeItem('NavItemsMeta');
        localStorage.removeItem('menuItems');
        setMessage(`Data for menus, NavItemsMeta, and menuItems has been removed.`);
        setData('');
        setEditableData('');
    };

    const handleEdit = () => {
        localStorage.setItem(key, data);
        setData('');
        setEditableData('');
        setMessage(`Changes have been saved to ${key}`);
    };
    const handleAdd = () => {
        localStorage.setItem(key, data);
        setData('');
        setEditableData('');
        setMessage(`${key} has been added to localStorage`);
    };
    const handleActionChange = (e) => {
        stopDemo();
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

    const isValidKey = (value) => {
        const normalized = String(value || '').trim();
        return normalized !== '' && normalized !== placeholderKey;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValidKey(key)) {
            setData('');
            setMessage('Please select or enter a localStorage key.');
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
        <div className='mt--30'>
            <form className='containerDetail' onSubmit={handleSubmit}>
                <div className='containerDetail bg-lite contentLeft p-20 size20 color-yellow mb-5'>
                    Admin Tool
                </div>
                <AppAppearanceDialog 
                    open={true}
                    onClose={() => console.log('AppAppearanceDialog closed')}
                    onApply={() => console.log('AppAppearanceDialog apply')}
                />
                <div
                    className='containerDetail button color-lite contentLeft mt-5 bg-blue p-20 size20'
                    aria-expanded={showDataInterface}
                    aria-controls='data-interface-section'
                    onClick={() => setShowDataInterface((prev) => !prev)}
                >
                    {showDataInterface ? '▼' : '►'} Data Interface
                </div>
                {showDataInterface && (
                    <div id='data-interface-section' className='containerDetail contentLeft bg-lite p-10 mt-5'>
                        <div>
                            <div className='containerDetail p-20 bold color-lite size20 bg-lite'>
                                LocalStorage
                            </div>
                            <label>
                                <select
                                    className='containerDetail width-100-percent width--5 color-lite p-20 size20 mb-5'
                                    value={key}
                                    onChange={handleKeyChange}
                                    aria-label='Select a localStorage key'
                                >
                                    {
                                        localDataItems.map((itemKey, index) => (
                                            <option key={`${itemKey}-${index}`} value={itemKey === placeholderKey ? '' : itemKey}>{itemKey}</option>
                                        ))
                                    }
                                </select>
                                <div className='flexContainer mt-5'>
                                    <div className='containerDetail flex9Column contentRight bg-lite color-lite p-20 size20'>
                                        Key:
                                    </div>
                                    <input
                                        id='key'
                                        name='key'
                                        className='containerDetail flex2Column color-lite p-20 size20 ml-5'
                                        type='text'
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        aria-label='LocalStorage key'
                                    />
                                </div>
                            </label>
                        </div>
                        <label className='flexContainer mt-10'>
                            <div className='containerDetail flex9Column contentRight bg-lite color-lite p-20 size20 mt--5'>
                                Action:
                            </div>
                            <select
                                className='containerDetail flex2Column color-lite p-20 size20 mt--5'
                                value={action}
                                onChange={handleActionChange}
                                aria-label='Choose data action'
                            >
                                <option value='view'>View</option>
                                <option value='edit'>Edit</option>
                                <option value='add'>Add</option>
                                <option value='remove'>Remove</option>
                            </select>
                        </label>
                        <button
                            type='submit'
                            className='containerDetail button width--5 ml-2 bg-green contentLeft color-lite p-20 size20 mt-10'
                            aria-label='Run selected Admin action'
                        >
                            Select
                        </button>
                    </div>
                )}
                {/* Data display and edit/add UI, only show if Data Interface is open */}
                {showDataInterface && action === 'view' && data !== null && (
                    <div className='containerDetail width-100-percent contentLeft' >
                        <h3 className='pt-10 color-yellow ml-10'>View Data</h3>
                        <textarea
                            className='containerDetail width-100-percent'
                            rows='10'
                            cols='50'
                            value={data}
                            readOnly
                            aria-label='View localStorage data'
                        />
                    </div>
                )}

                {showDataInterface && action === 'edit' && data !== null && (
                    <div className='containerDetail width-100-percent contentLeft' >
                        <h3 className='pt-10 color-yellow ml-10'>Edit Data</h3>
                        <textarea
                            className='containerDetail width-100-percent'
                            rows='10'
                            cols='50'
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            aria-label='Edit localStorage data'
                        />
                        <br />
                        <button type='button' className='containerDetail button width--10 ml-5 mr-5 bg-green size20 p-20 mt-10' onClick={handleEdit}>
                            Save Changes
                        </button>
                    </div>
                )}
                {showDataInterface && action === 'add' && data !== null && (
                    <div className='containerDetail width-100-percent contentLeft' >
                        <h3 className='pt-10 color-yellow ml-10'>Add Data</h3>
                        <textarea
                            className='containerDetail width-100-percent'
                            rows='10'
                            cols='50'
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            aria-label='Add localStorage data'
                        />
                        <br />
                        <button type='button' className='containerDetail button width-100-percent bg-green' onClick={handleAdd}>Add Data</button>
                    </div>
                )}
                {/* Always visible controls */}
                <button
                    type='button'
                    className='containerDetail button bg-red color-lite contentLeft p-20 size20 mt-5 mb-5 width--5 ml--5 mr--5'
                    onClick={handleRemoveMenuSystem}
                >
                    🗑️ Remove Menu System Data
                </button>
                {isDemoRunning
                    ? <button
                        className='containerDetail button width--5 ml--5 mr--5 bg-red color-lite contentLeft p-20 size20'
                        type='button'
                        onClick={() => { stopDemo(); setMessage('⏹️ Demo stopped.'); }}
                    >
                        ⏹️ Stop Demo
                    </button>
                    : <button
                        type='button'
                        className='containerDetail button bg-green color-lite contentLeft p-20 size20 width--5 ml--5 mr--5'
                        onClick={startDemo}
                    >
                        ▶️ Demo
                    </button>
                }
            </form>
            {message && (
                <div className='containerDetail width-100-percent color-neogreen'>
                    <h3>{message}</h3>
                </div>
            )}
            <LocalStorageImporter />
        </div>
    );
};

export default Admin;