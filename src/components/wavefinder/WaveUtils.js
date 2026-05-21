import React, { useState, useContext, useRef, useEffect } from 'react';
import icons from '../site/icons';
import validate from '../utils/validate';
import { OceanContext } from '../context/OceanContext';
import { WavesContext } from '../context/WavesContext';

const WaveUtils = ({
    item
}) => {

    const {
        status
    } = useContext(OceanContext);

    const {
        locations,
        handleResetLocations,
        handleEditToggle,
        edit,
        updateLocations
    } = useContext(WavesContext);

    const [displayData, setDisplayData] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editDialogTarget, setEditDialogTarget] = useState(null);
    const [draftValues, setDraftValues] = useState({
        swell: '',
        wind: '',
        tide: ''
    });
    const [editingValue, setEditingValue] = useState(null);
    const activeInputRef = useRef(null);
    const activeDialogIndex = editDialogTarget
        ? locations.findIndex(location =>
            location.name === editDialogTarget.name
            && location.latitude === editDialogTarget.latitude
            && location.longitude === editDialogTarget.longitude
        )
        : -1;

    useEffect(() => {
        if (editingValue) {
            activeInputRef.current?.focus();
        }
    }, [editingValue]);

    const toggleExport = () => {
        setDisplayData(prev => !prev);
    }
    const deleteWave = (props) => {
        const filtered = locations.filter(location =>
            !(typeof location.name === 'string' && location.name === props.name)
        );
        updateLocations(filtered);
    }
    const updateLocationValues = (index, key, nextValues) => {
        const newLocations = [...locations];
        newLocations[index] = {
            ...newLocations[index],
            [key]: nextValues
        };
        updateLocations(newLocations);
    };
    const beginAddValue = (key) => {
        setEditingValue({ key, valueIndex: null });
        setDraftValues(prev => ({
            ...prev,
            [key]: ''
        }));
    };
    const beginEditValue = (key, valueIndex, value) => {
        setEditingValue({ key, valueIndex });
        setDraftValues(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const cancelValueEdit = (key) => {
        setEditingValue(prev => (prev && prev.key === key) ? null : prev);
        setDraftValues(prev => ({
            ...prev,
            [key]: ''
        }));
    };
    const commitValueChange = (index, key) => {
        const nextValue = String(draftValues[key] || '').trim();
        if (!nextValue) {
            cancelValueEdit(key);
            return;
        }

        const nextValues = [...locations[index][key]];

        if (editingValue && editingValue.key === key && editingValue.valueIndex !== null) {
            nextValues[editingValue.valueIndex] = nextValue;
        } else {
            nextValues.push(nextValue);
        }

        updateLocationValues(index, key, nextValues);
        cancelValueEdit(key);
    };
    const handleDraftValueChange = (key, value) => {
        setDraftValues(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const handleDraftValueKeyDown = (event, index, key) => {
        if (event.key === 'Enter') {
            commitValueChange(index, key);
        }

        if (event.key === 'Escape') {
            cancelValueEdit(key);
        }
    };
    const removeItemByIndex = (array, index) => {
        if (index >= 0 && index < array.length) {
            array.splice(index, 1);
        } else {
            console.error("Index out of range");
        }
    };
    const deleteASwell = (index, swellId) => {
        const next = [...locations[index].swell];
        removeItemByIndex(next, swellId);
        updateLocationValues(index, 'swell', next);
    }
    const deleteATide = (index, tideId) => {
        const next = [...locations[index].tide];
        removeItemByIndex(next, tideId);
        updateLocationValues(index, 'tide', next);
    }
    const deleteAWind = (index, windId) => {
        const next = [...locations[index].wind];
        removeItemByIndex(next, windId);
        updateLocationValues(index, 'wind', next);
    }
    // Cam input state for edit dialog
    const [camInput, setCamInput] = useState('');
    const openEditDialog = (index) => {
        const selectedLocation = locations[index];
        if (!selectedLocation) {
            return;
        }

        setCamInput(selectedLocation.cam || '');
        setEditDialogTarget({
            name: selectedLocation.name,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
        });
        setIsEditDialogOpen(true);
    };
    const closeEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditDialogTarget(null);
        setEditingValue(null);
        setDraftValues({
            swell: '',
            wind: '',
            tide: ''
        });
    };
    const handleCamInputChange = (e) => {
        setCamInput(e.target.value);
    };
    const commitCamChange = () => {
        if (activeDialogIndex !== -1 && (locations[activeDialogIndex].cam || '') !== camInput) {
            const newLocations = [...locations];
            newLocations[activeDialogIndex] = {
                ...newLocations[activeDialogIndex],
                cam: camInput
            };
            updateLocations(newLocations);
        }
    };
    const handleCamInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            commitCamChange();
            e.target.blur();
        }
    };
    const renderValueEditor = (index, key, label) => {
        const isEditingKey = editingValue && editingValue.key === key;

        return (
            <div className='containerDetail p-10 m-5 size15 color-lite'>
                <div className='containerDetail p-10 m-5 size15 color-yellow button' onClick={() => beginAddValue(key)}>
                    {label} <span className='text-outline-lite'>{icons.plus}</span>
                </div>
                {
                    isEditingKey
                        ? <div className='containerDetail p-10 m-5 size15 color-lite'>
                            <input
                                ref={activeInputRef}
                                type='text'
                                className='containerDetail p-10 m-5 size15 color-lite p-5 m-5'
                                value={draftValues[key]}
                                onChange={(event) => handleDraftValueChange(key, event.target.value)}
                                onKeyDown={(event) => handleDraftValueKeyDown(event, index, key)}
                                placeholder={`Enter ${label.toLowerCase()}...`}
                            />
                            <div className='flexContainer containerDetail'>
                                <div className='containerDetail flex2Column button mr-5 bg-green p-10' onClick={() => commitValueChange(index, key)}>
                                    Save
                                </div>
                                <div className='containerDetail flex2Column button bg-red p-10' onClick={() => cancelValueEdit(key)}>
                                    Cancel
                                </div>
                            </div>
                        </div>
                        : null
                }
                {
                    locations[index][key].map((value, valueIndex) => {
                        const isEditingThisValue = isEditingKey && editingValue.valueIndex === valueIndex;

                        return <div key={`${key}-${value}-${valueIndex}`} className='containerDetail p-10 m-5 size15 color-lite flexContainer button'>
                            <div
                                className='flex2Column columnLeftAlign'
                                title={`edit ${value}`}
                                onClick={() => beginEditValue(key, valueIndex, value)}
                            >
                                {isEditingThisValue ? `${value} (editing)` : value}
                            </div>
                            <div
                                title='delete'
                                className='flex1Column columnRightAlign'
                                onClick={() => {
                                    if (key === 'swell') {
                                        deleteASwell(index, valueIndex);
                                    } else if (key === 'wind') {
                                        deleteAWind(index, valueIndex);
                                    } else {
                                        deleteATide(index, valueIndex);
                                    }
                                }}
                            >
                                {icons.delete}
                            </div>
                        </div>;
                    })
                }
            </div>
        );
    };
    const renderEditDialog = (_, index) => (
        <div className='containerDetail p-10 m-5 size20 color-lite'>
            <div className='containerDetail p-10 m-5 size15 color-yellow'>
                {locations[index].name}
            </div>
            <div className='containerDetail p-10 m-5 size15 color-lite'>
                {locations[index].longitude}
            </div>
            <div className='containerDetail p-10 m-5 size15 color-lite'>
                {locations[index].latitude}
            </div>
            <div className='containerDetail p-10 m-5 size15 color-lite'>
                <label className='color-yellow bold'>Cam Link:</label>
                <input
                    type='text'
                    className='containerDetail p-10 m-5 size15 color-lite p-5 m-5'
                    value={camInput}
                    onChange={handleCamInputChange}
                    onBlur={commitCamChange}
                    onKeyDown={handleCamInputKeyDown}
                    placeholder='Add or edit cam link...'
                    style={{ width: '100%' }}
                />
            </div>
            {renderValueEditor(index, 'swell', 'SWELL')}
            {renderValueEditor(index, 'wind', 'WIND')}
            {renderValueEditor(index, 'tide', 'TIDE')}
        </div>
    );

    const editWave = (props) => {
        if (props.name === 'button') {
            handleEditToggle();
        } else if (props.name === 'edit') {
            if (isEditDialogOpen) {
                closeEditDialog();
            } else {
                const index = locations.findIndex(obj =>
                    obj.name === item.name
                    && obj.latitude === item.latitude
                    && obj.longitude === item.longitude
                );
                if (index !== -1) {
                    openEditDialog(index);
                }
            }
        }
    }

    const menu = <div className='containerDetail p-10 m-5 size15 color-lite'>
        {
            (edit && (displayData === false))
                ? <div className='buttonLite button' onClick={() => { handleEditToggle(); closeEditDialog(); }}>
                    {edit ? 'Save' : 'Edit Waves'}
                </div>
                : null
        }
        {
            (edit && (displayData === false))
                ? <div className='buttonLite button' onClick={() => toggleExport()}>
                    Display Location Data
                </div>
                : null
        }
        {
            (edit && (displayData === true))
                ? <div className='buttonLite button' onClick={() => toggleExport()}>
                    Close Location Data
                </div>
                : null
        }
        {
            (edit && (displayData === true))
                ? <div className='containerDetail p-10 m-5 size15 color-lite'>
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
            edit
                ? <div className='buttonLite button' onClick={() => handleResetLocations()}>
                    RESET LOCATIONS
                </div>
                : null
        }
        {
            edit
                ? <div className='buttonLite button' onClick={() => { localStorage.setItem('edit', 'false'); closeEditDialog(); handleEditToggle(); }}>
                    Cancel
                </div>
                : null
        }
    </div>;
    const itemContainer = <div className='containerDetail p-10 m-5 size15 color-lite'>
        {isEditDialogOpen && activeDialogIndex !== -1 && renderEditDialog(locations[activeDialogIndex], activeDialogIndex)}
        <div className='flexContainer containerDetail p-10 m-5 size15 color-lite'>
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