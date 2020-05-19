import React from 'react';
import Timer from './Timer.js';
import Geolocator from './utils/Geolocator.js';

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            longitude: null,
            latitude: null,
            distance: 0,
            tracking: false,
            markedLongitude: null,
            markedLatitude: null
        }
    }
    calculateDistance = () => {
        const lat1 = this.state.markedLatitude;
        const lat2 = this.state.latitude;
        const lon1 = this.state.markedLongitude;
        const lon2 = this.state.longitude;
        let unit = "feet"
        console.log(`lat1: ${lat1} === lat2: ${lat2}) && (lon1: ${lon1} === lon2: ${lon2}`)
        if (((lat1 === lat2) && (lon1 === lon2)) || (!lat1 || !lat2 || !lon1 || !lon2)) {
            return 0;
        }else {
            const radlat1 = Math.PI * lat1/180;
            const radlat2 = Math.PI * lat2/180;
            const theta = lon1-lon2;
            const radtheta = Math.PI * theta/180;
            const feetOrYards = (dist) => ((dist*5280)>30) ? `${(dist*1760).toFixed(2)} yards` : `${(dist*5280).toFixed(2)} feet`;
            let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            dist = (dist<.25) ? feetOrYards(dist) : `${dist.toFixed(2)} miles`;
            //dist = dist.toFixed(2);
            if (unit==="Kilometers") { dist = dist * 1.609344 }
            if (unit==="Nautical") { dist = dist * 0.8684 }
            console.log(`DISTANCE => ${dist}`)
            return dist;
        }
    }
    updateCurrentLocation = (longitude, latitude) => {
        console.log(`UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`)
        this.setState({
            longitude: longitude,
            latitude: latitude,
            distance: this.calculateDistance()
        })
    }
    startDistance = () => {
        this.setState({
            tracking: true,
            markedLatitude: this.state.latitude,
            markedLongitude: this.state.longitude
        })
    }
    stopTracking = () => {
        this.setState({
            tracking: false,
        })
    }
    getDistance = () => this.state.distance;
    getTracker = () => {
        const tracker = (this.state.tracking === true) 
        ? <div>
            <div className="color-neogreen p-20 bold greet bg-dkGreen r-5 m-20">{this.getDistance()}</div>
            <div className="button p-20 r-5 m-20 bg-red incompletedSelector color-black" onClick={this.stopTracking}>Stop Tracking</div>
        </div>
        : <div>
            <div className="color-neogreen p-20 bold greet bg-dkGreen r-5 m-20">{this.state.distance}</div>
            <div className="button p-20 r-5 m-20 bg-neogreen completedSelector color-black" onClick={this.startDistance}>Start Tracking</div>
        </div>

        return tracker;
    }
                    
    render() {
        return (
            <div className="App fadeIn">
                <header className="App-content">
                    <a className="App-link bold greet p-20 r-10 w-200 bg-green brdr-green noUnderline"
                    href="https://jsongithub.github.io/portfolio/"
                    target="_self"
                    rel="noopener noreferrer"
                    >
                        portfolio
                    </a>
                    {/*<Lister items={[1,2,3]} />*/}
                    <Timer/>
                    Current position:<br/>
                    <Geolocator currentPositionExists="false" returnCurrentPosition={this.updateCurrentLocation}/><br/>
                    {this.getTracker()}
                </header>
            </div>
        );
    };
}

export default Home;