import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useCurrentTime from '../../utils/useCurrentTime';
import TideGraph from './TideGraph';
import validate from '../../utils/validate';
import icons from '../../site/icons';
import moment from 'moment';
import Spline from 'cubic-spline';
import getKey from '../../utils/KeyGenerator';
import Moon from '../../utils/Moon';
import { getNearestTideStation } from '../api';

const TideChart = ({
    standalone,
    lat,
    lon
}) => {

    const [tideNow, setTideNow] = useState(null);
    const [tideChart, setTideChart] = useState(null);
    const [tideData, setTideData] = useState(null);
    const [currentTide, setCurrentTide] = useState([0, 'up']);
    const [stationName, setStationName] = useState('');
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const tideStartTime = time[0].tideStartTime;
    const tideEndTime = time[0].tideEndTime;

    const hiloStation = useMemo(() => getNearestTideStation(lat || 32.87, lon || -117.26), [lat, lon]);
    const waterLevelStation = useMemo(() => getNearestTideStation(lat || 32.87, lon || -117.26), [lat, lon]);

    const tideNowLink = useMemo(() => (
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${tideStartTime}&end_date=${tideEndTime}&station=${waterLevelStation.id}&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`
    ), [tideStartTime, tideEndTime, waterLevelStation.id]);
    const significantTides = useMemo(() => (
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${startTime}&end_date=${endTime}&datum=MLLW&station=${hiloStation.id}&time_zone=lst_ldt&units=english&interval=hilo&format=json`
    ), [startTime, endTime, hiloStation.id]);
    
    console.log(`TideChart => time: ${JSON.stringify(time, null, 2)}`);
    console.log(`TideChart => startTime: ${startTime} endTime: ${endTime}`);

    //https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&
    //begin_date=20240624%2004:00
    // &end_date=20240625%2011:30
    //&datum=MLLW&station=9410230&time_zone=lst_ldt&units=english&interval=hilo&format=json

    //https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?
    //begin_date=20240624%205:00
    // &end_date=20240624%2017:30
    //&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json

    const interpolateTides = useCallback((data, intervalMinutes = 1) => {
        const times = data.map(point => moment(point.t, 'YYYY-MM-DD HH:mm').unix());
        const values = data.map(point => parseFloat(point.v));

        const spline = new Spline(times, values);

        const startTime = moment(data[0].t, 'YYYY-MM-DD HH:mm');
        const endTime = moment(data[data.length - 1].t, 'YYYY-MM-DD HH:mm');
        const durationMinutes = endTime.diff(startTime, 'minutes');
        const steps = Math.ceil(durationMinutes / intervalMinutes);

        const interpolatedData = [];

        for (let step = 0; step <= steps; step++) {
            const currentTime = startTime.clone().add(step * intervalMinutes, 'minutes');
            const currentUnixTime = currentTime.unix();
            const value = spline.at(currentUnixTime);

            interpolatedData.push({
                t: currentTime.format('YYYY-MM-DD HH:mm'),
                v: value.toFixed(3)
            });
        }

        return interpolatedData;
    }, []);
    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await fetch(significantTides);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                const shortIntervalData = {
                    predictions: interpolateTides(data.predictions)
                };
                setTideNow(data);
                setTideChart(shortIntervalData);
                if (data.metadata?.name) {
                    setStationName(data.metadata.name);
                }
                localStorage.setItem('tideNow', JSON.stringify({ data, timestamp: new Date().getTime() }));
                localStorage.setItem('tideChart', JSON.stringify({ shortIntervalData, timestamp: new Date().getTime() }));
            } catch (error) {
                setTideChart(null);
                setTideNow(null);
            }
        };
        fetchData();
    }, [significantTides, interpolateTides]);

    useEffect(() => {
        localStorage.setItem('currentTide', currentTide[0]);
        localStorage.setItem('currentTideDirection', currentTide[1]);
    }, [currentTide]);

    const convertTo12HourTime = (militaryTime) => {
        let [hours, minutes] = militaryTime.split(':').map(Number);
        let period = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12; // Converts '0' or '12' to '12'
        return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
    }
    const getClosestValue = useCallback((data) => {

        const currentTime = new Date();
        let closest = null;
        let smallestDifference = Infinity;
        let lastHeight = 0;
        let direction = '';

        data.forEach((item) => {
            const itemTime = new Date(item.t.replace(" ", "T"));
            const timeDifference = Math.abs(currentTime - itemTime);

            if (Number(item.v) > lastHeight) {
                direction = 'up';
            } else {
                direction = 'down';
            }
            if (timeDifference < smallestDifference) {
                closest = item;
                smallestDifference = timeDifference;
            }
            lastHeight = Number(item.v);
        });
        return closest ? [Number(closest.v), direction] : [0, direction];
    }, []);

    useEffect(() => {
        if (validate(tideChart) !== null) {

            const fetchData = async () => {
                try {
                    const response = await fetch(tideNowLink);
                    if (!response.ok) {
                        throw new Error('Failed to fetch data');
                    }
                    const data = await response.json();
                    setTideData(data);
                    localStorage.setItem('tideData', JSON.stringify({ data, timestamp: new Date().getTime() }));
                    setCurrentTide(getClosestValue(data.data));
                } catch (error) {
                    setTideData(null);
                }
            };
            fetchData();

        }
    }, [tideChart, tideNowLink, getClosestValue]);
    const getNextTideIndex = () => {
        const predictions = tideNow.predictions;
        const currentTime = new Date();
        let closestIndex = -1;
        let closestTimeDiff = Infinity;

        for (let i = 0; i < predictions.length; i++) {
            const predictionTime = new Date(predictions[i].t);
            if ((predictionTime > currentTime)) {
                closestIndex = i;
                const timeDiff = predictionTime - currentTime;
                if (timeDiff < closestTimeDiff) {
                    closestIndex = i;
                    closestTimeDiff = timeDiff;
                    return closestIndex;
                }
                return closestIndex;
            }
        }
        return closestIndex;
    };
    
    return (
        <div className='containerDetail color-lite mt--30'>
            {
                (tideChart && tideData && tideNow)
                ? <div className='containerDetail p-5 bg-lite r-10 size20'>
                    {
                        (standalone === 'true')
                        ? <div className='containerDetail p-20 bg-lite r-10 contentLeft color-yellow'>
                            Current Tide: {(localStorage.getItem('currentTideDirection') === 'UP') ? icons.expand : icons.collapse} {currentTide[0].toFixed(1)}<span className='size12'>ft</span>
                        </div>
                        : null
                    }
                    <div className='containerDetail mt-5 mb-5 bg-tintedMedium'>
                        <TideGraph tideChart={tideChart} stationName={stationName || hiloStation.name} />
                    </div>
                    <div className='containerDetail'>
                    {
                        tideNow.predictions.map((prediction, index) => {
                            const getTide = (tide) => (tide === 'H' || tide === 'HIGH') ? 'HIGH' : 'LOW';
                            const time = convertTo12HourTime(prediction.t.split(' ')[1]);
                            return <div key={getKey('tide')}>
                                {
                                    (getNextTideIndex() === index)
                                        ? <div key={getKey('prediction')} className='containerDetail p-10 mt-5 mb-5 flexContainer bg-oceanblue color-white text-outline-dark bold'>
                                            <div className='flex3Column'>{Number(prediction.v).toFixed(1)}'</div>
                                            <div className='flex3Column'>{getTide(prediction.type)}</div>
                                            <div className='flex3Column'>{time}</div>
                                        </div>
                                        : <div key={getKey('prediction')} className={`containerDetail p-10 ${(index === tideNow.predictions.length-1) ? null : 'mb-5'} flexContainer color-yellow`}>
                                            <div className='flex3Column'>{Number(prediction.v).toFixed(1)}'</div>
                                            <div className='flex3Column'>{getTide(prediction.type)}</div>
                                            <div className='flex3Column'>{time}</div>
                                        </div>
                                }
                            </div>
                        })
                    }
                    </div>
                    <Moon standalone={false} />
                    <div className='containerDetail p-10 mt-5'>
                        <a className='button size15' href="https://www.tide-forecast.com/tide/Bahia-de-Ballenas-Baja-California-Sur-Mexico" target="_blank" rel="noopener noreferrer">
                            {icons.buoys} Bahia-de-Ballenas-Baja-California-Sur-Mexico
                        </a>
                    </div>
                </div>
                : null
            }

        </div>
    );
}
export default TideChart;