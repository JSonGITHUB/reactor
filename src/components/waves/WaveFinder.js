import React from 'react';
import getKey from '../utils/KeyGenerator.js';
import Geolocator from '../utils/Geolocator.js';
import Tide from './Tide.js';
import WaterTemp from './WaterTemp.js';
import AirTemp from './AirTemp.js';
import WindDirection from './WindDirection.js';
import Selector from '../forms/FunctionalSelector.js';
import Dialog from '../functional/Dialog.js';
import swell1 from '../../assets/images/wavePrimary.png'
import swell2 from '../../assets/images/waveSecondaryB.png'
import N from '../../assets/images/windN.png'
import NE from '../../assets/images/windNE.png'
import E from '../../assets/images/windE.png'
import SE from '../../assets/images/windSE.png'
import S from '../../assets/images/windS.png'
import SW from '../../assets/images/windSW.png'
import W from '../../assets/images/windW.png'
import NW from '../../assets/images/windNW.png'
import tide from '../../assets/images/tide.png'
import waterTemp from '../../assets/images/waterTemp.png'
import airTemp from '../../assets/images/airTemp.png'
import thumbsUp from '../../assets/images/ThumbsUp.png';
import thumbsDown from '../../assets/images/ThumbsDown.png';
import SurfLocation from './SurfLocation.js';

class WaveFinder extends React.Component {
    
    constructor(props) {
        super(props);
        const getLocal = (item) => localStorage.getItem(item);
        const getProps = (item) => props[item];
        const getDefault = (item) => (getLocal(item) === null) ? getProps(item) : getLocal(item);
        const getSwell1Direction = () => localStorage.getItem("swell1Direction") ? localStorage.getItem("swell1Direction") : "SSW";
        const getSwell2Direction = () => localStorage.getItem("swell2Direction") ? localStorage.getItem("swell2Direction") : "SSW";
        console.log(`isWind: ${getDefault("isWind")}`)
        this.state = {
            pause: false,
            date: new Date(),
            tide: getDefault("tide"),
            stars: getDefault("stars"),
            waterTemp: "66.2",
            swell1Height: "2.0",
            swell1Interval: "17 seconds",
            swell1Direction: getSwell1Direction(),
            swell2Height: "2.0",
            swell2Interval: "9 seconds",
            swell2Direction: getSwell2Direction(),
            swell1Angle: this.directionObject["SSW"],
            swell2Angle: this.directionObject["SSW"],
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
            locations: [{
                "name": "HB: 17th St.",
                "latitude": 33.663781,
                "longitude": -118.013605,
                "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "HB: Taco Bell Reef",
                "latitude": 33.657999,
                "longitude": -118.006578,
                "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "HB: North Peir",
                "latitude": 33.655927,
                "longitude": -118.003874,
                "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "HB: South Peir",
                "latitude": 33.655534,
                "longitude": -118.003145,
                "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "HB: River Jetties",
                "latitude": 33.630302,
                "longitude": -117.961721,
                "swell": ["SSE", "S", "SW","W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium", "high"]
            },
            {
                "name": "Salt Creek",
                "latitude": 33.475456,
                "longitude": -117.722133,
                "swell": ["S", "SW", "W", "WNW"],
                "wind": ["E", "SE", "S"],
                "tide": ["medium", "high"]
            },
            {
                "name": "Lowers",
                "latitude": 33.382848,
                "longitude": -117.588214,
                "swell": ["S", "SW","W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["medium"]
            },
            {
                "name": "O-Side: Harbor North",
                "latitude": 33.206684,
                "longitude": -117.397452,
                "swell": ["SSW", "SW", "W", "WNW", "SSE"],
                "wind": ["E"],
                "tide": ["medium", "high"]
            },
            {
                "name": "O-Side: Harbor South",
                "latitude": 33.202483,
                "longitude": -117.392796,
                "swell": ["SSW", "SW", "W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["medium", "high"]
            },
            {
                "name": "O-Side: Pier North",
                "latitude": 33.194686,
                "longitude": -117.385226,
                "swell": ["SSW", "SW", "W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "O-Side: Pier South",
                "latitude": 33.193630,
                "longitude": -117.384826,
                "swell": ["SSW", "SW", "W", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["medium", "high"]
            },
            {
                "name": "Carlsbad",
                "latitude": 33.144850,
                "longitude": -117.343638,
                "swell": ["WNW", "W", "SW", "SSW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Ponto: Jetties",
                "latitude": 33.086801,
                "longitude": -117.313695,
                "swell": ["W", "NW", "SW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Sea Bluff",
                "latitude": 33.081980,
                "longitude": -117.311783,
                "swell": ["W", "NW", "SW", "SSW", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Grandview",
                "latitude": 33.076397,
                "longitude": -117.310334,
                "swell": ["W", "NW", "SW", "SSW", "WNW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Beacons",
                "latitude": 33.065118,
                "longitude": -117.305518,
                "swell": ["W", "NW", "SW", "SSW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "D Street",
                "latitude": 33.046486,
                "longitude": -117.298161,
                "swell": ["W", "WNW", "NW", "SW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Swamis",
                "latitude": 33.034592,
                "longitude": -117.292734,
                "swell": ["W", "NW"],
                "wind": ["E"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Pipes",
                "latitude": 33.026892,
                "longitude": -117.287915,
                "swell": ["W", "NW", "SW"],
                "wind": ["E", "NE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Traps",
                "latitude": 33.025580,
                "longitude": -117.287165,
                "swell": ["NW","W"],
                "wind": ["E"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Cardiff Reef",
                "latitude": 33.015631,
                "longitude": -117.282085,
                "swell": ["NW","W"],
                "wind": ["E"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Georges",
                "latitude": 33.010952,
                "longitude": -117.280085,
                "swell": ["NW","W"],
                "wind": ["E"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Seaside Reef",
                "latitude": 33.001613,
                "longitude": -117.278393,
                "swell": ["NW","W"],
                "wind": ["E"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Del Mar",
                "latitude": 32.976395,
                "longitude": -117.270974,
                "swell": ["SW", "W", "NW"],
                "wind": ["E"],
                "tide": ["low", "medium", "high"]
            },
            {
                "name": "Torrey Pines",
                "latitude": 32.938600,
                "longitude": -117.261978,
                "swell": ["SW", "WNW", "NW"],
                "wind": ["NE", "E", "SE"],
                "tide": ["medium", "high"]
            },
            {
                "name": "Blacks",
                "latitude": 32.881882,
                "longitude": -117.252467,
                "swell": ["W","NW", "SW"],
                "wind": ["E", "SE"],
                "tide": ["low", "medium"]
            },
            {
                "name": "Scripps",
                "latitude": 32.865358,
                "longitude": -117.254981,
                "swell": ["W", "NW", "SW"],
                "wind": ["E", "SE", "S"],
                "tide": ["medium"]
            },
            {
                "name": "La Jolla Shores",
                "latitude": 32.858424,
                "longitude": -117.256791,
                "swell": ["W", "NW"],
                "wind": ["E"],
                "tide": ["medium"]
            },
            {
                "name": "Mission Beach",
                "latitude": 32.767649,
                "longitude": -117.252731,
                "swell": ["W", "NW", "SW"],
                "wind": ["E", "S"],
                "tide": ["medium"]
            },
            {
                "name": "OB Jetti",
                "latitude": 32.754755,
                "longitude": -117.253815,
                "swell": ["W", "NW", "SW"],
                "wind": ["E"],
                "tide": ["medium"]
            },
            {
                "name": "OB Avalanche",
                "latitude": 32.751873,
                "longitude": -117.252972,
                "swell": ["W", "NW", "SW"],
                "wind": ["E"],
                "tide": ["medium"]
            },
            {
                "name": "OB Pier",
                "latitude": 32.747869,
                "longitude": -117.253615,
                "swell": ["W", "NW", "SW"],
                "wind": ["E"],
                "tide": ["medium"]
            },
            {
                "name": "Sunset Cliffs",
                "latitude": 32.725570,
                "longitude": -117.258111,
                "swell": ["W", "NW", "SW"],
                "wind": ["E"],
                "tide": ["medium"]
            },
            {
                "name": "Rosarito",
                "latitude": 32.333760,
                "longitude": -117.056838,
                "swell": ["S", "SW"],
                "wind": ["E"],
                "tide": ["medium"]
            },
            {
                "name": "K-38s",
                "latitude": 32.259594,
                "longitude": -116.987307,
                "swell": ["S", "SW", "W", "WNW"],
                "wind": ["NE","E"],
                "tide": ["medium", "low"]
            },
            {
                "name": "Gaviotas",
                "latitude": 32.252500,
                "longitude": -116.961600,
                "swell": ["S", "SW", "W", "WNW"],
                "wind": ["NE", "ENE", "E", "ESE", "SE"],
                "tide": ["high", "medium", "low"]
            },
            {
                "name": "La Fonda",
                "latitude": 32.121058,
                "longitude": -116.885713,
                "swell": ["SW", "W"],
                "wind": ["E"],
                "tide": ["medium", "low"]
            },
            {
                "name": "Punta Baja",
                "latitude": 29.954293,
                "longitude": -115.807737,
                "swell": ["SW", "SSW", "S", "WNW", "W"],
                "wind": ["N", "NE"],
                "tide": ["high", "medium", "low"]
            },
            {
                "name": "Elijandros",
                "latitude": 28.706507,
                "longitude": -114.288678,
                "swell": ["W", "WNW", "NW"],
                "wind": ["N","NE", "E", "NW"],
                "tide": ["high", "medium", "low"]
            },
            {
                "name": "Harbor",
                "latitude": 28.666795,
                "longitude": -114.239317,
                "swell": ["WNW", "NW"],
                "wind": ["N"],
                "tide": ["medium", "low"]
            },
            {
                "name": "Notch",
                "latitude": 28.666800,
                "longitude": -114.224431,
                "swell": ["WNW", "NW"],
                "wind": ["N"],
                "tide": ["medium", "low"]
            },
            {
                "name": "Wall",
                "latitude": 28.566481,
                "longitude": -114.158590,
                "swell": ["W", "WNW", "NW"],
                "wind": ["N", "NE", "ENE"],
                "tide": ["high", "medium", "low"]
            },
            {
                "name": "Abreojos",
                "latitude": 26.722327,
                "longitude": -113.546932,
                "swell": ["S"],
                "wind": ["N", "NE", "NW"],
                "tide": ["high", "medium"]
            },
            {
                "name": "Scorpion Bay",
                "latitude": 26.239488,
                "longitude": -112.477709,
                "swell": ["SW","SSW"],
                "wind": ["N", "NW"],
                "tide": ["medium", "low"]
            },
            {
                "name": "Estuary",
                "latitude": 23.050415,
                "longitude": -109.678612,
                "swell": ["S", "SE"],
                "wind": ["N"],
                "tide": ["high", "medium", "low"]
            },
            {
                "name": "Colorados",
                "latitude": 11.406466,
                "longitude": -86.048310,
                "swell": ["SW"],
                "wind": ["E", "NE"],
                "tide": ["high", "medium"]
            }]
        };
        this.handleTideSelection = this.handleTideSelection.bind(this);
        this.handleWindSelection = this.handleWindSelection.bind(this);
        this.handleStarSelection = this.handleStarSelection.bind(this);
        this.handleSwell1Selection = this.handleSwell1Selection.bind(this);
        this.handleSwell2Selection = this.handleSwell2Selection.bind(this);
        this.handleSwell1Angle = this.handleSwell1Angle.bind(this);
        this.handleSwell2Angle = this.handleSwell2Angle.bind(this);
        this.handleSwell1Height = this.handleSwell1Height.bind(this);
        this.handleSwell2Height = this.handleSwell2Height.bind(this);
        this.handleSwell1Interval = this.handleSwell1Interval.bind(this);
        this.handleSwell2Interval = this.handleSwell2Interval.bind(this);
        this.handleSwell2Check = this.handleSwell2Check.bind(this);
        this.handleSwell1Check = this.handleSwell1Check.bind(this);
        this.handleTideCheck = this.handleTideCheck.bind(this);
        this.handleDistanceSelection = this.handleDistanceSelection.bind(this);
    }
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
                this.setState({
                    isLoaded: true,
                    locations: data
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));
        
    }
    */
   componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
        console.log(`pause: ${this.state.pause}`)
        if (this.state.pause === false) {
            this.setState({
                date: new Date()
            });
        }
    }
    currentPositionExists = () => (this.state.longitude) ? true : false;
    updateCurrentLocation = (longitude, latitude) => {
//        console.log(`UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`)
        this.setState({
            longitude,
            latitude
        })
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
        const uri = this.tideURL;
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`data =-=-=-=-=-=-> ${JSON.stringify(data,null,2)}`)
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));
    }
    */
    getDefaultHeights = (tideSelected) => {
        if (tideSelected === "high") {
            return 5;
        } else if (tideSelected === "medium") {
            return 3;
        }
        return 0;
    }
    handleTideSelection = (groupTitle, label, selected) => {
        localStorage.setItem("tide", selected);
        this.setState({
            pause: false,
            tide: selected,
            height: this.getDefaultHeights(selected)
        })
    }
    handleWindCheck = (event) => {
        const isWind = (!!this.state.isWind === true) ? false : true;
        localStorage.setItem("isWind", isWind);
        this.setState({
            pause: false,
            isWind: isWind
        })
    }
    handleTideCheck = (event) => {
        const isTide = (!!this.state.isTide === true) ? false : true;
        localStorage.setItem("isTide", isTide);
        this.setState({
            pause: false,
            isTide: isTide
        })
    }
    handleSwell1Check = (event) => {
        const isSwell1 = (!!this.state.isSwell1 === true) ? false : true;
        localStorage.setItem("isSwell1", isSwell1);
        this.setState({
            pause: false,
            isSwell1: isSwell1
        })
    }
    handleSwell2Check = (event) => {
        const isSwell2 = (!!this.state.isSwell2 === true) ? false : true;
        localStorage.setItem("isSwell2", isSwell2);
        this.setState({
            pause: false,
            isSwell2: isSwell2
        })
    }
    directionArray = ["W", "WSW", "WNW", "E", "ESE", "ENE", "N", "NE", "NNE", "NW", "NNW", "S", "SE", "SSE", "SW", "SSW"];
    directionObject = {
        N: 0,
        NNE: 25,
        NE: 45,
        ENE: 65,
        E: 90,
        ESE: 115,
        SE: 135,
        SSE: 160,
        S: 180,
        SSW: 205,
        SW: 225,
        WSW: 250,
        W: 270,
        WNW: 295,
        NW: 315,
        NNW: 340
    }

    handleSwell1Selection = (groupTitle, label, selected) => {
        const swell1Angle = this.directionObject[selected];
        console.log(`${selected} swell1Angle: ${swell1Angle}`)
        localStorage.setItem("swell1Angle", swell1Angle);
        localStorage.setItem("swell1Direction", selected);
        this.setState({
            pause: false,
            swell1Direction: selected,
            swell1Angle: swell1Angle
        })
    }
    handleSwell2Selection = (groupTitle, label, selected) => {
        const swell2Angle = this.directionObject[selected];
        console.log(`${selected} swell2Angle: ${swell2Angle}`)
        localStorage.setItem("swell2Angle", swell2Angle);
        localStorage.setItem("swell2Direction", selected);
        this.setState({
            pause: false,
            swell2Direction: selected,
            swell2Angle: swell2Angle
        })
    }
    handleSwell1Angle = (groupTitle, label, selected) => {
        localStorage.setItem("swell1Angle", selected);
        this.setState({
            pause: false,
            swell1Angle: selected
        })
    }
    handleSwell2Angle = (groupTitle, label, selected) => {
        localStorage.setItem("swell2Angle", selected);
        this.setState({
            pause: false,
            swell2Angle: selected
        })
    }
    handleSwell1Height = (groupTitle, label, selected) => {
        localStorage.setItem("swell1Height", selected);
        this.setState({
            pause: false,
            swell1Height: selected
        })
    }
    handleSwell2Height = (groupTitle, label, selected) => {
        localStorage.setItem("swell2Height", selected);
        this.setState({
            pause: false,
            swell2Height: selected
        })
    }
    handleSwell1Interval = (groupTitle, label, selected) => {
        localStorage.setItem("swell1Interval", selected);
        this.setState({
            pause: false,
            swell1Interval: selected
        })
    }
    handleSwell2Interval = (groupTitle, label, selected) => {
        localStorage.setItem("swell2Interval", selected);
        this.setState({
            pause: false,
            swell2Interval: selected
        })
    }
    handleWindSelection = (groupTitle, label, selected) => {
        localStorage.setItem("windDirection", selected);
        this.setState({
            pause: false,
            windDirection: selected
        })
    }
    handleStarSelection = (groupTitle, label, selected) => {
        localStorage.setItem("stars", selected);
        this.setState({
            pause: false,
            stars: selected
        })
    }
    handleDistanceSelection = (event) => {
        const target = event.target;
        localStorage.setItem("distance", target.value);
        this.setState({
            distance: target.value
        })
    }
    pause = (event) => {
        console.log("PAUSE");
        this.setState({
            pause: true
        })
    }
    unpause = () => {
        console.log("UNPAUSE");
        this.setState({
            pause: false
        })
    }
    isSwell1 = () => (this.state.isSwell1 === true) ? true : false;
    isSwell2 = () => (this.state.isSwell2 === true) ? true : false;
    isSwellSelected = (id) => ((id === 1 && this.isSwell1() === true) || (id === 2 && this.isSwell2()===true)) ? 'bg-green' : 'bg-red';
    swellClass = (id) => `${this.isSwellSelected(id)} flex2Column r-10 m-5 p-15`;
    swellSelector = (id, swellDirection) => <div className={this.swellClass(id)} onMouseDown={this.pause}>
        {this.getSwellIcon(id)}
        <span className="ml-5">Swell{id}</span><br/>
        <span className="greet ml-5">direction</span><br/>
        <Selector
            groupTitle={`Swell${id}`}
            selected={swellDirection} 
            //this.getState(`swell1`)
            label="Direction" 
            items={this.directionArray}
            onChange={(id === 1) ? this.handleSwell1Selection : this.handleSwell2Selection}
        />
        <br/>
        <span className="greet ml-5">angle</span><br/>
        <Selector
            groupTitle={`SwellAngle${id}`}
            selected={(id === 1) ? this.state.swell1Angle : this.state.swell2Angle} 
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
            onChange={(id === 1) ? this.handleSwell1Angle : this.handleSwell2Angle}
        />
        <br/>
        <span className="greet ml-5">height</span><br/>
        <Selector
            groupTitle={`SwellHeight${id}`}
            selected={(id === 1) ? this.state.swell1Height : this.state.swell2Height} 
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
            onChange={(id === 1) ? this.handleSwell1Height : this.handleSwell2Height}
        />
        <br/>
        <span className="greet ml-5">interval</span><br/>
        <Selector
            groupTitle={`SwellInterval${id}`}
            selected={(id === 1) ? this.state.swell1Interval : this.state.swell2Interval} 
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
            onChange={(id === 1) ? this.handleSwell1Interval : this.handleSwell2Interval}
        />
        {(id===1) ? 
            /*
            <div className="fl-left">
                <input
                    name="isSwell1"
                    type="checkbox"
                    checked={this.state.isSwell1}
                    onChange={this.handleSwell1Check}
                />
            </div>
            */
            <div className="button mt-15" onClick={this.handleSwell1Check}>
                {(this.state.isSwell1 === true) ? <img src={thumbsUp} alt='swell1' className='p-10 r-20' /> : <img src={thumbsDown} alt='swell1' className='p-10 r-20' /> }
            </div>
            :
            /*
            <div className="fl-left">
                <input
                    name="isSwell2"
                    type="checkbox"
                    checked={this.state.isSwell2}
                    onChange={this.handleSwell2Check}
                />
            </div>
            */
            <div className="button mt-15" onClick={this.handleSwell2Check}>
                {(this.state.isSwell2 === true) ? <img src={thumbsUp} alt='swell2' className='p-10 r-20' /> : <img src={thumbsDown} alt='swell2' className='p-10 r-20' /> }
            </div>
        }
    </div>
    isTideSelected = () => (this.state.isTide === true) ? 'bg-green' : 'bg-red';
    tideClass = () => `${this.isTideSelected()} flex2Column r-10 m-5 p-15`;
    tideSelector = (tide) => <div className={this.tideClass()} onMouseDown={this.pause}>
                                Tide
                                <div className="greet"><Tide setTide={this.setTide}/></div>
                                <Selector 
                                    groupTitle="Tide"
                                    selected={this.state.tide} 
                                    label="current" 
                                    items={["low", "medium", "high"]}
                                    onChange={this.handleTideSelection}
                                />
                                <div className="button mt-15" onClick={this.handleTideCheck}>
                                    {(this.state.isTide === true) ? <img src={thumbsUp} alt='tide' className='p-10 r-20' /> : <img src={thumbsDown} alt='tide' className='p-10 r-20' /> }
                                </div>
                            </div>
    isWindSelected = () => (this.state.isWind === true) ? 'bg-green' : 'bg-red';
    windClass = () => `${this.isWindSelected()} flex2Column r-10 m-5 p-15`;
    windSelector = (windDirection) => <div className={this.windClass()} onMouseDown={this.pause}>
    {/*console.log(`windSelector => windDirection: ${this.state.windDirection}`)*/}
                            Wind<br/>
                            <div className="greet"><WindDirection columns="1" setWind={this.setWind}/></div>
                            <Selector
                                groupTitle="Wind" 
                                selected={this.state.windDirection} 
                                label="Direction"
                                items={this.directionArray}
                                onChange={this.handleWindSelection}
                            />
                            <div className="button mt-15" onClick={this.handleWindCheck}>
                                {(this.state.isWind === true) ? <img src={thumbsUp} alt='wind' className='p-10 r-20' /> : <img src={thumbsDown} alt='wind' className='p-10 r-20' /> }
                            </div>
                        </div>
    starSelector = (stars) => <div className="flex3Column bg-dkYellow r-10 m-5 p-15" onMouseDown={this.pause}>
                        Match<br/>
                        <Selector
                            groupTitle="Matches" 
                            selected={stars} 
                            label="Quality"
                            items={[0,1,2,3,4,5]}
                            onChange={this.handleStarSelection}
                        />
                    </div>
    getMatchIcon = (kind) => {
        let icon = (kind === "swell1") ? "swell1" : "swell2";
        icon = (kind === "wind") ? "wind" : icon;
        icon = (kind === "tide") ? "tide" : icon;
        if (kind === "swell1") {
            return <img src={swell1} className={this.getStarKind(kind)} alt={kind} />
        } else if (kind === "swell2") {
            return <img src={swell2} className={this.getStarKind(kind)} alt={kind} />;
        } else if (kind === "tide") {
            return <img src={tide} className={this.getStarKind(kind)} alt={kind} />;
        } else if (kind === "wind") {
            const windDirection = this.state.windDirection;
            if (windDirection === "N") {
                return <img src={N} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
                return <img src={NE} className={this.getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "E") {
                return <img src={E} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
                return <img src={SE} className={this.getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "S") {
                return <img src={S} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
                return <img src={SW} className={this.getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "W") {
                return <img src={W} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
                return <img src={NW} className={this.getStarKind(kind)} alt={kind} />;
            }
        }
    }
    getStarKind = (kind) => {
        let classes = "shaka r-20 p-2";
        classes = (kind === "wind") ? (classes + " bg-white") : classes; 
        return classes;
    }
    getState = (kind) => {
        const { swell1Direction, swell2Direction, tide, windDirection } = this.state;
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
    getStarDetails = (kind) => {
        let details = "";
        const { height, windSpeed, windGusts } = this.state;
        details = (kind === "tide") ? <div className="bold color-neogreen">{height}'</div> : details;
        details = (kind === "wind") ? <div className="bold color-neogreen">{windSpeed}-{windGusts}kts</div> : details;
        return details
    }
    star = (matchKind) => <div className="flex3Column bg-lite mr-5 ml-5 p-10 r-10">
                            {this.getMatchIcon(matchKind)}
                            <div className="greet">{this.getState(matchKind)}{this.getStarDetails(matchKind)}</div>
                        </div>;
    getStars = (stars) => stars.map((star) => this.star(star));
    setTide = (tide) => {
        //console.log(`WaveFinder = > setTide(${tide})`)
        let currentTide = (Number(tide)>2) ? "medium" : "low";
        currentTide = (Number(tide)>4) ? "high" : currentTide;
        if (this.state.pause === false) {
            this.setState({
                tide: currentTide,
                height: tide
            })
        }
    }
    setWind = (direction, angle, speed, gusts) => {
        //console.log(`setWind => direction: ${direction}`)
        if (!this.state.pause) {
            this.setState({
                windDirection: direction,
                windAngle: Number(angle).toFixed(0),
                windSpeed: Number(speed).toFixed(0),
                windGusts: Number(gusts).toFixed(0)
            }) 
        }
    }
    getTideIcon = <img src={tide} className={`mb--5 ${this.getStarKind("tide")}`} alt="tide" />;
    getWaterTempIcon = <img src={waterTemp} className={`mb--7 ${this.getStarKind("tide")}`} alt="water temp" />;
    getAirTempIcon = <img src={airTemp} className={`mb--7 ${this.getStarKind("tide")}`} alt="air temp" />;
    getSwellIcon = (id) => {
        if (id === 1) {
            return <img src={swell1} className={`mb--5 ${this.getStarKind("tide")}`} alt="swell1" />
        } else {
            return <img src={swell2} className={`mb--5 ${this.getStarKind("tide")}`} alt="swell2" />;
        }
    }
    getWindIcon = () => {
        const windDirection = this.state.windDirection;
        if (windDirection === "N") {
            return <img src={N} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
            return <img src={NE} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "E") {
            return <img src={E} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
            return <img src={SE} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "S") {
            return <img src={S} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
            return <img src={SW} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "W") {
            return <img src={W} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
            return <img src={NW} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        }
    }
    getReport = () => <iframe title="report" id="report" src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224"></iframe>
    calculateDistance = (item) => {
        const { latitude, longitude } = this.state;
        const lat1 = item.latitude;
        const lat2 = latitude;
        const lon1 = item.longitude;
        const lon2 = longitude;
        const unit = "Miles"
        if ((lat1 === lat2) && (lon1 === lon2)) {
            return 0;
        } else {
            var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            dist = dist.toFixed(1);
            if (unit==="Kilometers") { dist = dist * 1.609344 }
            if (unit==="Nautical") { dist = dist * 0.8684 }
            //console.log(`DISTANCE => ${dist}`)
            return dist;
        }
    }
    render() {
//        console.log(`currentPositionExists: ${this.currentPositionExists()}`)
        const {locations, windDirection, isWind, swell1Direction, swell2Direction, tide, isTide, height, stars, distance, isSwell1, isSwell2} = this.state;
        const swell1Match = (item) => (item.swell.indexOf(swell1Direction)>-1) ? true : false;
        const swell2Match = (item) => (item.swell.indexOf(swell2Direction)>-1) ? true : false;
        const windMatch = (item) => (item.wind.indexOf(windDirection)>-1) ? true : false;
        const tideMatch = (item) => (item.tide.indexOf(tide)>-1) ? true : false;
        //const swell1DirectionMatch = (direction) => (direction.swell===swell1Direction) ? true : false;
        //const swell2DirectionMatch = (direction) => (direction===swell2Direction) ? true : false;
        //const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
        //const tideDirectionMatch = (direction) => (direction.tide === tide) ? true : false;
        const calculateDistance = (item) => this.calculateDistance(item);
        const getDistance = (item) => calculateDistance(item);
        //Math.abs(item.latitude - this.state.latitude)+Math.abs(item.longitude - this.state.longitude);
        //.01 - 1 mile
        const distanceRange = Number(distance);
        const regionMatch = (item) => (getDistance(item)<distanceRange) ? getDistance(item) : false
        let count = 0;
        const match = (item) => {
            const matches = [];
            let matchesCount = (swell1Match(item)) ? matches.push("swell1") : matches;
            matchesCount = (swell2Match(item)) ? matches.push("swell2") : matches;
            matchesCount = (windMatch(item)) ? matches.push("wind") : matches;
            matchesCount = (tideMatch(item)) ? matches.push("tide") : matches;
            //console.log(`matches => ${item.name} - ${matches}`)
            return matches;
        }
        const statusClass = (status) => (status === true) ? "color-neogreen" : "color-yellow"; 
        const subStatusClass = (status) => (status === true) ? "color-orange" : "color-yellow"; 
        const swell1Confirm = (matches) => ((isSwell1 && matches.includes("swell1")) || isSwell1 === false) ? true : false;
        const swell2Confirm = (matches) => ((isSwell2 && matches.includes("swell2")) || isSwell2 === false) ? true : false;
        const tideConfirm = (matches) => ((isTide && matches.includes("tide")) || isTide === false) ? true : false;
        const windConfirm = (matches) => ((isWind && matches.includes("wind")) || isWind === false) ? true : false;
        const getMatchingLocation = (item) => {
            const matches = match(item);
            const inRegion = regionMatch(item);
            if (swell1Confirm(matches) && swell2Confirm(matches) && tideConfirm(matches) && windConfirm(matches)) {
                if (inRegion !== false) {
                    if (matches.length >= Number(this.state.stars)) {
                        //console.log(`STARS ==================> Matches: ${matches.length} state stars:${this.state.stars}`)
                        count = count + 1;
                        return <SurfLocation state={this.state} item={item} matches={matches} calculateDistance={calculateDistance} regionMatch={inRegion}></SurfLocation>
                        /*
                        <div key={getKey("loc")}>
                                    <div className="r-10 m-10 p-20 bg-dkGreen">
                                            <div className="width100Percent flexContainer">{this.getStars(matches)}</div>
                                            <div className="mt-10 navBranding">{item.name}</div>
                                            <div className="greet color-yellow p-5 bg-dkGreen mt-15 mb-10 r-5">{`${regionMatch(item)} miles`}</div>
                                        <div className="flexContainer">
                                            <div className="flexContainer m-auto">
                                                <div className="columnRight pr-10">
                                                    <div className="color-neogreen bold">Swell: </div>
                                                    <div className="color-neogreen bold">Wind: </div>
                                                    <div className="color-neogreen bold">Tide: </div>
                                                </div>
                                                <div className="columnLeft">
                                                    <div>{item.swell.map((swell, i) => <span className={(swell === this.state.swell1Direction) ? statusClass(swell1Match(item)) : subStatusClass(swell2DirectionMatch(swell))}>{swell}{((i+1) === item.swell.length)? "" : ", "}</span>)}</div>
                                                    <div className={statusClass(windMatch(item))}>
                                                        {item.wind.map((wind, i) => <span className={statusClass(windDirectionMatch({wind}))}>
                                                                                    {wind}{((i+1) === item.wind.length)? "" : ", "}
                                                                                </span>)}
                                                    </div>
                                                    <div className={statusClass(tideMatch(item))}>{item.tide.map((tide,i) => <span className={statusClass(tideDirectionMatch({tide}))}>{tide}{((i+1) === item.tide.length)? "" : ", "}</span>)}</div>
                                                </div>
                                            </div>
                                        </div>   
                                    </div>
                                </div>
                                */
                    }
                }
            }
        }
        const matchingLocations = () => locations.map((item) => getMatchingLocation(item));
        const getLocations = matchingLocations();
        const date = this.state.date.toLocaleTimeString();
        const time = date.replace(" ","").toLocaleLowerCase();
        return ( 
            <div className="App-content fadeIn">
                <Dialog title="Wave Finder" message=""> 
                    <div className="white pointer">   
                        <div className="bg-darker p-5 r-10 m-5">
                            <span className="bold">{time}</span>
                            <Geolocator currentPositionExists={this.currentPositionExists} returnCurrentPosition={this.updateCurrentLocation}/>
                            <div className="flexContainer">
                                <span className="flex3Column p-5 r-5 color-orange bg-lite m-5">{/*this.getTideIcon*/} tide<br/><Tide setTide={this.setTide}/></span>
                                <span className="flex3Column p-5 r-5 color-blue bg-lite m-5">{/*this.getWaterTempIcon*/}<span className="ml-2">water</span><br/><WaterTemp/></span>
                                <span className="flex3Column p-5 r-5 color-white bg-lite m-5">{/*this.getAirTempIcon*/}<span className="ml-2">air</span><br/><AirTemp/></span>
                            </div>
                            <div className="flex3Column p-5 r-5 color-yellow bg-lite m-5"><span className="size25 bg-white p-3 m-10 r-20">{this.getWindIcon()}</span>wind<WindDirection columns="2" setWind={this.setWind}/></div>
                            {this.getReport()}
                            <div>select current conditions:</div>
                            <div className="flexContainer">
                                {this.swellSelector(1,swell1Direction)}
                                {this.swellSelector(2,swell2Direction)}
                            </div>
                            <div className="flexContainer">
                                {this.tideSelector(tide)}
                                {this.windSelector(windDirection)}
                                {this.starSelector(stars)} 
                            </div>
                            <div className="bg-dkYellow r-10 m-5 p-15">
                                <label>
                                    Miles<br/>
                                    <input className="mt-10 p-5 r-10"
                                        name="distance"
                                        type="number"
                                        value={distance}
                                        onChange={this.handleDistanceSelection}/>
                                </label>
                            </div>
                            <div className="bg-neogreen r-10 m-5 p-15 color-black bold" onClick={this.unpause}>Use live data</div>
                        </div>
                        <div className="mt-10 mb-20">
                            <span className="color-neogreen bold">{(count === 1) ? `1 wave` : `${count} waves`}</span> out of {locations.length}<br/>
                            are in a <span className="color-neogreen bold">{distance}</span> mile radius<br/>
                            and prefer <span className="color-neogreen bold">{swell1Direction} </span>and <span className="color-orange bold ">{swell2Direction} </span>swell <br/>
                            with a <span className="color-neogreen bold">{height}' {tide} </span>tide:
                        </div>
                        {getLocations}
                    </div> 
                </Dialog>
            </div>  
        )
    }
    
}
export default WaveFinder;
