import React from 'react';
import LogEntry from './LogEntryFunctional.js';
import Loader from '../utils/Loader.js';
import LogId from './LogId.js';
class Logger extends React.Component {

    logIdComponent = new LogId(this.props.logId);
    
    constructor(props) {
        super(props);
//        console.log(`Logger => constructor -> props.logId: ${this.props.logId}`)
//        console.log(`Logger => constructor -> localStorage.getItem: ${this.props.logId} ====> ${localStorage.getItem(this.props.logId)}`)
        if (localStorage.getItem(this.props.logId) === null) {
            this.log = this.logIdComponent.templateData;
            this.lodId = this.logIdComponent.generateNewLogId();
        } else {
            this.log = JSON.parse(localStorage.getItem(this.props.logId));
            this.logId = this.props.logId
        }
//        console.log(`Logger => constructor -> log: ${JSON.stringify(this.log,null,2)}`)
        this.state = {
            date: new Date(),
            log: this.log,
            items: [],
            isLoaded: false,
            logId: this.logId
        };
        this.updateLog = this.updateLog.bind(this);
        this.getStateLog = this.getStateLog.bind(this);
    }
    //getSpot = () => (this.state.spot) ? this.state.spot : this.log.Location.Break;
    getSpot = () => localStorage.getItem("spot");
    componentDidMount() {
        //const logId = (this.props.location.state === undefined) ? this.logIdComponent.getLastRecordId() : this.props.location.state.logId.item;
        const { state } = this.props.location;
        console.log(`Logger => componentDidMount -> SPOT: ${this.getSpot()}`); 
        const logId = (state === undefined) ? this.props.logId : state.logId.item;
        //console.log(`Logger => componentDidMount -> logId: ${logId}`)
        if (localStorage.getItem(this.props.logId) === null) {
            this.log = this.logIdComponent.templateData;
            this.lodId = this.logIdComponent.generateNewLogId();
        } else {
            this.log = JSON.parse(localStorage.getItem(this.props.logId));
            this.logId = this.props.logId
        }
        //console.log(`logId$$$$$$$$$$: ${this.props.logId} --- localStorage.${this.props.logId} ==== ${JSON.stringify(this.log,null,2)} AND logId::::: ${logId}`)
//      console.log(`Logger => constructor -> log: ${JSON.stringify(this.log,null,2)}`)
        let data = [{
            "description": "Location",
            "group": [
                {
                    "type": "selector",
                    "description": "Break", 
                    "selections": [
                        "",
                        "HB: 17th St.",
                        "HB: Taco Bell Reef",
                        "HB: Sanchos",
                        "HB: North Peir",
                        "HB: South Peir",
                        "HB: River Jetties",
                        "Salt Creek",
                        "Lowers",
                        "O-Side: Harbor North",
                        "O-Side: Harbor Middles",
                        "O-Side: Harbor South",
                        "O-Side: Jettie Southside",
                        "O-Side: Pier North",
                        "O-Side: Pier South",
                        "O-Side: Tyson",
                        "O-Side: Trenchtown",
                        "O-Side: Blvd",
                        "O-Side: Rock",
                        "O-Side: Poo Poos",
                        "C-Bad: Northend",
                        "C-Bad: Southside",
                        "Ponto: North",
                        "Ponto: Proper",
                        "Ponto: South",
                        "Sea Bluff",
                        "Sandbags",
                        "Grandview: Proper",
                        "Avocados",
                        "Beacons: North",
                        "Beacons: Out Front",
                        "Beacons: Wall",
                        "D Street: North",
                        "D Street: Diamond House",
                        "D Street: Hollywood Squares",
                        "Boneyards",
                        "Swamis",
                        "Brown House",
                        "Pipes",
                        "Traps",
                        "Barneys",
                        "Turtles",
                        "85s",
                        "Tippers",
                        "Suckouts",
                        "Cardiff Reef",
                        "Cardiff Reef South",
                        "Georges",
                        "Bus Stops",
                        "P-Lots",
                        "Seaside Reef",
                        "Palis",
                        "Tabletops",
                        "Cherry Hill",
                        "Rock Piles",
                        "Del Mar Rivermouth",
                        "Del Mar: 29th",
                        "Del Mar: 19th",
                        "Del Mar: 15th",
                        "Del Mar: 11th",
                        "Del Mar: 8th",
                        "Del Mar: The Mouse Hole",
                        "Torrey Pines: North",
                        "Torrey Pines: South",
                        "Blacks",
                        "Scripps",
                        "La Jolla Shores",
                        "Mission Drive",
                        "Mission: San Fernando",
                        "South Mission Jetti",
                        "OB Jetti",
                        "OB Avalanche",
                        "OB Pier",
                        "Loscombs",
                        "Rosarito: Smoke Stacks",
                        "Rosarito: Peir",
                        "K-38s",
                        "Gaviotas",
                        "La Fonda",
                        "Punta Baja",
                        "Elijandros",
                        "Harbor",
                        "Notch",
                        "Wall",
                        "Abreojos",
                        "Abreojos: 3 pole",
                        "Abreojos: Razors",
                        "Scorpion Bay",
                        "Estuary",
                        "Colorados"
                    ]
                }
            ]
        },
        {
            "description": "Surf",
            "group": [
                {
                    "type": "selector",
                    "description": "Height", 
                    "selections": [
                        "",
                        "knee high", 
                        "waist high", 
                        "shoulder high", 
                        "head high", 
                        "over head", 
                        "foot over head", 
                        "couple of feet over head", 
                        "double over head",
                        "triple over head"
                    ]
                },
                {
                    "type": "selector",
                    "description": "Report", 
                    "selections": [
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
                    ]
                },
                {
                    "type": "selector",
                    "description": "Shape", 
                    "selections": [
                        "",
                        "speedy runners",
                        "peaky",
                        "bowly",
                        "close-outs",
                        "barreling",
                        "skatepark",
                        "mush burgers",
                        "slopey",
                        "slabbing"
                    ]
                }
            ]
        },
        {
            "description": "Swell1",
            "group": [
                {
                    "type": "selector",
                    "description": "Height", 
                    "selections": [
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
                    ]
                },
                {
                    "type": "selector",
                    "description": "Direction", 
                    "selections": [
                        "",
                        "N",
                        "NE",
                        "ENE",
                        "NNE",
                        "NW",
                        "NNW",
                        "W",
                        "WNW",
                        "E",
                        "ESE",
                        "S",
                        "SE",
                        "SSE",
                        "WSW",
                        "SW",
                        "SSW"
                    ]
                },
                {
                    "type": "selector",
                    "description": "Angle", 
                    "selections": [
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
                    ]
                },
                {
                    "type": "selector",
                    "description": "Interval", 
                    "selections": [
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
                    ]
                }
            ]
        },
        {
            "description": "Swell2",
            "group": [
                {
                    "type": "selector",
                    "description": "Height", 
                    "selections": [
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
                    ]
                },
                {
                    "type": "selector",
                    "description": "Direction", 
                    "selections": [
                        "",
                        "N",
                        "NE",
                        "ENE",
                        "NNE",
                        "NW",
                        "NNW",
                        "W",
                        "WNW",
                        "E",
                        "ESE",
                        "S",
                        "SE",
                        "SSE",
                        "WSW",
                        "SW",
                        "SSW"
                    ]
                },
                {
                    "type": "selector",
                    "description": "Angle", 
                    "selections": [
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
                    ]
                },
                {
                    "type": "selector",
                    "description": "Interval", 
                    "selections": [
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
                    ]
                }
            ]
        },
        {
            "description": "Swell3",
            "group": [
                {
                    "type": "selector",
                    "description": "Height", 
                    "selections": [
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
                    ]
                },
                {
                    "type": "selector",
                    "description": "Direction", 
                    "selections": [
                        "",
                        "N",
                        "NE",
                        "ENE",
                        "NNE",
                        "NW",
                        "NNW",
                        "W",
                        "WNW",
                        "E",
                        "ESE",
                        "S",
                        "SE",
                        "SSE",
                        "WSW",
                        "SW",
                        "SSW"
                    ]
                },
                {
                    "type": "selector",
                    "description": "Angle", 
                    "selections": [
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
                    ]
                },
                {
                    "type": "selector",
                    "description": "Interval", 
                    "selections": [
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
                    ]
                }
            ]
        },
        {
            "description": "Wind",
            "group": [
                {
                    "type": "selector",
                    "description": "Direction", 
                    "selections": [
                        "",
                        "N",
                        "NE",
                        "ENE",
                        "NNE",
                        "NW",
                        "NNW",
                        "W",
                        "WNW",
                        "E",
                        "ESE",
                        "S",
                        "SE",
                        "SSE",
                        "WSW",
                        "SW",
                        "SSW"
                    ]
                },
                {
                    "type": "selector",
                    "description": "Orientation", 
                    "selections": [
                        "",
                        "offshore",
                        "onshore",
                        "sideshore => rights",
                        "sideshore => lefts"
                    ]
                },
                {
                    "type": "selector",
                    "description": "MPH", 
                    "selections": [
                        "",
                        "1mph",
                        "2mph",
                        "3mph",
                        "4mph",
                        "5mph",
                        "6mph",
                        "7mph",
                        "8mph",
                        "9mph",
                        "10mph",
                        "11mph",
                        "12mph",
                        "13mph",
                        "14mph",
                        "15mph"
                    ]
                },
                {
                    "type": "selector",
                    "description": "Surface", 
                    "selections": [
                        "",
                        "oily glass",
                        "glassy",
                        "textured",
                        "choppy",
                        "victory at sea"
                    ]
                }
            ]
        },
        {
            "description": "Tide",
            "group": [
                {
                    "type": "selector",
                    "description": "Phase", 
                    "selections": [
                        "",
                        "high",
                        "medium",
                        "low"
                    ]
                },
                {
                    "type": "selector",
                    "description": "Height", 
                    "selections": [
                        "",
                        "-2ft",
                        "-1ft",
                        "0ft",
                        "1ft",
                        "2ft",
                        "3ft",
                        "4ft",
                        "5ft",
                        "6ft",
                        "7ft",
                        "8ft",
                        "9ft",
                        "10ft"
                    ]
                }
            ]
        },
        {
            "description": "Conditions",
            "group": [
                {
                    "type": "radio",
                    "description": "Conditions", 
                    "selections": [
                        "Firing",
                        "Good",
                        "Bad"
                    ]
                }
            ]
        }];
        //localStorage.setItem('spot', this.getSpot());
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        /*
        const requestInit = {
            method:'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default'
        };
        */
        //const uri = new Request('https://jsongithub.github.io/portfolio/assets/data/appData.json', requestInit);
        //GOOD const uri = 'https://jsongithub.github.io/portfolio/assets/data/appData.json';
        const uri = 'https://jsongithub.github.io/portfolio/assets/data/appData.json';
        //const uri = 'localhost:8080/writeSurfLog.json';
        
        this.setState({
            isLoaded: true,
            items: data,
            //logId: this.props.logId
            logId: logId
        })       
    }

    updateLog(groupTitle, label, selected, set) {
        this.log[groupTitle][label] = selected;
        if (groupTitle !== undefined && groupTitle !== 1 && selected !== undefined && set) {
            this.setState({log: this.log});
        }
    }
    getStateLog = () => this.state.log;
    
    render() {      
        let {isLoaded, items} = this.state;
            console.log(`Logger ===> ${JSON.stringify(items, null, 2)}`);
            let appInterface = <div className="App-content fadeIn">
                                    <div className="flex3Column"></div>
                                    <div className="flex3Column">
                                        <Loader />
                                    </div>
                                    <div className="flex3Column"></div>
                                </div>;
            if (isLoaded) {
                appInterface = <div className="App-content fadeIn">
                    <div className="flex3Column"></div>
                    <div className="flex3Column">
                        <LogEntry
                        // logId={this.props.logId}
                            logId={this.state.logId}
                            onChange={this.updateLog} 
                            getStateLog={this.getStateLog} 
                            title="Session Log" 
                            message="Add your session data"  
                            buttonLabel="submit" 
                            items={items}
                        />
                    </div>
                    <div className="flex3Column"></div>
                </div>
                
            }
            return (
                appInterface            
            )
    }
    
}
export default Logger;