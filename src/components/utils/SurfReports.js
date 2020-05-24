import React from 'react';
import Loader from './Loader.js';
//import tide from '../../assets/images/tide.png'

class SurfReports extends React.Component {
    render() {
        return <div>
            <iframe title="surf report" src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46225" ></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46266"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46254"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJAC1"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJPC1"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46232"></iframe><br/>
        </div>
    };
}

export default SurfReports;