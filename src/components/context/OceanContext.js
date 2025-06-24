import React, { createContext, useEffect, useState, useContext } from 'react';
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

    const getLocal = (item) => initializeData(item, null);
    const getProps = (item) => item;
    
    const getDistance = () => {
        const newDistance = (getLocal('distance') === null) ? getProps('distance') : getLocal('distance');
        if (isNaN(newDistance) || newDistance === '' || Number(newDistance) < 1) {
            return 10;
        }
        return newDistance;
    }

    const getDefault = (item) => (getLocal(item) === null)
        ? getProps(item)
        : getLocal(item);

    const getSwell1Direction = () => initializeData('swell1Direction', 'SSW');
    const getSwell2Direction = () => initializeData('swell2Direction', 'SSW');

    //const swellUrl = "https://marine-api.open-meteo.com/v1/marine?latitude=33.085692&longitude=-117.319371&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period&length_unit=imperial&timeformat=unixtime&timezone=America%2FLos_Angeles&forecast_days=1&models=best_match";
    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');

    const swellUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period&length_unit=imperial&timeformat=unixtime&timezone=America%2FLos_Angeles&forecast_days=1&models=best_match`;
    const [retry, setRetry] = useState('');
    const swellData = useOceanData('swell', swellUrl, '', setRetry);
    const [swell, setSwell] = useState(null);
    const [dataInit, setDataInit] = useState(false);

    const [status, setStatusData] = useState();

    const handleSwell1LiveSelection = () => {

        const swellData = JSON.parse(localStorage.getItem('swellData'));
        //console.log(`handleSwell1LiveSelection => swellData: ${JSON.stringify(swellData, null, 2)}`);
        const swell1Angle = getDirection(swellData.swell_wave_direction);
        //console.log(`handleSwell1LiveSelection => swell_wave_period: ${Number(swellData.swell_wave_period).toFixed(0)} - ${directionObject[swell1Angle]} or ${roundToNearestFive(directionObject[swell1Angle])} swell1Angle: ${swell1Angle}`);
        localStorage.setItem('swell1Direction', swell1Angle);
        localStorage.setItem('swell1Angle', roundToNearestFive(swellData.swell_wave_direction));
        localStorage.setItem('swell1Height', swellData.swell_wave_height);
        localStorage.setItem('swell1Interval', swellData.swell_wave_period);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Direction: swell1Angle,
            swell1Angle: roundToNearestFive(swellData.swell_wave_direction),
            swell1Height: Number(swellData.swell_wave_height).toFixed(0),
            swell1Interval: `${Number(swellData.swell_wave_period).toFixed(0)}`,
            swellData
        }));

    }
    const handleSwell2LiveSelection = () => {

        const swellData = JSON.parse(localStorage.getItem('swellData'));
        //console.log(`handleSwell2LiveSelection => swellData: ${JSON.stringify(swellData, null, 2)}`);
        const swell2Angle = getDirection(swellData.wave_direction);
        localStorage.setItem('swell2Direction', swell2Angle);
        localStorage.setItem('swell2Angle', roundToNearestFive(swellData.wave_direction));
        localStorage.setItem('swell2Height', swellData.wave_height);
        localStorage.setItem('swell2Interval', swellData.wave_period);
        //console.log(`handleSwell2LiveSelection => wave_period: ${Number(swellData.wave_period).toFixed(0)} - ${roundToNearestFive(directionObject[swell2Angle])} swell2Angle: ${swell2Angle}`);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Direction: swell2Angle,
            swell2Angle: roundToNearestFive(directionObject[swell2Angle]),
            swell2Height: Number(swellData.wave_height).toFixed(0),
            swell2Interval: `${Number(swellData.wave_period).toFixed(0)}`,
            swellData
        }));

    }

    const setStatus = (newValue) => {
        //console.log(`setStatus => newValue.length: ${newValue.length} newValue: ${JSON.stringify(newValue, null, 2)}`);
        if (newValue && newValue !== undefined && newValue.length > 0) {
            //localStorage.setItem('players', JSON.stringify(newValue));
            //////////////////////////////////////////////////////////////

            const swellData = initializeData('swellData', [])

            //console.log(`SwellDisplay => swellData[0].current: ${JSON.stringify(swellData[0], null, 2)}`);
            //const swellData = swellData[0].current;
            const swell1Angle = getDirection(swellData.swell_wave_direction);
            const swell2Angle = getDirection(swellData.wave_direction);
            const roundToNearestFive = (number) => Math.round(number / 5) * 5;
            //console.log(`OceanContext => newValue: ${JSON.stringify(newValue, null, 2)}`);
            
            newValue.pause = true;
            newValue.swell1Direction = swell1Angle;
            newValue.swell1Angle = roundToNearestFive(swellData.swell_wave_direction);
            newValue.swell1Height = Number(swellData.swell_wave_height).toFixed(0);
            newValue.swell1Interval = `${Number(swellData.swell_wave_period).toFixed(0)}`;
            newValue.swell2Direction = swell2Angle;
            newValue.swell2Angle = roundToNearestFive(swellData.wave_direction);
            newValue.swell2Height = Number(swellData.wave_height).toFixed(0);
            newValue.swell2Interval = `${Number(swellData.wave_period).toFixed(0)}`;
            newValue.swellData = swellData;
            //////////////////////////////////////////////////////////////
            setStatusData(newValue);
        }
    };

    useEffect(() => {
        
        setStatusData({
            module: 'Waves',
            pause: true,
            date: new Date(),
            //edit: false,
            tide: getDefault('tide'),
            stars: getDefault('stars'),
            waterTemp: '66.2',
            swell1Height: initializeData('swell1Height', '2.0'),
            swell1Interval: initializeData('swell1Interval', 17),
            swell1Direction: getSwell1Direction(),
            swell2Height: initializeData('swell2Height', '2.0'),
            swell2Interval: initializeData('swell2Interval', 9),
            swell2Direction: getSwell2Direction(),
            swell1Angle: directionObject[getSwell1Direction()],
            swell2Angle: directionObject[getSwell2Direction()],
            //swell1Direction: getDefault('swell1Direction'),
            //swell2Direction: getDefault('swell2Direction'),
            //swell1Angle: getDefault('swell1Angle'),
            //swell2Angle: getDefault('swell2Angle'),
            //swell1Height: getDefault('swell1Height'),
            //swell2Height: getDefault('swell2Height'),
            //swell1Interval: getDefault('swell1Interval'),
            //swell2Interval: getDefault('swell2Interval'),
            windDirection: getDefault('windDirection'),
            distance: getDistance(),
            isSwell1: (initializeData('isSwell1', null) === true) ? true : false,
            isSwell2: (initializeData('isSwell2', null) === true) ? true : false,
            isTide: (initializeData('isTide', null) === true) ? true : false,
            isWind: (initializeData('isWind', null) === true) ? true : false,
            //locations: getLocalLocations(),
            matches: [],
            init: false
        })
    }, []);

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
        }
        //console.log(`swellData: ${JSON.stringify(swellData, null, 2)}`);
        if (swellData[0].current) {
            if (swellData[0].current.swell_wave_period === 'NaN' || isNaN(swellData[0].current.swell_wave_period)) {
                const localSwell = initializeData('swellData', templateData)
                setSwell(localSwell);
            } else {
                localStorage.setItem('swellData', JSON.stringify(swellData[0].current));
                setSwell(swellData[0].current);
            }
            setDataInit(true);
        }
    }, [swellData]);

    const getDefaultHeights = (tideSelected) => {
        if (tideSelected === 'high') {
            return 5;
        } else if (tideSelected === 'medium') {
            return 3;
        }
        return 0;
    }

    const setWindStatus = (selected) => {
        localStorage.setItem('windDirection', roundToNearestFive(selected));
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            windDirection: roundToNearestFive(selected)
        }));
    }
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
    }
    const setWind = (direction, angle, speed, gusts) => {
        localStorage.setItem('windDirection', direction);
        setStatus(prevState => ({
            ...prevState,
            windDirection: direction,
            windAngle: Number(angle).toFixed(0),
            windSpeed: Number(speed).toFixed(0),
            windGusts: Number(gusts).toFixed(0)
        }));
    }
    const handleWindCheck = () => {
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            isWind: !status.isWind
        }));
    }
    const handleTideCheck = () => {
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            isTide: !status.isTide
        }));
    }
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
    }
    // eslint-disable-next-line
    const handleSwellSelection = (id, groupTitle, label, selected) => {
        // eslint-disable-next-line
        const swellAngle = directionObject[selected];
        if (id === '1') {
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                swell1Direction: selected,
                swell1Angle: swellAngle
            }));
        } else {
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                swell2Direction: selected,
                swell2Angle: swellAngle
            }));
        }
    }
    const handleSwell1Selection = (groupTitle, label, selected) => {
        const swell1Angle = directionObject[selected];
        console.log(`OceanContext => handleSwell1Selection: ${selected} swell1Angle: ${swell1Angle}`);
        localStorage.setItem('swell1Direction', selected);
        localStorage.setItem('swell1Angle', swell1Angle);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Direction: selected,
            swell1Angle: swell1Angle
        }));
    }
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
    }
    const roundToNearestFive = (number) => Math.round(number / 5) * 5;
    
    const handleSwell1Angle = (groupTitle, label, selected) => {

        //console.log(`handleSwell1Angle => selected: ${selected} getDirection(selected): ${getDirection(selected)}`);

        localStorage.setItem('swell1Angle', selected);
        localStorage.setItem('swell1Direction', getDirection(selected));  
            
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Angle: selected,
            swell1Direction: getDirection(selected)
        }));
    }
    const handleSwell2Angle = (groupTitle, label, selected) => {

        localStorage.setItem('swell2Angle', selected);
        localStorage.setItem('swell2Direction', getDirection(selected));

        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Angle: selected,
            swell2Direction: getDirection(selected)
        }));
    }
    const handleSwell1Height = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Height', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Height: selected.replace('ft', '')
        }));
    }
    const handleSwell2Height = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Height', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Height: selected.replace('ft', '')
        }));
    }
    const handleSwell1Interval = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Interval', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Interval: selected
        }));
    }
    const handleSwell2Interval = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Interval', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Interval: selected
        }));
    }
    const handleStarSelection = (groupTitle, label, selected) => {
        localStorage.setItem('stars', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            stars: selected
        }));
    }
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
    }
    const pause = (event) => {
        setStatus(prevState => ({
            ...prevState,
            pause: true
        }));
    }
    // eslint-disable-next-line
    const unpause = () => {
        setStatus(prevState => ({
            ...prevState,
            pause: true
        }));
    };
    const setTide = (tide, height) => {
        localStorage.setItem('tide', tide);
        localStorage.setItem('height', height);
        if (initializeData('tide', null) !== tide) {
            setStatus(prevState => ({
                ...prevState,
                tide: tide,
                height: height
            }));
        }
    }
    
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