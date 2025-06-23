import React, { useRef } from 'react';

const DogWhistle = () => {

    const [tone, setTone] = React.useState(false);
    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);

    const startTone = () => {
        // Create AudioContext if not already created
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const audioCtx = audioContextRef.current;

        // Create oscillator node
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine'; // pure tone
        oscillator.frequency.setValueAtTime(12000, audioCtx.currentTime); // 12.0 kHz

        // Connect to destination and start
        oscillator.connect(audioCtx.destination);
        oscillator.start();

        oscillatorRef.current = oscillator;
        setTone(true);
    };

    const stopTone = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
        }
        setTone(false);
    };

    return (
        <div className='containerBox bg-tinted flexContainer contentCenter'>
            Dog Whistle
            <div className={`containerDetail m-5 p-20 flex2Column button bg-lite size30 ${(tone)?'bottomBorderMedium':null}`} onClick={startTone}>🐶 🤫</div>
            <div className={`containerDetail m-5 p-20 flex2Column button bg-lite size30 ${(!tone) ? 'bottomBorderMedium' : null}`} onClick={stopTone}>🐕</div>
        </div>
    );
};

export default DogWhistle;
