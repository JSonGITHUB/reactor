import React, { useState, useEffect, useRef, useMemo } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import { motion } from 'framer-motion';

const animationations = [
    { name: 'Up and Down', direction: 'vertical', sound: 'pitch' },
    { name: 'Left and Right', direction: 'horizontal', sound: 'pan' },
    { name: 'Zoom In and Out', direction: 'scale', sound: 'volume' },
    { name: 'Diagonal Top-Left to Bottom-Right', direction: 'diagonal1', sound: 'complex' },
    { name: 'Diagonal Top-Right to Bottom-Left', direction: 'diagonal2', sound: 'complex' },
    { name: 'Circle Motion', direction: 'circle', sound: 'wave' },
    { name: 'Figure Eight', direction: 'figure8', sound: 'complex' },
    { name: 'Square Path', direction: 'square', sound: 'step' },
    { name: 'Zigzag', direction: 'zigzag', sound: 'chirp' },
    { name: 'Random Darting', direction: 'random', sound: 'random' },
];

const EyeExercises = () => {
    const [selectedAnimations, setSelectedAnimations] = useState(animationations.map(() => true));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(10); // seconds
    const [countdown, setCountdown] = useState(duration);
    const [collapse, setCollapse] = useState(true);
    const intervalRef = useRef(null);
    const audioCtxRef = useRef(null);
    const oscillatorRef = useRef(null);

    const centerX = useMemo(() => window.innerWidth / 2, []);
    const centerY = useMemo(() => window.innerHeight / 2, []);
    const offsetX = useMemo(() => centerX, []);
    const offsetY = useMemo(() => centerY, []);

    const useViewportAnimations = () => {
        
        console.log('window.innerWidth:', window.innerWidth, 'window.innerHeight:', window.innerHeight, 'centerX:', centerX, 'centerY:', centerY, 'offsetX:', offsetX, 'offsetY:', offsetY);
        return {
            vertical: {
                y: [0, -offsetY, 0, offsetY, 0],
                x: [centerX, centerX, centerX, centerX, centerX],
                scale: [1, 1, 1, 1, 1],
            },
            horizontal: {
                x: [centerX, centerX - offsetX, centerX, (centerX + offsetX) - 100, centerX],
                y: [0, 0, 0, 0, 0],
                scale: [1, 1, 1, 1, 1],
            },

            scale: {
                scale: [1, 10, 1, 10, 1],
                y: [0, 0, 0, 0, 0],
                x: [centerX, centerX, centerX, centerX, centerX],
            },
            diagonal1: {
                x: [centerX, centerX - offsetX, centerX, (centerX + offsetX) - 100, centerX],
                y: [0, offsetY, 0, -offsetY, 0],
                scale: [1, 1, 1, 1, 1],
            },
            diagonal2: {
                x: [centerX, -offsetX + centerX, centerX, offsetX + centerX, centerX],
                y: [0, -offsetY, 0, offsetY, 0],
                scale: [1, 1, 1, 1, 1],
            },
            circle: {
                y: [centerY - offsetY, -offsetY, centerY - offsetY, offsetY, centerY - offsetY],
                x: [0, centerX, (centerX + offsetX) - 100, centerX, 0],
                //rotate: [0, 360] 
            },
            figure8: {
                x: [0, offsetX * .5, centerX, centerX + (offsetX * .5), centerX + (offsetX * .5), (centerX + offsetX), centerX + (offsetX * .5), centerX + (offsetX * .5), 0],
                y: [centerY, 0 - offsetY, centerY, offsetY, 0 - offsetY, centerY, centerY, offsetY*.5, centerY],
            },
            square: {
                x: [0, offsetX, offsetX, 0, 0],
                y: [0, 0, offsetY, offsetY, 0],
            },
            zigzag: {
                x: [0, offsetX * 0.4, -offsetX * 0.4, offsetX * 0.4, -offsetX * 0.4, 0],
            },
            random: {
                x: [0, offsetX * 0.3, -offsetX * 0.5, offsetX * 0.2, -offsetX * 0.2, 0],
                y: [0, -offsetY * 0.3, offsetY * 0.5, -offsetY * 0.2, offsetY * 0.2, 0],
            },
        };
    };


    useEffect(() => {
        if (isPlaying && countdown > 0) {
            intervalRef.current = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            handleNext();
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, countdown]);

    useEffect(() => {
        setCountdown(duration);
    }, [currentIndex, duration]);

    useEffect(() => {
        return () => stopSound();
    }, [currentIndex, isPlaying]);

    const playSound = (type) => {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        switch (type) {
            case 'pitch':
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + duration);
                break;
            case 'pan': {
                const panNode = new StereoPannerNode(ctx, { pan: -1 });
                osc.connect(panNode).connect(gain).connect(ctx.destination);
                panNode.pan.linearRampToValueAtTime(1, ctx.currentTime + duration);
                break;
            }
            case 'volume':
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(1, ctx.currentTime + duration);
                break;
            default:
                gain.gain.value = 0.2;
                break;
        }

        if (type !== 'pan') osc.connect(gain).connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
        oscillatorRef.current = osc;
    };

    const stopSound = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            } catch { }
        }
    };

    const handleToggleSelect = (index) => {
        const updated = [...selectedAnimations];
        updated[index] = !updated[index];
        setSelectedAnimations(updated);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleNext = () => {
        const nextIndex = findNextIndex(currentIndex);
        setCurrentIndex(nextIndex);
        setCountdown(duration);
    };
    const handleBack = () => {
        const prevIndex = findPrevIndex(currentIndex);
        setCurrentIndex(prevIndex);
        setCountdown(duration);
    };

    const findNextIndex = (current) => {
        for (let i = 1; i <= animationations.length; i++) {
            const next = (current + i) % animationations.length;
            if (selectedAnimations[next]) return next;
        }
        return current;
    };

    const findPrevIndex = (current) => {
        for (let i = 1; i <= animationations.length; i++) {
            const prev = (current - i + animationations.length) % animationations.length;
            if (selectedAnimations[prev]) return prev;
        }
        return current;
    };

    const current = animationations[currentIndex];

    /* 
    const getAnimation = (direction) => {
        switch (direction) {
            case 'vertical': return { y: [0, -50, 0, 50, 0] };
            case 'horizontal': return { x: [0, -50, 0, 50, 0] };
            case 'scale': return { scale: [1, 1.5, 1, 0.5, 1] };
            case 'diagonal1': return { x: [0, 50, 0, -50, 0], y: [0, 50, 0, -50, 0] };
            case 'diagonal2': return { x: [0, -50, 0, 50, 0], y: [0, 50, 0, -50, 0] };
            case 'circle': return { rotate: [0, 360] };
            case 'figure8': return { x: [0, 30, 0, -30, 0], y: [0, 30, 0, -30, 0] };
            case 'square': return { x: [0, 50, 50, 0, 0], y: [0, 0, 50, 50, 0] };
            case 'zigzag': return { x: [0, 30, -30, 30, -30, 0] };
            case 'random': return { x: [0, 20, -40, 10, -10, 0], y: [0, -20, 40, -10, 10, 0] };
            default: return {};
        }
    }
    const getEdgeAnimation = (direction) => {
        switch (direction) {
            case 'horizontal':
                return { x: [200, 0, 200, centerX, 200] };
            case 'vertical':
                return { y: [200, 0, 200, centerX, 200] };
            default:
                return {};
        }
    } 
    */
    const animationsByDirection = useViewportAnimations();

    const motionProps = {
        key: { currentIndex },
        animate: animationsByDirection[current.direction],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        className: 'containerBox ht-10 w-10 absolute bg-neogreen',
        //className: 'w-10 h-10 bg-blue-500 rounded-full absolute top-1/2 left-1/2',
        initial: { x: centerX, y: centerY }
    };

/* 
    const motionProps = {
        initial: { x: 0, y: 0 },
        animate: getEdgeAnimation(current.direction),
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        className: 'containerDetail ht-10 w-10 absolute top-1/2 left-1/2 bg-blue',
        //className: 'w-10 h-10 bg-blue-500 rounded-full absolute top-1/2 left-1/2'
    };
 */
    return (
        <div className='containerBox'>
            <div className='containerBox'>
                <CollapseToggleButton
                    title={`${icons.eyeexercises} Eye Exercises`}
                    isCollapsed={collapse}
                    setCollapse={setCollapse}
                    className='color-yellow'
                    align='left'
                />
            </div>
            {
                (collapse)
                ? null
                : <div className='containerBox'>
                    {animationations.map((animation, animationIndex) => (
                        <div className='containerBox columnLeftAlign' key={animationIndex}>
                            <label key={animationIndex}>
                                <input
                                    type='checkbox'
                                    checked={selectedAnimations[animationIndex]}
                                    onChange={() => handleToggleSelect(animationIndex)}
                                />
                                <span className='ml-5'>{animation.name}</span>
                            </label>
                        </div>
                    ))}
                </div>
            }
            <div className='containerBox'>
                <h3 className='containerBox'>{current.name}</h3>
                <p className='containerBox'>Direction: {current.direction}</p>
                <p className='containerBox'>Sound Type: {current.sound}</p>
                <p className='containerBox'>Time Left: {countdown}s</p>
                <div className='containerBox ht-200 relative'>
                    <motion.div {...motionProps} />
                </div>
                <div className='containerBox flexContainer bg-lite'>
                    <div className='containerBox flex3Column' onClick={handleBack}>{icons.rewind}</div>
                    {isPlaying ? (
                        <div className='containerBox flex3Column' onClick={handlePause}>{icons.pause}</div>
                    ) : (
                        <div className='containerBox flex3Column' onClick={handlePlay}>{icons.play}</div>
                    )}
                    <div className='containerBox flex3Column' onClick={handleNext}>{icons.fastForward}</div>
                </div>

                <div className='containerBox'>
                    <label htmlFor='duration'>Animation Duration (seconds):</label>
                    <input
                        type='number'
                        id='duration'
                        className='containerBox'
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min='5'
                    />
                </div>
            </div>
        </div>
    );
};

export default EyeExercises;