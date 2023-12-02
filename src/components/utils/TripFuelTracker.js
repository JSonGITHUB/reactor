import React, { useState, useEffect } from 'react';
import getKey from './KeyGenerator.js';
import Geolocator from "./Geolocator.js";

const TripFuelTracker = () => {

    const tempData = [{location:"Home",odometer:"79084",guageStart:"",guageEnd:"",time:"10/26/2023, 3:57:44 AM",latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:0,usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Calexico",odometer:"79215",guageStart:"25",guageEnd:"110",time:"10/26/2023, 6:07:37 AM",latitude:32.7483392,longitude:-117.1259392,distance:131,gallons:"14",usdPerGallon:"5.09",totalUSD:"71.26"},{location:"San Felipe",odometer:"79335",guageStart:"45",guageEnd:"110",time:"10/26/2023, 8:17:23 AM",latitude:32.7483392,longitude:-117.1259392,distance:120,gallons:"10",usdPerGallon:"5.07",totalUSD:"50.70"},{location:"Jesus Maria",odometer:"79540",guageStart:"5",guageEnd:"110",time:"10/26/2023, 11:50:07 AM",latitude:32.7483392,longitude:-117.1259392,distance:205,gallons:"16.1",usdPerGallon:"5.23",totalUSD:"84.20"},{location:"Abreojos Campo",odometer:"79679",guageStart:"40",guageEnd:"40",time:"10/26/2023, 2:49:01 PM",latitude:32.7483392,longitude:-117.1259392,distance:139,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79679",guageStart:"40",guageEnd:"40",time:"10/27/2023, 3:28:53 PM",latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Tienda",odometer:"79682",guageStart:"40",guageEnd:"40",time:"10/27/2023, 3:30:56 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79685",guageStart:"40",guageEnd:"40",time:"10/27/2023, 3:32:13 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79685",guageStart:"40",guageEnd:"40",time:"10/28/2023, 3:33:02 PM",latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Tienda",odometer:"79688",guageStart:"40",guageEnd:"40",time:"10/28/2023, 3:33:43 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79691",guageStart:"40",guageEnd:"40",time:"10/28/2023, 3:34:15 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79691",guageStart:"40",guageEnd:"40",time:"10/29/2023, 3:34:48 PM",latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Tienda",odometer:"79694",guageStart:"40",guageEnd:"40",time:"10/29/2023, 3:35:09 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79697",guageStart:"40",guageEnd:"40",time:"10/29/2023, 3:35:11 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79697",guageStart:"40",guageEnd:"40",time:"10/30/2023, 3:35:33 PM",latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Tienda",odometer:"79700",guageStart:"40",guageEnd:"40",time:"10/30/2023, 3:35:34 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79703",guageStart:"40",guageEnd:"40",time:"10/30/2023, 3:35:34 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79703",guageStart:"40",guageEnd:"40",time:"10/31/2023, 3:36:05 PM",latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Tienda",odometer:"79706",guageStart:"40",guageEnd:"40",time:"10/31/2023, 3:36:06 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79709",guageStart:"40",guageEnd:"40",time:"10/31/2023, 3:36:07 PM",latitude:32.7483392,longitude:-117.1259392,distance:3,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Campo",odometer:"79709",guageStart:"40",guageEnd:"40",time:"11/1/2023, 7:09:00 AM",latitude:32.7483392,longitude:-117.1259392,distance:0,gallons:"",usdPerGallon:"0.00",totalUSD:"0.00"},{location:"Abreojos Pemex",odometer:"79717",guageStart:"70",guageEnd:"110",time:"11/1/2023, 7:19:49 AM",latitude:32.7483392,longitude:-117.1259392,distance:8,gallons:"14.3",usdPerGallon:"5.87",totalUSD:"83.94"},{location:"Jesus Maria",odometer:"79856",guageStart:"25",guageEnd:"110",time:"11/1/2023, 9:39:10 AM",latitude:32.7483392,longitude:-117.1259392,distance:139,gallons:"11.9",usdPerGallon:"5.56",totalUSD:"66.16"},{location:"Gonzaga",odometer:"79970",guageStart:"45",guageEnd:"110",time:"11/1/2023, 11:51:41 AM",latitude:32.7483392,longitude:-117.1259392,distance:114,gallons:"8.8",usdPerGallon:"5.89",totalUSD:"51.83"},{location:"San Felipe",odometer:"80061",guageStart:"50",guageEnd:"110",time:"11/1/2023, 1:40:45 PM",latitude:32.7483392,longitude:-117.1259392,distance:91,gallons:"8.6",usdPerGallon:"5.37",totalUSD:"46.18"},{location:"Pine Valley",odometer:"80252",guageStart:"0",guageEnd:"95",time:"11/1/2023, 6:11:35 PM",latitude:32.7483392,longitude:-117.1259392,distance:191,gallons:"15.8",usdPerGallon:"6.29",totalUSD:"99.38"},{location:"Home",odometer:"80314",guageStart:"0",guageEnd:"95",time:"11/1/2023, 7:40:42 PM",latitude:32.7483392,longitude:-117.1259392,distance:62,gallons:"0",usdPerGallon:"0",totalUSD:"0.00"}];

    const [location, setLocation] = useState('');
    const [odometer, setOdometer] = useState('');
    const [exchangeRate, setExchangeRate] = useState(0);
    const [pricePerLiter, setPricePerLiter] = useState(0);
    const [pricePerGallon, setPricePerGallon] = useState(0);
    const [gallonsPurchased, setGallonsPurchased] = useState(0);
    const [litersPurchased, setLitersPurchased] = useState(0);
    const [trips, setTrips] = useState(JSON.parse(localStorage.getItem('TripFuelTracker')) || []);
    const [currency, setCurrency] = useState('USD');
    const [longitude, setLongitude] = useState(localStorage.getItem('longitude') || []);
    const [latitude, setLatitude] = useState(localStorage.getItem('latitude') || []);
    const [distance, setDistance] = useState(localStorage.getItem('distance') || []);
    const [guageStart, setGuageStart] = useState('');
    const [guageEnd, setGuageEnd] = useState('');

    const currencyCode = [
        'USD',
        'MXN',
        'NIO',
        'CRC',
        'IDR',
        'AUD',
    ];

    const currencies = {
        USD: 'Dollar',
        MXN: `Pesos`,   // Mexican Peso
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
        setDistance(localStorage.getItem('distance'));
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

    const clearRecord = () => {
        setTrips([]);
    }
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
            console.log("Invalid index to remove");
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

    const getDate = (index) => (trips[index] !== undefined) ? `${trips[index].time.split(', ')[0].split('/')[0]}/${trips[index].time.split(', ')[0].split('/')[1]}` : null;
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
        const time = new Date().toLocaleString();
        const newDate = `${time.split(', ')[0].split('/')[0]}/${time.split(', ')[0].split('/')[1]}`;
        const lastOdometer = Number(localStorage.getItem('odometer'));
        const newDistance = (lastDate == newDate) ? (Number(odometer) - lastOdometer) : 0;
        localStorage.setItem('distance', newDistance);
        localStorage.setItem('odometer', odometer);

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
        const { name, value } = event.target;
        setCurrency(value);
    };
    const handleGuageStartChange = (event) => {
        const { name, value } = event.target;
        setGuageStart(value);
    };
    const handleGuageEndChange = (event) => {
        const { name, value } = event.target;
        setGuageEnd(value);
    };
    const getUSInputs = () => {
        if (currencies[currency] === 'Dollar') {
            return <div>
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            {currencies[currency]} per Gallon:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <input className='r-5 p-10 w-150 bg-darker color-soft'
                            type='number'
                            value={pricePerGallon}
                            onChange={(e) => setPricePerGallon(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            Total Gallons:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <input className='r-5 p-10 w-150 bg-darker color-soft'
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
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            Exchange Rate:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <input className='r-5 p-10 w-150 bg-darker color-soft'
                            type='number'
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            {currencies[currency]} per Liter:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <input className='r-5 p-10 w-150 bg-darker color-soft'
                            type='number'
                            value={pricePerLiter}
                            onChange={(e) => setPricePerLiter(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            Total Liters:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <input className='r-5 p-10 w-150 bg-darker color-soft'
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
        setLatitude(latitude);
        //setDistance(calculateDistance());
    };
    const getDailyTotalsDisplay = (index) => {
        const date = getDate(index);
        const previousDate = getDate(index - 1) || null;
        const nextDate = getDate(index + 1) || null;
        if (date == nextDate) {
            return
        }
        return <div className='flexContainer bg-veryLite color-yellow mt-20 r-5 m-5 p-5 size20'>
            <div className='flex4Column'>
                <div className='p-5'>distance</div>
                <div className='p-5 bold bg-darker m-1 r-5 mt-5 mb-5'>{getTotalMiles(index)}</div>
            </div>
            <div className='flex4Column'>
                <div className='p-5'>time</div>
                <div className='p-5 bold bg-darker m-1 r-5 mt-5 mb-5'>{getTotalHours(index)}</div>
            </div>
            <div className='flex4Column'>
                <div className='p-5'>stops</div>
                <div className='p-5 bold bg-darker m-1 r-5 mt-5 mb-5'>{getTotalStops(index)}</div>
            </div>
            <div className='flex4Column'>
                <div className='p-5'>gallons</div>
                <div className='p-5 bold bg-darker m-1 r-5 mt-5 mb-5'>{getTotalGallons(index)}</div>
            </div>
            <div className='flex4Column'>
                <div className='p-5'>USD</div>
                <div className='p-5 bold bg-darker m-1 r-5 mt-5 mb-5'>${getTotalUSD(index)}</div>
            </div>
        </div>
    }
    return (
        <div className='mt--20'>
            <div className='bg-tinted r-10 p-10 m-5'>
                <Geolocator
                    currentPositionExists="false"
                    returnCurrentPosition={updateCurrentLocation}
                />
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            Location:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <input className='r-5 p-10 w-150 bg-darker color-soft'
                            type='string'
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            Odometer:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <input className='r-5 p-10 w-150 bg-darker color-soft'
                            type='number'
                            value={odometer}
                            onChange={(e) => setOdometer(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='columnRightAlign width-50-percent'>
                        <span className='size20 r-5 w-200 p-10 bold color-soft'>
                            Currency:
                        </span>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <select
                            name="currency"
                            value={currency}
                            onChange={handleInputChange}
                            className='mt--2 w-150 bg-darker color-soft r-5 p-10'
                        >
                            <option value="">Select Currency</option>
                            {currencyCode.map((currency) => (
                                <option key={currency} value={currency}>
                                    {currencies[currency]}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>
                <label className='flexContainer bg-veryLite r-10 m-5'>
                    <div className='size20 p-10 columnRightAlign width-50-percent'>
                        <select
                            name="guageStart"
                            value={guageStart}
                            onChange={handleGuageStartChange}
                            className='mt--2 bg-darker color-soft r-5 p-10'
                        >
                            <option value="">Tank Start</option>
                            {fuelGuageReadings.map((readingValue) => (
                                <option key={readingValue} value={readingValue}>
                                    {`${readingValue}%`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='size20 p-10 columnLeftAlign width-50-percent'>
                        <select
                            name="guageEnd"
                            value={guageEnd}
                            onChange={handleGuageEndChange}
                            className='mt--2 w-150 bg-darker color-soft r-5 p-10'
                        >
                            <option value="">Tank End</option>
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
            <div>
                <div className='flexContainer'>
                    <div className='flex2Column contentCenter'>
                        <button className='myButton mt-20 p-20 w-150' onClick={calculateAndRecord}>Add</button>
                    </div>
                    <div className='flex2Column contentCenter'>
                        <button className='myButton mt-20 p-20 w-150' onClick={clearRecord}>Clear</button>
                    </div>
                </div>
                <div className='scrollHeight250 r-10 m-5 mt-20'>
                    {
                        trips.map((trip, index) => <div className='mt-1 r-10 color-soft bg-darker pb-10' key={getKey(`trip${index}`)}>
                            <div className="p-10 w-100-percent flexContainer">
                                <div className="bold size30 color-yellow flexOneFifthColumn contentLeft" onClick={() => editLocation(index, trip.location)}>{index + 1}. {trip.location}</div>
                                <div className="rt-25 t-0 mt-5 r-5 size15 bg-lite bold color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight" onClick={() => deleteLocation(index)}>X</div>
                            </div>
                            <div className='ml-40 w-auto'>
                                <div className='p-5 r-5 bg-darker mt-5 width-100-percent flexContainer'>
                                    <span onClick={() => editLatitude(index, trip.latitude)}>{trip.latitude}</span>, <span onClick={() => editLongitude(index, trip.longitude)}>{trip.longitude}</span>
                                    <span className="ml-10">
                                        <a className="p-5 bg-green r-5 mt-35 color-lite" href={`https://www.google.com/maps?q=${trip.latitude},${trip.longitude}`} target="_blank">Map</a>
                                    </span>
                                </div>
                            </div>
                            <div className='flexContainer r-5 pb-5 bg-veryLite m-10'>
                                <div className='m-auto w-auto'>
                                    <div className='p-5' onClick={() => editTime(index)}>{`${trip.time.split(', ')[1]}`}</div>
                                    <div className='p-10 bold bg-darker r-5 size25' onClick={() => editDate(index)}>{`${trip.time.split(', ')[0].split('/')[0]}/${trip.time.split(', ')[0].split('/')[1]}`}</div>
                                </div>
                                <div className='m-auto'>
                                    <div className='p-5'>Gallons</div>
                                    <div className='p-10 bold bg-darker r-5 size25' onClick={() => editGallons(index, trip.gallons)}>{trip.gallons}</div>
                                </div>
                                <div className='m-auto'>
                                    <div className='p-5'>$/Gallons</div>
                                    <div className='p-10 bold bg-darker r-5 size25' onClick={() => editUSDGallons(index, trip.usdPerGallon)}>${trip.usdPerGallon}</div>
                                </div>
                                <div className='m-auto'>
                                    <div className='p-5'>USD</div>
                                    <div className='p-10 bold bg-darker r-5 size25' onClick={() => editTotalUSD(index, trip.totalUSD)}>${trip.totalUSD}</div>
                                </div>
                            </div>
                            <div className='ml-10 mt--5 mr-10 mb-5 r-5 greet color-lite bg-veryLite flexContainer'>
                                <div className='m-auto w-auto p-5' onClick={() => editOdometer(index, trip.odometer)}>
                                    <div className='bold'>odometer:</div>
                                    <div className='p-5 r-5 bg-darker mt-5'>{trip.odometer}</div>
                                </div>
                                <div className='m-auto w-auto p-5'>
                                    <div className='bold'>tank:</div>
                                    <div className='p-5 r-5 bg-darker mt-5' onClick={() => editGuageStart(index, trip.guageStart)}>{trip.guageStart}% to <span onClick={() => editGuageEnd(index, trip.guageEnd)}>{trip.guageEnd}</span>%</div>
                                </div>
                                <div className='m-auto w-auto p-5' onClick={() => editDistance(index, trip.distance)}>
                                    <div className='bold'>
                                        distance:
                                    </div>
                                    <div className='p-5 r-5 bg-darker mt-5'>
                                        {trip.distance} miles
                                    </div>
                                </div>
                            </div>
                            {getDailyTotalsDisplay(index)}
                        </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default TripFuelTracker;