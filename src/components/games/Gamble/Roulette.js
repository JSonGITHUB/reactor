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
        }, 2000);
    };

    return (
        <div className='containerDetail p-20 mt--30 color-lite'>
            <div className='containerDetail p-20 color-yellow size30 mb-20'>🎰 Roulette</div>
            <div className='board'>
                <div className='zero-slot' onClick={() => {
                    setSelectedNumber(0);
                    setSelectedColor(null);
                }}>
                    <div className={`slot green ${selectedNumber === 0 ? 'selected' : ''}`}>0</div>
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
                                        className={`slot ${color} ${selectedNumber === number ? 'selected' : ''}`}
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

            <div className='color-bets'>
                <button
                    className={`color-bet red ${selectedColor === 'red' ? 'selected' : ''}`}
                    onClick={() => {
                        setSelectedColor('red');
                        setSelectedNumber(null);
                    }}
                >
                    Bet on Red
                </button>
                <button
                    className={`color-bet black ${selectedColor === 'black' ? 'selected' : ''}`}
                    onClick={() => {
                        setSelectedColor('black');
                        setSelectedNumber(null);
                    }}
                >
                    Bet on Black
                </button>
            </div>

            <div className='controls'>
                <label>
                    Bet Amount: $
                    <input
                        type='number'
                        min='1'
                        value={betAmount}
                        onChange={(e) => setBetAmount(parseInt(e.target.value))}
                    />
                </label>
                <button
                    onClick={spinWheel}
                    disabled={spinning || (selectedNumber === null && selectedColor === null) || balance < betAmount}
                >
                    {spinning ? 'Spinning...' : 'Spin'}
                </button>
            </div>

            <div>
                <div className='mt-20 pt-20 size50 pb-20 color-yellow'>💰{balance}</div>
                {result && (
                    <div className='containerBox size20 m-20'>
                        🎯 Result:
                        <div className={`containerDetail size30 size50 mt-10 pt-30 pb-30 ${(result.color === 'black') ? 'bg-dark' : 'bg-dkRed'} ${(result.color === 'black') ? 'color-yellow' : 'color-red'}`}>
                            {result.number}
                        </div>
                    </div>
                  
                )}
                {(result && (selectedNumber !== null || selectedColor !== null)) && (
                    <div className='size25'>
                        {(selectedNumber !== null && result.number === selectedNumber) ||
                            (selectedColor !== null && result.color === selectedColor && result.number !== 0)
                            ? '✅ You win!'
                            : '❌ You lose.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Roulette;