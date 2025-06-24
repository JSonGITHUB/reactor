import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator';
import useCurrentTime from '../utils/useCurrentTime';
import TideDisplay from './TideDisplay';
import initializeData from '../utils/InitializeData';

const NewTide = ({
    display
}) => {

    const [tides, setNewTideData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const uriMLL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${startTime}&end_date=${endTime}&datum=MLLW&station=9410230&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    const defaultTide = {
        data: {
            predictions: [
                {
                    t: "2024-07-01 11:40",
                    v: 1.960,
                    type: "L"
                },
                {
                    t: "2024-07-01 18:23",
                    v: 6.064,
                    type: "H"
                },
                {
                    t: "2024-07-02 01:53",
                    v: -0.341,
                    type: "L"
                },
                {
                    t: "2024-07-02 08:22",
                    v: 3.338,
                    type: "H"
                },
                {
                    t: "2024-07-02 12:34",
                    v: 2.232,
                    type: "L"
                }
            ]
        },
        "timestamp": 1719874078612
    }
    const findClosestDate = (data) => {
        let datesArray = (data.predictions) ? data.predictions.map((tide) => tide.t) : [];
        if (!Array.isArray(datesArray) || datesArray.length === 0) {
            //return null; // Return null for an empty or non-array input
            if (Object.keys(tides).length === 0) {
                const predictions = initializeData('tides', defaultTide)[0].predictions;
                datesArray = predictions.map((tide) => tide.t)
            } else {
                //console.log(`useEffect => 3 tides: ${JSON.stringify(tides, null, 2)}`);
                datesArray = tides.predictions.map((tide) => tide.t)
            }
        }

        const now = new Date();
        let closestDate = datesArray[0];
        let index = 0;
        let closestIndex = 0;

        datesArray.forEach(date => {

            const currentDate = new Date(date);
            const timeDifference = Math.abs(currentDate - now);

            // If the current date is closer than the assumed closest date, update closestDate
            if (timeDifference < Math.abs(new Date(closestDate) - now)) {
                closestDate = date;
                closestIndex = index;
            }
            index++

        });

        return [closestIndex, closestDate];

    }

    const getTideHour = (tide) => {
        const tideHour = Number(tide.t.split(' ')[1].split(':')[0]);
        const greaterThan12 = (tideHour > 12) ? true : false;
        const lessThan1 = (tideHour < 1) ? true : false;
        const hour = (greaterThan12) ? (tideHour - 12) : (lessThan1) ? 12 : tideHour;
        return hour;
    }
    const getTideMinutes = (tide) => {
        const tideMinute = Number(tide.t.split(' ')[1].split(':')[1]);
        const lessThan10 = (tideMinute < 10) ? true : false;
        const minutes = (lessThan10) ? `0${tideMinute}` : tideMinute;
        return minutes;
    }

    const getTideTime = (tide) => {
        const tideTime = `${getTideHour(tide)}:${getTideMinutes(tide)}`;
        return tideTime;
    }
    const getTideHeight = (tide) => {
        const tideHeight = Number(tide.v);
        const displayTide = `${tideHeight.toFixed(1)}'`
        return displayTide;
    }
    const getTide = (tide) => {
        const newType = (tide.type === 'H') ? 'HIGH' : 'LOW';
        return newType;
    }
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const cachedData = initializeData('tides', defaultTide);
                const sixHoursAgo = new Date().getTime() - 6 * 60 * 60 * 1000;
                if (cachedData && cachedData.timestamp > sixHoursAgo) {
                    setNewTideData(cachedData.data);
                    setLoading(false);
                    setErrorMessage('');
                } else {
                    //const response = await fetch(tideNowLink);
                    console.log(`NewTide => uriMLL: ${uriMLL}`)
                    const response = await fetch(uriMLL);
                    if (!response.ok) {
                        throw new Error('Failed to fetch data');
                    }
                    const data = await response.json();
                    setNewTideData(data);
                    localStorage.setItem('tides', JSON.stringify({ data, timestamp: new Date().getTime() }));
                    setLoading(false);
                    setErrorMessage('');
                }
            } catch (error) {
                setNewTideData(null);
                setLoading(false);
                setErrorMessage('Error fetching data. Please try again later.');
            }
        };

        fetchData();
    }, []);
    
    const handleOverride = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            //const response = await fetch(tideNowLink);
            console.log(`NewTide => uriMLL: ${uriMLL}`)
            const response = await fetch(uriMLL);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setNewTideData(data);
            localStorage.setItem('tides', JSON.stringify({ data, timestamp: new Date().getTime() }));
            setLoading(false);
        } catch (error) {
            setNewTideData(null);
            setLoading(false);
            setErrorMessage('Error fetching data. Please try again later.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (errorMessage) {
        return (
            <div>
                <p>{errorMessage}</p>
                <button onClick={handleOverride}>Refresh Data</button>
            </div>
        );
    }

    if (!tides) {
        return <div>No data available.</div>;
    }
    /*
    return (
        <div>
            <h2>Menu</h2>
            <ul>
                {tides.map((item, index) => (
                    <li key={index}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
    */
    if (tides) {
        //console.log(`NewTide => ${startTime} - ${endTime} tides: ${JSON.stringify(tides, null, 2)}`)
    }
    const tideTable = () => tides.predictions.map((tide) => <div key={getKey('tide')} className={`containerBox flexContainer bold ${(findClosestDate(tides)[1] === tide.t) ? 'bg-green' : ''}`}>
        <div className={`flex2Column p-10`}>
            <div className=''>
                <div>{getTideTime(tide)}</div>
            </div>
        </div>
        <div className={`flex3Column p-10`}>
            <div>{getTide(tide)}</div>
        </div>
        <div className={`flex3Column p-10`}>
            <div className='pr-10-percent'>
                {getTideHeight(tide)}
            </div>
        </div>
    </div>
    );
    return <TideDisplay
                display={display}
                tides={tides}
                tideTable={tideTable}
                getTide={getTide}
                getTideTime={getTideTime}
                getTideHeight={getTideHeight}
            />;
};

export default NewTide;