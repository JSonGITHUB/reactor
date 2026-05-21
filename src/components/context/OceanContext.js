import React, { createContext, useCallback, useEffect, useState, useContext } from 'react';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';
import directionObject from '../waves/DirectionObject';
import getDirection from '../waves/getDirection';
import useOceanData from '../waves/useOceanData';

export const OceanContext = createContext();

const OceanParent = ({
    children,
    targetElementRef
}) => {

    const getDistance = useCallback(() => {
        const newDistance = initializeData('distance', 10);
        if (isNaN(newDistance) || newDistance === '' || Number(newDistance) < 1) {
            return 10;
        }
        return newDistance;
    }, []);

    const getSwell1Direction = useCallback(() => initializeData('swell1Direction', 'SSW'), []);
    const getSwell2Direction = useCallback(() => initializeData('swell2Direction', 'SSW'), []);

    //const swellUrl = "https://marine-api.open-meteo.com/v1/marine?latitude=33.085692&longitude=-117.319371&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period&length_unit=imperial&timeformat=unixtime&timezone=America%2FLos_Angeles&forecast_days=1&models=best_match";
    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');

    const swellUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period&length_unit=imperial&timeformat=unixtime&timezone=America%2FLos_Angeles&forecast_days=1&models=best_match`;
    const [retry, setRetry] = useState('');
    const swellData = useOceanData('swell', swellUrl, '', setRetry);
    const [swell, setSwell] = useState(null);

    const [status, setStatusData] = useState();

    const handleSwell1LiveSelection = () => {
        const liveSwellData = swell || JSON.parse(localStorage.getItem('swellData'));
        if (!liveSwellData) {
            return;
        }

        // Keep this aligned with SwellDisplay header, which uses wave_* values.
        const swell1Angle = getDirection(liveSwellData.wave_direction);
        localStorage.setItem('swell1Direction', swell1Angle);
        localStorage.setItem('swell1Angle', roundToNearestFive(liveSwellData.wave_direction));
        localStorage.setItem('swell1Height', liveSwellData.wave_height);
        localStorage.setItem('swell1Interval', liveSwellData.wave_period);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Direction: swell1Angle,
            swell1Angle: roundToNearestFive(liveSwellData.wave_direction),
            swell1Height: Number(liveSwellData.wave_height).toFixed(0),
            swell1Interval: `${Number(liveSwellData.wave_period).toFixed(0)}`,
            swellData: liveSwellData
        }));

    }
    const handleSwell2LiveSelection = () => {
        const liveSwellData = swell || JSON.parse(localStorage.getItem('swellData'));
        if (!liveSwellData) {
            return;
        }

        // Prefer secondary swell fields; fall back to wave_* if unavailable.
        const swell2DirectionValue = Number.isFinite(Number(liveSwellData.swell_wave_direction))
            ? liveSwellData.swell_wave_direction
            : liveSwellData.wave_direction;
        const swell2HeightValue = Number.isFinite(Number(liveSwellData.swell_wave_height))
            ? liveSwellData.swell_wave_height
            : liveSwellData.wave_height;
        const swell2PeriodValue = Number.isFinite(Number(liveSwellData.swell_wave_period))
            ? liveSwellData.swell_wave_period
            : liveSwellData.wave_period;

        const swell2DirectionLabel = getDirection(swell2DirectionValue);
        localStorage.setItem('swell2Direction', swell2DirectionLabel);
        localStorage.setItem('swell2Angle', roundToNearestFive(swell2DirectionValue));
        localStorage.setItem('swell2Height', swell2HeightValue);
        localStorage.setItem('swell2Interval', swell2PeriodValue);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Direction: swell2DirectionLabel,
            swell2Angle: roundToNearestFive(swell2DirectionValue),
            swell2Height: Number(swell2HeightValue).toFixed(0),
            swell2Interval: `${Number(swell2PeriodValue).toFixed(0)}`,
            swellData: liveSwellData
        }));

    }

    const setStatus = (newValue) => {
        if (typeof newValue === 'function') {
            setStatusData((prevState) => newValue(prevState));
            return;
        }

        if (newValue && typeof newValue === 'object') {
            setStatusData((prevState) => ({
                ...prevState,
                ...newValue
            }));
        }
    };

    useEffect(() => {
        setStatusData({
            module: 'Waves',
            pause: true,
            date: new Date(),
            tide: initializeData('tide', 'medium'),
            stars: initializeData('stars', 3),
            waterTemp: initializeData('waterTemp', '66.2'),
            swell1Height: initializeData('swell1Height', '2.0'),
            swell1Interval: initializeData('swell1Interval', 17),
            swell1Direction: getSwell1Direction(),
            swell2Height: initializeData('swell2Height', '2.0'),
            swell2Interval: initializeData('swell2Interval', 9),
            swell2Direction: getSwell2Direction(),
            swell1Angle: directionObject[getSwell1Direction()],
            swell2Angle: directionObject[getSwell2Direction()],
            windDirection: initializeData('windDirection', 0),
            distance: getDistance(),
            isSwell1: (initializeData('isSwell1', null) === true) ? true : false,
            isSwell2: (initializeData('isSwell2', null) === true) ? true : false,
            isTide: (initializeData('isTide', null) === true) ? true : false,
            isWind: (initializeData('isWind', null) === true) ? true : false,
            matches: [],
            init: false
        });
    }, [getDistance, getSwell1Direction, getSwell2Direction]);

    useEffect(() => {
        const templateData = {
            time: 1719878400,
            interval: 3600,
            wave_height: 2.625,
            wave_direction: 257,
            wave_period: 8.65,
            wind_wave_height: 0.328,
            wind_wave_direction: 215,
            wind_wave_period: 1.7,
            wind_wave_peak_period: null,
            swell_wave_height: 2.165,
            swell_wave_direction: 275,
            swell_wave_period: 5.95,
            swell_wave_peak_period: null
        };

        if (swellData[0].current) {
            if (swellData[0].current.swell_wave_period === 'NaN' || isNaN(swellData[0].current.swell_wave_period)) {
                const localSwell = initializeData('swellData', templateData);
                setSwell(localSwell);
            } else {
                localStorage.setItem('swellData', JSON.stringify(swellData[0].current));
                setSwell(swellData[0].current);
            }
        }
    }, [swellData]);

    const getDefaultHeights = (tideSelected) => {
        if (tideSelected === 'high') {
            return 5;
        } else if (tideSelected === 'medium') {
            return 3;
        }
        return 0;
    };

    const setWindStatus = (selected) => {
        localStorage.setItem('windDirection', roundToNearestFive(selected));
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            windDirection: roundToNearestFive(selected)
        }));
    };

    const handleTideSelection = (groupTitle, label, selected) => {
        const height = getDefaultHeights(selected);
        localStorage.setItem('tide', selected);
        setTide(selected, height);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            tide: selected,
            height: height
        }));
    };

    const setWind = (direction, angle, speed, gusts) => {
        const parsedSpeed = Number(speed).toFixed(0);
        const parsedGusts = Number(gusts).toFixed(0);
        localStorage.setItem('windDirection', direction);
        localStorage.setItem('windSpeed', `${parsedSpeed}mph`);
        localStorage.setItem('windGusts', parsedGusts);
        setStatus(prevState => ({
            ...prevState,
            windDirection: direction,
            windAngle: Number(angle).toFixed(0),
            windSpeed: parsedSpeed,
            windGusts: parsedGusts
        }));
    };

    const handleWindCheck = () => {
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            isWind: !status.isWind
        }));
    };

    const handleTideCheck = () => {
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            isTide: !status.isTide
        }));
    };

    const handleSwellCheck = (id) => {
        if (id === '1') {
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                isSwell1: !status.isSwell1
            }));
        } else {
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                isSwell2: !status.isSwell2
            }));
        }
    };

    const handleSwell1Selection = (groupTitle, label, selected) => {
        const swell1Angle = directionObject[selected];
        localStorage.setItem('swell1Direction', selected);
        localStorage.setItem('swell1Angle', swell1Angle);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Direction: selected,
            swell1Angle: swell1Angle
        }));
    };

    const handleSwell2Selection = (groupTitle, label, selected) => {
        const swell2Angle = directionObject[selected];
        localStorage.setItem('swell2Direction', selected);
        localStorage.setItem('swell2Angle', swell2Angle);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Direction: selected,
            swell2Angle: swell2Angle
        }));
    };

    const roundToNearestFive = (number) => Math.round(number / 5) * 5;
    
    const handleSwell1Angle = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Angle', selected);
        localStorage.setItem('swell1Direction', getDirection(selected));  
            
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Angle: selected,
            swell1Direction: getDirection(selected)
        }));
    };

    const handleSwell2Angle = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Angle', selected);
        localStorage.setItem('swell2Direction', getDirection(selected));

        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Angle: selected,
            swell2Direction: getDirection(selected)
        }));
    };

    const handleSwell1Height = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Height', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Height: selected.replace('ft', '')
        }));
    };

    const handleSwell2Height = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Height', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Height: selected.replace('ft', '')
        }));
    };

    const handleSwell1Interval = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Interval', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Interval: selected
        }));
    };

    const handleSwell2Interval = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Interval', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Interval: selected
        }));
    };

    const handleStarSelection = (groupTitle, label, selected) => {
        
        localStorage.setItem('stars', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            stars: selected
        }));
    };

    const handleDistanceSelection = (event) => {
        const target = event.target;
        if (isNaN(target.value) || target.value === '' || Number(target.value) < 1) {
            target.value = 10;
        }
        localStorage.setItem('distance', target.value);
        setStatus(prevState => ({
            ...prevState,
            distance: target.value
        }));
    };

    const pause = (event) => {
        setStatus(prevState => ({
            ...prevState,
            pause: true
        }));
    };

    const setTide = (tide, height) => {
        console.log(`OceanContext => setTide => tide: ${tide}, height: ${height}`);
        localStorage.setItem('tide', tide);
        localStorage.setItem('height', height);
        if (initializeData('tide', null) !== tide) {
            setStatus(prevState => ({
                ...prevState,
                tide: tide,
                height: height
            }));
        }
    };
    
    return (

        <OceanContext.Provider 
            value={{
                status,
                setStatus,
                swell,
                swellData,
                setTide,
                setWind,
                setWindStatus,
                handleTideCheck,
                handleTideSelection,
                handleWindCheck,
                handleSwellCheck,
                handleSwell1Selection,
                handleSwell2Selection,
                handleSwell1LiveSelection,
                handleSwell2LiveSelection,
                handleSwell1Angle,
                handleSwell2Angle,
                handleSwell1Height,
                handleSwell2Height,
                handleSwell1Interval,
                handleSwell2Interval,
                handleStarSelection,
                handleDistanceSelection,
                pause,
                retry,
                targetElementRef
            }}>
            {
                (validate(status) !== null)
                    ? children
                    : <div>WHOOOPSIE!</div>
            }
        </OceanContext.Provider>
    );

};
export const useOcean = () => useContext(OceanContext);

export default OceanParent;