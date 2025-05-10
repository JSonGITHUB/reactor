import React, { useContext } from 'react'
import { StepContext } from '../context/StepContext'

const CurrentTimer = () => {

    const {
        currentTimer,
        formatTime
    } = useContext(StepContext);

    return (
        <div className='containerDetail size35 bg-dark p-20 ml-5 mr-5'>{formatTime(currentTimer)}</div>
    )
}

export default CurrentTimer