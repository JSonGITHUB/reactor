import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css';
import getKey from '../utils/KeyGenerator.js';

const WeatherCard = ({dt, temp_min, temp_max, main, icon}) => {

  const date = new Date(dt);
  console.log(`Day: ${date.getDay()}`)
  const src =`http://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div key={getKey("loc")} /*onClick={() => this.props.editLocation()}*/>
        <div className="r-10 m-20 p-20 bg-dkGreen">
                <div className="width-100-percent flexContainer">
                    <div className="flex3Column bg-lite mr-5 ml-5 p-10 r-10">
                        <img src={src} alt='weather' />
                    </div>
                </div>
                <div className="mt-10 navBranding white">{main}</div>
                <div className="greet color-yellow p-5 bg-dkGreen mt-15 mb-10 r-5">{date.toLocaleDateString()} - {date.toLocaleTimeString()}</div>
                <div className='color-neogreen bold'>{temp_max}°</div>
                <div className='color-green bold'>{temp_min}°</div>
        </div>
    </div>
  );
};

export default WeatherCard;