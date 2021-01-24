import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator.js';
import Geolocator from '../utils/Geolocator.js';
import WaveUtils from '../utils/WaveUtils.js';
import calculateDistance from '../utils/CalculateDistance.js';
import Tide from './Tide.js';
import WaterTemp from './WaterTemp.js';
import AirTemp from './AirTemp.js';
import WindDirection from './WindDirection.js';
import Selector from '../forms/FunctionalSelector.js';
import Dialog from '../functional/Dialog.js';
import swell1 from '../../assets/images/wavePrimary.png';
import swell2 from '../../assets/images/waveSecondaryB.png';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';
// eslint-disable-next-line
import tide from '../../assets/images/tide.png';
import waterTemp from '../../assets/images/waterTemp.png';
import airTemp from '../../assets/images/airTemp.png';
import thumbsUp from '../../assets/images/ThumbsUp.png';
import thumbsDown from '../../assets/images/ThumbsDown.png';
import SurfLocation from './SurfLocation.js';
import locations from './Locations.js';
import directionObject from './DirectionObject.js';

const WaveFinder = ({
        tide,
        isSwell1,
        isSwell2,
        isTide,
        isWind,
        swell1Direction,
        swell2Direction,
        swell1Angle,
        swell2Angle,
        swell1Height,
        swell2Height,
        swell1Interval,
        swell2Interval,
        windDirection,
        distance
    }) => {
    
    const getLocal = (item) => localStorage.getItem(item);
    const getProps = (item) => item;
    const getDefault = (item) => (getLocal(item) === null) ? getProps(item) : getLocal(item);
    const getSwell1Direction = () => localStorage.getItem("swell1Direction") ? localStorage.getItem("swell1Direction") : "SSW";
    const getSwell2Direction = () => localStorage.getItem("swell2Direction") ? localStorage.getItem("swell2Direction") : "SSW";
    //console.log(`isWind: ${getDefault("isWind")}`)
    const getLocations = () => getLocalLocations() || defaultLocations();
    const getLocalLocations = () => (localStorage.getItem('locations')) ? JSON.parse(localStorage.getItem('locations')) : false;
    const defaultLocations = () => {
        localStorage.setItem('locations', JSON.stringify(locations));
        return locations;
    }

    const [status, setStatus] = useState({
        module: 'WaveFinder',
        pause: false,
        date: new Date(),
        edit: false,
        tide: getDefault("tide"),
        stars: getDefault("stars"),
        waterTemp: "66.2",
        swell1Height: "2.0",
        swell1Interval: "17 seconds",
        swell1Direction: getSwell1Direction(),
        swell2Height: "2.0",
        swell2Interval: "9 seconds",
        swell2Direction: getSwell2Direction(),
        swell1Angle: directionObject["SSW"],
        swell2Angle: directionObject["SSW"],
        //swell1Direction: getDefault("swell1Direction"),
        //swell2Direction: getDefault("swell2Direction"),
        //swell1Angle: getDefault("swell1Angle"),
        //swell2Angle: getDefault("swell2Angle"),
        //swell1Height: getDefault("swell1Height"),
        //swell2Height: getDefault("swell2Height"),
        //swell1Interval: getDefault("swell1Interval"),
        //swell2Interval: getDefault("swell2Interval"),
        windDirection: getDefault("windDirection"),
        distance: getDefault("distance"),
        isSwell1: (getDefault("isSwell1") === "true") ? true : false,
        isSwell2: (getDefault("isSwell2") === "true") ? true : false,
        isTide: (getDefault("isTide") === "true") ? true : false,
        isWind: (getDefault("isWind") === "true") ? true : false,
        locations: getLocations()
    });
    /*
    componentDidMount() {
        
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        const uri = 'https://jsongithub.github.io/portfolio/assets/data/gpsData.json';
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                setStatus({
                    isLoaded: true,
                    locations: data
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));
        
    }
    */
    const tick = () => {
        console.log(`pause: ${status.pause}`)
        if (status.pause === false) {
            setStatus(prevState => ({
                ...prevState,
                date: new Date()
            }));
        }
    }
    useEffect(() => {     		
        const timerID = setInterval(
            () => tick(),
            3000000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    },[]);
    const currentPositionExists = () => (status.longitude) ? true : false;
    const updateCurrentLocation = (longitude, latitude) => {
//      console.log(`UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`)
        localStorage.setItem("longitude", longitude);
        localStorage.setItem("latitude", latitude);
        setStatus(prevState => ({
            ...prevState,
            longitude,
            latitude
        }));
    }
    /*
    tideURL = ${`https://tidesandcurrents.noaa.gov/api/datagetter?
        begin_date=20130101 10:00&
        end_date=20130101 10:24&
        station=9410230&
        product=water_level&
        datum=mllw&
        units=metric&
        time_zone=gmt&
        application=web_services&
        format=json`
    }
    data = () => {
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        const uri = tideURL;
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`data =-=-=-=-=-=-> ${JSON.stringify(data,null,2)}`)
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));
    }
   const data = () => {
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        const uri = tideURL;
        fetch("https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224")
            .then(response => validate(response))
            .then(data => {
                console.log(`data =-=-=-=-=-=-> ${JSON.stringify(data,null,2)}`)
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));
    }
    */
    const getDefaultHeights = (tideSelected) => {
        if (tideSelected === "high") {
            return 5;
        } else if (tideSelected === "medium") {
            return 3;
        }
        return 0;
    }
    const handleTideSelection = (groupTitle, label, selected) => {
        localStorage.setItem("tide", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            tide: selected,
            height: getDefaultHeights(selected)
        }));
    }
    const handleWindCheck = (event) => {
        const isWind = (!!status.isWind === true) ? false : true;
        localStorage.setItem("isWind", isWind);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            isWind: isWind
        }));
    }
    const handleTideCheck = (event) => {
        const isTide = (!!status.isTide === true) ? false : true;
        localStorage.setItem("isTide", isTide);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            isTide: isTide
        }));
    }
    const handleSwell1Check = (event) => {
        const isSwell1 = (!!status.isSwell1 === true) ? false : true;
        localStorage.setItem("isSwell1", isSwell1);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            isSwell1: isSwell1
        }));
    }
    const handleSwell2Check = (event) => {
        const isSwell2 = (!!status.isSwell2 === true) ? false : true;
        localStorage.setItem("isSwell2", isSwell2);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            isSwell2: isSwell2
        }))
    }
    const directionArray = ["W", "WSW", "WNW", "E", "ESE", "ENE", "N", "NE", "NNE", "NW", "NNW", "S", "SE", "SSE", "SW", "SSW"];

    const handleSwell1Selection = (groupTitle, label, selected) => {
        const swell1Angle = directionObject[selected];
        //console.log(`handleSwell1Selection => \nselected: ${selected} \nswell1Angle: ${swell1Angle}\n directionObject: ${JSON.stringify(directionObject, null, 2)}`)
        localStorage.setItem("swell1Angle", swell1Angle);
        localStorage.setItem("swell1Direction", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell1Direction: selected,
            swell1Angle: swell1Angle
        }));
    }
    const handleSwell2Selection = (groupTitle, label, selected) => {
        const swell2Angle = directionObject[selected];
        //console.log(`${selected} swell2Angle: ${swell2Angle}`)
        localStorage.setItem("swell2Angle", swell2Angle);
        localStorage.setItem("swell2Direction", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell2Direction: selected,
            swell2Angle: swell2Angle
        }));
    }
    const handleSwell1Angle = (groupTitle, label, selected) => {
        localStorage.setItem("swell1Angle", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell1Angle: selected
        }));
    }
    const handleSwell2Angle = (groupTitle, label, selected) => {
        localStorage.setItem("swell2Angle", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell2Angle: selected
        }))
    }
    const handleSwell1Height = (groupTitle, label, selected) => {
        localStorage.setItem("swell1Height", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell1Height: selected
        }));
    }
    const handleSwell2Height = (groupTitle, label, selected) => {
        localStorage.setItem("swell2Height", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell2Height: selected
        }));
    }
    const handleSwell1Interval = (groupTitle, label, selected) => {
        localStorage.setItem("swell1Interval", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell1Interval: selected
        }));
    }
    const handleSwell2Interval = (groupTitle, label, selected) => {
        localStorage.setItem("swell2Interval", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            swell2Interval: selected
        }));
    }
    const handleWindSelection = (groupTitle, label, selected) => {
        localStorage.setItem("windDirection", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            windDirection: selected
        }));
    }
    const handleStarSelection = (groupTitle, label, selected) => {
        localStorage.setItem("stars", selected);
        setStatus(prevState => ({
            ...prevState,
            pause: false,
            stars: selected
        }));
    }
    const handleDistanceSelection = (event) => {
        const target = event.target;
        localStorage.setItem("distance", target.value);
        setStatus(prevState => ({
            ...prevState,
            distance: target.value
        }));
    }
    const pause = (event) => {
        //console.log("PAUSE");
        setStatus(prevState => ({
            ...prevState,
            pause: true
        }));
    }
    const unpause = () => {
        //console.log("UNPAUSE");
        setStatus(prevState => ({
            ...prevState,
            pause: false
        }));
    }
    const isSwellSelected = (id) => ((id === 1 && status.isSwell1 === true) || (id === 2 && status.isSwell2===true)) ? 'bg-green' : 'bg-dkGreen';
    const swellClass = (id) => `${isSwellSelected(id)} flex2Column r-10 m-5 p-15`;
    const swellSelector = (id, swellDirection) => <div className={swellClass(id)} onMouseDown={pause}>
        {getSwellIcon(id)}
        <span className="ml-5">Swell{id}</span><br/>
        <div className='bg-lite r-10 mt-20 pb-15'>
            <span className="greet ml-5">direction</span><br/>
            <Selector
                groupTitle={`Swell${id}`}
                selected={swellDirection} 
                //getState(`swell1`)
                label="Direction" 
                items={directionArray}
                onChange={(id === 1) ? handleSwell1Selection : handleSwell2Selection}
            />
            <br/>
            <span className="greet ml-5">angle</span><br/>
            <Selector
                groupTitle={`SwellAngle${id}`}
                selected={(id === 1) ? status.swell1Angle : status.swell2Angle} 
                label="Angle" 
                items={[
                    "0",
                    "5",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                    "60",
                    "65",
                    "70",
                    "75",
                    "80",
                    "85",
                    "90",
                    "95",
                    "100",
                    "105",
                    "110",
                    "115",
                    "120",
                    "125",
                    "130",
                    "135",
                    "140",
                    "145",
                    "150",
                    "155",
                    "160",
                    "165",
                    "170",
                    "175",
                    "180",
                    "185",
                    "190",
                    "195",
                    "200",
                    "205",
                    "210",
                    "215",
                    "220",
                    "225",
                    "230",
                    "235",
                    "240",
                    "245",
                    "250",
                    "255",
                    "260",
                    "265",
                    "270",
                    "275",
                    "280",
                    "285",
                    "290",
                    "295",
                    "300",
                    "305",
                    "310",
                    "315",
                    "320",
                    "325",
                    "330",
                    "335",
                    "340"
                ]}
                onChange={(id === 1) ? handleSwell1Angle : handleSwell2Angle}
            />
            <br/>
            <span className="greet ml-5">height</span><br/>
            <Selector
                groupTitle={`SwellHeight${id}`}
                selected={(id === 1) ? status.swell1Height : status.swell2Height} 
                label="Height" 
                items={[
                    "",
                    "1ft",
                    "2ft",
                    "3ft",
                    "4ft",
                    "5ft",
                    "6ft",
                    "7ft",
                    "8ft",
                    "9ft",
                    "10ft",
                    "11ft",
                    "12ft",
                    "13ft",
                    "14ft",
                    "15ft",
                    "16ft",
                    "17ft",
                    "18ft"
                ]}
                onChange={(id === 1) ? handleSwell1Height : handleSwell2Height}
            />
            <br/>
            <span className="greet ml-5">interval</span><br/>
            <Selector
                groupTitle={`SwellInterval${id}`}
                selected={(id === 1) ? status.swell1Interval : status.swell2Interval} 
                label="interval" 
                items={[
                    "",
                    "5 seconds",
                    "6 seconds",
                    "7 seconds",
                    "8 seconds",
                    "9 seconds",
                    "10 seconds",
                    "11 seconds",
                    "12 seconds",
                    "13 seconds",
                    "14 seconds",
                    "15 seconds",
                    "16 seconds",
                    "17 seconds",
                    "18 seconds",
                    "19 seconds",
                    "20 seconds",
                    "21 seconds",
                    "22 seconds",
                    "23 seconds"
                ]}
                onChange={(id === 1) ? handleSwell1Interval : handleSwell2Interval}
            />
        </div>
        
        {(id===1) ? 
            /*
            <div className="fl-left">
                <input
                    name="isSwell1"
                    type="checkbox"
                    checked={status.isSwell1}
                    onChange={handleSwell1Check}
                />
            </div>
            */
            <div className="button mt-15" onClick={handleSwell1Check}>
                {(status.isSwell1 === true) ? <img src={thumbsUp} alt='swell1' className='p-10 r-20' /> : <img src={thumbsDown} alt='swell1' className='p-10 r-20' /> }
            </div>
            :
            /*
            <div className="fl-left">
                <input
                    name="isSwell2"
                    type="checkbox"
                    checked={status.isSwell2}
                    onChange={handleSwell2Check}
                />
            </div>
            */
            <div className="button mt-15" onClick={handleSwell2Check}>
                {(status.isSwell2 === true) ? <img src={thumbsUp} alt='swell2' className='p-10 r-20' /> : <img src={thumbsDown} alt='swell2' className='p-10 r-20' /> }
            </div>
        }
    </div>
    const isTideSelected = () => (status.isTide === true) ? 'bg-green' : 'bg-dkGreen';
    const tideClass = () => `${isTideSelected()} flex2Column r-10 m-5 p-15`;
    const tideSelector = (tide) => <div className={tideClass()} onMouseDown={pause}>
                                Tide
                                <div className="greet pt-10"><Tide setTide={setTide} display='narrow'/></div>
                                <Selector 
                                    groupTitle="Tide"
                                    selected={status.tide} 
                                    label="current" 
                                    items={["low", "medium", "high"]}
                                    onChange={handleTideSelection}
                                />
                                <div className="button mt-15" onClick={handleTideCheck}>
                                    {(status.isTide === true) ? <img src={thumbsUp} alt='tide' className='p-10 r-20' /> : <img src={thumbsDown} alt='tide' className='p-10 r-20' /> }
                                </div>
                            </div>
    const isWindSelected = () => (status.isWind === true) ? 'bg-green' : 'bg-dkGreen';
    const windClass = () => `${isWindSelected()} flex2Column r-10 m-5 p-15`;
    const windSelector = (windDirection) => <div className={windClass()} onMouseDown={pause}>
    {/*console.log(`windSelector => windDirection: ${status.windDirection}`)*/}
                            Wind<br/>
                            <div className="greet pt-10"><WindDirection columns="1" setWind={setWind}/></div>
                            <Selector
                                groupTitle="Wind" 
                                selected={status.windDirection} 
                                label="Direction"
                                items={directionArray}
                                onChange={handleWindSelection}
                            />
                            <div className="button mt-15" onClick={handleWindCheck}>
                                {(status.isWind === true) ? <img src={thumbsUp} alt='wind' className='p-10 r-20' /> : <img src={thumbsDown} alt='wind' className='p-10 r-20' /> }
                            </div>
                        </div>
    const starSelector = (stars) => <div className="flex2Column bg-dkGreen r-10 m-5 p-15" onMouseDown={pause}>
                        Match<br/>
                        <Selector
                            groupTitle="Matches" 
                            selected={stars} 
                            label="Quality"
                            items={[0,1,2,3,4,5]}
                            onChange={handleStarSelection}
                        />
                    </div>
    const milesInput = (distance) => <div className="flex2Column bg-dkGreen r-10 m-5 p-10">
                                <label>
                                    Miles<br/>
                                    <input className="mt-10 p-5 r-10"
                                        name="distance"
                                        type="number"
                                        value={distance}
                                        onChange={handleDistanceSelection}/>
                                </label>
                            </div>
    const getMatchIcon = (kind) => {
        // eslint-disable-next-line
        let icon = (kind === "swell1") ? "swell1" : "swell2";
        icon = (kind === "wind") ? "wind" : icon;
        icon = (kind === "tide") ? "tide" : icon;
        if (kind === "swell1") {
            return <img src={swell1} className={getStarKind(kind)} alt={kind} />
        } else if (kind === "swell2") {
            return <img src={swell2} className={getStarKind(kind)} alt={kind} />;
        } else if (kind === "tide") {
            return <img src={status.tide} className={getStarKind(kind)} alt={kind} />;
        } else if (kind === "wind") {
            const windDirection = status.windDirection;
            if (windDirection === "N") {
                return <img src={N} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
                return <img src={NE} className={getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "E") {
                return <img src={E} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
                return <img src={SE} className={getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "S") {
                return <img src={S} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
                return <img src={SW} className={getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "W") {
                return <img src={W} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
                return <img src={NW} className={getStarKind(kind)} alt={kind} />;
            }
        }
    }
    const getStarKind = (kind) => {
        let classes = "shaka r-20 p-2";
        classes = (kind === "wind") ? (classes + " bg-white") : classes; 
        return classes;
    }
    const getState = (kind) => {
        const { swell1Direction, swell2Direction, tide, windDirection } = status;
        if (kind === "swell1") {
            return swell1Direction;
        } else if (kind === "swell2") {
            return swell2Direction;
        } else if (kind === "tide") {
            return tide;
        } else if (kind === "wind") {
            return windDirection;
        }
    }
    const getStarDetails = (kind) => {
        let details = "";
        const { height, windSpeed, windGusts } = status;
        details = (kind === "tide") ? <div className="bold color-neogreen">{height}'</div> : details;
        details = (kind === "wind") ? <div className="bold color-neogreen">{windSpeed}-{windGusts}kts</div> : details;
        return details
    }
    // eslint-disable-next-line
    const star = (matchKind) => <div className="flex3Column bg-lite mr-5 ml-5 p-10 r-10">
                            {getMatchIcon(matchKind)}
                            <div className="greet">{getState(matchKind)}{getStarDetails(matchKind)}</div>
                        </div>;
    const setTide = (tide) => {
        //console.log(`WaveFinder = > setTide(${tide})`)
        let currentTide = (Number(tide)>2) ? "medium" : "low";
        //console.log(`WaveFinder = > ${tide} currentTide(${currentTide})`)
        currentTide = (Number(tide)>4) ? "high" : currentTide;
        //console.log(`WaveFinder = > ${tide} currentTide(${currentTide})`)
        if (status.pause === false) {
            setStatus(prevState => ({
                ...prevState,
                tide: currentTide,
                height: tide
            }));
        }
    }
    const setWind = (direction, angle, speed, gusts) => {
        //console.log(`setWind => direction: ${direction}`)
        if (!status.pause) {
            setStatus(prevState => ({
                ...prevState,
                windDirection: direction,
                windAngle: Number(angle).toFixed(0),
                windSpeed: Number(speed).toFixed(0),
                windGusts: Number(gusts).toFixed(0)
            }));
        }
    }
    // eslint-disable-next-line
    const getTideIcon = <img src={status.tide} className={`mb--5 ${getStarKind("tide")}`} alt="tide" />;
    // eslint-disable-next-line
    const getWaterTempIcon = <img src={waterTemp} className={`mb--7 ${getStarKind("tide")}`} alt="water temp" />;
    // eslint-disable-next-line
    const getAirTempIcon = <img src={airTemp} className={`mb--7 ${getStarKind("tide")}`} alt="air temp" />;
    const getSwellIcon = (id) => {
        if (id === 1) {
            return <img src={swell1} className={`mb--5 ${getStarKind("tide")}`} alt="swell1" />
        } else {
            return <img src={swell2} className={`mb--5 ${getStarKind("tide")}`} alt="swell2" />;
        }
    }
    const getReport = () => <iframe className="Percent95 mt-5 r-10" title="report" id="report" src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224"></iframe>
    
    console.log(`currentPositionExists: ${currentPositionExists()}`)
    const swell1Match = (item) => (item.swell.indexOf(status.swell1Direction)>-1) ? true : false;
    const swell2Match = (item) => (item.swell.indexOf(status.swell2Direction)>-1) ? true : false;
    const windMatch = (item) => (item.wind.indexOf(status.windDirection)>-1) ? true : false;
    const tideMatch = (item) => (item.tide.indexOf(status.tide)>-1) ? true : false;
    //const swell1DirectionMatch = (direction) => (direction.swell===status.swell1Direction) ? true : false;
    //const swell2DirectionMatch = (direction) => (direction===status.swell2Direction) ? true : false;
    //const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
    //const tideDirectionMatch = (direction) => (direction.tide === status.tide) ? true : false;
    const getDistance = (item) => calculateDistance(status, item);
    //Math.abs(item.latitude - status.latitude)+Math.abs(item.longitude - status.longitude);
    //.01 - 1 mile
    const distanceRange = Number(status.distance);
    const regionMatch = (item) => (getDistance(item)<distanceRange) ? getDistance(item) : false
    let count = 0;
    const match = (item) => {
        const matches = [];
        // eslint-disable-next-line
        let matchesCount = (swell1Match(item)) ? matches.push("swell1") : matches;
        matchesCount = (swell2Match(item)) ? matches.push("swell2") : matches;
        matchesCount = (windMatch(item)) ? matches.push("wind") : matches;
        matchesCount = (tideMatch(item)) ? matches.push("tide") : matches;
        //console.log(`matches => ${item.name} - ${matches}`)
        return matches;
    }
    // eslint-disable-next-line
    const statusClass = (status) => (status === true) ? "color-neogreen" : "color-yellow"; 
    // eslint-disable-next-line
    const subStatusClass = (status) => (status === true) ? "color-orange" : "color-yellow"; 
    const swell1Confirm = (matches) => ((status.isSwell1 && matches.includes("swell1")) || status.isSwell1 === false) ? true : false;
    const swell2Confirm = (matches) => ((status.isSwell2 && matches.includes("swell2")) || status.isSwell2 === false) ? true : false;
    const tideConfirm = (matches) => ((status.isTide && matches.includes("tide")) || status.isTide === false) ? true : false;
    const windConfirm = (matches) => ((status.isWind && matches.includes("wind")) || status.isWind === false) ? true : false;
    let showAll = false;
    const getMatchingLocation = (item) => {
        const matches = match(item);
        const inRegion = regionMatch(item);
        if ((swell1Confirm(matches) && swell2Confirm(matches) && tideConfirm(matches) && windConfirm(matches)) || showAll) {
            if (inRegion !== false) {
                if (matches.length >= Number(status.stars)) {
                    //console.log(`STARS ==================> Matches: ${matches.length} state stars:${status.stars}`)
                    count = count + 1;
                    return <SurfLocation key={getKey("link")} state={status} item={item} matches={matches} calculateDistance={calculateDistance} regionMatch={inRegion}></SurfLocation>
                }
            }
        }
    }
    const matchingLocations = () => status.locations.map((item) => getMatchingLocation(item));
    const date = status.date.toLocaleTimeString();
    const time = date.replace(" ","").toLowerCase();
    //localStorage.setItem('locations', JSON.stringify(status.locations))
    
    const matches = matchingLocations();
    return ( 
        <div className="App-content fadeIn">
            <Dialog title="Wave Finder" message=""> 
                <div className="white pointer">   
                    <div>
                        <span className="bold color-neogreen">{time}</span>
                        <Geolocator currentPositionExists={currentPositionExists} returnCurrentPosition={updateCurrentLocation}/>
                        {getReport()}
                        <div className="flexContainer">
                            <span className="flex2Column p-5 r-10 color-blue bg-dkGreen m-5">{/*getWaterTempIcon*/}<span className="ml-2">water</span><br/><WaterTemp/></span>
                            <span className="flex2Column p-5 r-10 color-white bg-dkGreen m-5">{/*getAirTempIcon*/}<span className="ml-2">air</span><br/><AirTemp/></span>
                        </div>
                        <div className="flexContainer">
                            <div className="flex2Column p-5 r-10 color-orange bg-dkGreen m-5">{/*getTideIcon*/} tide<br/><Tide setTide={setTide} display='wide'/></div>
                            <div className="flex2Column p-5 r-10 color-yellow bg-dkGreen m-5"><span className="size25 bg-white p-3 m-10 r-20"></span>wind<WindDirection columns="2" setWind={setWind}/></div>
                        </div>
                    </div>
                    <div className="p-5 r-10 m-5">
                        <div className='p-10 color-yellow'>select current conditions:</div>
                        <div className="flexContainer">
                            {swellSelector(1,status.swell1Direction)}
                            {swellSelector(2,status.swell2Direction)}
                        </div>
                        <div className="flexContainer">
                            {tideSelector(status.tide)}
                            {windSelector(status.windDirection)}
                        </div>
                        <div className="flexContainer">
                            {milesInput(status.distance)}
                            {starSelector(status.stars)} 
                        </div>
                        <div className="bg-neogreen r-10 m-5 p-15 color-black bold" onClick={unpause}>Use live data</div>
                    </div>
                    <div className="mt-10 mb-20">
                        <span className="color-neogreen bold">{(count === 1) ? `1 wave` : `${count} waves`}</span> out of {status.locations.length}<br/>
                        are in a <span className="color-neogreen bold">{status.distance}</span> mile radius<br/>
                        and prefer <span className="color-neogreen bold">{status.swell1Direction} </span>and <span className="color-orange bold ">{status.swell2Direction} </span>swell <br/>
                        with a <span className="color-neogreen bold">{status.height}' {status.tide} </span>tide:
                    </div>
                    {matches}
                    <WaveUtils state={status} item={status}></WaveUtils>
                </div> 
            </Dialog>
        </div>  
    )
}
export default WaveFinder;