import React, { useEffect, useRef, useState } from 'react';

const LoungeBeatPlayer = () => {
    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(80); // Default 80 BPM, lounge style

    useEffect(() => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        return () => {
            if (ctx) ctx.close();
        };
    }, []);

    // Helper to create soft Reverb
    const createReverb = () => {
        const ctx = audioCtxRef.current;
        const convolver = ctx.createConvolver();
        const length = ctx.sampleRate * 2;
        const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
        for (let i = 0; i < impulse.numberOfChannels; i++) {
            const channelData = impulse.getChannelData(i);
            for (let j = 0; j < length; j++) {
                channelData[j] = (Math.random() * 2 - 1) * (1 - j / length); // fades out noise
            }
        }
        convolver.buffer = impulse;
        return convolver;
    };

    const swingAmount = 0.06; // 6% swing delay on even beats (adjustable)

    // NEW Jazzier Chord Pool
    const chords = [
        [261.63, 329.63, 392.00],  // C major
        [220.00, 293.66, 349.23],  // A minor
        [246.94, 329.63, 392.00],  // B diminished
        [174.61, 220.00, 261.63],  // F major
    ];

    // Kick Drum
    const playKick = (time) => {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.5);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        osc.connect(gain).connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.5);
    };

    // Snare Drum
    const playSnare = (time) => {
        const ctx = audioCtxRef.current;
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1200, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        const reverb = createReverb();

        noise.connect(noiseFilter).connect(gain).connect(reverb).connect(ctx.destination);
        noise.start(time);
        noise.stop(time + 0.2);
    };

    // Hi-Hat
    const playHiHat = (time) => {
        const ctx = audioCtxRef.current;
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(5000, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        noise.connect(noiseFilter).connect(gain).connect(ctx.destination);
        noise.start(time);
        noise.stop(time + 0.05);
    };

    const playPianoChord = (time) => {
        const ctx = audioCtxRef.current;
        const selectedChord = chords[Math.floor(Math.random() * chords.length)];

        selectedChord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const reverb = createReverb();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.12, time);
            gain.gain.linearRampToValueAtTime(0.0001, time + 2.5);

            osc.connect(gain).connect(reverb).connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 2.5);
        });
    };

    // Deep Smooth Bass
    const playBass = (time) => {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, time); // Very low A

        gain.gain.setValueAtTime(0.5, time);
        gain.gain.linearRampToValueAtTime(0.0001, time + 2);

        osc.connect(gain).connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 2);
    };

    const schedule = (startTime) => {
        const ctx = audioCtxRef.current;
        const beatDuration = 60 / tempo;
        const barDuration = beatDuration * 4;

        for (let bar = 0; bar < 2; bar++) {
            const barStart = startTime + bar * barDuration;

            // Kick drum (basic on beats 1 and 3)
            playKick(barStart);
            playKick(barStart + beatDuration * 2);

            // Snare on 2 and 4
            playSnare(barStart + beatDuration);
            playSnare(barStart + beatDuration * 3);

            // Hi-Hats with Swing
            for (let beat = 0; beat < 4; beat++) {
                const swingOffset = beat % 2 === 0 ? 0 : beatDuration * swingAmount;
                playHiHat(barStart + beat * beatDuration + swingOffset);
            }

            // Piano chord
            playPianoChord(barStart);

            // Bass hit
            playBass(barStart);
        }
    };

    const startLoop = () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state !== 'running') ctx.resume();

        const now = ctx.currentTime;
        schedule(now);

        intervalRef.current = setInterval(() => {
            schedule(ctx.currentTime);
        }, (60 / tempo) * 4 * 2 * 1000); // two bars long
    };

    const stopLoop = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    const togglePlay = () => {
        if (!isPlaying) {
            startLoop();
        } else {
            stopLoop();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className='containerBox'>
            <div className='containerBox'>🎶 Lounge Beat</div>
            <div>
                <button onClick={togglePlay} className='containerBox button bg-green width-100-percent'>
                    {isPlaying ? 'Stop' : 'Start'}
                </button>
            </div>
            <div className='containerBox bg-lite'>
                <label>Tempo: {tempo} BPM</label>
                <input
                    type='range'
                    min='60'
                    max='140'
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className='width-100-percent'
                />
            </div>
        </div>
    );
};

export default LoungeBeatPlayer;