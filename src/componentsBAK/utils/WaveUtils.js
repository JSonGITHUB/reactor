import React, {useState} from 'react';

const WaveUtils = ({item, state, logLocation, updateLocations}) => {
   //console.log(`WaveUtils => \nstate: \n${JSON.stringify(state,null,2)}\nlogLocation: \n${JSON.stringify(logLocation,null,2)}`)
    // eslint-disable-next-line
    //console.log(`WaveUtils => state: ${state}`);
    const locationsInit = [{
        "name": "Seaside Reef",
        "latitude": 33.001613,
        "longitude": -117.278393,
        "swell": ["NW","W"],
        "wind": ["E"],
        "tide": ["low", "medium"]
    }];
    const [status, setStatus] = useState(state);
    const [locations, setLocations] = useState((status !== undefined) ? status.locations : locationsInit)
    const addWave = () => {
        const swells = [];
        const winds = [];
        const tides = [];
        const waveLocations = locations;
        let i=0;
        let wave = prompt('wave: ', '');
        const latitude = prompt('lat: ', localStorage.getItem('latitude'));
        const longitude = prompt('long: ', localStorage.getItem('longitude'));
        
        const swellCount = prompt('swell count: ', '');
        for (i=0; i<swellCount; i++) {
            swells[i] = prompt('swell direction', '').toLocaleUpperCase();
        }
        const windCount = prompt('wind count: ', '');
        for (i=0; i<windCount; i++) {
            winds[i] = prompt('wind direction', '').toLocaleUpperCase();
        }
        const tideCount = prompt('tide count: ', '');
        for (i=0; i<tideCount; i++) {
            tides[i] = prompt('tide direction', '').toLocaleLowerCase();
        }
        const getObj = () => {
            //console.log(`getObj => state: ${JSON.stringify(status,null,2)}`)
            return {
                name: wave,
                latitude: latitude,
                longitude: longitude,
                swell: swells,
                wind: winds,
                tide: tides
            }
        }
        waveLocations.push(getObj());
        //console.log(`add a wave... ${JSON.stringify(getObj(), null, 2)}`);
        localStorage.setItem('locations', JSON.stringify(waveLocations));
        setLocations(waveLocations);
        updateLocations();
    }
    const deleteWave = (props) => {
        let waveLocations = JSON.parse(localStorage.getItem('locations'));
        //console.log(`Props: ${JSON.stringify(props, null, 2)}`)
        let index = 0;
        /*
        const result = waveLocations.find(obj => {
            index++
            return obj.name === props.name
        })
        console.log(`delete 1 => index: ${index-1} result: ${JSON.stringify(result, null, 2)}`)
        console.log(`delete 2 => locations: [${index-1}]: ${JSON.stringify(waveLocations[index-1], null, 2)}`)
        */
        ///////////////
        waveLocations.splice(index-1, 1);
        localStorage.setItem('locations', JSON.stringify(waveLocations))
        //console.log(`delete 3 => locations: [${index-1}]: ${waveLocations.map((location, index) => `${index} ${location.name}`)}`)
        setLocations(localStorage.getItem('locations'));
        updateLocations();
    }
    const editWaveSave = (location, index) => {
        //console.log(`editWaveSave() => ${JSON.stringify(location,null,2)}`)
        let waveLocations = JSON.parse(localStorage.getItem('locations'));
        let swells = location.swell;
        let winds = location.wind;
        let tides = location.tide;
        let i=0;
        let wave = prompt('wave: ', location.name);
        let latitude = prompt('lat: ', location.latitude);
        let longitude = prompt('long: ', location.longitude);
        const swellCount = prompt('swell count: ', swells.length);
        for (i=0; i<swellCount; i++) {
            swells[i] = prompt('edit swell direction', swells[i]).toLocaleUpperCase();
        }
        swells = swells.slice(0, swellCount);
        const windCount = prompt('wind count: ', winds.length);
        for (i=0; i<windCount; i++) {
            winds[i] = prompt('edit wind direction', winds[i]).toLocaleUpperCase();
        }
        winds = winds.slice(0, windCount);
        const tideCount = prompt('tide count: ', tides.length);
        for (i=0; i<tideCount; i++) {
            tides[i] = prompt('edit tide direction', tides[i]).toLocaleLowerCase();
        }
        tides = tides.slice(0, tideCount);
        const getObj = () => {
            return {
                name: wave,
                latitude: latitude,
                longitude: longitude,
                swell: swells,
                wind: winds,
                tide: tides
            }
        }
        //console.log(`locations: ${JSON.stringify(waveLocations[index],null,2)} => will be ${JSON.stringify(getObj(),null,2)}`)
        waveLocations[index] = getObj();
        //console.log(`edit a wave saving... ${JSON.stringify(waveLocations[index], null, 2)}`)
        localStorage.setItem('locations', JSON.stringify(waveLocations))
        setLocations(localStorage.getItem('locations'));
        updateLocations();
    }
   
    const editWave = (props) => {

        console.log(`editWave =>\nprops: ${JSON.stringify(props, null, 2)}`);
        const waveLocations = JSON.parse(localStorage.getItem('locations'));
        
        if (props.name === 'button') {
            //console.log(`edit(${localStorage.getItem('edit')}) toggle... ${JSON.stringify(props, null, 2)}`);
            handleEditToggle()
        } else if (props.name === 'edit') {
            //console.log(`edit a wave... ${JSON.stringify(item, null, 2)}`);
            //console.log(`Props: ${JSON.stringify(props, null, 2)}`)
            let index = 0;
            const result = waveLocations.find(obj => {
                index++
                return obj.name === item.name
            })
            //console.log(`index: ${index} result: ${JSON.stringify(result, null, 2)}`)
            //console.log(`locations: [${index}]: ${JSON.stringify(waveLocations[index-1], null, 2)}`)
            editWaveSave(result, index-1);
        }
    }
    const handleEditToggle = () => {
        const edit = (localStorage.getItem('edit') === 'true') ? false : true;
        localStorage.setItem('edit', edit);
        updateLocations();
        //console.log(`handleEditToggle => EDIT: ${edit}`)
        /*
        this.setState({
            edit: edit
        })
        */
    }
    const menu = <div>
                    <div className='glassy button m-5 r-10 p-10 bg-green ' onClick={() => addWave()}>
                        Add wave
                    </div>
                    <div className='glassy button m-5 r-10 p-10 bg-green' onClick={() => editWave({'name':'button'})}>
                        {(localStorage.getItem('edit') === 'true') ? 'Save' : 'Edit wave'}
                    </div>
                </div>;
    const itemContainer = <div>
                    <div className='App button bg-yellow color-black p-10 r-10 mt-20' onClick={() => logLocation(item)}>
                        Log Session
                    </div>
                    <div className='App button bg-red color-black p-10 r-10 mt-20' onClick={() => editWave({'name':'edit'})}>
                        Edit Location
                    </div>
                    <div className='App button bg-red color-black p-10 r-10 mt-20' onClick={() => deleteWave(item)}>
                        Delete Location
                    </div>
                </div>
    //console.log(`status.module: ${status.module}`)
    return ((status !== undefined && status.module) === 'WaveFinder') ? menu : itemContainer;
}
export default WaveUtils