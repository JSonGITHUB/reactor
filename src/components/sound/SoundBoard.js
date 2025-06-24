import React, { useState, useEffect } from 'react';
import Sounds from './Sounds';
import getKey from '../utils/KeyGenerator';
import Selector from '../forms/FunctionalSelector';
import Breathing from '../breathing/Breathing';
import BreathingPath from '../breathing/BreathingPath';
import AnimatedLine from '../breathing/AnimatedLine';
import LoungeBeatPlayer from './LoungeBeatPlayer';
import DogWhistle from './DogWhistle';

const SoundBoard = () => {

    const [duration, setDuration] = useState();
    const times = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 'Continuous'];

    const boardItems = [
        {
            //title: '532 Hz (ADHD)',
            title: 'ADHD (532Hz)',
            sound: 'Hz532'
        },
        {
            //title: '174 Hz (lower body)',
            title: 'lower body (174Hz)',
            sound: 'Hz174'
        },
        {
            //title: '285 Hz (tissues and organs)',
            title: 'organs (285Hz)',
            sound: 'Hz285'
        },
        {
            //title: '396 Hz (fear and guilt)',
            title: 'fear (396Hz)',
            sound: 'Hz396'
        },
        {
            //title: '417 Hz (change)',
            title: 'change (417Hz)',
            sound: 'Hz417'
        },
        {
            //title: '432 Hz (anxiety, stress, headaches and tension)',
            title: 'anxiety (432Hz)',
            sound: 'Hz432'
        },
        {
            //title: '528 Hz (DNA repair, sleep, stress)',
            title: 'stress (528Hz)',
            sound: 'Hz528'
        },
        {
            //title: '639 Hz (relationships)',
            title: 'relationships (639Hz)',
            sound: 'Hz639'
        },
        {
            //title: '741 Hz (detoxify)',
            title: 'detoxify (741Hz)',
            sound: 'Hz741'
        },
        {
            //title: '777 Hz (fear and anxiety, and nervous system)',
            title: 'nervous system (777Hz)',
            sound: 'Hz777'
        },
        {
            //title: '852 Hz (spirituality and connect to the universe)',
            title: 'spirituality (852Hz)',
            sound: 'Hz852'
        },
        {
            //title: '963 Hz (consciousness and wisdom)',
            title: 'consciousness (963Hz)',
            sound: 'Hz963'
        },
        {
            title: 'Binuaral Beat',
            sound: 'binuaralBeat'
        },
        {
            title: 'Isochronic',
            sound: 'isochronic'
        },
        {
            title: 'Machine Gun',
            sound: 'machineGun'
        },
        {
            title: 'AK-47',
            sound: 'ak47'
        },
        {
            title: 'White Noise 1',
            sound: 'whiteNoise'
        },
        {
            title: 'White Noise 2',
            sound: 'water'
        },
        {
            title: 'Boop',
            sound: 'boop'
        },
        {
            title: 'Siren',
            sound: 'siren'
        },
        {
            title: 'Bell',
            sound: 'bell'
        },
        {
            title: 'Soft Bell',
            sound: 'softBell'
        },
        {
            title: 'Purr',
            sound: 'catPurr'
        },
        {
            title: 'Beep',
            sound: 'beep'
        },
        {
            title: 'Drip',
            sound: 'drip'
        },
        {
            title: 'Water',
            sound: 'water'
        },
        {
            title: 'Ping',
            sound: 'ping'
        },
        {
            title: 'Clank',
            sound: 'clank'
        },
        {
            title: 'Tuning Up',
            sound: 'tuningUp'
        },
        {
            title: 'Tuning Down',
            sound: 'tuningDown'
        },
        {
            title: 'Bamboo Wind Chime',
            sound: 'bambooWindChime'
        }
    ]
    useEffect(() => {
        setDuration(5);
    }, []);
    useEffect(() => {
        console.log(`Duration: ${duration} seconds`);
    }, [duration]);

    const changeDuration = (dontCare, notConcerned, value) => setDuration(value);
    const playSound = (sound) => {
        console.log(`SoundBoard => ${sound} - Duration: ${duration} seconds`)
        if (typeof Sounds[sound] === 'function' && duration === 'Continuous') {
            Sounds[sound](1000*1000); // Call the function dynamically using bracket notation
        } else if (typeof Sounds[sound] === 'function') {
            Sounds[sound](duration*1000); // Call the function dynamically using bracket notation
        } else {
            console.error(`Function ${sound} does not exist in Sounds`);
        }
    }
    return (
        <div>
            <div className='containerBox flexContainer centerVertical'>
                <div className='containerBox flex2Column color-yellow contentRight'>
                    Duration:
                </div>
                <div className='flex2Column color-yellow pr-10 contentLeft'>
                    <Selector
                        groupTitle='time'
                        label='Session time:'
                        items={times}
                        selected={duration}
                        onChange={changeDuration}
                        fontSize='25'
                        padding='10px'
                        width='100%'
                    />
                </div>
            </div>
            <DogWhistle />
            <LoungeBeatPlayer />
            <div className='containerBox grid300'>
                {
                    boardItems.map((sound, index) => <div
                        title={sound.title}
                        key={getKey(`${sound.title}${index}`)}
                        className='containerDetail p-20 button'
                        onClick={() => playSound(sound.sound)}
                    >
                        {sound.title}
                    </div>
                    )
                }
            </div>
            {/*}
            <div className='containerBox'>
                <div className='mb--200'>
                    <div className='width-100-percent contentCenter'>
                            <AnimatedLine />
                        </div>
                </div>
                <div className='containerBox flexContainer'>
                    <div className='flex2Column'></div>
                    <div className='flexColumn'>
                        <Breathing />
                    </div>
                    <div className='flex2Column'></div>
                </div>
            </div>
            */}
        </div>
    );
};

export default SoundBoard;