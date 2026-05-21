import React, { useState, useEffect, FormEvent } from 'react';
import initializeData from '../utils/InitializeData';

type Action = 'view' | 'edit' | 'add' | 'remove';

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

const defaultData : [{skill: string, time: string, percentage: string}]= [
    {
        skill: 'Surfing',
        time: '00:00:00',
        percentage: '0'
    }
];

const tryParseJSON = (value: string | null) : null | string => {
    if (value === null) return null;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const isJsonLike = (v: any) : boolean => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'object') return true;
    if (typeof v === 'string') {
        const first : string = v.trim().charAt(0);
        return first === '{' || first === '[';
    }
    return false;
};

const Admin: React.FC = () => {
    const [key, setKey] = useState<string>('');
    const [action, setAction] = useState<Action>('view');
    const [data, setData] = useState<string | null>(null); // displayed text
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        // lightweight debug
        // console.log('Admin data changed', { key, action, data, message });
    }, [key, action, data, message]);

    const handleView = () : void => {
        setMessage(null);
        if (key === '*') {
            // show all localStorage as an object
            const all: Record<string, any> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k : string | null = localStorage.key(i);
                if (!k) continue;
                const raw : string | null = localStorage.getItem(k);
                all[k] = tryParseJSON(raw);
            }
            setData(JSON.stringify(all, null, 2));
            return;
        }

        // initializeData may return parsed object or string
        const stored : any = initializeData(key, null);
        if (stored === undefined || stored === null) {
            const raw : string | null = localStorage.getItem(key);
            if (raw === null) {
                setMessage(`No data found for ${key}.`);
                setData(null);
                return;
            } else {
                setData(raw);
                return;
            }
        }

        // format display
        const display : string = isJsonLike(stored) ? JSON.stringify(stored, null, 2) : String(stored);
        setData(display);
    };

    const handleNew = () : void => {
        setMessage(null);
        const exists : string | null = localStorage.getItem(key);
        if (exists !== null) {
            setMessage(`Data already exists for ${key}.`);
            setData(null);
            return;
        }
        setData(JSON.stringify(defaultData, null, 2));
    };

    const handleRemove = () : void => {
        if (!key) {
            setMessage('Please select a key to remove.');
            return;
        }
        localStorage.removeItem(key);
        setMessage(`Data for key '${key}' has been removed.`);
        setData(null);
    };

    const handleRemoveMenuSystem = () : void => {
        localStorage.removeItem('menus');
        localStorage.removeItem('NavItemsMeta');
        localStorage.removeItem('menuItems');
        setMessage(`Data for menus, NavItemsMeta, and menuItems has been removed.`);
        setData(null);
    };

    const handleEdit = () : void => {
        if (!key) {
            setMessage('Please select a key to edit.');
            return;
        }
        if (data === null) {
            setMessage('No data to save.');
            return;
        }
        // Save raw content as-is (behavior preserved from original)
        localStorage.setItem(key, data);
        setMessage(`Changes have been saved to ${key}`);
        setData(null);
    };

    const handleAdd = () : void => {
        if (!key) {
            setMessage('Please provide a key to add.');
            return;
        }
        if (!data) {
            setMessage('No data to add.');
            return;
        }
        localStorage.setItem(key, data);
        setMessage(`${key} has been added to localStorage`);
        setData(null);
    };

    const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) : void => {
        setAction(e.target.value as Action);
        setData(null);
        setMessage(null);
    };

    const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) : void => {
        setKey(e.target.value);
        setData(null);
        setMessage(null);
    };

    const handleSubmit = (e: FormEvent) : void => {
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
            handleView(); // load existing data for editing
        } else if (action === 'add') {
            handleNew();
        }
    };

    return (
        <div className="mt--30">
            <form className="containerBox" onSubmit={handleSubmit}>
                <div className="containerBox bg-lite">
                    <h2>Admin Tool</h2>
                </div>
                <div>
                    <div className="containerBox p-20 bold">LocalStorage</div>
                    <label>
                        <select
                            className="containerBox width--10"
                            value={key}
                            onChange={handleKeyChange}
                        >
                            {localDataItems.map((k) => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                        </select>
                        <div className="flexContainer">
                            <div className="containerBox flex9Column contentRight">Key:</div>
                            <input
                                id="admin-ts-key"
                                name="admin-ts-key"
                                className="containerBox flex2Column"
                                type="text"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                            />
                        </div>
                    </label>
                </div>

                <label className="flexContainer">
                    <div className="containerBox flex9Column contentRight">Action:</div>
                    <select
                        className="containerBox flex2Column"
                        value={action}
                        onChange={handleActionChange}
                    >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="add">Add</option>
                        <option value="remove">Remove</option>
                    </select>
                </label>

                <button className="containerBox button width-100-percent bg-green" type="submit">
                    Select
                </button>
                <button
                    className="containerBox button width-100-percent bg-red"
                    type="button"
                    onClick={handleRemoveMenuSystem}
                >
                    🗑️ Remove Menu System Data
                </button>
            </form>

            {action === 'view' && data && (
                <div className="containerBox width-100-percent">
                    <h3>View Data</h3>
                    <pre className="containerBox width-100-percent contentLeft">
                        {data}
                    </pre>
                </div>
            )}

            {action === 'edit' && data && (
                <div className="containerBox width-100-percent">
                    <h3>Edit Data</h3>
                    <textarea
                        className="containerBox width-100-percent"
                        rows={10}
                        cols={50}
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                    <br />
                    <div className="containerBox button width-100-percent bg-green" onClick={handleEdit}>
                        Save Changes
                    </div>
                </div>
            )}

            {action === 'add' && data && (
                <div className="containerBox width-100-percent">
                    <h3>Add Data</h3>
                    <textarea
                        className="containerBox width-100-percent"
                        rows={10}
                        cols={50}
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                    <br />
                    <div className="containerBox button width-100-percent bg-green" onClick={handleAdd}>
                        Add Data
                    </div>
                </div>
            )}

            {message && (
                <div className="containerBox width-100-percent color-neogreen">
                    <h3>{message}</h3>
                </div>
            )}
        </div>
    );
};

export default Admin;
