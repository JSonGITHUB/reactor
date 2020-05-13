import React from 'react';
import Dialog from '../functional/Dialog.js';
import Loader from '../utils/Loader.js';

class Geolocate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            longitude: null,
            latitude: null,
            errorMessage: null
        }
    }
    componentDidMount() {
        window.navigator.geolocation.getCurrentPosition(
            //position => console.log(position.coords.longitude),
            position => {
                this.setState({
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude,
                });
            },
            err => {
                console.log(err)
                this.setState({
                    errorMessage: err.message
                });

            }
        )
    }
    getLocation = () => `position: ${this.state.longitude}, ${this.state.latitude} `;
    percent = (window.innerWidth < 700) ? 'twentyfivePercent mt--70 mb--70' : 'fiftyPercent mt--40 mb--40';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    latlon = () => this.state.latitude + "," + this.state.longitude;
    
    render() {
        const errorExists = (this.state.errorMessage) ? true : false;
        const latExists = (this.state.latitude) ? true : false;
        const errMessage = this.state.errorMessage;
        let gelocationStatus = (latExists) ? this.getLocation() : this.loading();
        gelocationStatus = (errorExists) ? `${errMessage}` : gelocationStatus;
        
        return <div>
                <div className="color-yellow greet">{gelocationStatus}</div>
            </div>
    };
}

export default Geolocate;