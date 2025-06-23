import React, { useState, useEffect } from 'react';
import getKey from './KeyGenerator.js';
import Geolocator from '../location/Geolocator.js';
import { currentDate } from './CurrentCalendar.js';
import CollapseToggleButton from './CollapseToggleButton';
import validate from './validate';
import settings from '../../assets/images/settings.png';
import initializeData from '../utils/InitializeData';


const Fuel = () => {

    //const tempData = [{location:'Home',odometer:'79084',guageStart:'',guageEnd:'',time:'10/26/2023, 3:57:44 AM',latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:0,usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Calexico',odometer:'79215',guageStart:'25',guageEnd:'110',time:'10/26/2023, 6:07:37 AM',latitude:32.7483392,longitude:-117.1259392,distance:131,gallons:'14',usdPerGallon:'5.09',totalUSD:'71.26'},{location:'San Felipe',odometer:'79335',guageStart:'45',guageEnd:'110',time:'10/26/2023, 8:17:23 AM',latitude:32.7483392,longitude:-117.1259392,distance:120,gallons:'10',usdPerGallon:'5.07',totalUSD:'50.70'},{location:'Jesus Maria',odometer:'79540',guageStart:'5',guageEnd:'110',time:'10/26/2023, 11:50:07 AM',latitude:32.7483392,longitude:-117.1259392,distance:205,gallons:'16.1',usdPerGallon:'5.23',totalUSD:'84.20'},{location:'Abreojos Campo',odometer:'79679',guageStart:'40',guageEnd:'40',time:'10/26/2023, 2:49:01 PM',latitude:32.7483392,longitude:-117.1259392,distance:139,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79679',guageStart:'40',guageEnd:'40',time:'10/27/2023, 3:28:53 PM',latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Tienda',odometer:'79682',guageStart:'40',guageEnd:'40',time:'10/27/2023, 3:30:56 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79685',guageStart:'40',guageEnd:'40',time:'10/27/2023, 3:32:13 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79685',guageStart:'40',guageEnd:'40',time:'10/28/2023, 3:33:02 PM',latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Tienda',odometer:'79688',guageStart:'40',guageEnd:'40',time:'10/28/2023, 3:33:43 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79691',guageStart:'40',guageEnd:'40',time:'10/28/2023, 3:34:15 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79691',guageStart:'40',guageEnd:'40',time:'10/29/2023, 3:34:48 PM',latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Tienda',odometer:'79694',guageStart:'40',guageEnd:'40',time:'10/29/2023, 3:35:09 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79697',guageStart:'40',guageEnd:'40',time:'10/29/2023, 3:35:11 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79697',guageStart:'40',guageEnd:'40',time:'10/30/2023, 3:35:33 PM',latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Tienda',odometer:'79700',guageStart:'40',guageEnd:'40',time:'10/30/2023, 3:35:34 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79703',guageStart:'40',guageEnd:'40',time:'10/30/2023, 3:35:34 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79703',guageStart:'40',guageEnd:'40',time:'10/31/2023, 3:36:05 PM',latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Tienda',odometer:'79706',guageStart:'40',guageEnd:'40',time:'10/31/2023, 3:36:06 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79709',guageStart:'40',guageEnd:'40',time:'10/31/2023, 3:36:07 PM',latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Campo',odometer:'79709',guageStart:'40',guageEnd:'40',time:'11/1/2023, 7:09:00 AM',latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:'',usdPerGallon:'0.00',totalUSD:'0.00'},{location:'Abreojos Pemex',odometer:'79717',guageStart:'70',guageEnd:'110',time:'11/1/2023, 7:19:49 AM',latitude:32.7483392,longitude:-117.1259392,distance:8,gallons:'14.3',usdPerGallon:'5.87',totalUSD:'83.94'},{location:'Jesus Maria',odometer:'79856',guageStart:'25',guageEnd:'110',time:'11/1/2023, 9:39:10 AM',latitude:32.7483392,longitude:-117.1259392,distance:139,gallons:'11.9',usdPerGallon:'5.56',totalUSD:'66.16'},{location:'Gonzaga',odometer:'79970',guageStart:'45',guageEnd:'110',time:'11/1/2023, 11:51:41 AM',latitude:32.7483392,longitude:-117.1259392,distance:114,gallons:'8.8',usdPerGallon:'5.89',totalUSD:'51.83'},{location:'San Felipe',odometer:'80061',guageStart:'50',guageEnd:'110',time:'11/1/2023, 1:40:45 PM',latitude:32.7483392,longitude:-117.1259392,distance:91,gallons:'8.6',usdPerGallon:'5.37',totalUSD:'46.18'},{location:'Pine Valley',odometer:'80252',guageStart:'0',guageEnd:'95',time:'11/1/2023, 6:11:35 PM',latitude:32.7483392,longitude:-117.1259392,distance:191,gallons:'15.8',usdPerGallon:'6.29',totalUSD:'99.38'},{location:'Home',odometer:'80314',guageStart:'0',guageEnd:'95',time:'11/1/2023, 7:40:42 PM',latitude:32.7483392,longitude:-117.1259392,distance:62,gallons:'0',usdPerGallon:'0',totalUSD:'0.00'}];

    const lastOdometer = () => Number(initializeData('odometer', 0));
    const lastOilChange = () => Number(initializeData('oilChange', 0));
    const lastLocation = () => initializeData('location', 'Home');
    const lastGallons = () => Number(initializeData('gallons', 0));
    const lastUSDPerGallon = () => Number(initializeData('usdPerGallon', 0));
    const [location, setLocation] = useState(lastLocation());
    const [odometer, setOdometer] = useState(lastOdometer());
    const [oilChange, setOilChange] = useState(lastOilChange());
    const [exchangeRate, setExchangeRate] = useState(0);
    const [pricePerLiter, setPricePerLiter] = useState(0);
    const [pricePerGallon, setPricePerGallon] = useState(lastUSDPerGallon());
    const [gallonsPurchased, setGallonsPurchased] = useState(lastGallons());
    const [litersPurchased, setLitersPurchased] = useState(0);
    const [trips, setTrips] = useState(initializeData('TripFuelTracker', []));
    const [currency, setCurrency] = useState('USD');
    const [longitude, setLongitude] = useState(initializeData('longitude', []));
    const [latitude, setLatitude] = useState(initializeData('latitude', []));
    const [distance, setDistance] = useState(initializeData('distance', []));
    const [guageStart, setGuageStart] = useState('');
    const [guageEnd, setGuageEnd] = useState('');
    const [formCollapse, setFormCollapse] = useState(false);
    const [logCollapse, setLogCollapse] = useState(true);
    const [gpsCollapse, setGpsCollapse] = useState(true);
    const [oilCollapse, setOilCollapse] = useState(true);

    const currencyCode = [
        'USD',
        'MXN',
        'DOP',
        'NIO',
        'CRC',
        'IDR',
        'AUD',
    ];

    const currencies = {
        USD: 'Dollar',
        MXN: `MXN Pesos`,   // Mexican Peso
        DOP: `DOP Pesos`,   // Dominican Peso
        NIO: `Córdoba`,   // Nicaraguan Cordovas
        CRC: `Colones`,    // Costa Rican Colones
        IDR: `Rupiah`,  // Indonesian Rupiah
        AUD: `AUD`,    // Australian Dollar
    };

    const fuelGuageReadings = [
        '110',
        '105',
        '100',
        '95',
        '90',
        '85',
        '80',
        '75',
        '70',
        '65',
        '60',
        '55',
        '50',
        '45',
        '40',
        '35',
        '30',
        '25',
        '20',
        '15',
        '10',
        '5',
        '0',
        '-5',
        '-10'
    ];

    useEffect(() => {
        localStorage.setItem('TripFuelTracker', JSON.stringify(trips));
        setDistance(initializeData('distance', null));
    }, [trips]);
    useEffect(() => {
        localStorage.setItem('latitude', latitude);
    }, [latitude]);
    useEffect(() => {
        localStorage.setItem('longitude', longitude);
    }, [longitude]);
    useEffect(() => {
        localStorage.setItem('distance', distance);
    }, [distance]);
    useEffect(() => {
        localStorage.setItem('oilChange', oilChange);
    }, [oilChange]);
    /*
    const clearRecord = () => {
        setTrips([]);
    }
    */
    const recalculateDistances = (tripData) => {
        for (let i = 1; i < tripData.length; i++) {
            const currentDate = new Date(tripData[i].time);
            const previousDate = new Date(tripData[i - 1].time);
            if (currentDate.toDateString() === previousDate.toDateString()) {
                tripData[i].distance = tripData[i].odometer - tripData[i - 1].odometer;
            } else {
                tripData[i].distance = 0;
            }
        }
        return tripData;
    }
    const deleteLocation = (index) => {
        const newTrips = [...trips];
        const deleteConfirmed = window.confirm(`Do you want to delete ${newTrips[index].location}?`);

        if (deleteConfirmed && index >= 0 && index < newTrips.length) {
            newTrips.splice(index, 1);
        } else {
            console.log('Invalid index to remove');
        }
        const tripsUpdate = recalculateDistances(newTrips);
        setTrips(tripsUpdate);
    }
    const editLocation = (index, location) => {
        const newTrips = [...trips];
        newTrips[index].location = prompt('Edit location:', location) || location;
        setTrips(newTrips);
    }
    const editOdometer = (index, odometer) => {
        const newTrips = [...trips];
        newTrips[index].odometer = prompt('Edit odometer:', odometer) || odometer;
        /*
        newTrips[index].distance = newTrips[index].odometer - newTrips[index - 1].odometer;
        if (newTrips[index + 1].distance) {
            newTrips[index + 1].distance = newTrips[index + 1].odometer - newTrips[index].odometer;
        }
        setTrips(newTrips);
        */
        const tripsUpdate = recalculateDistances(newTrips);
        setTrips(tripsUpdate);
    }
    const editGuageStart = (index, guageStart) => {
        const newTrips = [...trips];
        newTrips[index].guadeStart = prompt('Edit guage start:', guageStart) || guageStart;
        setTrips(newTrips);
    }
    const editGuageEnd = (index, guageEnd) => {
        const newTrips = [...trips];
        newTrips[index].guadeEnd = prompt('Edit guage end:', guageEnd) || guageEnd;
        setTrips(newTrips);
    }
    const editLongitude = (index, longitude) => {
        const newTrips = [...trips];
        newTrips[index].longitude = prompt('Edit longitiude:', longitude) || longitude;
        setTrips(newTrips);
    }
    const editLatitude = (index, latitude) => {
        const newTrips = [...trips];
        newTrips[index].latitude = prompt('Edit latitude:', latitude) || latitude;
        setTrips(newTrips);
    }
    const editDistance = (index, distance) => {
        const newTrips = [...trips];
        newTrips[index].distance = prompt('Edit distance:', distance) || distance;
        setTrips(newTrips);
    }
    const editGallons = (index, gallons) => {
        const newTrips = [...trips];
        newTrips[index].gallons = prompt('Edit gallons:', gallons) || gallons;
        const newTotalUSD = newTrips[index].usdPerGallon * newTrips[index].gallons;
        newTrips[index].totalUSD = newTotalUSD.toFixed(2);
        setTrips(newTrips);
    }
    const editTime = (index) => {
        const newTrips = [...trips];
        const date = newTrips[index].time.split(', ')[0];
        const time = newTrips[index].time.split(', ')[1];
        const newTime = prompt('Edit time:', time) || time;
        const newTripTime = `${date}, ${newTime}`;
        newTrips[index].time = newTripTime;
        setTrips(newTrips);
    }
    const editDate = (index) => {
        const newTrips = [...trips];
        //trip.time.split(', ')[0].split('/')[0]}/${trip.time.split(', ')[0].split('/')[1]}
        const date = newTrips[index].time.split(', ')[0];
        const month = date.split(', ')[0].split('/')[0];
        const day = date.split(', ')[0].split('/')[1];
        const year = date.split(', ')[0].split('/')[2];
        const shortDate = `${month}/${day}`;
        const time = newTrips[index].time.split(', ')[1];
        const newDate = prompt('Edit date:', shortDate) || shortDate;
        const newTripDate = `${newDate}/${year}`;
        const newTripTime = `${newTripDate}, ${time}`;
        newTrips[index].time = newTripTime;
        const tripsUpdate = recalculateDistances(newTrips);
        setTrips(tripsUpdate);
    }
    const editUSDGallons = (index, usdPerGallon) => {
        const newTrips = [...trips];
        newTrips[index].usdPerGallon = prompt('Edit USD per gallon', usdPerGallon) || usdPerGallon;
        const newTotalUSD = newTrips[index].usdPerGallon * newTrips[index].gallons;
        newTrips[index].totalUSD = newTotalUSD.toFixed(2);
        setTrips(newTrips);
    }
    const editTotalUSD = (index, totalUSD) => {
        const newTrips = [...trips];
        newTrips[index].totalUSD = prompt('Edit total USD:', totalUSD) || totalUSD;
        setTrips(newTrips);
    }

    //const getDate = (index) => (trips[index] !== undefined) ? `${trips[index].time.split(', ')[0].split('/')[0]}/${trips[index].time.split(', ')[0].split('/')[1]}` : null;
    const getDate = (index) => (validate(trips[index]) !== null) ? `${trips[index].time.split(', ')[0].split('/')[0]}/${trips[index].time.split(', ')[0].split('/')[1]}` : null;

    const getSameDayStartIndex = (targetDate) => {
        let startIndex = -1;
        for (let i = 0; i < trips.length; i++) {
            if (getDate(i) === targetDate) {
                startIndex = i;
                break;
            }
        }
        return startIndex;
    }
    const getSameDayEndIndex = (targetDate) => {
        let endIndex = -1;
        for (let i = trips.length - 1; i >= 0; i--) {
            if (getDate(i) === targetDate) {
                endIndex = i;
                break;
            }
        }
        return endIndex;
    }
    const calculateAndRecord = () => {

        const lastIndex = (trips.length - 1);
        const lastDate = getDate(lastIndex);
        const pricePerLiterUSD = pricePerLiter / exchangeRate;
        const gallons = litersPurchased * 0.264172;
        const newGallons = (currency === 'USD') ? gallonsPurchased : gallons.toFixed(1);

        const usdPerGallon = (currency === 'USD') ? Number(pricePerGallon) : Number(pricePerLiterUSD * 3.78541);
        const newUsdPerGallon = usdPerGallon.toFixed(2) || 0;
        const totalUSD = (currency === 'USD') ? (gallonsPurchased * pricePerGallon) : (gallons * usdPerGallon);
        const newTotalUSD = totalUSD.toFixed(2);
        const time = currentDate();
        const newDate = `${time.split(', ')[0].split('/')[0]}/${time.split(', ')[0].split('/')[1]}`;
        const newDistance = (lastDate === newDate) ? (Number(odometer) - lastOdometer()) : 0;
        localStorage.setItem('distance', newDistance);
        localStorage.setItem('odometer', odometer);
        localStorage.setItem('oilChange', oilChange);
        localStorage.setItem('location', location);
        localStorage.setItem('gallons', newGallons);
        localStorage.setItem('usdPerGallon', newUsdPerGallon);

        const newTrip = {
            location: location,
            odometer: odometer,
            guageStart: guageStart,
            guageEnd: guageEnd,
            time: time,
            latitude: latitude,
            longitude: longitude,
            distance: newDistance,
            gallons: newGallons,
            usdPerGallon: newUsdPerGallon,
            totalUSD: newTotalUSD
        }
        const newTrips = [...trips, newTrip]
        setTrips(newTrips);

    };
    const getTotalHours = (index) => {
        //const totalTime = trips.reduce((accumulator, trip) => accumulator + parseFloat(trip.time), 0);
        const targetDate = new Date(trips[index].time);
        if (isNaN(targetDate)) return null;
        const dates = trips.map((trip) => new Date(trip.time));
        const tripsForDate = dates.filter((date) => date.toDateString() === targetDate.toDateString());
        const firstDate = tripsForDate[0];
        const lastDate = tripsForDate[tripsForDate.length - 1];
        if (isNaN(firstDate) || isNaN(lastDate)) return null;
        const timeDifference = lastDate - firstDate;
        const totalTime = timeDifference / (1000 * 60 * 60);
        const nearestHours = Math.floor(totalTime);
        const remainingMinutes = Math.round((totalTime - nearestHours) * 60);

        return `${nearestHours}h${remainingMinutes}m`;
    }
    const getTotalMiles = (index) => {
        //const totalMiles = trips.reduce((accumulator, trip) => accumulator + parseFloat(trip.distance), 0);
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalMilesInRange = trips
            .slice(startIndex, endIndex + 1)
            .reduce((accumulator, trip) => accumulator + parseFloat(trip.distance), 0);

        return totalMilesInRange.toFixed(1);
    }
    const getTotalGallons = (index) => {
        //const totalGallons = trips.reduce((accumulator, trip) => accumulator + parseFloat(Number(trip.gallons)), 0);
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalGallons = trips
            .slice(startIndex, endIndex + 1)
            .reduce((accumulator, trip) => accumulator + parseFloat(Number(trip.gallons)), 0);

        return totalGallons.toFixed(1);
    }
    const getTotalStops = (index) => {
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalStops = endIndex - startIndex;
        return totalStops;
    }
    const getTotalUSD = (index) => {
        //const totalUSD = trips.reduce((accumulator, trip) => accumulator + parseFloat(trip.totalUSD), 0);
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalUSD = trips
            .slice(startIndex, endIndex + 1)
            .reduce((accumulator, trip) => accumulator + parseFloat(trip.totalUSD), 0);

        return totalUSD.toFixed(2);
    };
    const handleInputChange = (event) => {
        const { value } = event.target;
        setCurrency(value);
    };
    const handleGuageStartChange = (event) => {
        const { value } = event.target;
        setGuageStart(value);
    };
    const handleGuageEndChange = (event) => {
        const { value } = event.target;
        setGuageEnd(value);
    };
    const getUSInputs = () => {
        if (currencies[currency] === 'Dollar') {
            return <div>
                <label className='flexContainer containerInput'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='inputText'>
                            {currencies[currency]} per Gallon:
                        </span>
                    </div>
                    <div className='columnLeftAlign width-50-percent'>
                        <input 
                            id='pricePerGallon'
                            name='pricePerGallon'
                            className='inputField'
                            type='number'
                            value={pricePerGallon}
                            onChange={(e) => setPricePerGallon(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer containerInput'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='inputText'>
                            Total Gallons:
                        </span>
                    </div>
                    <div className='columnLeftAlign width-50-percent'>
                        <input className='inputField'
                            id='gallonsPurchased'
                            name='gallonsPurchased'
                            type='number'
                            value={gallonsPurchased}
                            onChange={(e) => setGallonsPurchased(e.target.value)}
                        />
                    </div>
                </label>
            </div>
        }
    }
    const getInternationalInputs = () => {
        if (currencies[currency] !== 'Dollar') {
            return <div>
                <label className='flexContainer containerInput'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='inputText'>
                            Exchange Rate:
                        </span>
                    </div>
                    <div className='columnLeftAlign width-50-percent'>
                        <input className='inputField'
                            id='exchangeRate'
                            name='exchangeRate'
                            type='number'
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer containerInput'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='inputText'>
                            {currencies[currency]} per Liter:
                        </span>
                    </div>
                    <div className='columnLeftAlign width-50-percent'>
                        <input className='inputField'
                            id='pricePerLiter'
                            name='pricePerLiter'
                            type='number'
                            value={pricePerLiter}
                            onChange={(e) => setPricePerLiter(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer containerInput'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='inputText'>
                            Total Liters:
                        </span>
                    </div>
                    <div className='columnLeftAlign width-50-percent'>
                        <input className='inputField'
                            id='litersPurchased'
                            name='litersPurchased'
                            type='number'
                            value={litersPurchased}
                            onChange={(e) => setLitersPurchased(e.target.value)}
                        />
                    </div>
                </label>
            </div>
        }
    }
    const updateCurrentLocation = (longitude, latitude) => {
        console.log(
            `UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`
        );
        setLongitude(longitude);
        setLatitude(latitude + .000001);
        //setDistance(calculateDistance());
    };
    const getDailyTotalsDisplay = (index) => {
        const date = getDate(index);
        //const previousDate = getDate(index - 1) || null;
        const nextDate = getDate(index + 1) || null;
        if (date === nextDate) {
            return
        }
        return <div className='flexContainer scrollSnapBottom r-10 bg-dkGreen'>
            <div className='flex4Column containerDetail m-1'>
                <div className='containerDetail bold color-yellow'>distance</div>
                <div className='bold color-lite'>{getTotalMiles(index)}</div>
            </div>
            <div className='flex4Column containerDetail m-1'>
                <div className='containerDetail bold color-yellow'>time</div>
                <div className='bold color-lite'>{getTotalHours(index)}</div>
            </div>
            <div className='flex4Column containerDetail m-1'>
                <div className='containerDetail bold color-yellow'>stops</div>
                <div className='bold color-lite'>{getTotalStops(index)}</div>
            </div>
            <div className='flex4Column containerDetail m-1'>
                <div className='containerDetail bold color-yellow'>gallons</div>
                <div className='bold color-lite'>{getTotalGallons(index)}</div>
            </div>
            <div className='flex4Column containerDetail m-1'>
                <div className='containerDetail bold color-yellow'>USD</div>
                <div className='bold color-lite'>${getTotalUSD(index)}</div>
            </div>
        </div>
    }
    const getTripTime = (trip) => {
        const time = trip.time.split(', ')[1];
        const hours = time.split(':')[0];
        const minutes = time.split(':')[1];
        const half = time.split(' ')[1];
        const display = `${hours}:${minutes} ${half}`;
        return display;
    }
    const locationEntry = () => <div>
        <div className='containerBox'>
            <div className='containerBox bold color-yellow bg-lite p-20'>
                <CollapseToggleButton
                    //title={`TIDE ${icons.moon}`}
                    //title={`TIDE ${Number(heightInit()).toFixed(1)}ft ${getCurrentTide}`}
                    title={'GPS'}
                    isCollapsed={gpsCollapse}
                    setCollapse={setGpsCollapse}
                    align='left'
                    icon={settings}
                />
            </div>
            {
                (gpsCollapse)
                    ? null
                    : <Geolocator
                            currentPositionExists='false'
                            returnCurrentPosition={updateCurrentLocation}
                        />
            }
            <label className='flexContainer containerInput'>
                <div className='columnRightAlign width-50-percent'>
                    <span className='inputText'>
                        Location:
                    </span>
                </div>
                <div className='columnLeftAlign width-50-percent'>
                    <input className='inputField'
                        id='location'
                        name='location'
                        type='string'
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
            </label>
            <label className='flexContainer containerInput'>
                <div className='columnRightAlign width-50-percent'>
                    <span className='inputText'>
                        Odometer:
                    </span>
                </div>
                <div className='columnLeftAlign width-50-percent'>
                    <input className='inputField'
                        id='odometer'
                        name='odometer'
                        type='number'
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                    />
                </div>
            </label>
            <label className='flexContainer containerInput'>
                <div className='columnRightAlign width-50-percent'>
                    <span className='inputText'>
                        Currency:
                    </span>
                </div>
                <div className='columnLeftAlign width-50-percent'>
                    <select
                        name='currency'
                        value={currency}
                        onChange={handleInputChange}
                        className='inputSelect'
                    >
                        <option value=''>Select Currency</option>
                        {currencyCode.map((currency) => (
                            <option key={currency} value={currency}>
                                {currencies[currency]}
                            </option>
                        ))}
                    </select>
                </div>
            </label>
            <label className='flexContainer containerInput'>
                <div className='columnRightAlign width-50-percent'>
                    <select
                        name='guageStart'
                        value={guageStart}
                        onChange={handleGuageStartChange}
                        className='inputSelect'
                    >
                        <option value=''>Tank Start</option>
                        {fuelGuageReadings.map((readingValue) => (
                            <option key={readingValue} value={readingValue}>
                                {`${readingValue}%`}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='columnLeftAlign width-50-percent'>
                    <select
                        name='guageEnd'
                        value={guageEnd}
                        onChange={handleGuageEndChange}
                        className='inputSelect'
                    >
                        <option value=''>Tank End</option>
                        {fuelGuageReadings.map((readingValue) => (
                            <option key={readingValue} value={readingValue}>
                                {`${readingValue}%`}
                            </option>
                        ))}
                    </select>
                </div>
            </label>
            {getInternationalInputs()}
            {getUSInputs()}
        </div>
        <div className='flexContainer containerBox'>
            <button className='myButton p-20 width-100-percent m-5' onClick={calculateAndRecord}>Add</button>
        </div>
    </div>

    const displayLog = () => {
        const sortedTrips = [...trips].reverse();
        return <div>
            <div className='height--350 r-10 m-5 mt-20'>
                {
                    sortedTrips.map((trip, index) => {
                        const originalIndex = trips.length - 1 - index;
                        return <div className='containerBox bg-lite width--30' key={getKey(`trip${originalIndex}`)}>
                            <div className='containerDetail color-soft scrollSnap mb-5 bg-veryLite'>
                                <div className='containerBox flexContainer'>
                                    <div className='bold size25 color-yellow flex1Auto contentLeftCenter' onClick={() => editLocation(originalIndex, trip.location)}>
                                        {originalIndex+1}. {trip.location}
                                    </div>
                                    <div className='rt-25 t-0 mt-5 r-5 size15 bg-lite bold color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight' onClick={() => deleteLocation(originalIndex)}>
                                        X
                                    </div>
                                </div>
                                <div className='containerDetail mr-5 ml-5'>
                                    <div className='p-5 flexContainer'>
                                        <span>
                                            <div
                                                className='button p-5 bg-green mr-10 r-5 color-lite'
                                                onClick={() => window.location = `https://www.google.com/maps?q=${trip.latitude},${trip.longitude}`}>
                                                Map
                                            </div>
                                        </span>
                                        <span className='color-yellow p-5' onClick={() => editLatitude(originalIndex, trip.latitude)}>{trip.latitude}, </span><span className='color-yellow p-5' onClick={() => editLongitude(originalIndex, trip.longitude)}>{trip.longitude}</span>
                                    </div>
                                </div>
                                <div className=''>
                                    <div className='flexContainer m-5'>
                                        <div className='flex4Column containerDetail'>
                                            <div className='containerDetail color-lite bold' onClick={() => editTime(originalIndex)}>{`${getTripTime(trip)}`}</div>
                                            <div className='bold size20 p-5' onClick={() => editDate(originalIndex)}>{`${trip.time.split(', ')[0].split('/')[0]}/${trip.time.split(', ')[0].split('/')[1]}`}</div>
                                        </div>
                                        <div className='flex4Column ml-5 containerDetail'>
                                            <div className='containerDetail color-lite bold'>Gallons</div>
                                            <div className='bold size20 p-5' onClick={() => editGallons(originalIndex, trip.gallons)}>{trip.gallons}</div>
                                        </div>
                                        <div className='flex4Column ml-5 containerDetail'>
                                            <div className='containerDetail color-lite bold'>$/Gallons</div>
                                            <div className='bold size20 p-5' onClick={() => editUSDGallons(originalIndex, trip.usdPerGallon)}>${trip.usdPerGallon}</div>
                                        </div>
                                        <div className='flex4Column ml-5 containerDetail'>
                                            <div className='containerDetail color-lite bold'>USD</div>
                                            <div className='bold size20 p-5' onClick={() => editTotalUSD(originalIndex, trip.totalUSD)}>${trip.totalUSD}</div>
                                        </div>
                                    </div>
                                    <div className='flexContainer m-5'>
                                        <div className='containerDetail flex3Column' onClick={() => editOdometer(originalIndex, trip.odometer)}>
                                            <div className='containerDetail color-lite bold'>odometer</div>
                                            <div className='bold size20 p-5'>{trip.odometer}</div>
                                        </div>
                                        <div className='containerDetail flex3Column ml-5 mr-5'>
                                            <div className='containerDetail color-lite bold'>tank</div>
                                            <div className='bold size20 p-5' onClick={() => editGuageStart(originalIndex, trip.guageStart)}>{trip.guageStart}% to <span onClick={() => editGuageEnd(originalIndex, trip.guageEnd)}>{trip.guageEnd}</span>%</div>
                                        </div>
                                        <div className='containerDetail flex3Column' onClick={() => editDistance(originalIndex, trip.distance)}>
                                            <div className='containerDetail color-lite bold'>
                                                distance
                                            </div>
                                            <div className='bold size20 p-5'>
                                                {trip.distance} miles
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {getDailyTotalsDisplay(originalIndex)}
                        </div>
                    })
                }
            </div>
        </div>
    }

    return (
        <div className='mt--20 mr-10 ml-10'>
            <div className='containerBox'>
                <CollapseToggleButton
                    title={<span className={`${(odometer > (oilChange + 10000)) ? 'color-red' : (odometer > (oilChange + 4800)) ? 'color-yellow'  : 'color-green'}`}>Oil Change</span>}
                    isCollapsed={oilCollapse}
                    setCollapse={setOilCollapse}
                    align='left'
                />
            </div>
            {
                (oilCollapse)
                ? null
                : <div className='containerBox'>
                    <div className='containerBox'>
                            <label className='flexContainer containerInput'>
                                <div className='columnRightAlign width-50-percent'>
                                    <span className='inputText'>
                                        Last Oil Change:
                                    </span>
                                </div>
                                <div className='columnLeftAlign width-50-percent'>
                                    <input className='inputField'
                                        id='oilChange'
                                        name='oilChange'
                                        type='number'
                                        value={oilChange}
                                        onChange={(e) => setOilChange(e.target.value)}
                                    />
                                </div>
                            </label>
                    </div>
                    <div className='containerBox'>
                        <div className='flexContainer containerInput'>
                            <div className='columnRightAlign width-50-percent'>
                                <span className='inputText'>
                                    since last oil change:
                                </span>
                            </div>
                            <div className='columnLeftAlign width-50-percent color-yellow'>
                                {(Number(odometer) - Number(oilChange))} miles
                            </div>
                        </div>
                    </div>
                    <div className='containerBox'>
                        <div className='flexContainer containerInput'>
                            <div className='columnRightAlign width-50-percent'>
                                <span className='inputText'>
                                    next oil change:
                                </span>
                            </div>
                            <div className='columnLeftAlign width-50-percent color-yellow'>
                                {(Number(oilChange) + 10000)} miles
                            </div>
                        </div>
                    </div>
                        <div className='containerBox'>
                            <div className='flexContainer containerInput'>
                                <div className='columnRightAlign width-50-percent'>
                                    <span className='inputText'>
                                        last record:
                                    </span>
                                </div>
                                <div className='columnLeftAlign width-50-percent color-yellow'>
                                    {Number(odometer)} miles
                                </div>
                            </div>
                        </div>
                    <div className='containerBox'>
                        <div className='flexContainer containerInput'>
                            <div className='columnRightAlign width-50-percent'>
                                <span className='inputText'>
                                    until oil change:
                                </span>
                            </div>
                            <div className='columnLeftAlign width-50-percent color-yellow'>
                                    {(Number(oilChange) + 10000 - Number(odometer))} miles
                            </div>
                        </div>
                    </div>
                </div>
            }
            <div className='containerBox'>
                <CollapseToggleButton
                    title={'Location Entry'}
                    isCollapsed={formCollapse}
                    setCollapse={setFormCollapse}
                    align='left'
                />
            </div>
            {
                (formCollapse)
                ? <div></div>
                : locationEntry()
            }
            <div className='containerBox'>
                <CollapseToggleButton
                    title={'Trip Log'}
                    isCollapsed={logCollapse}
                    setCollapse={setLogCollapse}
                    align='left'
                />
            </div>
            {
                (logCollapse)
                    ? <div></div>
                    : displayLog()
            }
        </div>
    );
};

export default Fuel;