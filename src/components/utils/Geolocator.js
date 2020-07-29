import React from 'react';
import Loader from '../utils/Loader.js';

class Geolocate extends React.Component {
    constructor(props) {
        super(props);
        const { returnCurrentPosition, currentPositionExists } = props;
        this.state = {
            longitude: null,
            latitude: null,
            errorMessage: null,
            returnCurrentPosition: returnCurrentPosition,
            currentPositionExists: currentPositionExists
        }
    }
    getCurrentPosition = () => {
        window.navigator.geolocation.getCurrentPosition(
            //position => console.log(position.coords.longitude),
           position => {
                const { longitude, latitude } = position.coords;
                this.props.returnCurrentPosition(longitude, latitude);
                //console.log(`getCurrentPosition => coords ^^^^^^^^^^^ ${longitude}, ${latitude}`)
                this.setState({
                    longitude: longitude,
                    latitude: latitude,
                });
                /*
                try {
                    //if (!this.props.currentPositionExists()) {
                        this.props.returnCurrentPosition(position.coords.longitude, position.coords.latitude);
                    //}
                }catch(err) {
                }
                */
            },
            err => {
                console.log(err)
                this.setState({
                    errorMessage: err.message
                });

            }
        )
    }
    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            5000
        );
    }
    tick() {
        this.getCurrentPosition();
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    getLocation = () => `${this.state.latitude.toFixed(6)}, ${this.state.longitude.toFixed(6)} `;
    percent = (window.innerWidth < 700) ? 'twentyfivePercent mt--70 mb--70' : 'fiftyPercent mt--40 mb--40';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    latlon = () => this.state.latitude + "," + this.state.longitude;
    render() {
        const { latitude, errorMessage } = this.state;
        const errorExists = (errorMessage) ? true : false;
        const latExists = (latitude) ? true : false;
        const errMessage = errorMessage;
        let gelocationStatus = (latExists) ? this.getLocation() : this.loading();
        gelocationStatus = (errorExists) ? `${errMessage}` : gelocationStatus;
        /*
        if (latExists) {
            if (!this.props.currentPositionExists()) {
                this.props.returnCurrentPosition(this.state.longitude, this.state.latitude);
            }
        }
        */
        return <div className="color-yellow greet">{gelocationStatus}</div>
    };
}

export default Geolocate;