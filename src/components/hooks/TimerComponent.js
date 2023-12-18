// TimerComponent.js

import React, { useState, useEffect } from 'react';

const TimerComponent = () => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const worker = new Worker('timerWorker.js');

        worker.onmessage = (event) => {
            console.log(`event.data: ${event.data}`)
            setElapsedSeconds(event.data);
        };

        return () => {
            worker.terminate();
        };
    }, []);

    // Format seconds to HH:MM:SS
    const formatTime = (seconds) => {
        const date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substring(11, 8);
    };

    return (
        <div>
            <div className='containerBox size45 color-neogreen bold'>
                Elapsed Time: {elapsedSeconds}
            </div>
            {/* Additional JSX if needed */}
        </div>
    );
};

export default TimerComponent;