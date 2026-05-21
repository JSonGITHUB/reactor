import React, { useState, useEffect, useCallback, useRef } from 'react';
import './WheelOfFortune.css';
import Confetti from './Confetti';
import Sounds from '../../sound/Sounds';
import validate from '../../utils/validate';
import initializeData from '../../utils/InitializeData';

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

const WORD_BANK = [
    // === PHRASES (20) ===
    { text: 'BREAK A LEG', category: 'Phrase' },
    { text: 'BETTER LATE THAN NEVER', category: 'Phrase' },
    { text: 'HIT THE NAIL ON THE HEAD', category: 'Phrase' },
    { text: 'ONCE IN A BLUE MOON', category: 'Phrase' },
    { text: 'A BLESSING IN DISGUISE', category: 'Phrase' },
    { text: 'PIECE OF CAKE', category: 'Phrase' },
    { text: 'EASIER SAID THAN DONE', category: 'Phrase' },
    { text: 'COSTS AN ARM AND A LEG', category: 'Phrase' },
    { text: 'BURNING THE MIDNIGHT OIL', category: 'Phrase' },
    { text: 'HOLD YOUR HORSES', category: 'Phrase' },
    { text: 'BETWEEN A ROCK AND A HARD PLACE', category: 'Phrase' },
    { text: 'A DIME A DOZEN', category: 'Phrase' },
    { text: 'EVERY CLOUD HAS A SILVER LINING', category: 'Phrase' },
    { text: 'BACK TO THE DRAWING BOARD', category: 'Phrase' },
    { text: 'UNDER THE WEATHER', category: 'Phrase' },
    { text: 'LET THE CAT OUT OF THE BAG', category: 'Phrase' },
    { text: 'SPILL THE BEANS', category: 'Phrase' },
    { text: 'HIT THE HAY', category: 'Phrase' },
    { text: 'ON THE SAME PAGE', category: 'Phrase' },
    { text: 'BY THE SKIN OF YOUR TEETH', category: 'Phrase' },

    // === OCCUPATIONS (20) ===
    { text: 'SOFTWARE ENGINEER', category: 'Occupation' },
    { text: 'TEACHER', category: 'Occupation' },
    { text: 'NURSE PRACTITIONER', category: 'Occupation' },
    { text: 'CHEMICAL ENGINEER', category: 'Occupation' },
    { text: 'POLICE OFFICER', category: 'Occupation' },
    { text: 'ELECTRICIAN', category: 'Occupation' },
    { text: 'PLUMBER', category: 'Occupation' },
    { text: 'DATA SCIENTIST', category: 'Occupation' },
    { text: 'CHEF', category: 'Occupation' },
    { text: 'PHOTOGRAPHER', category: 'Occupation' },
    { text: 'FLIGHT ATTENDANT', category: 'Occupation' },
    { text: 'PILOT', category: 'Occupation' },
    { text: 'FIREFIGHTER', category: 'Occupation' },
    { text: 'LAWYER', category: 'Occupation' },
    { text: 'DOCTOR', category: 'Occupation' },
    { text: 'ARCHITECT', category: 'Occupation' },
    { text: 'GRAPHIC DESIGNER', category: 'Occupation' },
    { text: 'AUTHOR', category: 'Occupation' },
    { text: 'DENTIST', category: 'Occupation' },
    { text: 'MECHANIC', category: 'Occupation' },

    // === MOVIES (20) ===
    { text: 'JURASSIC PARK', category: 'Movie' },
    { text: 'THE MATRIX', category: 'Movie' },
    { text: 'INCEPTION', category: 'Movie' },
    { text: 'THE DARK KNIGHT', category: 'Movie' },
    { text: 'FORREST GUMP', category: 'Movie' },
    { text: 'THE GODFATHER', category: 'Movie' },
    { text: 'BACK TO THE FUTURE', category: 'Movie' },
    { text: 'STAR WARS', category: 'Movie' },
    { text: 'THE SHAWSHANK REDEMPTION', category: 'Movie' },
    { text: 'THE LORD OF THE RINGS', category: 'Movie' },
    { text: 'GLADIATOR', category: 'Movie' },
    { text: 'TITANIC', category: 'Movie' },
    { text: 'THE LION KING', category: 'Movie' },
    { text: 'AVATAR', category: 'Movie' },
    { text: 'THE AVENGERS', category: 'Movie' },
    { text: 'PULP FICTION', category: 'Movie' },
    { text: 'CASABLANCA', category: 'Movie' },
    { text: 'GOODFELLAS', category: 'Movie' },
    { text: 'BRAVEHEART', category: 'Movie' },
    { text: 'TOY STORY', category: 'Movie' },

    // === FOODS (20) ===
    { text: 'SPAGHETTI AND MEATBALLS', category: 'Food' },
    { text: 'PEPPERONI PIZZA', category: 'Food' },
    { text: 'CHICKEN NUGGETS', category: 'Food' },
    { text: 'ICE CREAM SUNDAE', category: 'Food' },
    { text: 'FISH AND CHIPS', category: 'Food' },
    { text: 'MACARONI AND CHEESE', category: 'Food' },
    { text: 'FRIED RICE', category: 'Food' },
    { text: 'SUSHI ROLL', category: 'Food' },
    { text: 'CHOCOLATE CAKE', category: 'Food' },
    { text: 'TACOS AL PASTOR', category: 'Food' },
    { text: 'BUFFALO WINGS', category: 'Food' },
    { text: 'STRAWBERRY SHORTCAKE', category: 'Food' },
    { text: 'CHEESEBURGER', category: 'Food' },
    { text: 'PANCAKES WITH SYRUP', category: 'Food' },
    { text: 'CAESAR SALAD', category: 'Food' },
    { text: 'BEEF BURRITO', category: 'Food' },
    { text: 'BANANA SPLIT', category: 'Food' },
    { text: 'APPLE PIE', category: 'Food' },
    { text: 'GARLIC BREAD', category: 'Food' },
    { text: 'SHRIMP COCKTAIL', category: 'Food' },

    // === ANIMALS (20) ===
    { text: 'ELEPHANT', category: 'Animal' },
    { text: 'GIRAFFE', category: 'Animal' },
    { text: 'KANGAROO', category: 'Animal' },
    { text: 'CROCODILE', category: 'Animal' },
    { text: 'CHEETAH', category: 'Animal' },
    { text: 'POLAR BEAR', category: 'Animal' },
    { text: 'GOLDEN RETRIEVER', category: 'Animal' },
    { text: 'BALD EAGLE', category: 'Animal' },
    { text: 'SEA TURTLE', category: 'Animal' },
    { text: 'GIANT PANDA', category: 'Animal' },
    { text: 'BLUE WHALE', category: 'Animal' },
    { text: 'CHIMPANZEE', category: 'Animal' },
    { text: 'PEACOCK', category: 'Animal' },
    { text: 'SLOTH', category: 'Animal' },
    { text: 'DOLPHIN', category: 'Animal' },
    { text: 'RATTLESNAKE', category: 'Animal' },
    { text: 'ZEBRA', category: 'Animal' },
    { text: 'FLAMINGO', category: 'Animal' },
    { text: 'HIPPOPOTAMUS', category: 'Animal' },
    { text: 'HONEYBEE', category: 'Animal' },

    // === COUNTRIES (20) ===
    { text: 'UNITED STATES', category: 'Country' },
    { text: 'CANADA', category: 'Country' },
    { text: 'BRAZIL', category: 'Country' },
    { text: 'ARGENTINA', category: 'Country' },
    { text: 'GERMANY', category: 'Country' },
    { text: 'FRANCE', category: 'Country' },
    { text: 'ITALY', category: 'Country' },
    { text: 'SPAIN', category: 'Country' },
    { text: 'CHINA', category: 'Country' },
    { text: 'JAPAN', category: 'Country' },
    { text: 'SOUTH KOREA', category: 'Country' },
    { text: 'INDIA', category: 'Country' },
    { text: 'SOUTH AFRICA', category: 'Country' },
    { text: 'EGYPT', category: 'Country' },
    { text: 'AUSTRALIA', category: 'Country' },
    { text: 'NEW ZEALAND', category: 'Country' },
    { text: 'MEXICO', category: 'Country' },
    { text: 'GREECE', category: 'Country' },
    { text: 'RUSSIA', category: 'Country' },
    { text: 'UNITED KINGDOM', category: 'Country' },

    // === TV SHOWS (20) ===
    { text: 'GAME OF THRONES', category: 'TV Show' },
    { text: 'BREAKING BAD', category: 'TV Show' },
    { text: 'FRIENDS', category: 'TV Show' },
    { text: 'THE OFFICE', category: 'TV Show' },
    { text: 'STRANGER THINGS', category: 'TV Show' },
    { text: 'THE SIMPSONS', category: 'TV Show' },
    { text: 'SEINFELD', category: 'TV Show' },
    { text: 'GREYS ANATOMY', category: 'TV Show' },
    { text: 'THE WALKING DEAD', category: 'TV Show' },
    { text: 'HOW I MET YOUR MOTHER', category: 'TV Show' },
    { text: 'BIG BANG THEORY', category: 'TV Show' },
    { text: 'LOST', category: 'TV Show' },
    { text: 'HOUSE OF CARDS', category: 'TV Show' },
    { text: 'MODERN FAMILY', category: 'TV Show' },
    { text: 'THE CROWN', category: 'TV Show' },
    { text: 'BETTER CALL SAUL', category: 'TV Show' },
    { text: 'THE SOPRANOS', category: 'TV Show' },
    { text: 'MAD MEN', category: 'TV Show' },
    { text: 'PARKS AND RECREATION', category: 'TV Show' },
    { text: 'CHEERS', category: 'TV Show' },

    // === PLACES (20) ===
    { text: 'GOLDEN GATE BRIDGE', category: 'Place' },
    { text: 'EIFFEL TOWER', category: 'Place' },
    { text: 'GREAT WALL OF CHINA', category: 'Place' },
    { text: 'TAJ MAHAL', category: 'Place' },
    { text: 'STATUE OF LIBERTY', category: 'Place' },
    { text: 'GRAND CANYON', category: 'Place' },
    { text: 'MOUNT EVEREST', category: 'Place' },
    { text: 'PYRAMIDS OF GIZA', category: 'Place' },
    { text: 'SYDNEY OPERA HOUSE', category: 'Place' },
    { text: 'BIG BEN', category: 'Place' },
    { text: 'STONEHENGE', category: 'Place' },
    { text: 'NIAGARA FALLS', category: 'Place' },
    { text: 'RED SQUARE', category: 'Place' },
    { text: 'TIMES SQUARE', category: 'Place' },
    { text: 'DISNEYLAND', category: 'Place' },
    { text: 'ANGKOR WAT', category: 'Place' },
    { text: 'CHRIST THE REDEEMER', category: 'Place' },
    { text: 'MACHU PICCHU', category: 'Place' },
    { text: 'SAHARA DESERT', category: 'Place' },
    { text: 'BURJ KHALIFA', category: 'Place' },

    // === SPORTS TEAMS (20) ===
    { text: 'NEW YORK YANKEES', category: 'Sports Team' },
    { text: 'LOS ANGELES LAKERS', category: 'Sports Team' },
    { text: 'DALLAS COWBOYS', category: 'Sports Team' },
    { text: 'GREEN BAY PACKERS', category: 'Sports Team' },
    { text: 'CHICAGO BULLS', category: 'Sports Team' },
    { text: 'BOSTON RED SOX', category: 'Sports Team' },
    { text: 'GOLDEN STATE WARRIORS', category: 'Sports Team' },
    { text: 'MIAMI HEAT', category: 'Sports Team' },
    { text: 'TORONTO RAPTORS', category: 'Sports Team' },
    { text: 'HOUSTON ASTROS', category: 'Sports Team' },
    { text: 'MANCHESTER UNITED', category: 'Sports Team' },
    { text: 'REAL MADRID', category: 'Sports Team' },
    { text: 'FC BARCELONA', category: 'Sports Team' },
    { text: 'LIVERPOOL FC', category: 'Sports Team' },
    { text: 'BAYERN MUNICH', category: 'Sports Team' },
    { text: 'JUVENTUS', category: 'Sports Team' },
    { text: 'PARIS SAINT GERMAIN', category: 'Sports Team' },
    { text: 'CHICAGO BEARS', category: 'Sports Team' },
    { text: 'NEW ENGLAND PATRIOTS', category: 'Sports Team' },
    { text: 'PHILADELPHIA EAGLES', category: 'Sports Team' },

    // === HISTORICAL FIGURES (20) ===
    { text: 'ALBERT EINSTEIN', category: 'Historical Figure' },
    { text: 'LEONARDO DA VINCI', category: 'Historical Figure' },
    { text: 'ISAAC NEWTON', category: 'Historical Figure' },
    { text: 'GEORGE WASHINGTON', category: 'Historical Figure' },
    { text: 'ABRAHAM LINCOLN', category: 'Historical Figure' },
    { text: 'NAPOLEON BONAPARTE', category: 'Historical Figure' },
    { text: 'CLEOPATRA', category: 'Historical Figure' },
    { text: 'MAHATMA GANDHI', category: 'Historical Figure' },
    { text: 'MARTIN LUTHER KING', category: 'Historical Figure' },
    { text: 'NELSON MANDELA', category: 'Historical Figure' },
    { text: 'JOAN OF ARC', category: 'Historical Figure' },
    { text: 'JULIUS CAESAR', category: 'Historical Figure' },
    { text: 'ALEXANDER THE GREAT', category: 'Historical Figure' },
    { text: 'WILLIAM SHAKESPEARE', category: 'Historical Figure' },
    { text: 'CHARLES DARWIN', category: 'Historical Figure' },
    { text: 'QUEEN ELIZABETH', category: 'Historical Figure' },
    { text: 'WINSTON CHURCHILL', category: 'Historical Figure' },
    { text: 'KARL MARX', category: 'Historical Figure' },
    { text: 'SOCRATES', category: 'Historical Figure' },
    { text: 'MARIE CURIE', category: 'Historical Figure' },

    // === BOOKS (20) ===
    { text: 'MOBY DICK', category: 'Book' },
    { text: 'PRIDE AND PREJUDICE', category: 'Book' },
    { text: 'TO KILL A MOCKINGBIRD', category: 'Book' },
    { text: 'THE GREAT GATSBY', category: 'Book' },
    { text: 'WAR AND PEACE', category: 'Book' },
    { text: 'CRIME AND PUNISHMENT', category: 'Book' },
    { text: 'ANIMAL FARM', category: 'Book' },
    { text: 'LORD OF THE FLIES', category: 'Book' },
    { text: 'THE HOBBIT', category: 'Book' },
    { text: 'HARRY POTTER', category: 'Book' },
    { text: 'THE CATCHER IN THE RYE', category: 'Book' },
    { text: 'THE ODYSSEY', category: 'Book' },
    { text: 'DON QUIXOTE', category: 'Book' },
    { text: 'JANE EYRE', category: 'Book' },
    { text: 'BRAVE NEW WORLD', category: 'Book' },
    { text: 'THE DIVINE COMEDY', category: 'Book' },
    { text: 'THE ILIAD', category: 'Book' },
    { text: 'A TALE OF TWO CITIES', category: 'Book' },
    { text: 'WUTHERING HEIGHTS', category: 'Book' },
    { text: 'THE ALCHEMIST', category: 'Book' },

    // === THINGS (20) ===
    { text: 'SMARTPHONE', category: 'Thing' },
    { text: 'LAPTOP COMPUTER', category: 'Thing' },
    { text: 'WASHING MACHINE', category: 'Thing' },
    { text: 'TELEVISION REMOTE', category: 'Thing' },
    { text: 'VACUUM CLEANER', category: 'Thing' },
    { text: 'MICROWAVE OVEN', category: 'Thing' },
    { text: 'ELECTRIC GUITAR', category: 'Thing' },
    { text: 'BASKETBALL', category: 'Thing' },
    { text: 'WRISTWATCH', category: 'Thing' },
    { text: 'HEADPHONES', category: 'Thing' },
    { text: 'SUNGLASSES', category: 'Thing' },
    { text: 'BACKPACK', category: 'Thing' },
    { text: 'WATER BOTTLE', category: 'Thing' },
    { text: 'BOARD GAME', category: 'Thing' },
    { text: 'FIREPLACE', category: 'Thing' },
    { text: 'COFFEE MUG', category: 'Thing' },
    { text: 'PIANO', category: 'Thing' },
    { text: 'CAMERA', category: 'Thing' },
    { text: 'SKATEBOARD', category: 'Thing' },
    { text: 'UMBRELLA', category: 'Thing' },
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
    const index = Math.floor(Math.random() * WORD_BANK.length);
    return WORD_BANK[index];
};

const getRandomPrize = () => {
    return PRIZES[Math.floor(Math.random() * PRIZES.length)];
};

const commonBonusLetters = ['R', 'S', 'T', 'L', 'N', 'E'];

const playSound = (name) => {
    Sounds[name](5000);
};

const LS_KEYS = {
    phraseData: 'wofPhraseData',
    revealed: 'wofRevealed',
    guessedLetters: 'wofGuessedLetters',
    currentSector: 'wofCurrentSector',
    players: 'wofPlayers',
    currentPlayer: 'wofCurrentPlayer',
    showSolveInput: 'wofShowSolveInput',
    solveGuess: 'wofSolveGuess',
    roundOver: 'wofRoundOver',
    scoreboard: 'wofScoreboard',
    bonusMode: 'wofBonusMode',
    bonusLetters: 'wofBonusLetters',
    bonusGuess: 'wofBonusGuess',
    bonusPrize: 'wofBonusPrize',
    bonusComplete: 'wofBonusComplete',
    bonusWon: 'wofBonusWon',
    gameHistory: 'wofGameHistory'
};

const PLAYER_INIT = [
    { name: 'Player 1', balance: 0 },
    { name: 'Player 2', balance: 0 },
];

// Utility to get current date/time string
const getDateTimeString = () => {
    const now = new Date();
    return now.toLocaleString();
};

// Load game history from localStorage
const loadGameHistory = () => {
    try {
        const val = localStorage.getItem(LS_KEYS.gameHistory);
        return val ? JSON.parse(val) : [];
    } catch {
        return [];
    }
};

const WheelOfFortuneGame = () => {
    // --- LocalStorage keys ---
    // const LS_KEYS = {
    //     phraseData: 'wofPhraseData',
    //     revealed: 'wofRevealed',
    //     guessedLetters: 'wofGuessedLetters',
    //     currentSector: 'wofCurrentSector',
    //     players: 'wofPlayers',
    //     currentPlayer: 'wofCurrentPlayer',
    //     showSolveInput: 'wofShowSolveInput',
    //     solveGuess: 'wofSolveGuess',
    //     roundOver: 'wofRoundOver',
    //     scoreboard: 'wofScoreboard',
    //     bonusMode: 'wofBonusMode',
    //     bonusLetters: 'wofBonusLetters',
    //     bonusGuess: 'wofBonusGuess',
    //     bonusPrize: 'wofBonusPrize',
    //     bonusComplete: 'wofBonusComplete',
    //     bonusWon: 'wofBonusWon',
    //     gameHistory: 'wofGameHistory'
    // };

    // --- Load from localStorage or defaults ---
    const load = (key, def) => {
        try {
            const val = localStorage.getItem(key);
            return val !== null ? JSON.parse(val) : def;
        } catch {
            return def;
        }
    };

    const [phraseData, setPhraseData] = useState(load(LS_KEYS.phraseData, getRandomPhrase()));
    const [phrase, setPhrase] = useState('');
    const [revealed, setRevealed] = useState(load(LS_KEYS.revealed, []));
    const [guessedLetters, setGuessedLetters] = useState(load(LS_KEYS.guessedLetters, []));
    const [currentSector, setCurrentSector] = useState(load(LS_KEYS.currentSector, null));
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState('Lets go!');
    const [players, setPlayers] = useState(load(LS_KEYS.players, PLAYER_INIT));
    const [currentPlayer, setCurrentPlayer] = useState(load(LS_KEYS.currentPlayer, 0));
    const [showSolveInput, setShowSolveInput] = useState(load(LS_KEYS.showSolveInput, false));
    const [solveGuess, setSolveGuess] = useState(load(LS_KEYS.solveGuess, ''));
    const [roundOver, setRoundOver] = useState(load(LS_KEYS.roundOver, false));
    const [scoreboard, setScoreboard] = useState(load(LS_KEYS.scoreboard, [0, 0]));
    const [bonusMode, setBonusMode] = useState(load(LS_KEYS.bonusMode, false));
    const [bonusLetters, setBonusLetters] = useState(load(LS_KEYS.bonusLetters, []));
    const [bonusGuess, setBonusGuess] = useState(load(LS_KEYS.bonusGuess, ''));
    const [bonusPrize, setBonusPrize] = useState(load(LS_KEYS.bonusPrize, ''));
    const [bonusComplete, setBonusComplete] = useState(load(LS_KEYS.bonusComplete, false));
    const [bonusWon, setBonusWon] = useState(load(LS_KEYS.bonusWon, false));
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [pendingNames, setPendingNames] = useState(players.map(p => p.name));
    const [gameHistory, setGameHistory] = useState(loadGameHistory());
    const [selectedHistory, setSelectedHistory] = useState([]);
    const [spinWindowOpen, setSpinWindowOpen] = useState(false);
    const [spinWindowValue, setSpinWindowValue] = useState('');
    const [spinWindowTrail, setSpinWindowTrail] = useState([]);
    const spinIntervalRef = useRef(null);
    const spinFinalizeRef = useRef(null);

    // --- Persist to localStorage whenever state changes ---
    useEffect(() => {
        console.log(`WheelOfFortune => useEffect => LS_KEYS.phraseData: ${LS_KEYS.phraseData} phraseData: ${JSON.stringify(phraseData, null, 2)}`);
        localStorage.setItem(LS_KEYS.phraseData, JSON.stringify(phraseData));
        if (validate(phraseData)) {
            setPhrase(phraseData.text);
        }
    }, [phraseData]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.revealed, JSON.stringify(revealed));
    }, [revealed]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.guessedLetters, JSON.stringify(guessedLetters));
    }, [guessedLetters]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.currentSector, JSON.stringify(currentSector));
    }, [currentSector]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.players, JSON.stringify(players));
    }, [players]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.currentPlayer, JSON.stringify(currentPlayer));
    }, [currentPlayer]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.showSolveInput, JSON.stringify(showSolveInput));
    }, [showSolveInput]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.solveGuess, JSON.stringify(solveGuess));
    }, [solveGuess]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.roundOver, JSON.stringify(roundOver));
    }, [roundOver]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.scoreboard, JSON.stringify(scoreboard));
    }, [scoreboard]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.bonusMode, JSON.stringify(bonusMode));
    }, [bonusMode]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.bonusLetters, JSON.stringify(bonusLetters));
    }, [bonusLetters]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.bonusGuess, JSON.stringify(bonusGuess));
    }, [bonusGuess]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.bonusPrize, JSON.stringify(bonusPrize));
    }, [bonusPrize]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.bonusComplete, JSON.stringify(bonusComplete));
    }, [bonusComplete]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.bonusWon, JSON.stringify(bonusWon));
    }, [bonusWon]);
    useEffect(() => {
        localStorage.setItem(LS_KEYS.gameHistory, JSON.stringify(gameHistory));
    }, [gameHistory]);

    useEffect(() => {
        return () => {
            if (spinIntervalRef.current) {
                clearInterval(spinIntervalRef.current);
            }
            if (spinFinalizeRef.current) {
                clearTimeout(spinFinalizeRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const localPlayers = initializeData('wofPlayers', PLAYER_INIT);
        if (Array.isArray(localPlayers) && localPlayers.length) {
            setPlayers(localPlayers);
        }
    }, []);
    
    useEffect(() => {
        console.log(`WheelOfFortune => useEffect => currentSector: ${JSON.stringify(currentSector, null, 2)}`);
    }, [currentSector]);

    const isLetterRevealed = (char) => revealed.includes(char) || !/[A-Z]/.test(char);

    const switchTurn = useCallback(() => {
        setCurrentPlayer((prev) => (prev + 1) % players.length);
        setCurrentSector(null);
    }, [players.length]);

    const handleSpin = () => {
        if (spinning || roundOver || bonusMode) return;
        playSound('catPurr');
        setSpinning(true);
        setMessage('Wheel is spinning...');

        const result = getRandomSector();
        const finalizeSpin = () => {
            setCurrentSector(result);
            setSpinning(false);
            setSpinWindowOpen(false);

            if (result.label === 'Bankrupt') {
                const updated = [...players];
                updated[currentPlayer].balance = 0;
                setPlayers(updated);
                setMessage(`\uD83D\uDCA5 Bankrupt! ${players[currentPlayer].name}, you lose all winnings!`);
                playSound('clank');
                switchTurn();
            } else if (result.label === 'Lose a Turn') {
                setMessage('\uD83D\uDD01 Lose a Turn! Better luck next round.');
                playSound('clank');
                switchTurn();
            } else {
                setMessage(`${players[currentPlayer].name}, you spun ${result.label}. Guess a consonant!`);
            }
        };

        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        if (spinFinalizeRef.current) clearTimeout(spinFinalizeRef.current);

        const cycles = 4;
        const totalSteps = (SECTORS.length * cycles) + result.index;
        const stepMs = 110;
        const startIndex = (result.index - (totalSteps % SECTORS.length) + SECTORS.length) % SECTORS.length;
        let cursor = startIndex;
        let step = 0;

        setSpinWindowOpen(true);
        setSpinWindowValue(SECTORS[startIndex]);
        setSpinWindowTrail([SECTORS[startIndex]]);

        spinIntervalRef.current = setInterval(() => {
            cursor = (cursor + 1) % SECTORS.length;
            const value = SECTORS[cursor];
            setSpinWindowValue(value);
            setSpinWindowTrail((prev) => [...prev.slice(-10), value]);

            step += 1;
            if (step >= totalSteps) {
                clearInterval(spinIntervalRef.current);
                spinIntervalRef.current = null;
                setSpinWindowValue(result.label);
                spinFinalizeRef.current = setTimeout(finalizeSpin, 650);
            }
        }, stepMs);
    };

    const handleLetterClick = useCallback((letter) => {
        console.log(`WheelOfFortune => handleLetterClick => letter: ${letter}`);
        console.log(`WheelOfFortune => handleLetterClick => bonusComplete ${bonusComplete} guessedLetters: ${JSON.stringify(guessedLetters, null, 2)}`);
        if (guessedLetters.includes(letter) || spinning || roundOver || bonusComplete) return;
        const upper = letter.toUpperCase();
        if (!VOWELS.includes(upper) || (VOWELS.includes(upper) && players[currentPlayer].balance > 250)) {
            setGuessedLetters([...guessedLetters, upper]);
        }
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
                setMessage(`✅ ${count} ${upper}${(count < 2) ? " found" : "'s found!"}`);
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
                        playSound('ping');
                        switchTurn();
                    }
                } else {
                    setMessage('❗ Not enough balance to buy a vowel.');
                }
            } else {
                setMessage(`❌ No ${upper}'s in the phrase.`);
                playSound('wofMiss');
                switchTurn();
            }
        }
    }, [
        bonusComplete,
        bonusLetters,
        bonusMode,
        currentPlayer,
        currentSector,
        guessedLetters,
        phrase,
        players,
        revealed,
        roundOver,
        spinning,
        switchTurn,
    ]);

    // --- Keyboard logic ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                handleLetterClick(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleLetterClick]);

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
            setMessage(`🎉 Correct! ${players[currentPlayer].name}, you win ${bonusPrize}!`);
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
        // Only record the game if the round is actually over (not on mount/refresh)
        if (roundOver) {
            recordGame({ type: 'main', roundOver: true });
        }
        const newPhrase = getRandomPhrase();
        setPhraseData(newPhrase);
        setRevealed([]);
        setGuessedLetters([]);
        setCurrentSector(null);
        setMessage('New Round');
        setSpinning(false);
        setPlayers([
            { name: players[0].name, balance: 0 },
            { name: players[1].name, balance: 0 },
        ]);
        setRoundOver(false);
        setBonusMode(false);
        setBonusLetters([]);
        setBonusGuess('');
        setBonusComplete(false);
        setBonusWon(false);
    };
    const resetGame = () => {
        // Show a custom modal for player name changes instead of prompt/confirm
        setShowPlayerModal(true);
    };

    // Handler for modal confirm
    const handlePlayerModalConfirm = () => {
        // Record the game only if a round was completed before reset
        if (roundOver || bonusComplete) {
            recordGame({ type: 'reset', roundOver, bonusComplete });
        }
        const newPlayers = pendingNames.map((name, idx) => ({
            name: name || `Player ${idx + 1}`,
            balance: 0
        }));
        setPlayers(newPlayers);
        setScoreboard([0, 0]);
        setCurrentPlayer(0);
        setPhraseData(getRandomPhrase());
        setPhrase('');
        setRevealed([]);
        setGuessedLetters([]);
        setCurrentSector(null);
        setSpinning(false);
        setMessage('New Game Started!');
        setRoundOver(false);
        setBonusMode(false);
        setBonusLetters([]);
        setBonusGuess('');
        setBonusPrize('');
        setBonusComplete(false);
        setBonusWon(false);

        Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));
        setShowPlayerModal(false);
    };

    // Helper to record a finished game
    const recordGame = useCallback((opts = {}) => {
        const historyEntry = {
            date: getDateTimeString(),
            players: players.map((p, idx) => ({
                name: p.name,
                money: p.balance
            })),
            prize: bonusPrize || '',
            solvedPhrase: phrase,
            bonusSolved: bonusWon,
            ...opts
        };
        setGameHistory(prev => [historyEntry, ...prev]);
    }, [bonusPrize, bonusWon, phrase, players]);

    // For bonus round, keep this effect but add a guard:
    useEffect(() => {
        if (bonusComplete && bonusWon) {
            recordGame({ type: 'bonus', bonusComplete: true });
        }
    }, [bonusComplete, bonusWon, recordGame]);

    // Delete selected history items
    const deleteSelectedHistory = () => {
        setGameHistory(prev =>
            prev.filter((_, idx) => !selectedHistory.includes(idx))
        );
        setSelectedHistory([]);
    };

    const toggleHistorySelect = (idx) => {
        setSelectedHistory(prev =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        );
    };
    const toggleAll = () => {
        let newHistory = [...selectedHistory];
        if (newHistory.length === 0) {
            let index = 0;
            gameHistory.forEach((item) => {
                newHistory.push(index);
                index++
            });
        } else {
            newHistory = [];
        }
        setSelectedHistory(newHistory);
    };

    const displayPuzzle = () => {
        return phrase.split('').map((char, idx) => (
            char === ' ' ? (
                <div key={`${idx}-${char}`} className='width-100-percent'> </div>
            ) : (
                <span key={`${idx}-${char}`} className={`tile color-dark ${isLetterRevealed(char) ? 'flip-in' : ''}`}>
                    {isLetterRevealed(char) ? char : '_'}
                </span>
            )
        ));
    };

    const allLetters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    
    const editPlayer = (index) => {
        const newPlayers = [...players];
        newPlayers[index].name = prompt('edit name:', players[index].name);
        setPlayers(newPlayers);
    }

    return (
        <div className='mt--30'>
            <div className='containerDetail color-yellow bg-lite m-5 p-20 size30'>
                🎡 Wheel of Fortune
            </div>
            <div className='flexContainer color-lite'>
                <div className='containerDetail size20 m-5 p-10 flex2Column bg-lite noScroll'>
                    <span className='color-yellow p-10 button' onClick={() => editPlayer(0)}>
                        {players[0]?.name}:
                    </span> 
                    💰 {players[0]?.balance}
                </div>
                <div className='containerDetail size20 m-5 p-10 flex2Column bg-lite noScroll'>
                    <span className='color-yellow p-10' onClick={() => editPlayer(1)}>
                        {players[1]?.name}:
                    </span> 
                    💰 {players[1]?.balance}
                </div>
            </div>
            <div className='puzzle-board containerDetail m-10 pb-20 incompletedSelector'>
                <div className='containerDetail lh-30 m-5 p-20 bg-lite color-lite size30 color-pink width-100-percent'>
                    📂 {phraseData.category}
                </div>
                {displayPuzzle()}
            </div>
            {bonusWon && <Confetti />}
            {spinWindowOpen && (
                <div className='modal-overlay containerDetail p-10 size20 bg-tintedMedium'>
                    <div className='r-10 bg-white color-lite width--20'>
                        <div className='wof-spin-window'>
                            <div className='wof-spin-window-list'>
                                {spinWindowTrail.map((value, idx) => (
                                    <div
                                        key={`${value}-${idx}`}
                                        className={`wof-spin-window-item ${value === spinWindowValue ? 'wof-spin-window-item-active' : ''}`}
                                    >
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {message && <div className='containerDetail p-10 m-10 size20 completedSelector bg-dkGreen'>
                {/*
                            <p>📊 Scoreboard - {players[0].name}: ${scoreboard[0]}, {players[1].name}: ${scoreboard[1]}</p>
                            */}
                {<div className='containerDetail p-10 color-yellow'>{message}</div>}
                
            </div>
            }
            {/*             
            <div className='containerDetail p-10 size20 color-yellow'>
                👤 Current Player: <span className='color-lite'>{players[currentPlayer].name}</span>
            </div>
             */}
             <div className=''>
                {!roundOver && !bonusMode && !message.includes('consonant') && (
                    <div className='containerDetail p-20 m-10 size30 bg-pink button color-lite' onClick={handleSpin} disabled={spinning}>
                        {spinning ? '☸️  Spinning...' : `☸️ Spin Wheel ${players[currentPlayer].name}`}
                    </div>
                )}
                {!roundOver && !bonusMode && message.includes('consonant') && (
                    <div className='containerDetail p-10 size20 scoreboard h-scroll' style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 10 }}>
                        {allLetters.map((letter, idx) => (
                            guessedLetters.includes(letter)
                                ? null
                                : <div
                                    key={`${letter}${idx}-${letter.toLowerCase()}-${letter.toUpperCase()}`}
                                    onClick={() => handleLetterClick(letter)}
                                    disabled={guessedLetters.includes(letter)}
                                    className={`containerDetail button ${guessedLetters.includes(letter) ? 'bg-lite' : VOWELS.includes(letter) ? 'vowel' : 'consonant'} pt-10 pb-10`}
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
                {!roundOver && !bonusMode && (
                    <div className='containerDetail p-20 m-10 size30 bg-blue color-lite button' onClick={() => setShowSolveInput(true)}>
                        🔤 Solve the Puzzle
                    </div>
                )}
            </div>
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

            {bonusMode && (
                <div className='containerDetail m-10 pt-10 pb-15 color-lite borderOrange bg-dkOrange'>
                    <h3 className='containerDetail p-10 size20'>🎁 Bonus Round</h3>
                    <p>Guess the final phrase for a chance to win {bonusPrize}!</p>
                    <input
                        className='containerDetail p-10 size20 color-lite width--10 mb-10'
                        type='text'
                        value={bonusGuess}
                        onChange={(e) => setBonusGuess(e.target.value)}
                        placeholder='Final answer'
                    />
                    <div className='containerDetail m-10 p-10 size25 button bg-orange color-dark' onClick={handleBonusSolve}>Submit</div>
                </div>
            )}

            {(roundOver || bonusComplete) && (
                <div>
                    <div className='containerDetail m-10 size25 p-20 color-lite button bg-blue' onClick={handleNextRound}>🔁 Start Next Round</div>
                </div>
            )}
            {showPlayerModal && (
                <div className='modal-overlay containerDetail p-10 size20 bg-tintedMedium'>
                    <div className='containerDetail p-30 bg-tintedMedium'>
                        {pendingNames.map((name, idx) => (
                            <div key={`${name}-${idx}`}>
                                <label>Player {idx + 1}:</label>
                                <input
                                    className='containerDetail bg-dark color-lite p-10 m-10'
                                    type="text"
                                    value={name}
                                    onChange={e => {
                                        const updated = [...pendingNames];
                                        updated[idx] = e.target.value;
                                        setPendingNames(updated);
                                    }}
                                />
                            </div>
                        ))}
                        <div className='button containerDetail p-20 m-5 color-lite bg-green' onClick={handlePlayerModalConfirm}>Start New Game</div>
                        <div className='button containerDetail p-20 m-5 color-lite bg-red' onClick={() => setShowPlayerModal(false)}>Cancel</div>
                    </div>
                </div>
            )}
            <div className='containerDetail m-10 size25 p-20 color-lite button bg-lite' onClick={resetGame}>
                🆕 New Game
            </div>

            {/* Game History Section */}
            <div className='containerDetail p-10 size20 bg-lite mt-30'>
                <div className='containerDetail flexContainer size25 color-yellow p-10 mb-10'>
                    <div className='p-10 flex1Column contentLeft'>
                        🕑 Game History
                    </div>
                    <div title='Clear History' className='containerDetail p-10 size20 flexColumn contentRight'>
                        🗑️
                    </div>
                </div>
                {gameHistory.length === 0 ? (
                    <div className='containerDetail p-10 size20 color-lite p-10'>No games played yet.</div>
                ) : (
                        <div className= 'h-scroll'>
                            <div className='color-lite'>
                            
                                <div className='flexContainer m-5 pr-10 pl-10'>
                                    <div className='containerDetail flexColumn bg-green button pt-10 pb-10 pl-15 pr-15 size15' onClick={toggleAll}><div className='color-lite'>All</div></div>
                                    <div className='containerDetail flex7Column size15 pt-10 pb-10 pl-10 pr-15 m-5'>Date/Time</div>
                                    <div className='containerDetail flexColumn size15 pt-10 pb-10 m-5 pl-15 pr-20'>Players</div>
                                    <div className='containerDetail flex7Column size15 p-10 m-5 size20'>💰</div>
                                    <div className='containerDetail flex7Column size15 p-10 m-5'>Prize</div>
                                    <div className='containerDetail flex7Column size15 p-10 m-5'>Bonus</div>
                                </div>
                                <div className=''>
                                    {gameHistory.map((entry, idx) => (
                                        <div
                                            key={entry.id ? entry.id : `${entry.date}-${idx}`}
                                            className={`containerDetail size12 m-5 p-5 flexContainer ${selectedHistory.includes(idx) ? 'bg-dkRed' : 'bg-lite'}`}
                                            style={{ width: 'max-content', minWidth: '100%', display: 'flex' }}
                                        >
                                            <div className='flexColumn'>
                                                <div className='containerDetail p-20'>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedHistory.includes(idx)}
                                                        onChange={() => toggleHistorySelect(idx)}
                                                    />
                                                </div>
                                            </div>
                                            <div className='flex5Column containerDetail m-5 p-10 contentLeft'>
                                                <span className='color-yellow size15'>{entry.date.split(', ')[0]}</span>
                                                <br/>
                                                <span className='color-yellow size15'>{entry.date.split(', ')[1]}</span>
                                            </div>
                                            <div className='flex5Column'>
                                                {entry.players.map((p, pidx) => <div className='containerDetail color-lite m-5 size15 w-80' key={p.name + '-' + pidx}>{p.name}</div>)}
                                            </div>
                                            <div className='flex5Column'>
                                                {entry.players.map((p, pidx) => <div className='containerDetail color-lite m-5 size15' key={p.money + '-' + pidx}>{p.money}</div>)}
                                            </div>
                                            <div className='flex5Column containerDetail m-5 color-lite size15 w-50 h-scroll'>{entry.prize || 'no prize'}</div>
                                            <div className='flex5Column containerDetail m-5 size15 w-60'>{entry.bonusSolved ? '✅' : '☑️'}</div>
                                        </div>
                                    ))}
                                    {selectedHistory.length > 0 && (
                                        <div className='containerDetail p-10 button bg-red width--50 color-lite bt-15 fixed' onClick={deleteSelectedHistory}>
                                            Delete Selected
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                )}
            </div>
        </div>
    );
};

export default WheelOfFortuneGame;