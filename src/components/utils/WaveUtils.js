import React, {useState} from 'react';

const WaveUtils = ({item, state, logLocation}) => {
    // eslint-disable-next-line
    const [status, setStatus] = useState(state);
    const [locations, setLocations] = useState(state.locations)
    const addWave = () => {
        const swells = [];
        const winds = [];
        const tides = [];
        const waveLocations = locations;
        let i=0;
        let wave = prompt("wave: ", "enter spot");
        const swellCount = prompt("swell count: ", "how many directions?");
        for (i=0; i<swellCount; i++) {
            swells[i] = prompt("swell direction", "direction");
        }
        const windCount = prompt("wind count: ", "how many directions?");
        for (i=0; i<windCount; i++) {
            winds[i] = prompt("wind direction", "direction");
        }
        const tideCount = prompt("tide count: ", "how many tides?");
        for (i=0; i<tideCount; i++) {
            tides[i] = prompt("tide direction", "direction");
        }
        const getObj = () => {
            //console.log(`getObj => state: ${JSON.stringify(status,null,2)}`)
            return {
                name: wave,
                latitude: localStorage.getItem("latitude"),
                longitude: localStorage.getItem("longitude"),
                swell: swells,
                wind: winds,
                tide: tides
            }
        }
        waveLocations.push(getObj());
        //console.log(`add a wave... ${JSON.stringify(getObj(), null, 2)}`);
        localStorage.setItem('locations', JSON.stringify(waveLocations));
        setLocations(waveLocations);
    }
    const deleteWave = (props) => {
        let waveLocations = JSON.parse(localStorage.getItem("locations"));
        //console.log(`Props: ${JSON.stringify(props, null, 2)}`)
        let index = 0;
        let result = waveLocations.find(obj => {
            index++
            return obj.name === props.name
        })
        //console.log(`delete 1 => index: ${index-1} result: ${JSON.stringify(result, null, 2)}`)
        //console.log(`delete 2 => locations: [${index-1}]: ${JSON.stringify(waveLocations[index-1], null, 2)}`)

        ///////////////
        waveLocations.splice(index-1, 1);
        localStorage.setItem('locations', JSON.stringify(waveLocations))
        //console.log(`delete 3 => locations: [${index-1}]: ${waveLocations.map((location, index) => `${index} ${location.name}`)}`)
        setLocations(waveLocations);
    }
    const editWaveSave = (location, index) => {
        //console.log(`editWaveSave() => ${JSON.stringify(location,null,2)}`)
        let waveLocations = JSON.parse(localStorage.getItem("locations"));
        let swells = location.swell;
        let winds = location.wind;
        let tides = location.tide;
        let i=0;
        let wave = prompt("wave: ", location.name);
        const swellCount = prompt("swell count: ", swells.length);
        for (i=0; i<swellCount; i++) {
            swells[i] = prompt("edit swell direction", swells[i]);
        }
        swells = swells.slice(0, swellCount);
        const windCount = prompt("wind count: ", winds.length);
        for (i=0; i<windCount; i++) {
            winds[i] = prompt("edit wind direction", winds[i]);
        }
        winds = winds.slice(0, windCount);
        const tideCount = prompt("tide count: ", tides.length);
        for (i=0; i<tideCount; i++) {
            tides[i] = prompt("edit tide direction", tides[i]);
        }
        tides = tides.slice(0, tideCount);
        const getObj = () => {
            return {
                name: wave,
                latitude: location.latitude,
                longitude: location.longitude,
                swell: swells,
                wind: winds,
                tide: tides
            }
        }
        //console.log(`locations: ${JSON.stringify(waveLocations[index],null,2)} => will be ${JSON.stringify(getObj(),null,2)}`)
        waveLocations[index] = getObj();
        //console.log(`edit a wave saving... ${JSON.stringify(waveLocations[index], null, 2)}`)
        localStorage.setItem('locations', JSON.stringify(waveLocations))
        setLocations(waveLocations);
    }
   
    const editWave = (props) => {
        const waveLocations = JSON.parse(localStorage.getItem("locations"));
        
        if (props.name === "button") {
            //console.log(`edit(${localStorage.getItem('edit')}) toggle... ${JSON.stringify(props, null, 2)}`);
            handleEditToggle()
        } else if (props.name === "edit") {
            //console.log(`edit a wave... ${JSON.stringify(item, null, 2)}`);
            //console.log(`Props: ${JSON.stringify(props, null, 2)}`)
            let index = 0;
            let result = waveLocations.find(obj => {
                index++
                return obj.name === item.name
            })
            //console.log(`index: ${index} result: ${JSON.stringify(result, null, 2)}`)
            //console.log(`locations: [${index}]: ${JSON.stringify(waveLocations[index-1], null, 2)}`)
            editWaveSave(result, index-1);
        }
    }
    const handleEditToggle = () => {
        const edit = (localStorage.getItem('edit') === "true") ? false : true;
        localStorage.setItem("edit", edit);
        //console.log(`handleEditToggle => EDIT: ${edit}`)
        /*
        this.setState({
            edit: edit
        })
        */
    }
    const menu = <div>
                    <div className="button m-5 r-10 p-10 bg-green" onClick={() => addWave()}>
                        Add wave
                    </div>
                    <div className="button m-5 r-10 p-10 bg-green" onClick={() => editWave({"name":"button"})}>
                        {(localStorage.getItem("edit") === "true") ? "Save" : "Edit wave"}
                    </div>
                </div>;
    const itemContainer = <div>
                    <div className="App button bg-yellow color-black p-10 r-10 mt-20" onClick={() => logLocation(item)}>
                        Log Session
                    </div>
                    <div className="App button bg-red color-black p-10 r-10 mt-20" onClick={() => editWave({"name":"edit"})}>
                        Edit Location
                    </div>
                    <div className="App button bg-red color-black p-10 r-10 mt-20" onClick={() => deleteWave(item)}>
                        Delete Location
                    </div>
                </div>
    //console.log(`status.module: ${status.module}`)
    return (status.module === "WaveFinder") ? menu : itemContainer;
}
export default WaveUtils