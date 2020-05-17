import React from 'react';
import getKey from './utils/KeyGenerator.js';
import Geolocator from './utils/Geolocator.js';
import Selector from './forms/FunctionalSelector.js';
import Dialog from './functional/Dialog.js';

class WaveFinder extends React.Component {
    
    constructor(props) {
        super(props);
        const getLocal = (item) => localStorage.getItem(item);
        const getProps = (item) => props[item];
        const getDefault = (item) => (getLocal(item) === null) ? getProps(item) : getLocal(item);
        this.state = {
            pause: false,
            date: new Date(),
            tide: getDefault("tide"),
            swellDirection: getDefault("swellDirection"),
            windDirection: getDefault("windDirection"),
            distance: getDefault("distance"),
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
                "swell": ["S", "SE"],
                "wind": ["N"],
                "tide": ["high", "medium", "low"]
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
        this.handleSwellSelection = this.handleSwellSelection.bind(this);
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
        if (this.state.pause === false) {
            this.setState({
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
    handleTideSelection = (groupTitle, label, selected) => {
        localStorage.setItem("tide", selected);
        this.setState({
            pause: false,
            tide: selected
        })
    }
    handleSwellSelection = (groupTitle, label, selected) => {
        localStorage.setItem("swellDirection", selected);
        this.setState({
            pause: false,
            swellDirection: selected
        })
    }
    handleWindSelection = (groupTitle, label, selected) => {
        localStorage.setItem("windDirection", selected);
        this.setState({
            pause: false,
            windDirection: selected
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
    getDistanceMenu = () => {
        const max = 3500;
        let menu = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];
        return menu
    }
    render() {
        console.log(`currentPositionExists: ${this.currentPositionExists()}`)
        const {locations, windDirection, swellDirection, tide} = this.state;
        const swellMatch = (item) => (item.swell.indexOf(swellDirection)>-1) ? true : false;
        const windMatch = (item) => (item.wind.indexOf(windDirection)>-1) ? true : false;
        const tideMatch = (item) => (item.tide.indexOf(tide)>-1) ? true : false;
        const swellDirectionMatch = (direction) => (direction.swell === swellDirection) ? true : false;
        const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
        const tideDirectionMatch = (direction) => (direction.tide === tide) ? true : false;
        const distance = (loc, pos) => Math.abs(loc-pos);
        //.01 - 1 mile
        const distanceRange = (Number(this.state.distance) * .01);
        const regionMatch = (item) => (distance(item.latitude, this.state.latitude)<distanceRange) ? true : false
        let count = 0;
        const match = (item) => {
            let matches = 0;
            matches = (swellMatch(item)) ? matches+1 : matches;
            matches = (windMatch(item)) ? matches+1 : matches;
            matches = (tideMatch(item)) ? matches+1 : matches;
            return matches;
        }
        const statusClass = (status) => (status === true) ? "color-neogreen" : "color-red"; 
        const getMatchingLocation = (item) => {
            if (match(item) > 1) {
                if (regionMatch(item)) {
                    count = count + 1;
                    return <div key={getKey("loc")}>
                            <div className="r-10 m-10 p-20 bg-dkGreen">
                                <div className="navBranding white bold">{item.name}</div>
                                <div className="flexContainer">
                                    <div className="flexContainer m-auto">
                                        <div className="columnRight pr-10">
                                            <div className="color-yellow bold">Swell: </div>
                                            <div className="color-yellow bold">Wind: </div>
                                            <div className="color-yellow bold">Tide: </div>
                                        </div>
                                        <div className="columnLeft">
                                            <div className={statusClass(swellMatch(item))}>{item.swell.map((swell) => <span className={statusClass(swellDirectionMatch({swell}))}>{swell}, </span>)}</div>
                                            <div className={statusClass(windMatch(item))}>{item.wind.map((wind) => <span className={statusClass(windDirectionMatch({wind}))}>{wind}, </span>)}</div>
                                            <div className={statusClass(tideMatch(item))}>{item.tide.map((tide) => <span className={statusClass(tideDirectionMatch({tide}))}>{tide}, </span>)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        <div className="bg-darker p-15 r-10 m-5">
                            <div className="flexContainer">
                                <div className="flexOneFourthColumn bg-dkYellow r-10 m-1 p-15">
                                    Wind:<br/>
                                    <Selector
                                        groupTitle="Wind" 
                                        selected={this.state.windDirection} 
                                        label="Direction"
                                        items={["W", "WSW", "WNW", "E", "ESE", "ENE", "N", "NE", "NNE", "NW", "NNW", "S", "SE", "SSE", "SW", "SSW"]}
                                        onChange={this.handleWindSelection}
                                    />
                                </div>
                                <div className="flexOneFourthColumn bg-dkYellow r-10 m-1 p-15">
                                    Swell:<br/>
                                    <Selector
                                        groupTitle="Swell"
                                        selected={this.state.swellDirection} 
                                        label="Direction" 
                                        items={["W", "WSW", "WNW", "E", "ESE", "ENE", "N", "NE", "NNE", "NW", "NNW", "S", "SE", "SSE", "SW", "SSW"]}
                                        onChange={this.handleSwellSelection}
                                    />
                                </div>
                                <div className="flexOneFourthColumn bg-dkYellow r-10 m-1 p-15">
                                    Tide:<br/>
                                    <Selector 
                                        groupTitle="Tide"
                                        selected={this.state.tide} 
                                        label="current" 
                                        items={["low", "medium", "hign"]}
                                        onChange={this.handleTideSelection}
                                    />
                                </div>
                                <div className="flexOneFourthColumn bg-dkYellow r-10 m-1 p-15">
                                    <label>
                                        Miles:<br/>
                                        <input className="mt-10 p-5 r-10 brdr-green"
                                            name="distance"
                                            type="number"
                                            value={this.state.distance}
                                            onChange={this.handleDistanceSelection}/>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <br/>
                        <span className="color-neogreen bold">{count} waves</span> out of {locations.length}<br/>
                        are in a <span className="color-neogreen bold">{this.state.distance} mile radius</span><br/>
                        and prefer <span className="color-neogreen bold">{this.state.swellDirection} swell with {this.state.tide} tide</span>:
                        <br/><br/>
                        {getLocations}
                    </div>     
                </Dialog>  
            </div>  
        )
    }
    
}
export default WaveFinder;



