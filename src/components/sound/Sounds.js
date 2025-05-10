import { isIOS } from '../utils/iOSChecker';

var audioContext = new AudioContext(),
    oscillator;

var audioClank = new Audio();
//audioClank.src = 'clank.m4a';
//audioClank.preload = 'auto';

var audioSoftBell = new Audio();
//audioSoftBell.src = 'softBell.m4a';
//audioSoftBell.preload = 'auto';

var audioDrip = new Audio();
//audioDrip.src = 'drip.m4a';
//audioDrip.preload = 'auto';

var audioTuningUp = new Audio();
//audioTuningUp.src = 'tuningUp.m4a';
//audioTuningUp.preload = 'auto';

var audioTuningDown = new Audio();
//audioTuningDown.src = 'tuningDown.m4a';
//audioTuningDown.preload = 'auto';

const boop = (winner = 0, score = 1) => {

    // Create an oscillator node
    oscillator = audioContext.createOscillator();

    // Connect the oscillator to the audio context's destination (your speakers)
    oscillator.connect(audioContext.destination);

    const treeScores = [5, 10, 55, 60, 105, 110, 155, 160];
    const treeTotals = [50, 100, 150, 200];
    const treeClosed = () => treeTotals.includes(score);
    const isTree = () => treeScores.includes(score);
    const isTree1 = () => (score > 0 && score < 55);
    const isTree2 = () => (score > 50 && score < 105);
    const isTree3 = () => (score > 100 && score < 155);
    const isTree4 = () => (score > 150);
    const isTreeComplete = () => (score > 150);
    // Set the oscillator type to 'sine' (you can experiment with other types like 'square', 'sawtooth', 'triangle')

    const getType = () => (score === winner || treeClosed()) ? 'sawtooth' : 'triangle';
    oscillator.type = getType();

    //const note = (treeClosed()) ? 1000 : (440 + (score * 2));
    const note = (treeClosed()) ? 1000 : 440;
    // Set the frequency (Hz) - in this case, 440 Hz is an 'A' note
    oscillator.frequency.setValueAtTime(note, audioContext.currentTime);

    // Start the oscillator
    oscillator.start();

    const soundLength = (score === winner) ? 1 : 0.05;
    console.log(`soundLength: ${soundLength} score: ${score} winner: ${winner}`)
    // Stop the oscillator after 0.5 seconds (you can adjust this time)
    oscillator.stop(audioContext.currentTime + soundLength);
}

var audioContext = new AudioContext(),
    oscillator1;

const siren = (soundLength) => {

    let highPitch = false;

    const getHighPitch = () => {
        highPitch = !highPitch;
        return highPitch;
    }

    //const AudioContext = window.AudioContext || window.webkitAudioContext;
    //const audioContext = new AudioContext();

    oscillator1 = audioContext.createOscillator();
    oscillator1.type = 'sine'; // First oscillator is a sine wave
    oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);

    const oscillator2 = audioContext.createOscillator();
    oscillator2.type = 'sine'; // Second oscillator is a square wave
    oscillator2.frequency.setValueAtTime(400, audioContext.currentTime);

    // Gain nodes to control volume
    const gainNode1 = audioContext.createGain();
    const gainNode2 = audioContext.createGain();

    oscillator1.connect(gainNode1);
    oscillator2.connect(gainNode2);

    gainNode1.connect(audioContext.destination);
    gainNode2.connect(audioContext.destination);

    oscillator1.start();
    oscillator2.start();

    const sirenInterval = setInterval(() => {
        const frequency = (getHighPitch()) ? 1200 : 400; // Random frequency between 400 and 1200 Hz
        oscillator1.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(frequency, audioContext.currentTime);
    }, 100); // Change frequency every 10th of a second

    // Stop the siren after 10 seconds
    setTimeout(() => {
        clearInterval(sirenInterval);
        oscillator1.stop();
        oscillator2.stop();
    }, soundLength);

}
const bell = (soundLength = 5) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Use a sine wave for a soft sound

    // Create a gain node to control the volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1; // Set the volume to a soft level

    // Connect the oscillator to the gain node and the gain node to the destination (speakers)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();

    // Stop the oscillator after a short duration (e.g., 1 second)
    setTimeout(() => {
        oscillator.stop();
    }, (soundLength));
    oscillator.stop(audioContext.currentTime + soundLength);
}
const catPurr = (soundLength) => {
    const playRealisticCatPurr = (soundLength) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Base purr oscillator (low-frequency)
        const purrOscillator = audioCtx.createOscillator();
        purrOscillator.type = "sawtooth"; // Rough, deep purr texture
        purrOscillator.frequency.setValueAtTime(5, audioCtx.currentTime); // Base purr ~50Hz

        // Low-Frequency Oscillator (LFO) for amplitude modulation
        const lfo = audioCtx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(20, audioCtx.currentTime); // Purring pulsation (~20 Hz)

        // Secondary LFO for gurgling effect
        const gurgleLFO = audioCtx.createOscillator();
        gurgleLFO.type = "triangle";
        gurgleLFO.frequency.setValueAtTime(4, audioCtx.currentTime); // Slow irregular gurgling effect

        // Gain nodes
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // Start silent

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(0.1, audioCtx.currentTime); // Subtle amplitude modulation

        const gurgleGain = audioCtx.createGain();
        gurgleGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start with no gurgle

        // Connect LFOs
        lfo.connect(lfoGain.gain);
        gurgleLFO.connect(gurgleGain.gain);

        // Connect nodes
        purrOscillator.connect(gainNode);
        lfoGain.connect(gainNode.gain);
        gurgleGain.connect(gainNode.gain);
        gainNode.connect(audioCtx.destination);

        // Function to adjust the purr frequency as volume rises
        const schedulePurrCycle = (soundLength) => {
            const now = audioCtx.currentTime;

            // Fade in: Increase volume over 1.5 sec
            gainNode.gain.linearRampToValueAtTime(0.25, now + 1.5);

            // Slow down the purr as volume rises
            purrOscillator.frequency.linearRampToValueAtTime(30, now + 1.5); // Slow deep purr

            // Hold volume for 2 seconds
            gainNode.gain.setValueAtTime(0.25, now + 3.5);

            // Fade out: Decrease volume over 1.5 sec
            gainNode.gain.linearRampToValueAtTime(0, now + 5);

            // Add gurgling effect as it fades out
            gurgleGain.gain.linearRampToValueAtTime(0.05, now + 4.5);
            gurgleLFO.frequency.linearRampToValueAtTime(6, now + 4.5); // Faster irregular gurgle

            // Reset purr speed for the next cycle
            setTimeout(() => {
                purrOscillator.frequency.setValueAtTime(5, audioCtx.currentTime); // Reset to normal
                gurgleGain.gain.setValueAtTime(0, audioCtx.currentTime); // Reset gurgle
                gurgleLFO.frequency.setValueAtTime(4, audioCtx.currentTime); // Slow gurgle
            }, 5000);

            // Repeat the cycle
            setTimeout(schedulePurrCycle, 5000);
        }

        // Start oscillators and schedule the cycle
        purrOscillator.start();
        lfo.start();
        gurgleLFO.start();
        schedulePurrCycle();

        return {
            stop: () => {
                purrOscillator.stop();
                lfo.stop();
                gurgleLFO.stop();
                audioCtx.close();
            },
            audioCtx
        };
    }

    // Example usage:
    const purr = playRealisticCatPurr();

    // Stop after 20 seconds
    setTimeout(() => {
        purr.stop();
    }, soundLength);

}
const softBell = (soundLength = 1) => {
    if (isIOS()) {
        audioSoftBell.play();
    } else {
        // Create an oscillator node
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'triangle'; // Use a triangle wave for a softer sound

        // Create a gain node to control the volume
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Initial volume is 0
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1); // Ramp up to volume gradually
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1); // Ramp down to silence gradually

        // Connect the oscillator to the gain node and the gain node to the destination (speakers)
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set the frequency of the oscillator (adjust as needed)
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);

        // Start the oscillator
        oscillator.start();

        // Stop the oscillator after a short duration (e.g., 1 second)
        setTimeout(() => {
            oscillator.stop();
        }, (Number(soundLength)));
        oscillator.stop(audioContext.currentTime + Number(soundLength));
    }
}
const beep = (soundLength) => {
    // Create an AudioContext instance
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create an oscillator node
    const oscillator = audioContext.createOscillator();

    // Set oscillator parameters
    oscillator.type = 'sine'; // Sine wave for a smooth ticking sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequency of the tick sound

    // Connect the oscillator to the audio output
    oscillator.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();

    // Stop the oscillator after a short duration to create a ticking effect
    setTimeout(() => {
        oscillator.stop();
    }, 100); // Duration of the tick sound in milliseconds (adjust as needed)
}
const whiteNoise = (durationInSeconds) => {
    console.log(`Sounds => whiteNoise => durationInSeconds: ${durationInSeconds}`)
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create a buffer to store white noise data
    const bufferSize = durationInSeconds * audioContext.sampleRate; // Double the sample rate for a 2-second buffer
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Fill the buffer with random white noise data
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Generate random values between -1 and 1
    }

    // Create a buffer source node
    const bufferSource = audioContext.createBufferSource();

    // Set the buffer to the white noise buffer
    bufferSource.buffer = noiseBuffer;

    // Connect the buffer source to the AudioContext destination (speakers)
    bufferSource.connect(audioContext.destination);

    // Start playing the white noise
    bufferSource.start();

    // Stop the white noise after a duration (adjust as needed)
    setTimeout(() => {
        bufferSource.stop();
        audioContext.close();
    }, (Number(durationInSeconds))); // Adjust as needed
}
const drip = (soundLength) => {
    if (isIOS()) {
        audioDrip.play();
    } else {
        // Create AudioContext
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();

        // Create oscillator node for the initial drip sound
        const initialDripOscillator = audioContext.createOscillator();
        initialDripOscillator.type = 'sine'; // Use a sine wave for a smooth drip sound
        initialDripOscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // Adjust frequency as needed

        // Create gain node for the initial drip sound
        const initialDripGain = audioContext.createGain();
        initialDripGain.gain.setValueAtTime(1, audioContext.currentTime); // Start with full volume

        // Create envelope for the initial drip sound
        initialDripGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5); // Decaying volume envelope

        // Connect oscillator to gain node
        initialDripOscillator.connect(initialDripGain);

        // Connect gain node to AudioContext destination (speakers)
        initialDripGain.connect(audioContext.destination);

        // Start the initial drip sound
        initialDripOscillator.start();

        // Create a delay for the next drip sound
        setTimeout(() => {
            // Create oscillator node for the subsequent drip sound
            const subsequentDripOscillator = audioContext.createOscillator();
            subsequentDripOscillator.type = 'sine'; // Use a sine wave for a smooth drip sound
            subsequentDripOscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Adjust frequency as needed

            // Create gain node for the subsequent drip sound
            const subsequentDripGain = audioContext.createGain();
            subsequentDripGain.gain.setValueAtTime(0.5, audioContext.currentTime); // Adjust volume as needed

            // Create envelope for the subsequent drip sound
            subsequentDripGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 100); // Decaying volume envelope

            // Connect oscillator to gain node
            //subsequentDripOscillator.connect(subsequentDripGain);

            // Connect gain node to AudioContext destination (speakers)
            subsequentDripGain.connect(audioContext.destination);

            // Start the subsequent drip sound
            subsequentDripOscillator.start();
            // Stop the subsequent drip sound after a short duration
            setTimeout(() => {
                subsequentDripOscillator.stop();
                audioContext.close();
            }, 300); // Adjust as needed
        }, 500); // Adjust as needed
    }
}
const water = (soundLength) => {
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create a BiquadFilterNode for filtering the white noise
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'lowpass'; // Use a lowpass filter to simulate the sound of water over rocks
    filterNode.frequency.value = 500; // Lower cutoff frequency for a gentler effect

    // Create a GainNode for controlling the overall volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5; // Adjust the gain as needed to control volume

    // Create a buffer to store white noise data
    const bufferSize = 10 * audioContext.sampleRate; // 10-second buffer
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Fill the buffer with random white noise data
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Generate random values between -1 and 1
    }

    // Create a buffer source node
    const bufferSource = audioContext.createBufferSource();
    bufferSource.loop = true; // Loop the buffer source to create continuous sound

    // Set the buffer to the white noise buffer
    bufferSource.buffer = noiseBuffer;

    // Connect the buffer source to the filter node
    bufferSource.connect(filterNode);

    // Connect the filter node to the gain node
    filterNode.connect(gainNode);

    // Connect the gain node to the AudioContext destination (speakers)
    gainNode.connect(audioContext.destination);

    // Start playing the trickling stream
    bufferSource.start();

    // Function to modulate the filter cutoff frequency to mimic the sound of water flowing over rocks
    const modulateFilterFrequency = () => {
        const baseFrequency = 300; // Base frequency for the modulation
        const modulationDepth = 200; // Depth of modulation
        const modulationRate = 0.1; // Modulation rate
        const time = audioContext.currentTime;

        // Calculate the modulation frequency
        const modulationFrequency = baseFrequency + modulationDepth * Math.sin(modulationRate * time);

        // Apply modulation to the filter cutoff frequency
        filterNode.frequency.setValueAtTime(modulationFrequency, time);

        // Schedule the next modulation
        setTimeout(modulateFilterFrequency, 10); // Update the modulation every 10 milliseconds
    };

    // Start modulating the filter frequency
    modulateFilterFrequency();

    // Stop the trickling stream after a duration (optional)
     setTimeout(() => {
       bufferSource.stop();
       audioContext.close();
     }, soundLength); // Adjust as needed
}
const ping = (soundLength) => {
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create an oscillator node
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Use a sine wave for a smooth ping sound

    // Set frequency for the ping sound (adjust as needed)
    const frequency = 400; // Hz
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Create a gain node for controlling the volume of the ping
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    // Connect oscillator to gain node
    oscillator.connect(gainNode);

    // Create a delay node
    const delayNode = audioContext.createDelay();
    delayNode.delayTime.value = 0.5; // Set delay time (adjust as needed)

    // Connect gain node to delay node
    gainNode.connect(delayNode);

    // Connect delay node back to gain node (feedback loop)
    delayNode.connect(gainNode);

    // Connect gain node to AudioContext destination (usually speakers)
    gainNode.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();

    // Ramp up the gain to create the ping effect
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1); // Adjust the ramp time as needed

    // Ramp down the gain to fade out the ping
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5); // Adjust the ramp time and duration as needed

    // Stop the oscillator and close the AudioContext after the ping has faded out
    setTimeout(() => {
        oscillator.stop();
        audioContext.close();
    }, 2000); // Adjust the duration as needed
}
const clank = (soundLength) => {
    if (isIOS()) {
        audioClank.play();
    } else {
        // Create AudioContext
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();

        // Create an oscillator node
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'triangle'; // Using triangle wave for a sharper sound

        // Set higher frequency for the glass clank sound
        const frequency = 1000; // Hz
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Create a gain node for controlling the volume of the clank
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);

        // Connect oscillator to gain node
        oscillator.connect(gainNode);

        // Connect gain node to AudioContext destination (usually speakers)
        gainNode.connect(audioContext.destination);

        // Start the oscillator
        oscillator.start();

        // Ramp up the gain to create the clank effect
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05); // Adjust the ramp time as needed

        // Ramp down the gain to fade out the clank quickly
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2); // Adjust the ramp time and duration as needed

        // Stop the oscillator and close the AudioContext after the clank has faded out
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, 300); // Adjust the duration as needed
    }
}
const tuningUp = (soundLength) => {
    if (isIOS()) {
        audioTuningUp.play();
    } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();

        const initialOscillator = audioContext.createOscillator();
        initialOscillator.type = 'sine';

        const initialFrequency = 440;
        initialOscillator.frequency.setValueAtTime(initialFrequency, audioContext.currentTime);
        const initialGainNode = audioContext.createGain();
        initialOscillator.connect(initialGainNode);
        initialGainNode.connect(audioContext.destination);

        initialOscillator.start();
        initialGainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        initialGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 5); // Ramp down volume after 5 seconds



        // Stop both oscillators and close the AudioContext after 15 seconds (5 seconds + 10 seconds)
        setTimeout(() => {
            initialOscillator.stop();
            audioContext.close();
        }, 5000); // Adjust the total duration as needed
    }
}
const isochronic = (soundLength) => {
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create oscillator nodes for the left and right ears
    const leftOscillator = audioContext.createOscillator();
    const rightOscillator = audioContext.createOscillator();

    // Set the frequencies for the left and right ears
    const leftFrequency = 150; // Hz
    const rightFrequency = 154; // Hz

    leftOscillator.frequency.setValueAtTime(leftFrequency, audioContext.currentTime);
    rightOscillator.frequency.setValueAtTime(rightFrequency, audioContext.currentTime);

    // Create gain nodes for controlling the volume of each channel
    const leftGainNode = audioContext.createGain();
    const rightGainNode = audioContext.createGain();

    // Create stereo panner nodes to pan the sound to the left and right
    const leftPanner = audioContext.createStereoPanner();
    const rightPanner = audioContext.createStereoPanner();

    // Pan the left oscillator to the left ear
    leftPanner.pan.setValueAtTime(-1, audioContext.currentTime);
    // Pan the right oscillator to the right ear
    rightPanner.pan.setValueAtTime(1, audioContext.currentTime);

    // Connect the oscillators to the gain nodes
    leftOscillator.connect(leftGainNode);
    rightOscillator.connect(rightGainNode);

    // Connect the gain nodes to the panner nodes
    leftGainNode.connect(leftPanner);
    rightGainNode.connect(rightPanner);

    // Connect the panner nodes to the AudioContext destination (speakers)
    leftPanner.connect(audioContext.destination);
    rightPanner.connect(audioContext.destination);

    // Start the oscillators
    leftOscillator.start();
    rightOscillator.start();

    // Function to stop the binaural beat
    const stopBinauralBeat = () => {
        leftOscillator.stop();
        rightOscillator.stop();
        audioContext.close();
    }
    setTimeout(() => {
        stopBinauralBeat();
    }, soundLength);

    // Return the stop const to allow stopping the binaural beat
    return stopBinauralBeat;
}
const playConstantTone = (frequency) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine"; // Creates a smooth waveform
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); // Set frequency
    oscillator.connect(gainNode);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // Lower volume to prevent loud sound
    gainNode.connect(audioCtx.destination);

    oscillator.start(); // Start the tone

    return {
        stop: () => oscillator.stop(), // Provide a const to stop the sound
        audioCtx
    };
}
const Hz532 = (soundLength) => {
    const sound = playConstantTone(532);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}

const Hz174 = (soundLength) => {
    //Hz: Can relieve pain and stress, and is said to be particularly helpful for pain in the lower back, feet, and legs
    const sound = playConstantTone(174);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz285 = (soundLength) => {
    //Hz: Can help heal tissues and organs, and treat minor injuries and wounds
    const sound = playConstantTone(285);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}

const Hz396 = (soundLength) => {
    //Hz: Can help liberate the listener from fear and guilt
    const sound = playConstantTone(396);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz417 = (soundLength) => {
    //Hz: Can help facilitate change
    const sound = playConstantTone(417);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz432 = (soundLength) => {
    console.log(`Hz432 => soundLength: ${soundLength}`)
    //Hz: Can reduce anxiety, lower cortisol, and ease stress - related symptoms like headaches and tension
    const sound = playConstantTone(432);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz528 = (soundLength) => {
    //Hz: Can help with transformation and DNA repair, and is said to be particularly effective for improving sleep quality and reducing stress
    const sound = playConstantTone(528);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz639 = (soundLength) => {
    //Hz: Can help reconnect relationships
    const sound = playConstantTone(639);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz741 = (soundLength) => {
    //Hz: Can help detoxify and cleanse the mind and body
    const sound = playConstantTone(741);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz777 = (soundLength) => {
    //Hz: Can help ease fear and anxiety, and calm the nervous system
    const sound = playConstantTone(777);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz852 = (soundLength) => {
    //Hz: Can help rebalance spirituality and connect to the universe
    const sound = playConstantTone(852);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}
const Hz963 = (soundLength) => {
    //Hz: Can help increase consciousness and wisdom 
    const sound = playConstantTone(963);
    setTimeout(() => {
        sound.stop();
        sound.audioCtx.close();
    }, soundLength);
}

const play25kHz = (soundLength) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create an oscillator
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine'; // Sine wave (can be 'square', 'sawtooth', 'triangle')
    oscillator.frequency.setValueAtTime(25000, audioCtx.currentTime); // 25kHz

    // Connect to the audio output
    oscillator.connect(audioCtx.destination);

    // Start the oscillator
    oscillator.start();

    /* return () => {
        oscillator.stop();
        oscillator.disconnect();
    }; */
    const stopDogWhistle = () => {
        oscillator.stop();
        oscillator.disconnect();
        //audioContext.close();
    }
    setTimeout(() => {
        stopDogWhistle();
    }, soundLength);
}



const binuaralBeat = (soundLength) => {
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create oscillator nodes for the left and right ears
    const leftOscillator = audioContext.createOscillator();
    const rightOscillator = audioContext.createOscillator();

    // Set the frequencies for the left and right ears
    const leftFrequency = 108; // Hz
    const rightFrequency = 112; // Hz

    leftOscillator.frequency.setValueAtTime(leftFrequency, audioContext.currentTime);
    rightOscillator.frequency.setValueAtTime(rightFrequency, audioContext.currentTime);

    // Create gain nodes for controlling the volume of each channel
    const leftGainNode = audioContext.createGain();
    const rightGainNode = audioContext.createGain();

    // Create stereo panner nodes to pan the sound to the left and right
    const leftPanner = audioContext.createStereoPanner();
    const rightPanner = audioContext.createStereoPanner();

    // Pan the left oscillator to the left ear
    leftPanner.pan.setValueAtTime(-1, audioContext.currentTime);
    // Pan the right oscillator to the right ear
    rightPanner.pan.setValueAtTime(1, audioContext.currentTime);

    // Connect the oscillators to the gain nodes
    leftOscillator.connect(leftGainNode);
    rightOscillator.connect(rightGainNode);

    // Connect the gain nodes to the panner nodes
    leftGainNode.connect(leftPanner);
    rightGainNode.connect(rightPanner);

    // Connect the panner nodes to the AudioContext destination (speakers)
    leftPanner.connect(audioContext.destination);
    rightPanner.connect(audioContext.destination);

    // Start the oscillators
    leftOscillator.start();
    rightOscillator.start();

    // Function to stop the binaural beat
    const stopBinauralBeat = () => {
        leftOscillator.stop();
        rightOscillator.stop();
        audioContext.close();
    }
    setTimeout(() => {
        stopBinauralBeat();
    }, soundLength);

    // Return the stop const to allow stopping the binaural beat
    return stopBinauralBeat;
}
const machineGun = (soundLength) => {
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create a gain node for controlling the volume
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);

    // Connect the gain node to AudioContext destination (usually speakers)
    gainNode.connect(audioContext.destination);

    // Start the machine gun sound
    const interval = 100; // Time between shots in milliseconds
    const shots = 20; // Number of shots
    const duration = interval * shots; // Total duration of the machine gun sound

    // Function to play a single shot
    const playShot = () => {
        // Create a buffer source node for white noise
        const noiseSource = audioContext.createBufferSource();

        // Create a buffer to store white noise data for a short burst
        const bufferSize = 0.05 * audioContext.sampleRate; // 0.05 seconds of noise
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Fill the buffer with random white noise data
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // Generate random values between -1 and 1
        }

        // Set the buffer to the noise buffer
        noiseSource.buffer = noiseBuffer;

        // Create an oscillator for the deeper tone
        const toneOscillator = audioContext.createOscillator();
        toneOscillator.type = 'sine'; // Use a sine wave for a deeper tone
        toneOscillator.frequency.setValueAtTime(100, audioContext.currentTime); // Set the frequency for the deeper tone

        // Connect the oscillator to the gain node
        toneOscillator.connect(gainNode);

        // Start the noise and tone oscillators
        noiseSource.start();
        toneOscillator.start();

        // Stop the noise and tone oscillators after a short duration
        setTimeout(() => {
            noiseSource.stop();
            toneOscillator.stop();
        }, 40); // Adjust the duration of each shot as needed
    };

    // Play the machine gun sound
    for (let i = 0; i < shots; i++) {
        setTimeout(playShot, i * interval);
    }

    // Stop the machine gun sound and close the AudioContext after the total duration
    setTimeout(() => {
        audioContext.close();
    }, soundLength);
}
const ak47 = (soundLength) => {
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create a gain node for controlling the volume
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);

    // Connect the gain node to AudioContext destination (usually speakers)
    gainNode.connect(audioContext.destination);

    // Start the AK-47 sound
    const interval = 50; // Time between shots in milliseconds
    const bursts = 10; // Number of bursts
    const duration = interval * bursts; // Total duration of the AK-47 sound

    // Function to play a single shot
    const playShot = () => {
        // Create a buffer source node for white noise
        const noiseSource = audioContext.createBufferSource();

        // Create a buffer to store white noise data for a short burst
        const bufferSize = 0.02 * audioContext.sampleRate; // 0.02 seconds of noise
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Fill the buffer with random white noise data
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // Generate random values between -1 and 1
        }

        // Set the buffer to the noise buffer
        noiseSource.buffer = noiseBuffer;

        // Create an oscillator for the higher-pitched tone
        const toneOscillator = audioContext.createOscillator();
        toneOscillator.type = 'sine'; // Use a sine wave for a higher-pitched tone
        toneOscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // Set the frequency for the higher-pitched tone

        // Connect the noise source and tone oscillator to the gain node
        noiseSource.connect(gainNode);
        toneOscillator.connect(gainNode);

        // Start the noise source and tone oscillator
        noiseSource.start();
        toneOscillator.start();

        // Stop the noise source and tone oscillator after a short duration
        setTimeout(() => {
            noiseSource.stop();
            toneOscillator.stop();
        }, 20); // Adjust the duration of each shot as needed
    };

    // Play the AK-47 sound with multiple bursts
    for (let i = 0; i < bursts; i++) {
        setTimeout(playShot, i * interval);
    }

    // Stop the AK-47 sound and close the AudioContext after the total duration
    setTimeout(() => {
        audioContext.close();
    }, soundLength);
}
const tuningDown = (soundLength) => {
    if (isIOS()) {
        audioTuningDown.play();
    } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();

        const deeperOscillator = audioContext.createOscillator();
        deeperOscillator.type = 'sine';

        const deeperFrequency = 220; // Hz (an octave lower than the initial tone)
        deeperOscillator.frequency.setValueAtTime(deeperFrequency, audioContext.currentTime);
        const deeperGainNode = audioContext.createGain();
        deeperOscillator.connect(deeperGainNode);
        deeperGainNode.connect(audioContext.destination);

        setTimeout(() => {
            deeperOscillator.start();
            deeperGainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Set initial volume
            deeperGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 10); // Ramp down volume after 10 seconds
        }, 1);

        // Stop both oscillators and close the AudioContext after 15 seconds (5 seconds + 10 seconds)
        setTimeout(() => {
            deeperOscillator.stop();
            audioContext.close();
        }, 5000); // Adjust the total duration as needed
    }
}
const playBambooWindChime = (pitch) => {
    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create a gain node for controlling the overall volume
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Adjust the volume as needed

    // Connect the gain node to AudioContext destination (usually speakers)
    gainNode.connect(audioContext.destination);

    // Define the frequencies for the bamboo chime tones
    const frequencies = [200 + pitch, 300 + pitch, 400 + pitch, 500 + pitch, 600 + pitch];

    // Create and connect oscillators for each bamboo chime tone
    frequencies.forEach(frequency => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // Use a sine wave for a smooth sound
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(gainNode);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 2); // Adjust the duration of each tone
    });

    // Close the AudioContext after the tones have finished playing
    setTimeout(() => {
        audioContext.close();
    }, 5000); // Adjust the total duration of the sound
    
}

// Function to generate random numbers and play the bamboo wind chime sound
const bambooWindChime = (soundLength) => {
    // Generate a random pitch value within a reasonable range
    const pitch = Math.random() * 200 - 100; // Adjust the range as needed

    // Call the const to play the bamboo wind chime sound with the random pitch
    playBambooWindChime(pitch);
}




const Sounds = {
    binuaralBeat,
    isochronic,
    Hz532,
    Hz174,
    Hz285,
    Hz396,
    Hz417,
    Hz432,
    Hz528,
    Hz639,
    Hz741,
    Hz777,
    Hz852,
    Hz963,
    play25kHz,
    machineGun,
    ak47,
    boop,
    siren,
    bell,
    softBell,
    catPurr,
    beep,
    whiteNoise,
    drip,
    water,
    ping,
    clank,
    tuningUp,
    tuningDown,
    bambooWindChime
};

export default Sounds;
