import React, { useEffect, useState } from 'react';
import './WordExploder.css';

const words = [
    'keep froth alive...',
    'play', 
    'train', 
    'track', 
    'convert', 
    'schedule', 
    'document',
    'reflect', 
    'simplify', 
    'improve'
];

const WordExploder = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stage, setStage] = useState('hidden');
    const [randomOffsets, setRandomOffsets] = useState([]);
    const [version, setVersion] = useState(0); // Force remount for sync

    const word = words[currentIndex];

    useEffect(() => {
        setStage('hidden');
        setRandomOffsets([]);

        const fadeIn = setTimeout(() => {
            setStage('fade-in');
        }, 50);

        const explode = setTimeout(() => {
            const offsets = word.split('').map(() => ({
                x: (Math.random() - 0.5) * 1,
                y: (Math.random() * 200),
                //rotation: Math.random() * 720 - 360,
            }));
            setRandomOffsets(offsets);
            setStage('explode');
        }, 1500);

        const next = setTimeout(() => {
            setCurrentIndex((i) => (i + 1) % words.length);
            setVersion((v) => v + 1); // Force fresh DOM render
        }, 2000);

        return () => {
            clearTimeout(fadeIn);
            clearTimeout(explode);
            clearTimeout(next);
        };
    }, [currentIndex, word]);

    return (
        <div className='exploder-container'>
            {word.split('').map((char, i) => (
                <span
                    key={`${char}-${i}-${version}`} // force remount with version
                    className={`letter ${stage}`}
                    style={
                        stage === 'explode'
                            ? {
                                transform: `translate(${randomOffsets[i]?.x || 0}px, ${randomOffsets[i]?.y || 0}px) rotate(0deg)`,
                                opacity: 0,
                            }
                            : {}
                    }
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </div>
    );
};

export default WordExploder;