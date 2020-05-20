import React from 'react';
import getKey from './utils/KeyGenerator.js';
import Geolocator from './utils/Geolocator.js';
import Selector from './forms/FunctionalSelector.js';
import Dialog from './functional/Dialog.js';
import swell1 from '../assets/images/wavePrimary.png'
import swell2 from '../assets/images/waveSecondaryB.png'
import N from '../assets/images/windN.png'
import NE from '../assets/images/windNE.png'
import E from '../assets/images/windE.png'
import SE from '../assets/images/windSE.png'
import S from '../assets/images/windS.png'
import SW from '../assets/images/windSW.png'
import W from '../assets/images/windW.png'
import NW from '../assets/images/windNW.png'
import tide from '../assets/images/tide.png'
import thumbsUp from '../assets/images/ThumbsUp.png';
import thumbsDown from '../assets/images/ThumbsDown.png';

class WaveFinder extends React.Component {
    
    constructor(props) {
        super(props);
        const getLocal = (item) => localStorage.getItem(item);
        const getProps = (item) => props[item];
        const getDefault = (item) => (getLocal(item) === null) ? getProps(item) : getLocal(item);
        this.state = {
            step: 0,
            pause: false,
            date: new Date(),
            tide: getDefault("tide"),
            stars: getDefault("stars"),
            swell1Direction: getDefault("swell1Direction"),
            swell2Direction: getDefault("swell2Direction"),
            windDirection: getDefault("windDirection"),
            distance: getDefault("distance"),
            isSwell1: false,
            isSwell2: false,
            isTide: false,
            isWind: false,
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
                "wind": ["N", "NE"],
                "tide": ["high", "medium"]
            },
            {
                "name": "Scorpion Bay",
                "latitude": 26.239488,
                "longitude": -112.477709,
                "swell": ["SW","SSW"],
                "wind": ["N"],
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
        this.handleSwell2Selection = this.handleSwell2Selection.bind(this);
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
            5000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    nextStep = () => (this.state.step === 3) ? 0 : this.state.step + 1;
    tick() {
        if (this.state.pause === false) {
            this.setState({
                step: this.nextStep(),
                date: new Date()
            });
        }
    }
    currentPositionExists = () => (this.state.longitude) ? true : false;
    updateCurrentLocation = (longitude, latitude) => {
        console.log(`UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`)
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
    handleTideSelection = (groupTitle, label, selected) => {
        localStorage.setItem("tide", selected);
        this.setState({
            pause: false,
            tide: selected
        })
    }
    handleWindCheck = (event) => {
        localStorage.setItem("isWind", !this.state.isWind);
        this.setState({
            isWind: !this.state.isWind
        })
    }
    handleTideCheck = (event) => {
        localStorage.setItem("isTide", !this.state.isTide);
        this.setState({
            isTide: !this.state.isTide
        })
    }
    handleSwell1Check = (event) => {
        localStorage.setItem("isSwell1", !this.state.isSwell1);
        this.setState({
            isSwell1: !this.state.isSwell1
        })
    }
    handleSwell2Check = (event) => {
        localStorage.setItem("isSwell2", !this.state.isSwell2);
        this.setState({
            isSwell2: !this.state.isSwell2
        })
    }
    handleSwell1Selection = (groupTitle, label, selected) => {
        localStorage.setItem("swell1Direction", selected);
        this.setState({
            pause: false,
            swell1Direction: selected
        })
    }
    handleSwell2Selection = (groupTitle, label, selected) => {
        localStorage.setItem("swell2Direction", selected);
        this.setState({
            pause: false,
            swell2Direction: selected
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
            pause: false,
            distance: target.value
        })
    }
    pause = (event) => this.setState({
        pause: true
    })
    swellSelector = (id, swellDirection) => <div className="flex2Column bg-dkYellow r-10 m-5 p-15">
        Swell{id}:<br/>
        <Selector
            groupTitle={`Swell${id}`}
            selected={swellDirection} 
            label="Direction" 
            items={["W", "WSW", "WNW", "E", "ESE", "ENE", "N", "NE", "NNE", "NW", "NNW", "S", "SE", "SSE", "SW", "SSW"]}
            onChange={(id === 1) ? this.handleSwell1Selection : this.handleSwell2Selection}
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
                {(this.state.isSwell1) ? <img src={thumbsUp} alt='swell1' className='p-10 r-20 bg-green' /> : <img src={thumbsDown} alt='swell1' className='p-10 r-20 bg-red' /> }
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
                {(this.state.isSwell2) ? <img src={thumbsUp} alt='swell2' className='p-10 r-20 bg-green' /> : <img src={thumbsDown} alt='swell2' className='p-10 r-20 bg-red' /> }
            </div>
        }
    </div>
    tideSelector = (tide) => <div className="flex3Column bg-dkYellow r-10 m-5 p-15">
                                Tide:<br/>
                                <Selector 
                                    groupTitle="Tide"
                                    selected={tide} 
                                    label="current" 
                                    items={["low", "medium", "hign"]}
                                    onChange={this.handleTideSelection}
                                />
                                <div className="button mt-15" onClick={this.handleTideCheck}>
                                    {(this.state.isTide) ? <img src={thumbsUp} alt='tide' className='p-10 r-20 bg-green' /> : <img src={thumbsDown} alt='tide' className='p-10 r-20 bg-red' /> }
                                </div>
                            </div>
    windSelector = (windDirection) => <div className="flex3Column bg-dkYellow r-10 m-5 p-15">
                            Wind:<br/>
                            <Selector
                                groupTitle="Wind" 
                                selected={windDirection} 
                                label="Direction"
                                items={["W", "WSW", "WNW", "E", "ESE", "ENE", "N", "NE", "NNE", "NW", "NNW", "S", "SE", "SSE", "SW", "SSW"]}
                                onChange={this.handleWindSelection}
                            />
                            <div className="button mt-15" onClick={this.handleWindCheck}>
                                {(this.state.isWind) ? <img src={thumbsUp} alt='wind' className='p-10 r-20 bg-green' /> : <img src={thumbsDown} alt='wind' className='p-10 r-20 bg-red' /> }
                            </div>
                        </div>
    starSelector = (stars) => <div className="flex3Column bg-dkYellow r-10 m-5 p-15">
                        Shakas:<br/>
                        <Selector
                            groupTitle="Shakas" 
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
        if (kind === "swell1") {
            return this.state.swell1Direction;
        } else if (kind === "swell2") {
            return this.state.swell2Direction;
        } else if (kind === "tide") {
            return this.state.tide;
        } else if (kind === "wind") {
            return this.state.windDirection;
        }
    }
    star = (matchKind) => <div className="flex3Column bg-lite mr-5 ml-5 p-10 r-10">
                            {this.getMatchIcon(matchKind)}
                            <div className="copyright">{this.getState(matchKind)}</div>
                        </div>;
    getStars = (stars) => stars.map((star) => this.star(star));
    render() {
        console.log(`currentPositionExists: ${this.currentPositionExists()}`)
        const {locations, windDirection, swell1Direction, swell2Direction, tide, stars, step} = this.state;
        const swell1Match = (item) => (item.swell.indexOf(swell1Direction)>-1) ? true : false;
        const swell2Match = (item) => (item.swell.indexOf(swell2Direction)>-1) ? true : false;
        const windMatch = (item) => (item.wind.indexOf(windDirection)>-1) ? true : false;
        const tideMatch = (item) => (item.tide.indexOf(tide)>-1) ? true : false;
        const swell1DirectionMatch = (direction) => (direction.swell===swell1Direction) ? true : false;
        const swell2DirectionMatch = (direction) => (direction===swell2Direction) ? true : false;
        const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
        const tideDirectionMatch = (direction) => (direction.tide === tide) ? true : false;
        const calculateDistance = (item) => {
            const lat1 = item.latitude;
            const lat2 = this.state.latitude;
            const lon1 = item.longitude;
            const lon2 = this.state.longitude;
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
                console.log(`DISTANCE => ${dist}`)
                return dist;
            }
        }
        const distance = (item) => calculateDistance(item);
        //Math.abs(item.latitude - this.state.latitude)+Math.abs(item.longitude - this.state.longitude);
        //.01 - 1 mile
        const distanceRange = Number(this.state.distance);
        const regionMatch = (item) => (distance(item)<distanceRange) ? distance(item) : false
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
        const swell1Confirm = (matches) => ((this.state.isSwell1 && matches.includes("swell1")) || this.state.isSwell1 === false) ? true : false;
        const swell2Confirm = (matches) => ((this.state.isSwell2 && matches.includes("swell2")) || this.state.isSwell2 === false) ? true : false;
        const tideConfirm = (matches) => ((this.state.isTide && matches.includes("tide")) || this.state.isTide === false) ? true : false;
        const windConfirm = (matches) => ((this.state.isWind && matches.includes("wind")) || this.state.isWind === false) ? true : false;
        const getMatchingLocation = (item) => {
            const matches = match(item);
            if (swell1Confirm(matches) && swell2Confirm(matches) && tideConfirm(matches) && windConfirm(matches)) {
                if (regionMatch(item) !== false) {
                    if (matches.length >= Number(this.state.stars)) {
                        //console.log(`STARS ==================> Matches: ${matches.length} state stars:${this.state.stars}`)
                        count = count + 1;
                        return <div key={getKey("loc")}>
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
                    }
                }
            }
        }
        const matchingLocations = () => locations.map((item) => getMatchingLocation(item))
        const getLocations = matchingLocations();
        const date = this.state.date.toLocaleTimeString();
        const time = date.replace(" ","").toLocaleLowerCase();
        return ( 
            <div className="App-content fadeIn">
                <Dialog title="Wave Finder" message="select current conditions:"> 
                    <div className="white pointer" onMouseDown={this.pause}>   
                        <span className="bold">{time}</span>
                        <Geolocator currentPositionExists={this.currentPositionExists} returnCurrentPosition={this.updateCurrentLocation}/>
                        <br/>
                        <div className="bg-darker p-5 r-10 m-5">
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
                                    Miles:<br/>
                                    <input className="mt-10 p-5 r-10"
                                        name="distance"
                                        type="number"
                                        value={this.state.distance}
                                        onChange={this.handleDistanceSelection}/>
                                </label>
                            </div>
                        </div>
                        <div className="mt-10 mb-20">
                            <span className="color-neogreen bold">{count} waves</span> out of {locations.length}<br/>
                            are in a <span className="color-neogreen bold">{this.state.distance}</span> mile radius<br/>
                            and prefer <span className="color-neogreen bold">{swell1Direction} </span>and <span className="color-orange bold ">{swell2Direction} </span>swell <br/>
                            with <span className="color-neogreen bold">{tide} </span>tide:
                        </div>
                        {getLocations}
                    </div>     
                </Dialog>  
            </div>  
        )
    }
    
}
export default WaveFinder;