import React, { useState } from 'react';
import './Roulette.css';

const ROULETTE_NUMBERS = [
    { number: 0, color: 'green' },
    ...Array.from({ length: 36 }, (_, i) => ({
        number: i + 1,
        color: ((i + 1) % 2 === 0) === ((Math.floor((i + 1) / 10) % 2) === 0) ? 'black' : 'red',
    }))
];

const getRandomNumber = () => {
    return ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)];
};

const Roulette = () => {
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [balance, setBalance] = useState(100);
    const [result, setResult] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [spinHistory, setSpinHistory] = useState([]);

    const spinWheel = () => {
        if ((selectedNumber === null && selectedColor === null) || balance < betAmount) return;

        setSpinning(true);
        setTimeout(() => {
            const outcome = getRandomNumber();
            setResult(outcome);

            let win = false;
            let payout = 0;

            if (selectedNumber !== null && outcome.number === selectedNumber) {
                win = true;
                payout = betAmount * 35;
            } else if (selectedColor !== null && outcome.color === selectedColor && outcome.number !== 0) {
                win = true;
                payout = betAmount * 2;
            }

            setBalance(balance + (win ? payout : -betAmount));
            setSpinning(false);
            
            // Add to history (keep last 20 spins)
            setSpinHistory(prev => [outcome, ...prev].slice(0, 20));
        }, 2000);
    };

    return (
        <div className='containerDetail mt--30 color-lite'>
            <div className='containerDetail p-20 color-yellow size30 mb-5 bg-lite contentLeft'>
                <span className='size40 color-red'>✵</span> Roulette
            </div>
            
            {/* Spin History Display */}
            {spinHistory.length > 0 && (
                <div className='containerDetail bg-tintedDark h-scroll'>
                    <div className='flexContainer contentLeft pl-15 pt-5'>
                        {spinHistory.map((spin, index) => (
                            <span
                                key={index} 
                                className={`history-circle ${spin.color} fl-left mr-5 w-50`}
                                title={`${spin.number} (${spin.color})`}
                            >
                                {spin.number}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            <div className='containerDetail mt-5 p-10 bg-tintedDark'>
                <div className='flexContainer mb-5'>
                    <div className='zero-slot flexColumn' onClick={() => {
                        setSelectedNumber(0);
                        setSelectedColor(null);
                    }}>
                        <div className={`slot green ${selectedNumber === 0 ? 'selectedRoulette' : ''}`}>0</div>
                    </div>
                    <div
                        className={`slot flex2Column button red ${selectedColor === 'red' ? 'selectedRoulette' : ''}`}
                        onClick={() => {
                            setSelectedColor('red');
                            setSelectedNumber(null);
                        }}
                    >
                        Bet on Red
                    </div>
                    <div
                        className={`slot flex2Column button black ${selectedColor === 'black' ? 'selectedRoulette' : ''}`}
                        onClick={() => {
                            setSelectedColor('black');
                            setSelectedNumber(null);
                        }}
                    >
                        Bet on Black
                    </div>
                </div>
                <div className='main-grid h-scroll'>
                    {[...Array(12)].map((_, colIdx) => (
                        <div key={colIdx} className='column'>
                            {[3, 2, 1].map((rowOffset, rowIdx) => {
                                const number = colIdx * 3 + rowOffset;
                                const color = ROULETTE_NUMBERS[number].color;
                                return (
                                    <div
                                        key={rowIdx}
                                        className={`slot ${color} ${selectedNumber === number ? 'selectedRoulette' : ''}`}
                                        onClick={() => {
                                            setSelectedNumber(number);
                                            setSelectedColor(null);
                                        }}
                                    >
                                        {number}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className='containerDetail mt-5 p-20 color-yellow bg-lite size40'>
                💰{balance}
            </div>
            <div className='containerDetail flexContainer p-10 controls bg-lite'>
                <label className='flex2Column pl-5 contentLeft size20 pt-5'>
                    Bet Amount: $
                    <input
                        type='number'
                        min='1'
                        value={betAmount}
                        onChange={(e) => setBetAmount(parseInt(e.target.value))}
                        className='containerDetail color-lite'
                    />
                </label>
                <div
                    onClick={spinWheel}
                    disabled={spinning || (selectedNumber === null && selectedColor === null) || balance < betAmount}
                    className='containeDetail flexColumn p-10 r-10 button size20 bg-green'
                >
                    {spinning ? 'Spinning...' : 'SPIN'}
                </div>
            </div>

            <div>
                {(result && (selectedNumber !== null || selectedColor !== null)) && (
                    <div className='size25 mt-5'>
                        {(selectedNumber !== null && result.number === selectedNumber) ||
                            (selectedColor !== null && result.color === selectedColor && result.number !== 0)
                            ? <div className='containerDetail p-10 bg-green'>✅ You win!</div>
                            : <div className='containerDetail p-10 bg-red'>❌ You lose.</div>}
                    </div>
                )}
                {result && (
                    <div className={`containerDetail mt-5 mb-10 p-20 size20 ${(result.color === 'black') ? 'bg-tintedMedium' : (result.color === 'red') ? 'bg-dkRed' : 'bg-green'} color-yellow`}>
                        🎯 Result:
                        <div className={`containerDetail size30 size50 mt-5 pt-30 pb-30 ${(result.color === 'black') ? 'bg-dark' : (result.color === 'red') ? 'bg-dkRed' : 'bg-dkGreen'} ${(result.color === 'black') ? 'color-yellow' : 'color-lite'}`}>
                            {result.number}
                        </div>
                    </div>
                  
                )}
            </div>
        </div>
    );
};

export default Roulette;