import React, { useState, useContext } from 'react';
import icons from '../site/icons';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';
import { OceanContext } from '../context/OceanContext';
import { WavesContext } from '../context/WavesContext';

const WaveUtils = ({
    item,
    /*state,*/
    logLocation
}) => {

    const {
        status
    } = useContext(OceanContext);

    const {
        locations,
        setLocations,
        handleResetLocations,
        handleEditToggle,
        edit,
        updateLocations
    } = useContext(WavesContext);

    const [displayData, setDisplayData] = useState(false);
    const [dialog, setDialog] = useState();

    const toggleExport = () => {
        setDisplayData(prev => !prev);
    }
    const deleteWave = (props) => {
        console.log(`deleteWave => locations: ${JSON.stringify(locations, null, 2)}`);
        const waveLocations = [...locations];

        const filterOutSelected = () => {
            if (!Array.isArray(waveLocations)) {
                throw new Error("must be an array of objects");
            }

            return waveLocations.filter(location =>
                !(typeof location.name === "string" && location.name === props.name)
            );
        }

        //console.log(`deleteWave => locations: ${locations.length} waveLocations: ${filterOutSelected().length}`);
        //waveLocations.splice(index-1, 1);
        setLocations(filterOutSelected());
        updateLocations(filterOutSelected());
    }
    const addASwell = (index) => {
        const newLocations = [...locations];
        const newSwell = prompt(`Enter swell ${newLocations[index].swell.length+1}: `,'');
        console.log(`newSwell: ${newSwell}`);
        newLocations[index].swell.push(newSwell);
        setLocations(newLocations);
    }
    const removeItemByIndex = (array, index) => {
        if (index >= 0 && index < array.length) {
            array.splice(index, 1);
        } else {
            console.error("Index out of range");
        }
    };
    const deleteASwell = (index, swellId) => {
        const newLocations = [...locations];
        const newSwell = [...newLocations[index].swell];
        removeItemByIndex(newSwell, swellId);
        console.log(`WaveUtils => deleteASwell => newSwell: ${JSON.stringify(newSwell, null, 2)}`);
        newLocations[index].swell = newSwell;
        setLocations(newLocations);
    }
    const editASwell = (index, swellId) => {
        const newLocations = [...locations];
        const newSwell = [...newLocations[index].swell];
        const updateSwell = prompt(`Swell ${Number(swellId)+1}: `, newSwell[swellId]);
        newSwell[swellId] = updateSwell;
        console.log(`WaveUtils => editASwell => newSwell: ${JSON.stringify(newSwell, null, 2)}`);
        newLocations[index].swell = newSwell;
        setLocations(newLocations);
    }
    const addATide = (index) => {
        const newLocations = [...locations];
        const newTide = prompt(`Enter tide ${newLocations[index].tide.length + 1}: `, '');
        console.log(`newTide: ${newTide}`);
        newLocations[index].tide.push(newTide);
        setLocations(newLocations);
    }
    const editATide = (index, tideId) => {
        const newLocations = [...locations];
        const newTide = [...newLocations[index].tide];
        const updateTide = prompt(`Tide ${Number(tideId)+1}: `, newTide[tideId]);
        newTide[tideId] = updateTide;
        console.log(`WaveUtils => editATide => newTide: ${JSON.stringify(newTide, null, 2)}`);
        newLocations[index].tide = newTide;
        setLocations(newLocations);
    }
    const deleteATide = (index, tideId) => {
        const newLocations = [...locations];
        const newTide = [...newLocations[index].tide];
        removeItemByIndex(newTide, tideId);
        console.log(`WaveUtils => deleteATide => newTide: ${JSON.stringify(newTide, null, 2)}`);
        newLocations[index].tide = newTide;
        setLocations(newLocations);
    }
    const addAWind = (index) => {
        const newLocations = [...locations];
        const newWind = prompt(`Enter wind ${newLocations[index].wind.length + 1}: `, '');
        console.log(`newWind: ${newWind}`);
        newLocations[index].wind.push(newWind);
        setLocations(newLocations);
    }
    const deleteAWind = (index, windId) => {
        const newLocations = [...locations];
        const newWind = [...newLocations[index].wind];
        removeItemByIndex(newWind, windId);
        console.log(`WaveUtils => deleteAWind => newWind: ${JSON.stringify(newWind, null, 2)}`);
        newLocations[index].wind = newWind;
        setLocations(newLocations);
    }
    const editAWind = (index, windId) => {
        const newLocations = [...locations];
        const newWind = [...newLocations[index].wind];
        const updateWind = prompt(`Wind ${Number(windId)+1}: `, newWind[windId]);
        newWind[windId] = updateWind;
        console.log(`WaveUtils => editAWind => newWind: ${JSON.stringify(newWind, null, 2)}`);
        newLocations[index].wind = newWind;
        setLocations(newLocations);
    }
    const displayEditDialog = (location, index) => {
        const editDialog = <div className='containerBox'>
            <div className='containerBox'>
                {locations[index].name}
            </div>
            <div className='containerBox'>
                {locations[index].longitude}
            </div>
            <div className='containerBox'>
                {locations[index].latitude}
            </div>
            <div className='containerBox'>
                <div className='containerBox color-yellow button' onClick={() => addASwell(index)}>
                    SWELL <span className='text-outline-light'>{icons.plus}</span>
                </div>
                {locations[index].swell.map((s, swellIndex) => <div className='containerBox flexContainer button'>
                    <div 
                        className='flex2Column columnLeftAlign'
                        title={`edit ${s}`}
                        onClick={() => editASwell(index, swellIndex)}
                    >
                        {s}
                    </div>
                    <div 
                        title='delete' 
                        className='flex1Column columnRightAlign'
                        onClick={() => deleteASwell(index, swellIndex)}
                    >
                        {icons.delete}
                    </div>
                </div>
                )}
            </div>
            <div className='containerBox'>
                <div className='containerBox color-yellow button' onClick={() => addAWind(index)}>
                    WIND <span className='text-outline-light'>{icons.plus}</span>
                </div>
                {locations[index].wind.map((w,windIndex) => <div className='containerBox flexContainer button'>
                        <div
                            className='flex2Column columnLeftAlign'
                            title={`edit ${w}`}
                            onClick={() => editAWind(index, windIndex)}
                        >
                            {w}
                        </div>
                        <div
                            title='delete'
                            className='flex1Column columnRightAlign'
                            onClick={() => deleteAWind(index, windIndex)}
                        >
                            {icons.delete}
                        </div>
                    </div>
                )}
            </div>
            <div className='containerBox'>
                <div className='containerBox color-yellow button' onClick={() => addATide(index)}>
                    TIDE <span className='text-outline-light'>{icons.plus}</span>
                </div>
                {locations[index].tide.map((t,tideIndex) => <div className='containerBox flexContainer button'>
                    <div
                        className='flex2Column columnLeftAlign'
                        title={`edit ${t}`}
                        onClick={() => editATide(index, tideIndex)}
                    >
                        {t}
                    </div>
                    <div
                        title='delete'
                        className='flex1Column columnRightAlign'
                        onClick={() => deleteATide(index, tideIndex)}
                    >
                        {icons.delete}
                    </div>
                </div>
                )}
            </div>
        </div>
        setDialog(editDialog);
    }

    const editWave = (props) => {

        console.log(`editWave =>\nprops: ${JSON.stringify(props, null, 2)}`);
        const waveLocations = [...locations];
        if (props.name === 'button') {
            handleEditToggle()
        } else if (props.name === 'edit') {
            console.log(`edit a wave => item: ${JSON.stringify(item, null, 2)}`);
            console.log(`edit a wave => waveLocations: ${JSON.stringify(waveLocations, null, 2)}`);
            let index = 0;
            const result = waveLocations.find(obj => {
                if (obj.name === item.name) {
                    console.log(`editWave => obj.name: ${obj.name}`)
                }
                index++
                return obj.name === item.name
            })
            console.log(`index: ${index} result: ${JSON.stringify(result, null, 2)}`)
            //editWaveSave(result, index-1);
            displayEditDialog(result, index - 1);
        }
    }

    const localEdit = initializeData('edit', 'false');
    const menu = <div className='containerBox'>
        {
            ((localEdit === 'true') && (displayData === false))
                ? <div className='buttonLite button' onClick={() => handleEditToggle()}>
                    {(localEdit === 'true') ? 'Save' : 'Edit Waves'}
                </div>
                : null
        }
        {
            ((localEdit === 'true') && (displayData === false))
                ? <div className='buttonLite button' onClick={() => toggleExport()}>
                    Display Location Data
                </div>
                : null
        }
        {
            ((localEdit === 'true') && (displayData === true))
                ? <div className='buttonLite button' onClick={() => toggleExport()}>
                    Close Location Data
                </div>
                : null
        }
        {
            ((localEdit === 'true') && (displayData === true))
                ? <div className='containerBox'>
                    <textarea
                        rows='10'
                        cols={window.innerWidth / 15}
                        value={JSON.stringify(locations, null, 2)}
                        className='mt-10 greet p-10 r-10 brdr-green'
                    />
                </div>
                : null
        }
        {
            (localEdit === 'true')
                ? <div className='buttonLite button' onClick={() => handleResetLocations()}>
                    RESET LOCATIONS
                </div>
                : null
        }
    </div>;
    const itemContainer = <div className='containerBox'>
        {dialog}
        <div className='flexContainer containerBox'>
            <div className='flex2Column button bold bg-dark color-lite r-10 m-10 contentCenter p-10 size25' onClick={() => editWave({ 'name': 'edit' })}>
                {icons.edit}
            </div>
            <div className='flex2Column button bold bg-dark color-lite r-10 m-10 contentCenter p-10 size25' onClick={() => deleteWave(item)}>
                {icons.delete}
            </div>
        </div>
    </div>
    //console.log(`status.module: ${item.module} edit: ${edit} status: ${JSON.stringify(validate(status), null, 2)}`);
    return ((edit) ? (validate(status) !== null && item.module === 'Waves') ? menu : itemContainer : null)

}
export default WaveUtils