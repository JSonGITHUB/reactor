import React, { useState } from 'react';

const ScrollingTimePicker = ({
    index,
    data,
    handleSubmit,
    handleCancel,
    categoryStyle
}) => {
    const [hours, setHours] = useState(data[index].time.split(':')[0] ?? 0);
    const [minutes, setMinutes] = useState(data[index].time.split(':')[1] ?? 0);
    const [seconds, setSeconds] = useState(data[index].time.split(':')[2] ?? 0);

    const generateNumbers = (limit) => {
        return Array.from({ length: limit }, (_, i) => String(i).padStart(2, '0'));
    };

    const hoursArray = generateNumbers(90);
    const minutesArray = generateNumbers(60);
    const secondsArray = generateNumbers(60);

    const handleScroll = (event, setValue) => {
        const value = event.target.value;
        setValue(value);
    };

    return (
        <div className=''>
            <div className='containerBox p-20' style={categoryStyle(index)}>
                {data[index].skill}
            </div>
            <div className='containerBox p-20'>
                <div className='flexContainer'>
                    <div className='flex1Auto'></div>
                    <div className='flex1Auto'>
                        <div className='flexContainer width-auto'>
                            <select className='containerBox flexColumn' value={hours} onChange={(e) => handleScroll(e, setHours)}>
                                {hoursArray.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {hour}
                                    </option>
                                ))}
                            </select>
                            <div className='flexColumn pt-15 size30'>:</div>
                            <select className='containerBox flexColumn' value={minutes} onChange={(e) => handleScroll(e, setMinutes)}>
                                {minutesArray.map((minute) => (
                                    <option key={minute} value={minute}>
                                        {minute}
                                    </option>
                                ))}
                            </select>
                            <div className='flexColumn pt-15 size30'>:</div>
                            <select className='containerBox flexColumn' value={seconds} onChange={(e) => handleScroll(e, setSeconds)}>
                                {secondsArray.map((second) => (
                                    <option key={second} value={second}>
                                        {second}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='flex1Auto'></div>
                </div>
                <div className='pt-20 pb-10'>
                    Selected Time: {`${hours}:${minutes}:${seconds}`}
                </div>
            </div>
            <div className='containerBox form-actions p-20 contentCenter'>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={() => handleSubmit(`${hours}:${minutes}:${seconds}`)}
                >
                    Submit
                </button>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ScrollingTimePicker;