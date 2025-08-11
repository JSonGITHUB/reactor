import React, { useState, useEffect } from 'react';
import './WheelOfFortune.css';
import Confetti from './Confetti';
import Sounds from '../../sound/Sounds';

const SECTORS = [
    'Bankrupt',
    'Lose a Turn',
    '$300',
    '$500',
    '$700',
    '$900',
    '$600',
    '$800',
    '$1000',
];

const PHRASES = [
    { text: 'HELLO WORLD', category: 'Phrase' },
    { text: 'REACT COMPONENT', category: 'Tech' },
    { text: 'FULL STACK DEVELOPER', category: 'Occupation' },
    { text: 'JAVASCRIPT FUNCTION', category: 'Tech' },
    { text: 'LORD OF THE RINGS', category: 'Movie' },
];

const PRIZES = [
    'a new car',
    '$5000 cash',
    'a trip to Hawaii',
    'a luxury watch',
    'a home theater system'
];

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

const getRandomSector = () => {
    const index = Math.floor(Math.random() * SECTORS.length);
    return { label: SECTORS[index], index };
};

const getRandomPhrase = () => {
    const index = Math.floor(Math.random() * PHRASES.length);
    return PHRASES[index];
};

const getRandomPrize = () => {
    return PRIZES[Math.floor(Math.random() * PRIZES.length)];
};

const commonBonusLetters = ['R', 'S', 'T', 'L', 'N', 'E'];

const playSound = (name) => {
    Sounds[name]();
};

const WheelOfFortuneGame = () => {
    const [phraseData, setPhraseData] = useState(getRandomPhrase());
    const [phrase, setPhrase] = useState('');
    const [revealed, setRevealed] = useState([]);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [currentSector, setCurrentSector] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState('');
    const [players, setPlayers] = useState([
        { name: 'Player 1', balance: 0 },
        { name: 'Player 2', balance: 0 },
    ]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [showSolveInput, setShowSolveInput] = useState(false);
    const [solveGuess, setSolveGuess] = useState('');
    const [roundOver, setRoundOver] = useState(false);
    const [scoreboard, setScoreboard] = useState([0, 0]);
    const [bonusMode, setBonusMode] = useState(false);
    const [bonusLetters, setBonusLetters] = useState([]);
    const [bonusGuess, setBonusGuess] = useState('');
    const [bonusPrize, setBonusPrize] = useState('');
    const [bonusComplete, setBonusComplete] = useState(false);
    const [bonusWon, setBonusWon] = useState(false);

    useEffect(() => {
        setPhrase(phraseData.text);
    }, [phraseData]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                handleLetterClick(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [guessedLetters, spinning, roundOver, bonusComplete]);

    const isLetterRevealed = (char) => revealed.includes(char) || !/[A-Z]/.test(char);

    const switchTurn = () => {
        setCurrentPlayer((prev) => (prev + 1) % players.length);
        setCurrentSector(null);
    };

    const handleSpin = () => {
        if (spinning || roundOver || bonusMode) return;
        playSound('catPurr');
        setSpinning(true);
        setMessage('');

        const result = getRandomSector();
        setTimeout(() => {
            setCurrentSector(result);
            setSpinning(false);

            if (result.label === 'Bankrupt') {
                const updated = [...players];
                updated[currentPlayer].balance = 0;
                setPlayers(updated);
                setMessage('\uD83D\uDCA5 Bankrupt! You lose all winnings!');
                playSound('clank');
                switchTurn();
            } else if (result.label === 'Lose a Turn') {
                setMessage('\uD83D\uDD01 Lose a Turn! Better luck next round.');
                playSound('clank');
                switchTurn();
            } else {
                setMessage(`You spun ${result.label}. Guess a consonant!`);
            }
        }, 1000);
    };

    const handleLetterClick = (letter) => {
        if (guessedLetters.includes(letter) || spinning || roundOver || bonusComplete) return;
        const upper = letter.toUpperCase();
        setGuessedLetters([...guessedLetters, upper]);

        const count = phrase.split('').filter((ch) => ch === upper).length;

        if (bonusMode) {
            const newBonusLetters = [...bonusLetters, upper];
            setBonusLetters(newBonusLetters);
            const updatedRevealed = [...revealed, upper];
            setRevealed(updatedRevealed);
        } else {
            if (count > 0 && currentSector && typeof currentSector.label === 'string' && currentSector.label.startsWith('$') && !VOWELS.includes(upper)) {
                const value = parseInt(currentSector.label.slice(1));
                const updated = [...players];
                updated[currentPlayer].balance += value * count;
                setPlayers(updated);
                setRevealed([...revealed, upper]);
                setMessage(`✅ ${count} ${upper}'s found!`);
                playSound('ping');
            } else if (VOWELS.includes(upper)) {
                if (players[currentPlayer].balance >= 250) {
                    const countVowel = phrase.split('').filter((ch) => ch === upper).length;
                    const updated = [...players];
                    updated[currentPlayer].balance -= 250;
                    setPlayers(updated);
                    if (countVowel > 0) {
                        setRevealed([...revealed, upper]);
                        setMessage(`🟢 Vowel ${upper} revealed.`);
                        playSound('ping');
                    } else {
                        setMessage(`❌ No ${upper}'s in the phrase.`);
                        playSound('clank');
                        switchTurn();
                    }
                } else {
                    setMessage('❗ Not enough balance to buy a vowel.');
                }
            } else {
                setMessage(`❌ No ${upper}'s in the phrase.`);
                playSound('clank');
                switchTurn();
            }
        }
    };

    const handleSolveAttempt = () => {
        if (solveGuess.trim().toUpperCase() === phrase) {
            const updatedScoreboard = [...scoreboard];
            updatedScoreboard[currentPlayer] += players[currentPlayer].balance;
            setScoreboard(updatedScoreboard);
            setMessage(`🎉 ${players[currentPlayer].name} solved the puzzle!`);
            playSound('siren');
            setRoundOver(true);
            if (updatedScoreboard[currentPlayer] >= 3000) {
                setBonusMode(true);
                const bonusPhrase = getRandomPhrase();
                setPhraseData(bonusPhrase);
                setRevealed(commonBonusLetters);
                setGuessedLetters(commonBonusLetters);
                setBonusPrize(getRandomPrize());
                setMessage(`🏆 ${players[currentPlayer].name} advances to the Bonus Round! Choose 3 consonants and 1 vowel.`);
            }
        } else {
            setMessage('❌ Incorrect guess. Turn passes.');
            playSound('clank');
            switchTurn();
        }
        setShowSolveInput(false);
        setSolveGuess('');
    };

    const handleBonusSolve = () => {
        if (bonusGuess.trim().toUpperCase() === phrase) {
            setMessage(`🎉 Correct! You win ${bonusPrize}!`);
            setBonusWon(true);
            playSound('siren');
        } else {
            setMessage('😢 Incorrect. Better luck next time!');
            playSound('tuningDown');
        }
        setBonusMode(false);
        setBonusComplete(true);
    };

    const handleNextRound = () => {
        const newPhrase = getRandomPhrase();
        setPhraseData(newPhrase);
        setRevealed([]);
        setGuessedLetters([]);
        setCurrentSector(null);
        setMessage('');
        setSpinning(false);
        setPlayers([
            { name: 'Player 1', balance: 0 },
            { name: 'Player 2', balance: 0 },
        ]);
        setRoundOver(false);
        setBonusMode(false);
        setBonusLetters([]);
        setBonusGuess('');
        setBonusComplete(false);
        setBonusWon(false);
    };

    const displayPuzzle = () => {
        return phrase.split('').map((char, idx) => (
            char === ' ' ? (
                <span key={idx} className='space'> </span>
            ) : (
                <span key={idx} className={`tile color-dark ${isLetterRevealed(char) ? 'flip-in' : ''}`}>
                    {isLetterRevealed(char) ? char : '_'}
                </span>
            )
        ));
    };

    const allLetters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

    return (
        <div className='containerBox'>
            <div className='containerDetail color-yellow p-20 size30'>
                🎡 Wheel of Fortune
            </div>
            <div className='containerBox flexContainer'>
                <div className='containerBox flex2Column'>
                    <span className='color-yellow p-10'>
                        {players[0].name}:
                    </span> 
                    💰 {players[0].balance}
                </div>
                <div className='containerBox flex2Column'>
                    <span className='color-yellow p-10'>
                        {players[1].name}:
                    </span> 
                    💰 {players[1].balance}
                </div>
            </div>
            <div className='containerBox color-yellow'>
                👤 Current Player: {players[currentPlayer].name}
            </div>
            <div className='containerDetail m-10 p-20 bg-lite size30'>
                📂 Category: {phraseData.category}
            </div>
            <div className='puzzle-board containerDetail p-30 bg-lite m-10'>
                {displayPuzzle()}
            </div>

            {bonusWon && <Confetti />}

            <div className='status'>
                {/*
                <p>📊 Scoreboard - {players[0].name}: ${scoreboard[0]}, {players[1].name}: ${scoreboard[1]}</p>
                */}
                {currentSector && <div className='containerBox'>🌀 Wheel Landed On: {currentSector.label}</div>}
                {message && <div className='containerBox'>{message}</div>}
            </div>

            {!roundOver && !bonusMode && (
                <div className='containerDetail p-20 m-10 bg-yellow button color-dark' onClick={handleSpin} disabled={spinning}>
                    {spinning ? 'Spinning...' : `Spin Wheel (${players[currentPlayer].name})`}
                </div>
            )}

            {!roundOver && !bonusMode && (
                <div className='containerDetail p-20 m-10 bg-blue button' onClick={() => setShowSolveInput(true)}>
                    🔤 Solve the Puzzle
                </div>
            )}

            {showSolveInput && (
                <div className='solve-box'>
                    <input
                        type='text'
                        value={solveGuess}
                        onChange={(e) => setSolveGuess(e.target.value)}
                        placeholder='Enter your solution'
                    />
                    <button onClick={handleSolveAttempt}>Submit</button>
                </div>
            )}

            {!roundOver && !bonusMode && (
                <div className='containerBox bg-neogreen scoreboard h-scroll' style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 10 }}>
                    {allLetters.map((letter) => (
                        <div
                            key={letter}
                            onClick={() => handleLetterClick(letter)}
                            disabled={guessedLetters.includes(letter)}
                            className={`containerDetail ${guessedLetters.includes(letter) ? 'bg-dark' : 'bg-lite'} pt-10 pb-10 ${VOWELS.includes(letter) ? 'vowel' : 'consonant'}`}
                            style={{
                                display: 'inline-block',
                                minWidth: 40,
                                margin: '0 4px',
                                fontSize: 24,
                                verticalAlign: 'middle'
                            }}
                        >
                            {letter}
                        </div>
                    ))}
                </div>
            )}

            {bonusMode && (
                <div className='bonus-round'>
                    <h3>🎁 Bonus Round</h3>
                    <p>Guess the final phrase for a chance to win {bonusPrize}!</p>
                    <input
                        type='text'
                        value={bonusGuess}
                        onChange={(e) => setBonusGuess(e.target.value)}
                        placeholder='Final answer'
                    />
                    <button onClick={handleBonusSolve}>Submit Final Guess</button>
                </div>
            )}

            {(roundOver || bonusComplete) && (
                <button onClick={handleNextRound}>🔁 Start Next Round</button>
            )}
        </div>
    );
};

export default WheelOfFortuneGame;