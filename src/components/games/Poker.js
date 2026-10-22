import React, { useState, useEffect, useRef } from 'react';
import getKey from '../utils/KeyGenerator';
import './Poker.css';

const Poker = () => {
    // Game state
    const [balance, setBalance] = useState(1000);
    const [pot, setPot] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [playerBet, setPlayerBet] = useState(0);
    const [raiseAmount, setRaiseAmount] = useState(0);
    const [gamePhase, setGamePhase] = useState('preGame'); // preGame, preFlop, flop, turn, river, showdown, gameOver
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [communityCards, setCommunityCards] = useState([]);
    const [opponents, setOpponents] = useState([]);
    const [dealerIndex, setDealerIndex] = useState(0);
    const [activePlayerIndex, setActivePlayerIndex] = useState(0);
    const [message, setMessage] = useState('Welcome to Poker! Configure your game and deal.');
    const [handHistory, setHandHistory] = useState([]);
    const aiTurnInProgress = useRef(false);
    const potRef = useRef(0);
    const playerBetRef = useRef(0);
    const [bettingRoundReset, setBettingRoundReset] = useState(false);
    const [lastAggressorIndex, setLastAggressorIndex] = useState(-1); // Track who raised last
    
    // Settings
    const [gameVariant, setGameVariant] = useState('fiveCardDraw'); // texasHoldem, fiveCardDraw, sevenCardStud
    const [bettingStructure, setBettingStructure] = useState('noLimit'); // noLimit, potLimit, fixedLimit, callFold
    const [numOpponents, setNumOpponents] = useState(2);
    const [aiDifficulty, setAiDifficulty] = useState('medium'); // easy, medium, hard
    const [smallBlind, setSmallBlind] = useState(5);
    const [bigBlind, setBigBlind] = useState(10);
    const [useAntes, setUseAntes] = useState(true);
    const [anteAmount, setAnteAmount] = useState(5);
    
    // Statistics
    const [stats, setStats] = useState({
        handsPlayed: 0,
        handsWon: 0,
        biggestPot: 0,
        totalWinnings: 0,
        totalLosses: 0,
        bestHand: 'None',
    });
    
    // UI state
    const [showSettings, setShowSettings] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showInitDialog, setShowInitDialog] = useState(true);
    const [selectedCards, setSelectedCards] = useState([]); // For 5-card draw
    const [justLoaded, setJustLoaded] = useState(false);
    const [settingsWarning, setSettingsWarning] = useState('');

    useEffect(() => {
        if (activePlayerIndex === numOpponents) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }, [activePlayerIndex, numOpponents]);
    
    // Helper to check if game is active
    const isGameActive = () => {
        return gamePhase !== 'preGame' && gamePhase !== 'showdown' && gamePhase !== 'gameOver';
    };

    // Load saved data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('pokerGameData');
        if (savedData) {
            const data = JSON.parse(savedData);
            // Only show dialog if there's actually saved data
            if (data.balance !== undefined) {
                setShowInitDialog(true);
            } else {
                setShowInitDialog(false);
            }
        } else {
            setShowInitDialog(false);
        }
    }, []);

    // Save to localStorage whenever critical state changes
    useEffect(() => {
        if (!showInitDialog) {
            const gameData = {
                balance,
                stats,
                handHistory,
                gameState: gamePhase !== 'preGame' ? {
                    pot,
                    currentBet,
                    playerBet,
                    gamePhase,
                    playerHand,
                    communityCards,
                    opponents,
                    dealerIndex,
                    activePlayerIndex,
                    deck,
                } : null,
                settings: {
                    gameVariant,
                    bettingStructure,
                    numOpponents,
                    aiDifficulty,
                    smallBlind,
                    bigBlind,
                    useAntes,
                    anteAmount,
                },
            };
            localStorage.setItem('pokerGameData', JSON.stringify(gameData));
        }
    }, [balance, stats, handHistory, gamePhase, pot, currentBet, playerBet, playerHand, 
        communityCards, opponents, dealerIndex, activePlayerIndex, deck, gameVariant, 
        bettingStructure, numOpponents, aiDifficulty, smallBlind, bigBlind, useAntes, 
        anteAmount, showInitDialog]);

    // Clear opponents when numOpponents changes in preGame state
    useEffect(() => {
        if (gamePhase === 'preGame' && opponents.length > 0 && opponents.length !== numOpponents) {
            console.log('Clearing stale opponents - count changed from', opponents.length, 'to', numOpponents);
            setOpponents([]);
            setCommunityCards([]);
            setPlayerHand([]);
            setPot(0);
            setCurrentBet(0);
            setPlayerBet(0);
            const currentPot = potRef.current;
            const currentPlayerBet = playerBetRef.current;
            const profit = currentPot - currentPlayerBet;
            setBalance(prevBalance => prevBalance + currentPot);
            let message = '🏆 YOU WIN! 🏆\n';
            message += 'All opponents folded!\n';
            message += `💰 Won $${currentPot} (Profit: $${profit})\n`;
            message += `Pot: $${currentPot} | Your contribution: $${currentPlayerBet}\n`;

            setMessage(message);
        }
    }, [numOpponents, gamePhase, opponents.length]);

    // Handle AI turns after loading a saved game
    useEffect(() => {
        if (justLoaded && gamePhase !== 'preGame' && gamePhase !== 'showdown' && gamePhase !== 'gameOver') {
            setJustLoaded(false);
            
            // Check if it's an AI player's turn
            if (activePlayerIndex < numOpponents) {
                const opponent = opponents[activePlayerIndex];
                if (opponent && !opponent.folded && !opponent.allIn) {
                    setTimeout(() => processAITurn(activePlayerIndex), 1000);
                }
            }
        }
        // processAITurn is intentionally excluded to avoid identity-driven retriggers.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [justLoaded, gamePhase, activePlayerIndex, numOpponents, opponents]);

    // Handle AI turns after betting round resets
    useEffect(() => {
        if (bettingRoundReset) {
            setBettingRoundReset(false);
            
            if (gamePhase === 'preGame' || gamePhase === 'showdown' || gamePhase === 'gameOver') {
                return;
            }
            
            console.log('Betting round reset - activePlayerIndex:', activePlayerIndex, 'opponents:', opponents.map((o, i) => `${i}: folded=${o.folded}, allIn=${o.allIn}, currentBet=${o.currentBet}`));
            
            // Check if it's an AI player's turn
            if (activePlayerIndex >= 0 && activePlayerIndex < numOpponents) {
                const opponent = opponents[activePlayerIndex];
                if (opponent && !opponent.folded && !opponent.allIn && !aiTurnInProgress.current) {
                    console.log('Triggering AI turn for player', activePlayerIndex);
                    setTimeout(() => processAITurn(activePlayerIndex), 1000);
                } else {
                    console.log('Skipping AI turn - opponent state:', opponent ? `folded=${opponent.folded}, allIn=${opponent.allIn}` : 'null');
                }
            } else if (activePlayerIndex === numOpponents) {
                // Human player's turn
                setMessage('Your turn! Check or bet.');
            }
        }
        // This effect is event-like; broader deps can cause duplicate AI turns.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bettingRoundReset]);
    useEffect(() => {
        if (showSettings) {
            setShowStats(false);
            setShowHistory(false);
            setShowInitDialog(false);
        }
    }, [showSettings]);
    useEffect(() => {
        if (showStats) {
            setShowSettings(false);
            setShowHistory(false);
            setShowInitDialog(false);
        }
    }, [showStats]);
    useEffect(() => {
        if (showHistory) {
            setShowStats(false);
            setShowSettings(false);
            setShowInitDialog(false);
        }
    }, [showHistory]);
    useEffect(() => {
        if (showInitDialog) {
            setShowSettings(false);
            setShowStats(false);
            setShowHistory(false);
        }
    }, [showInitDialog]);

    // Load saved game
    const loadSavedGame = () => {
        const savedData = localStorage.getItem('pokerGameData');
        if (savedData) {
            const data = JSON.parse(savedData);
            setBalance(data.balance || 1000);
            setStats(data.stats || stats);
            setHandHistory(data.handHistory || []);
            
            if (data.settings) {
                setGameVariant(data.settings.gameVariant);
                setBettingStructure(data.settings.bettingStructure);
                setNumOpponents(data.settings.numOpponents);
                setAiDifficulty(data.settings.aiDifficulty);
                setSmallBlind(data.settings.smallBlind);
                setBigBlind(data.settings.bigBlind);
                setUseAntes(data.settings.useAntes);
                setAnteAmount(data.settings.anteAmount);
            }
            
            if (data.gameState) {
                setPot(data.gameState.pot);
                setCurrentBet(data.gameState.currentBet);
                setPlayerBet(data.gameState.playerBet);
                setGamePhase(data.gameState.gamePhase);
                setPlayerHand(data.gameState.playerHand);
                setCommunityCards(data.gameState.communityCards);
                setOpponents(data.gameState.opponents);
                setDealerIndex(data.gameState.dealerIndex);
                setActivePlayerIndex(data.gameState.activePlayerIndex);
                setDeck(data.gameState.deck);
                
                // Determine message based on whose turn it is
                const activeIdx = data.gameState.activePlayerIndex;
                const numOpps = data.settings?.numOpponents || numOpponents;
                
                if (data.gameState.gamePhase === 'preGame') {
                    setMessage('Game loaded! Deal a new hand to continue.');
                } else if (activeIdx === numOpps) {
                    setMessage('Game loaded! Your turn.');
                } else if (activeIdx < numOpps) {
                    setMessage('Game loaded! Waiting for opponents...');
                    setJustLoaded(true); // Trigger the useEffect to process AI turn
                } else {
                    setMessage('Game loaded! Continue playing.');
                }
            } else {
                setMessage('Game loaded! Deal a new hand to start.');
            }
        }
        setShowInitDialog(false);
    };

    // Start fresh game
    const startFreshGame = () => {
        setShowSettings(false);
        setShowStats(false);
        setShowHistory(false);
        setShowInitDialog(false);
        setBalance(1000);
        setStats({
            handsPlayed: 0,
            handsWon: 0,
            biggestPot: 0,
            totalWinnings: 0,
            totalLosses: 0,
            bestHand: 'None',
        });
        setHandHistory([]);
        setGamePhase('preGame');
        setMessage('New game started! Configure settings and deal.');
        setShowInitDialog(false);
        localStorage.removeItem('pokerGameData');
    };

    // Card utilities
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const rankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

    const createDeck = () => {
        const newDeck = [];
        suits.forEach(suit => {
            ranks.forEach(rank => {
                newDeck.push({ suit, rank, value: rankValues[rank] });
            });
        });
        return shuffleDeck(newDeck);
    };

    const shuffleDeck = (deck) => {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Hand evaluation
    const evaluateHand = (cards) => {
        if (!cards || cards.length < 5) return { rank: 0, name: 'High Card', cards: [] };

        const allCombinations = gameVariant === 'texasHoldem' && cards.length === 7
            ? getCombinations(cards, 5)
            : [cards.slice(0, 5)];

        let bestHand = { rank: 0, name: 'High Card', cards: [], tiebreakers: [] };

        allCombinations.forEach(combo => {
            const sorted = [...combo].sort((a, b) => b.value - a.value);
            const hand = evaluateFiveCards(sorted);
            if (hand.rank > bestHand.rank || 
                (hand.rank === bestHand.rank && compareHands(hand, bestHand) > 0)) {
                bestHand = hand;
            }
        });

        return bestHand;
    };

    const getCombinations = (arr, size) => {
        if (size > arr.length) return [];
        if (size === arr.length) return [arr];
        if (size === 1) return arr.map(el => [el]);
        
        const combos = [];
        for (let i = 0; i < arr.length - size + 1; i++) {
            const head = arr.slice(i, i + 1);
            const tailCombos = getCombinations(arr.slice(i + 1), size - 1);
            tailCombos.forEach(combo => combos.push([...head, ...combo]));
        }
        return combos;
    };

    const evaluateFiveCards = (sorted) => {
        const isFlush = sorted.every(card => card.suit === sorted[0].suit);
        const values = sorted.map(c => c.value);
        const valueCounts = {};
        values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
        const counts = Object.values(valueCounts).sort((a, b) => b - a);
        const uniqueValues = Object.keys(valueCounts).map(Number).sort((a, b) => b - a);

        // Check straight
        let isStraight = false;
        if (values[0] - values[4] === 4 && new Set(values).size === 5) {
            isStraight = true;
        }
        // Check A-2-3-4-5 (wheel)
        if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
            isStraight = true;
            uniqueValues.splice(0, 1);
            uniqueValues.push(1); // Ace low
        }

        // Royal Flush
        if (isFlush && isStraight && values[0] === 14 && values[1] === 13) {
            return { rank: 10, name: 'Royal Flush', cards: sorted, tiebreakers: [] };
        }

        // Straight Flush
        if (isFlush && isStraight) {
            return { rank: 9, name: 'Straight Flush', cards: sorted, tiebreakers: uniqueValues };
        }

        // Four of a Kind
        if (counts[0] === 4) {
            const quadValue = uniqueValues.find(v => valueCounts[v] === 4);
            const kicker = uniqueValues.find(v => valueCounts[v] === 1);
            return { rank: 8, name: 'Four of a Kind', cards: sorted, tiebreakers: [quadValue, kicker] };
        }

        // Full House
        if (counts[0] === 3 && counts[1] === 2) {
            const tripValue = uniqueValues.find(v => valueCounts[v] === 3);
            const pairValue = uniqueValues.find(v => valueCounts[v] === 2);
            return { rank: 7, name: 'Full House', cards: sorted, tiebreakers: [tripValue, pairValue] };
        }

        // Flush
        if (isFlush) {
            return { rank: 6, name: 'Flush', cards: sorted, tiebreakers: uniqueValues };
        }

        // Straight
        if (isStraight) {
            return { rank: 5, name: 'Straight', cards: sorted, tiebreakers: uniqueValues };
        }

        // Three of a Kind
        if (counts[0] === 3) {
            const tripValue = uniqueValues.find(v => valueCounts[v] === 3);
            const kickers = uniqueValues.filter(v => valueCounts[v] === 1);
            return { rank: 4, name: 'Three of a Kind', cards: sorted, tiebreakers: [tripValue, ...kickers] };
        }

        // Two Pair
        if (counts[0] === 2 && counts[1] === 2) {
            const pairs = uniqueValues.filter(v => valueCounts[v] === 2).sort((a, b) => b - a);
            const kicker = uniqueValues.find(v => valueCounts[v] === 1);
            return { rank: 3, name: 'Two Pair', cards: sorted, tiebreakers: [...pairs, kicker] };
        }

        // One Pair
        if (counts[0] === 2) {
            const pairValue = uniqueValues.find(v => valueCounts[v] === 2);
            const kickers = uniqueValues.filter(v => valueCounts[v] === 1);
            return { rank: 2, name: 'One Pair', cards: sorted, tiebreakers: [pairValue, ...kickers] };
        }

        // High Card
        return { rank: 1, name: 'High Card', cards: sorted, tiebreakers: uniqueValues };
    };

    const compareHands = (hand1, hand2) => {
        for (let i = 0; i < Math.max(hand1.tiebreakers.length, hand2.tiebreakers.length); i++) {
            const val1 = hand1.tiebreakers[i] || 0;
            const val2 = hand2.tiebreakers[i] || 0;
            if (val1 > val2) return 1;
            if (val1 < val2) return -1;
        }
        return 0;
    };

    // AI Logic
    const getAIAction = (opponent, phase) => {
        const hand = gameVariant === 'texasHoldem' 
            ? [...opponent.hand, ...communityCards]
            : opponent.hand;
        
        const handStrength = evaluateHand(hand);
        
        // Sync check: if opponent has already bet more than currentBet, they must have raised
        // Use the higher value to avoid negative toCall
        const effectiveCurrentBet = Math.max(currentBet, opponent.currentBet);
        const toCall = Math.max(0, effectiveCurrentBet - opponent.currentBet); // Ensure non-negative
        
        let aggressiveness = 0.5;
        if (aiDifficulty === 'easy') aggressiveness = 0.4;
        if (aiDifficulty === 'hard') aggressiveness = 0.65;

        const random = Math.random();
        
        // Pre-flop play (only 2 cards) - play more hands
        const isPreFlop = gameVariant === 'texasHoldem' && communityCards.length === 0;
        
        if (isPreFlop) {
            const card1 = opponent.hand[0];
            const card2 = opponent.hand[1];
            const isPair = card1.value === card2.value;
            const isHighCard = card1.value >= 11 || card2.value >= 11; // J or better
            const isSuited = card1.suit === card2.suit;
            const isConnected = Math.abs(card1.value - card2.value) <= 2;
            
            // Premium hands - always play aggressively
            if (isPair && card1.value >= 10) {
                if (random < aggressiveness) {
                    const totalRaise = effectiveCurrentBet + bigBlind * (2 + Math.floor(Math.random() * 3));
                    return { action: 'raise', amount: totalRaise };
                }
                return { action: 'call', amount: toCall };
            }
            
            // Good hands - play most of the time
            if (isPair || (isHighCard && (isSuited || card1.value >= 12 || card2.value >= 12))) {
                if (toCall > bigBlind * 3 && random < 0.3) {
                    return { action: 'fold' };
                }
                if (random < aggressiveness * 0.4) {
                    const totalRaise = effectiveCurrentBet + bigBlind;
                    return { action: 'raise', amount: totalRaise };
                }
                return { action: 'call', amount: toCall };
            }
            
            // Decent hands - play if cheap
            if (isHighCard || isSuited || isConnected) {
                if (toCall > bigBlind * 2) {
                    if (random < 0.6) return { action: 'fold' };
                }
                if (toCall === 0 && random < 0.7) {
                    return { action: 'check' };
                }
                if (random < aggressiveness * 0.5) {
                    return { action: 'call', amount: toCall };
                }
                return { action: 'fold' };
            }
            
            // Weak hands - mostly fold unless free/cheap
            if (toCall === 0) {
                return random < 0.5 ? { action: 'check' } : { action: 'fold' };
            }
            if (toCall <= bigBlind && random < 0.3) {
                return { action: 'call', amount: toCall };
            }
            return { action: 'fold' };
        }
        
        // Post-flop play with community cards
        if (handStrength.rank >= 7) { // Strong hand (Full House or better)
            if (random < aggressiveness * 0.8) {
                const raiseAmt = effectiveCurrentBet + bigBlind * (2 + Math.floor(Math.random() * 4));
                return { action: 'raise', amount: Math.min(opponent.chips + opponent.currentBet, raiseAmt) };
            }
            return { action: 'call', amount: toCall };
        } else if (handStrength.rank >= 5) { // Very good hand (Straight or better)
            if (toCall > opponent.chips * 0.4 && random < 0.3) {
                return { action: 'fold' };
            }
            if (random < aggressiveness * 0.6) {
                const raiseAmt = effectiveCurrentBet + bigBlind * 2;
                return { action: 'raise', amount: Math.min(opponent.chips + opponent.currentBet, raiseAmt) };
            }
            return { action: 'call', amount: toCall };
        } else if (handStrength.rank >= 3) { // Good hand (Two Pair or better)
            if (toCall > opponent.chips * 0.3) {
                if (random < 0.5) return { action: 'fold' };
                return { action: 'call', amount: toCall };
            }
            if (random < aggressiveness * 0.4) {
                const raiseAmt = effectiveCurrentBet + bigBlind;
                return { action: 'raise', amount: Math.min(opponent.chips + opponent.currentBet, raiseAmt) };
            }
            return { action: 'call', amount: toCall };
        } else if (handStrength.rank >= 2) { // Weak hand (Pair)
            if (toCall > opponent.chips * 0.15) {
                if (random < 0.7) return { action: 'fold' };
            }
            if (toCall === 0) {
                return { action: 'check' };
            }
            if (random < aggressiveness * 0.3) {
                return { action: 'call', amount: toCall };
            }
            return { action: 'fold' };
        } else { // Very weak hand (High card)
            if (toCall === 0) {
                return random < 0.6 ? { action: 'check' } : { action: 'fold' };
            }
            if (toCall <= bigBlind && random < 0.2) {
                return { action: 'call', amount: toCall };
            }
            return { action: 'fold' };
        }
    };
    const startNewHand = () => {
        setGamePhase('preGame');
        setPot(0);
        setCurrentBet(0);
        setPlayerBet(0);
        setDealerIndex((dealerIndex + 1) % (numOpponents + 1));
        setActivePlayerIndex(-1);
        setOpponents([]);
        setCommunityCards([]);
        setPlayerHand([]);
        //setMessage(`💡 Hand complete. Click "Deal Hand" to play again!`);
        //setShowHistory(true);
    };
    // Deal new hand
    const dealNewHand = () => {
        setShowHistory(false);
        if (balance < bigBlind) {
            setMessage('Not enough chips to play! Reset your balance.');
            setGamePhase('gameOver');
            return;
        }

        const newDeck = createDeck();
        let deckIndex = 0;

        // Initialize opponents
        const newOpponents = Array(numOpponents).fill(null).map((_, i) => ({
            id: i,
            name: `Player ${i + 1}`,
            chips: 1000,
            hand: [],
            currentBet: 0,
            folded: false,
            allIn: false,
        }));

        // Post blinds or antes
        let newPot = 0;
        let newBalance = balance;
        let newCurrentBet = 0;
        let initialPlayerBet = 0;

        if (useAntes) {
            // Everyone posts antes
            newPot += anteAmount * (numOpponents + 1);
            newBalance -= anteAmount;
            initialPlayerBet = anteAmount; // Track player's ante contribution
            newOpponents.forEach(opp => {
                opp.chips -= anteAmount;
            });
        }

        // Post blinds for Texas Hold'em
        if (gameVariant === 'texasHoldem') {
            const sbIndex = (dealerIndex + 1) % (numOpponents + 1);
            const bbIndex = (dealerIndex + 2) % (numOpponents + 1);

            if (sbIndex === numOpponents) {
                // Player is small blind
                newBalance -= smallBlind;
                newPot += smallBlind;
                initialPlayerBet += smallBlind; // Add to existing ante if present
            } else {
                newOpponents[sbIndex].chips -= smallBlind;
                newOpponents[sbIndex].currentBet = smallBlind;
                newPot += smallBlind;
            }

            if (bbIndex === numOpponents) {
                // Player is big blind
                newBalance -= bigBlind;
                newPot += bigBlind;
                initialPlayerBet += bigBlind; // Add to existing ante if present
                newCurrentBet = bigBlind;
            } else {
                newOpponents[bbIndex].chips -= bigBlind;
                newOpponents[bbIndex].currentBet = bigBlind;
                newPot += bigBlind;
                newCurrentBet = bigBlind;
            }
        }

        // Deal cards
        const cardsPerPlayer = gameVariant === 'fiveCardDraw' ? 5 : 2;
        const newPlayerHand = newDeck.slice(deckIndex, deckIndex + cardsPerPlayer);
        deckIndex += cardsPerPlayer;

        newOpponents.forEach(opp => {
            opp.hand = newDeck.slice(deckIndex, deckIndex + cardsPerPlayer);
            deckIndex += cardsPerPlayer;
        });

        setDeck(newDeck.slice(deckIndex));
        setPlayerHand(newPlayerHand);
        setOpponents(newOpponents);
        setBalance(newBalance);
        console.log('dealNewHand setting pot to:', newPot, 'playerBet to:', initialPlayerBet);
        potRef.current = newPot;
        playerBetRef.current = initialPlayerBet;
        setPot(newPot);
        setCurrentBet(newCurrentBet);
        setPlayerBet(initialPlayerBet); // Set player's total contribution (antes + blinds)
        setCommunityCards([]);
        setSelectedCards([]);
        setGamePhase(gameVariant === 'texasHoldem' ? 'preFlop' : 'betting');
        
        // First to act after BB
        const firstToAct = (dealerIndex + 3) % (numOpponents + 1);
        setActivePlayerIndex(firstToAct);
        
        // Update stats
        setStats(prev => ({ ...prev, handsPlayed: prev.handsPlayed + 1 }));
        
        // If first to act is AI, trigger their turn
        if (firstToAct < numOpponents) {
            setMessage('New hand dealt! Waiting for opponents...');
            setTimeout(() => processAITurn(firstToAct), 1000);
        } else {
            setMessage('New hand dealt! Your turn.');
        }
    };

    // Player actions
    const playerFold = () => {
        setMessage('You folded.');
        endHand(false);
    };

    const playerCheck = () => {
        if (currentBet > playerBet) {
            setMessage('You must call or raise!');
            return;
        }
        setMessage('You checked.');
        nextPlayer();
    };

    const playerCall = () => {
        const toCall = currentBet - playerBet;
        if (toCall > balance) {
            setMessage('Not enough chips! Going all-in.');
            playerAllIn();
            return;
        }
        setBalance(balance - toCall);
        const newPlayerBet = playerBet + toCall;
        const newPot = pot + toCall;
        playerBetRef.current = newPlayerBet;
        potRef.current = newPot;
        setPlayerBet(newPlayerBet);
        setPot(newPot);
        setMessage(`You called $${toCall}.`);
        nextPlayer();
    };

    const playerRaise = () => {
        const minRaise = bettingStructure === 'fixedLimit' ? bigBlind : (currentBet - playerBet + bigBlind);
        const actualRaise = Math.max(minRaise, raiseAmount);
        
        if (bettingStructure === 'potLimit') {
            const maxRaise = pot + currentBet;
            if (actualRaise > maxRaise) {
                setMessage(`Pot limit! Max raise is $${maxRaise}`);
                return;
            }
        }

        if (actualRaise > balance) {
            setMessage('Not enough chips! Going all-in.');
            playerAllIn();
            return;
        }

        setBalance(balance - actualRaise);
        const newPlayerBet = playerBet + actualRaise;
        const newPot = pot + actualRaise;
        playerBetRef.current = newPlayerBet;
        potRef.current = newPot;
        setPlayerBet(newPlayerBet);
        setCurrentBet(newPlayerBet);
        setPot(newPot);
        setLastAggressorIndex(numOpponents); // Player is the last aggressor
        setMessage(`You raised to $${playerBet + actualRaise}.`);
        setRaiseAmount(0);
        nextPlayer();
    };

    const playerAllIn = () => {
        const allInAmount = balance;
        setBalance(0);
        const newPlayerBet = playerBet + allInAmount;
        const newPot = pot + allInAmount;
        playerBetRef.current = newPlayerBet;
        potRef.current = newPot;
        setPlayerBet(newPlayerBet);
        if (newPlayerBet > currentBet) {
            setCurrentBet(newPlayerBet);
        }
        setPot(newPot);
        setMessage(`You went all-in with $${allInAmount}!`);
        nextPlayer();
    };

    // Next player in betting round
    const nextPlayer = (fromIndex = null) => {
        // Use provided index or fall back to current activePlayerIndex
        const currentIndex = fromIndex !== null ? fromIndex : activePlayerIndex;
        
        console.log('nextPlayer called with fromIndex:', fromIndex, 'currentIndex:', currentIndex, 'activePlayerIndex:', activePlayerIndex);
        console.log('nextPlayer pot state:', { pot, playerBet, currentBet });
        
        // Check if only one player remains (everyone else folded) - DO THIS FIRST!
        const activePlayers = opponents.filter(o => !o.folded);
        const playerFolded = balance === 0 && playerBet === 0; // Crude check, but works for fold detection
        
        if (activePlayers.length === 0) {
            // All opponents folded, player wins - use refs to get current pot/playerBet
            console.log('All opponents folded! Pot from ref:', potRef.current, 'PlayerBet from ref:', playerBetRef.current);
            
            const currentPot = potRef.current;
            const currentPlayerBet = playerBetRef.current;
            
            setTimeout(() => {
                setGamePhase('showdown');
                setActivePlayerIndex(-1);
                
                const profit = currentPot - currentPlayerBet;
                setBalance(prevBalance => prevBalance + currentPot);
                
                let message = '🏆 YOU WIN! 🏆\n';
                message += 'All opponents folded!\n';
                message += `💰 Won $${currentPot} (Profit: $${profit})\n`;
                message += `Pot: $${currentPot} | Your contribution: $${currentPlayerBet}\n`;
                
                setMessage(message);
                setStats(prev => ({
                    ...prev,
                    handsWon: prev.handsWon + 1,
                    biggestPot: Math.max(prev.biggestPot, currentPot),
                    totalWinnings: prev.totalWinnings + currentPot,
                }));
                addToHistory(`Won $${currentPot} (Profit: $${profit}) - opponents folded`, buildHandSummary(), ['You']);
                
                //setTimeout(() => {
                    startNewHand();
                //}, 1000);
            }, 500);
            return;
        }
        
        if (activePlayers.length === 1 && playerFolded) {
            // Player folded, last opponent wins
            endHand(false);
            return;
        }

        let nextIndex = (currentIndex + 1) % (numOpponents + 1);

        // Skip folded/all-in players
        let attempts = 0;
        while (attempts < numOpponents + 1) {
            if (nextIndex === numOpponents) {
                // Human player - can't be folded/all-in in this check
                break;
            }
            if (nextIndex < numOpponents && !opponents[nextIndex].folded && !opponents[nextIndex].allIn) {
                // Found an active AI player
                break;
            }
            nextIndex = (nextIndex + 1) % (numOpponents + 1);
            attempts++;
        }

        // Check if betting round is complete
        const maxBet = Math.max(playerBet, ...opponents.map(o => o.currentBet));
        const allBetsEqual = 
            (playerBet === maxBet || playerFolded) &&
            opponents.every(o => o.folded || o.currentBet === maxBet || o.allIn);

        // Betting round is only complete if:
        // 1. All bets are equal AND
        // 2. Either:
        //    a) Someone raised (maxBet > 0) and action has returned to the last raiser
        //    b) No one raised but we've completed at least one full orbit (returned to dealer+1)
        const firstToActAfterReset = (dealerIndex + 1) % (numOpponents + 1);
        const hasCompletedOrbit = lastAggressorIndex >= 0 
            ? nextIndex === lastAggressorIndex  // Returned to last raiser
            : nextIndex === firstToActAfterReset && maxBet >= 0; // Returned to first actor
        
        const allPlayersActed = allBetsEqual && (maxBet > 0 || hasCompletedOrbit);

        console.log('Betting check:', { nextIndex, maxBet, playerBet, allBetsEqual, lastAggressorIndex, firstToActAfterReset, hasCompletedOrbit, allPlayersActed, opponentBets: opponents.map(o => o.currentBet) });

        if (allPlayersActed) {
            console.log('Betting round complete, progressing to next phase');
            // Betting round complete
            progressToNextPhase();
        } else {
            // Next player's turn - update active player index FIRST
            const isAIPlayer = nextIndex < numOpponents && !opponents[nextIndex].folded && !opponents[nextIndex].allIn;
            const isHumanPlayer = nextIndex === numOpponents;
            
            console.log('Next player:', { nextIndex, isAIPlayer, isHumanPlayer });
            
            setActivePlayerIndex(nextIndex);
            
            if (isAIPlayer) {
                // AI player's turn - only trigger if not already in progress
                if (!aiTurnInProgress.current) {
                    console.log('Triggering AI turn for player', nextIndex);
                    setTimeout(() => processAITurn(nextIndex), 1000);
                } else {
                    console.log('AI turn already in progress, not triggering');
                }
            } else if (isHumanPlayer) {
                // Back to player, player's turn
                setMessage('Your turn!');
            } else {
                // This shouldn't happen with the while loop above, but just in case
                console.warn('nextPlayer(): No valid player found at index', nextIndex);
                setTimeout(() => nextPlayer(), 500);
            }
        }
    };

    const processAITurn = (oppIndex) => {
        // Prevent duplicate AI turns
        if (aiTurnInProgress.current) {
            console.log('AI turn already in progress, skipping');
            return;
        }
        
        aiTurnInProgress.current = true;
        
        const opponent = opponents[oppIndex];
        if (!opponent || opponent.folded || opponent.allIn) {
            aiTurnInProgress.current = false;
            nextPlayer(oppIndex);
            return;
        }

        const action = getAIAction(opponent, gamePhase);
        const newOpponents = [...opponents];

        if (action.action === 'fold') {
            newOpponents[oppIndex].folded = true;
            console.log(`${opponent.name} folding. Current pot:`, pot, 'playerBet:', playerBet, 'active players after fold:', newOpponents.filter(o => !o.folded).length);
            setMessage(`${opponent.name} folded.`);
            setOpponents(newOpponents);
            
            // Check if all opponents have folded - do this BEFORE state updates propagate
            const activePlayers = newOpponents.filter(o => !o.folded);
            if (activePlayers.length === 0) {
                // All opponents folded, player wins - capture pot/playerBet from refs (always current)
                const currentPot = potRef.current;
                const currentPlayerBet = playerBetRef.current;
                console.log('All opponents folded after this fold! Pot:', currentPot, 'PlayerBet:', currentPlayerBet);
                aiTurnInProgress.current = false;
                
                // Call endHand directly with captured values
                //setTimeout(() => {
                    setGamePhase('showdown');
                    setActivePlayerIndex(-1);
                    
                    const profit = currentPot - currentPlayerBet;
                    setBalance(prevBalance => prevBalance + currentPot);
                    
                    let message = '🏆 YOU WIN! 🏆\n';
                    message += 'All opponents folded!\n';
                    message += `💰 Won $${currentPot} (Profit: $${profit})\n`;
                    message += `Pot: $${currentPot} | Your contribution: $${currentPlayerBet}\n`;
                    
                    setMessage(message);
                    setStats(prev => ({
                        ...prev,
                        handsWon: prev.handsWon + 1,
                        biggestPot: Math.max(prev.biggestPot, currentPot),
                        totalWinnings: prev.totalWinnings + currentPot,
                    }));
                    addToHistory(`Won $${currentPot} (Profit: $${profit}) - opponents folded`, buildHandSummary(), ['You']);
                    
                    //setTimeout(() => {
                        startNewHand();
                    //}, 4000);
                //}, 500);
                return;
            }
            
            aiTurnInProgress.current = false;
            setTimeout(() => nextPlayer(oppIndex), 500);
        } else if (action.action === 'check') {
            setMessage(`${opponent.name} checked.`);
            setOpponents(newOpponents);
            aiTurnInProgress.current = false;
            setTimeout(() => nextPlayer(oppIndex), 500);
        } else if (action.action === 'call') {
            const toCall = currentBet - opponent.currentBet;
            
            // If toCall is 0, this should be a check, not a call
            if (toCall === 0) {
                console.log(`${opponent.name} tried to call $0, converting to check`);
                setMessage(`${opponent.name} checked.`);
                setOpponents(newOpponents);
                aiTurnInProgress.current = false;
                setTimeout(() => nextPlayer(oppIndex), 500);
                return;
            }
            
            // Guard against negative toCall (state sync issue)
            if (toCall < 0) {
                console.error('Negative toCall detected:', { toCall, currentBet, opponentCurrentBet: opponent.currentBet });
                setMessage(`${opponent.name} checked.`);
                setOpponents(newOpponents);
                aiTurnInProgress.current = false;
                setTimeout(() => nextPlayer(oppIndex), 500);
                return;
            }
            
            const actualCall = Math.min(toCall, opponent.chips);
            newOpponents[oppIndex].chips -= actualCall;
            newOpponents[oppIndex].currentBet += actualCall;
            
            if (newOpponents[oppIndex].chips === 0) {
                newOpponents[oppIndex].allIn = true;
            }
            
            const newPot = pot + actualCall;
            potRef.current = newPot;
            setPot(newPot);
            setMessage(`${opponent.name} called $${actualCall}.`);
            setOpponents(newOpponents);
            aiTurnInProgress.current = false;
            setTimeout(() => nextPlayer(oppIndex), 500);
        } else if (action.action === 'raise') {
            // action.amount should be the TOTAL new bet, not additional
            const totalBet = Math.min(action.amount, opponent.chips + opponent.currentBet);
            const additionalAmount = totalBet - opponent.currentBet;
            
            newOpponents[oppIndex].chips -= additionalAmount;
            newOpponents[oppIndex].currentBet = totalBet;
            
            if (newOpponents[oppIndex].chips === 0) {
                newOpponents[oppIndex].allIn = true;
            }
            
            const newPot = pot + additionalAmount;
            potRef.current = newPot;
            setPot(newPot);
            setMessage(`${opponent.name} raised to $${totalBet}.`);
            setOpponents(newOpponents);
            setCurrentBet(totalBet);
            setLastAggressorIndex(oppIndex); // This opponent is the last aggressor
            aiTurnInProgress.current = false;
            // Use a longer timeout to ensure state updates propagate
            setTimeout(() => nextPlayer(oppIndex), 800);
        }
    };

    const progressToNextPhase = () => {
        console.log('progressToNextPhase called! gamePhase:', gamePhase, 'pot:', pot, 'playerBet:', playerBet);
        if (gameVariant === 'texasHoldem') {
            if (gamePhase === 'preFlop') {
                // Deal flop
                const newCommunity = [...communityCards, ...deck.slice(0, 3)];
                setCommunityCards(newCommunity);
                setDeck(deck.slice(3));
                setGamePhase('flop');
                const nextPlayer = (dealerIndex + 1) % (numOpponents + 1);
                const nextPlayerName = nextPlayer === numOpponents ? 'You' : opponents[nextPlayer]?.name || 'Player';
                setMessage(`Flop dealt! ${nextPlayerName} to act first.`);
                resetBettingRound();
            } else if (gamePhase === 'flop') {
                // Deal turn
                const newCommunity = [...communityCards, deck[0]];
                setCommunityCards(newCommunity);
                setDeck(deck.slice(1));
                setGamePhase('turn');
                const nextPlayer = (dealerIndex + 1) % (numOpponents + 1);
                const nextPlayerName = nextPlayer === numOpponents ? 'You' : opponents[nextPlayer]?.name || 'Player';
                setMessage(`Turn dealt! ${nextPlayerName} to act first.`);
                resetBettingRound();
            } else if (gamePhase === 'turn') {
                // Deal river
                const newCommunity = [...communityCards, deck[0]];
                setCommunityCards(newCommunity);
                setDeck(deck.slice(1));
                setGamePhase('river');
                const nextPlayer = (dealerIndex + 1) % (numOpponents + 1);
                const nextPlayerName = nextPlayer === numOpponents ? 'You' : opponents[nextPlayer]?.name || 'Player';
                setMessage(`River dealt! ${nextPlayerName} to act first.`);
                resetBettingRound();
            } else if (gamePhase === 'river') {
                // Showdown
                showdown();
            }
        } else {
            // Other variants - go to showdown after betting
            showdown();
        }
    };

    const resetBettingRound = () => {
        console.log('resetBettingRound called! Current pot:', pot, 'playerBet:', playerBet);
        
        // Check if all opponents folded BEFORE clearing anything
        const activePlayers = opponents.filter(o => !o.folded);
        if (activePlayers.length === 0) {
            console.log('resetBettingRound: All opponents folded! Skipping reset, going to showdown.');
            setTimeout(() => showdown(), 500);
            return;
        }
        
        setCurrentBet(0);
        playerBetRef.current = 0;  // Update ref when clearing
        setPlayerBet(0);
        setLastAggressorIndex(-1); // Reset aggressor tracking
        const newOpponents = opponents.map(opp => ({ ...opp, currentBet: 0 }));
        setOpponents(newOpponents);
        
        // Check if all opponents are folded or all-in
        const activeOpponents = newOpponents.filter(o => !o.folded && !o.allIn);
        
        if (activeOpponents.length === 0) {
            // All AI players are out, go straight to showdown
            console.log('All AI players folded/all-in, going to showdown');
            setTimeout(() => showdown(), 500);
            return;
        }
        
        // Find the next active (non-folded, non-all-in) player
        let nextPlayerIdx = (dealerIndex + 1) % (numOpponents + 1);
        let attempts = 0;
        
        while (attempts < numOpponents + 1) {
            if (nextPlayerIdx === numOpponents) {
                // Human player - always break here
                break;
            }
            if (nextPlayerIdx < numOpponents && !newOpponents[nextPlayerIdx].folded && !newOpponents[nextPlayerIdx].allIn) {
                // Found an active AI player
                break;
            }
            nextPlayerIdx = (nextPlayerIdx + 1) % (numOpponents + 1);
            attempts++;
        }
        
        setActivePlayerIndex(nextPlayerIdx);
        
        // Set flag to trigger AI turn via useEffect after state updates
        setBettingRoundReset(true);
    };

    const showdown = () => {
        setGamePhase('showdown');
        setActivePlayerIndex(-1); // Clear active player during showdown
        
        // Evaluate all hands
        const playerHandRank = evaluateHand(gameVariant === 'texasHoldem' 
            ? [...playerHand, ...communityCards] 
            : playerHand);
        
        const opponentHands = opponents.map(opp => ({
            ...opp,
            handRank: opp.folded ? null : evaluateHand(
                gameVariant === 'texasHoldem' 
                    ? [...opp.hand, ...communityCards] 
                    : opp.hand
            ),
        }));

        // Find winner(s)
        let winners = [];
        let bestRank = playerHandRank.rank;
        let bestHand = playerHandRank;

        opponentHands.forEach(opp => {
            if (opp.handRank && opp.handRank.rank > bestRank) {
                bestRank = opp.handRank.rank;
                bestHand = opp.handRank;
                winners = [opp];
            } else if (opp.handRank && opp.handRank.rank === bestRank) {
                const comparison = compareHands(opp.handRank, bestHand);
                if (comparison > 0) {
                    winners = [opp];
                    bestHand = opp.handRank;
                } else if (comparison === 0) {
                    winners.push(opp);
                }
            }
        });

        if (playerHandRank.rank > bestRank || 
            (playerHandRank.rank === bestRank && compareHands(playerHandRank, bestHand) >= 0)) {
            winners = playerHandRank.rank === bestRank && compareHands(playerHandRank, bestHand) === 0 
                ? [...winners, 'player'] 
                : ['player'];
        }

        // Build detailed result message
        let resultMessage = '🎲 SHOWDOWN 🎲';
        
        // Show your hand
        resultMessage += `You: ${playerHandRank.name}\n`;
        
        // Show opponent hands
        opponentHands.forEach(opp => {
            if (!opp.folded) {
                resultMessage += `${opp.name}: ${opp.handRank.name}\n`;
            } else {
                resultMessage += `${opp.name}: Folded\n`;
            }
        });
        
        // Distribute pot
        const winAmount = Math.floor(pot / winners.length);
        const amountLost = playerBet;
        
        if (winners.includes('player')) {
            const profit = winAmount - amountLost;
            
            // Use functional update to ensure we get the latest balance
            setBalance(prevBalance => prevBalance + winAmount);
            
            if (winners.length > 1) {
                const otherWinners = winners.filter(w => w !== 'player').map(w => w.name).join(', ');
                resultMessage += `\n🏆 TIE! You split the pot with ${otherWinners}\n`;
                resultMessage += `💰 You won $${winAmount} (Profit: $${profit})\n`;
            } else {
                resultMessage += `\n🏆 YOU WIN! 🏆\n`;
                resultMessage += `💰 Won $${winAmount} (Profit: $${profit})\n`;
            }
            
            setMessage(resultMessage);
            
            // Update stats
            setStats(prev => ({
                ...prev,
                handsWon: prev.handsWon + 1,
                biggestPot: Math.max(prev.biggestPot, pot),
                totalWinnings: prev.totalWinnings + winAmount,
                bestHand: playerHandRank.rank > evaluateHand([]).rank ? playerHandRank.name : prev.bestHand,
            }));

            // Add to history
            const winnerNameList = winners.map((w) => (w === 'player' ? 'You' : w.name));
            addToHistory(`Won $${winAmount} (Profit: $${profit}) with ${playerHandRank.name}`, {
                player: playerHandRank.name,
                opponents: opponentHands.map((opp) => ({
                    name: opp.name,
                    hand: opp.folded ? 'Folded' : (opp.handRank?.name || 'Unknown')
                }))
            }, winnerNameList);
        } else {
            const winnerNameList = winners.map(w => w.name);
            const winnerNames = winnerNameList.join(', ');
            resultMessage += `\n❌ YOU LOSE ❌\n`;
            resultMessage += `Winner: ${winnerNames} (${bestHand.name})\n`;
            resultMessage += `💸 Lost $${amountLost}\n`;
            
            setMessage(resultMessage);
            setStats(prev => ({
                ...prev,
                totalLosses: prev.totalLosses + amountLost,
            }));
            addToHistory(`Lost $${amountLost} to ${winnerNames} (${bestHand.name}). You had ${playerHandRank.name}`, {
                player: playerHandRank.name,
                opponents: opponentHands.map((opp) => ({
                    name: opp.name,
                    hand: opp.folded ? 'Folded' : (opp.handRank?.name || 'Unknown')
                }))
            }, winnerNameList);
        }

        //setTimeout(() => {
            startNewHand();
        //}, 7000);
    };

    const endHand = (playerWon) => {
        // Capture current values immediately to avoid stale closure issues
        const currentPot = pot;
        const currentPlayerBet = playerBet;
        
        setGamePhase('showdown');
        setActivePlayerIndex(-1); // Clear active player
        
        if (playerWon) {
            const profit = currentPot - currentPlayerBet;
            
            // Use functional update to ensure we get the latest balance
            setBalance(prevBalance => {
                const newBalance = prevBalance + currentPot;
                console.log('endHand balance update:', { prevBalance, currentPot, newBalance, profit, currentPlayerBet });
                return newBalance;
            });
            
            let message = '🏆 YOU WIN! 🏆\n';
            message += 'All opponents folded!\n';
            message += `💰 Won $${currentPot} (Profit: $${profit})\n`;
            message += `Pot: $${currentPot} | Your contribution: $${currentPlayerBet}\n`;
            
            setMessage(message);
            setStats(prev => ({
                ...prev,
                handsWon: prev.handsWon + 1,
                biggestPot: Math.max(prev.biggestPot, currentPot),
                totalWinnings: prev.totalWinnings + currentPot,
            }));
            addToHistory(`Won $${currentPot} (Profit: $${profit}) - opponents folded`, buildHandSummary(), ['You']);
        } else {
            let message = '❌ YOU LOSE ❌\n';
            message += 'You folded.\n';
            message += `💸 Lost $${playerBet}\n`;
            
            setMessage(message);
            setStats(prev => ({
                ...prev,
                totalLosses: prev.totalLosses + playerBet,
            }));
            const winnerNameList = opponents.filter((opp) => !opp.folded).map((opp) => opp.name);
            addToHistory(`Lost $${playerBet} (folded)`, buildHandSummary(), winnerNameList);
        }

        //setTimeout(() => {
            startNewHand();
        //}, 4000);
    };

    const buildHandSummary = () => {
        const playerHandRank = evaluateHand(gameVariant === 'texasHoldem'
            ? [...playerHand, ...communityCards]
            : playerHand);
        const opponentSummaries = opponents.map((opp) => {
            // Always evaluate hands, even if folded - just mark them as folded
            const handRank = evaluateHand(gameVariant === 'texasHoldem'
                ? [...opp.hand, ...communityCards]
                : opp.hand);
            return { 
                name: opp.name, 
                hand: handRank?.name || 'Unknown',
                folded: opp.folded 
            };
        });
        return {
            player: playerHandRank?.name || 'Unknown',
            opponents: opponentSummaries
        };
    };

    const addToHistory = (result, handSummary = null, winnerNames = []) => {
        const newEntry = {
            hand: handHistory.length + 1,
            result,
            timestamp: new Date().toLocaleString(),
            handSummary,
            winnerNames
        };
        setHandHistory([newEntry, ...handHistory].slice(0, 20)); // Keep last 20
    };

    const getHandIconCards = (handName) => {
        switch (handName) {
            case 'Royal Flush':
                return [
                    { rank: 'A', suit: '♠' },
                    { rank: 'K', suit: '♠' },
                    { rank: 'Q', suit: '♠' },
                    { rank: 'J', suit: '♠' },
                    { rank: '10', suit: '♠' }
                ];
            case 'Straight Flush':
                return [
                    { rank: '9', suit: '♥' },
                    { rank: '8', suit: '♥' },
                    { rank: '7', suit: '♥' },
                    { rank: '6', suit: '♥' },
                    { rank: '5', suit: '♥' }
                ];
            case 'Four of a Kind':
                return [
                    { rank: 'A', suit: '♣' },
                    { rank: 'A', suit: '♦' },
                    { rank: 'A', suit: '♥' },
                    { rank: 'A', suit: '♠' }
                ];
            case 'Full House':
                return [
                    { rank: 'K', suit: '♠' },
                    { rank: 'K', suit: '♥' },
                    { rank: 'K', suit: '♦' },
                    { rank: '9', suit: '♣' },
                    { rank: '9', suit: '♦' }
                ];
            case 'Flush':
                return [
                    { rank: 'Q', suit: '♣' },
                    { rank: '9', suit: '♣' },
                    { rank: '7', suit: '♣' },
                    { rank: '5', suit: '♣' },
                    { rank: '2', suit: '♣' }
                ];
            case 'Straight':
                return [
                    { rank: '10', suit: '♠' },
                    { rank: '9', suit: '♥' },
                    { rank: '8', suit: '♦' },
                    { rank: '7', suit: '♣' },
                    { rank: '6', suit: '♠' }
                ];
            case 'Three of a Kind':
                return [
                    { rank: '7', suit: '♠' },
                    { rank: '7', suit: '♦' },
                    { rank: '7', suit: '♥' }
                ];
            case 'Two Pair':
                return [
                    { rank: 'J', suit: '♣' },
                    { rank: 'J', suit: '♥' },
                    { rank: '4', suit: '♦' },
                    { rank: '4', suit: '♠' }
                ];
            case 'One Pair':
                return [{ rank: '8', suit: '♠' }, { rank: '8', suit: '♥' }];
            case 'High Card':
                return [{ rank: 'A', suit: '♦' }];
            case 'Folded':
                return [{ rank: '', suit: '🂠', back: true }];
            default:
                return [{ rank: '•', suit: '♠' }];
        }
    };

    const renderHandIcon = (handName) => {
        const cards = getHandIconCards(handName || 'High Card');
        return (
            <span className='hand-icon'>
                {cards.map((card, idx) => {
                    if (card.back) {
                        return <span key={getKey(`hand-icon-back-${idx}`)} className='mini-card mini-card-back' />;
                    }
                    const isRed = card.suit === '♥' || card.suit === '♦';
                    return (
                        <span
                            key={getKey(`hand-icon-${idx}-${card.rank}-${card.suit}`)}
                            className={`mini-card ${isRed ? 'mini-card-red' : 'mini-card-black'}`}
                        >
                            <span className='mini-card-rank'>{card.rank}</span>
                            <span className='mini-card-suit'>{card.suit}</span>
                        </span>
                    );
                })}
            </span>
        );
    };

    const renderHandBadge = (label, handName, isWinner = false, folded = false) => {
        const displayName = handName || 'Unknown';
        return (
            <div className={`containerDetail pl-10 flexContainer ${isWinner ? 'history-winner' : ''} ${folded ? 'opacity-60' : ''}`}>
                <div className='flex6Column contentLeft'>
                    <div className='size15'>
                        {label} {folded && <span className='size12 color-red'>(Folded)</span>}
                    </div>
                    <div className='hand-badge-name'>
                        {displayName}
                    </div>
                </div>
                <div className='containerDetail contentLeft bg-tintedMedium flex2Column'>
                    {renderHandIcon(displayName)}
                </div>
            </div>
        );
    };

    const resetGame = () => {
        startFreshGame();
        setMessage('Game reset! You have $1000.');
    };

    const clearHistory = () => {
        setHandHistory([]);
    };

    const deleteHistoryEntry = (entryIndex) => {
        setHandHistory(prev => prev.filter((_, idx) => idx !== entryIndex));
    };

    // 5-Card Draw specific
    const toggleCardSelection = (index) => {
        if (selectedCards.includes(index)) {
            setSelectedCards(selectedCards.filter(i => i !== index));
        } else if (selectedCards.length < 5) {
            setSelectedCards([...selectedCards, index]);
        }
    };

    const drawCards = () => {
        if (gameVariant !== 'fiveCardDraw') return;
        
        const newHand = [...playerHand];
        let newDeck = [...deck];
        
        selectedCards.sort((a, b) => b - a).forEach(index => {
            newHand[index] = newDeck[0];
            newDeck = newDeck.slice(1);
        });

        setPlayerHand(newHand);
        setDeck(newDeck);
        setSelectedCards([]);
        setMessage(`Drew ${selectedCards.length} cards.`);
        
        // AI draws cards
        setTimeout(() => {
            const newOpponents = opponents.map(opp => {
                const numToDraw = Math.floor(Math.random() * 4); // AI draws 0-3 cards
                const newOppHand = [...opp.hand];
                let deckCopy = [...newDeck];
                
                for (let i = 0; i < numToDraw; i++) {
                    newOppHand[i] = deckCopy[0];
                    deckCopy = deckCopy.slice(1);
                }
                
                return { ...opp, hand: newOppHand };
            });
            
            setOpponents(newOpponents);
            setDeck(newDeck);
            progressToNextPhase();
        }, 1500);
    };

    // Render card
    const renderCard = (card, hidden = false, selectable = false, selected = false, index = null) => {
        if (hidden) {
            return (
                <div className='poker-card card-back'>
                    <div className='card-pattern'></div>
                </div>
            );
        }

        const isRed = card.suit === '♥' || card.suit === '♦';
        
        return (
            <div 
                className={`poker-card ${isRed ? 'card-red' : 'card-black'} ${selected ? 'card-selected' : ''} ${selectable ? 'card-selectable' : ''}`}
                onClick={selectable && index !== null ? () => toggleCardSelection(index) : null}
            >
                <div className='card-corner top-left'>
                    <div className='card-rank'>{card.rank}</div>
                    <div className='card-suit'>{card.suit}</div>
                </div>
                <div className='card-center'>{card.suit}</div>
                <div className='card-corner bottom-right'>
                    <div className='card-rank'>{card.rank}</div>
                    <div className='card-suit'>{card.suit}</div>
                </div>
            </div>
        );
    };
    const getResults = (entry) => {
        const winnerNames = entry.winnerNames || [];
        const isPlayerWinner = winnerNames.includes('You');
        const resultHasDash = entry.result.includes(' - ');
        const resultHasTo = entry.result.includes(' to ');
        const resultLeft = resultHasDash
            ? entry.result.split(' - ')[0]
            : resultHasTo
                ? entry.result.split(' to ')[0]
                : entry.result;
        const resultRight = resultHasDash
            ? entry.result.split(' - ')[1]
            : resultHasTo
                ? entry.result.split(' to ')[1]
                : '';
        const winnerNameText = resultHasTo
            ? resultRight.split('(')[0]?.trim()
            : '';
        const winnerHandParen = resultHasTo && resultRight.includes('(')
            ? resultRight.match(/\(([^)]+)\)/)?.[0] || ''
            : '';
        const afterClosingParen = resultHasTo && resultRight.includes(')')
            ? resultRight.split(')').slice(1).join(')').trim()
            : '';
        const results = {
            resultLeft,
            resultRight,
            winnerNameText,
            winnerHandParen,
            afterClosingParen,
            resultHasDash,
            resultHasTo,
            isPlayerWinner
        };
        return results;
    }
    const getSummary = (entry, isPlayerWinner) => <div className='containerDetail mt-5 p-10 bg-pink'>
                                    <div>
                                        {entry.handSummary?.player && (
                                            <span className={`history-summary-badge ${isPlayerWinner ? 'is-winner' : ''}`}>
                                                {renderHandIcon(entry.handSummary.player)}
                                                <span className='history-summary-hand'>{entry.handSummary.player}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
    
    const getHandSummary = (entry, isPlayerWinner, winnerNames) => <>
        {entry.handSummary && (
            <div className='containerDetail bg-blue'>
                {renderHandBadge('You', entry.handSummary.player, isPlayerWinner, false)}
                {entry.handSummary.opponents?.map((opp, id) => (
                    <div key={getKey(`hist-${entry.hand}-${opp.name}`)} className={`${(entry.handSummary.opponents.length - 1 > id)?'mb-5 ':''}${(id === 0)?'mt-5':''}`}>
                        {renderHandBadge(opp.name, opp.hand, winnerNames.includes(opp.name), opp.folded)}
                    </div>
                ))}
            </div>
        )}
    </>;

    return (
        <div className='containerDetail color-lite bg-lite mt--25'>
            {/* Initial Dialog */}
            {showInitDialog && (
                <div className='poker-modal-overlay'>
                    <div className='poker-modal ml-10 mr-10'>
                        <h2 className='modal-title'>Welcome to Poker!</h2>
                        <p className='modal-text'>Continue with saved game or start fresh?</p>
                        <div className='modal-buttons'>
                            <div className='containerDetail bg-green color-yellow size20 p-20 button' onClick={loadSavedGame}>
                                Continue Saved Game
                            </div>
                            <div className='containerDetail bg-green color-yellow size20 p-20 button' onClick={startFreshGame}>
                                Start Fresh ($1000)
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className='containerDetail p-20 size25 flexContainer mb-5'>
                <div className='flex2Column contentLeft color-yellow'>
                    🃏 Poker
                </div>
                <div className='flex2Column contentRight'>
                    Balance: <span className='balance-amount'>${balance}</span>
                </div>
            </div>

            {/* Controls */}
            <div className='containerDetail flexContainer'>
                <div className='containerDetail button flex4Column bg-lite' onClick={() => setShowSettings(!showSettings)}>
                    ⚙️ Settings
                </div>
                <div className='containerDetail button flex4Column ml-5 bg-lite' onClick={() => setShowStats(!showStats)}>
                    📊 Stats
                </div>
                <div className='containerDetail button flex4Column ml-5 bg-lite' onClick={() => setShowHistory(!showHistory)}>
                    📜 History
                </div>
                <div className='containerDetail button flex4Column ml-5 bg-lite' onClick={resetGame}>
                    🔄 Reset
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className='containerDetail contentLeft'>
                    <div className='containerDetail contentLeft p-10 bg-lite color-yellow mb-5 size20'>
                        ⚙️ Settings
                    </div>
                    {isGameActive() && (
                        <div className='containerDetail p-10 bkg-yellow color-lite mb-5 contentLeft size12'>
                            ℹ️ Some settings are locked during active gameplay to prevent errors. Finish or fold the current hand to modify all settings.
                        </div>
                    )}
                    <div className='containerDetail'>
                        <div className='containerDetail contentLeft flexContainer'>
                            <label className='flexColumn'>
                                <div className='containerDetail color-yellow bg-lite p-10'>
                                    Game Variant:
                                </div>
                            </label>
                            <select 
                                className='containerDetail color-lite width--5 p-10 flex2Column'
                                value={gameVariant} 
                                onChange={(e) => setGameVariant(e.target.value)}
                            >
                                <option value='texasHoldem'>Texas Hold'em</option>
                                <option value='fiveCardDraw'>5-Card Draw</option>
                            </select>
                        </div>
                        <div className='containerDetail contentLeft flexContainer'>
                            <label className='flexColumn'>
                                <div className='containerDetail color-yellow bg-lite p-10'>
                                    Betting Structure:
                                </div>
                            </label>
                            <select 
                                className='containerDetail color-lite width--5 p-10 flex2Column'
                                value={bettingStructure} 
                                onChange={(e) => setBettingStructure(e.target.value)}
                            >
                                <option value='noLimit'>No Limit</option>
                                <option value='potLimit'>Pot Limit</option>
                                <option value='fixedLimit'>Fixed Limit</option>
                                <option value='callFold'>Call/Fold Only</option>
                            </select>
                        </div>
                        <div className='containerDetail contentLeft flexContainer'>
                            <label className='flexColumn'>
                                <div className='containerDetail color-yellow bg-lite p-10'>
                                    Opponents:
                                    {isGameActive() && <span className='size10 color-red'> (End hand to change)</span>}
                                </div>
                            </label>
                            <select 
                                className='containerDetail color-lite width--5 p-10 flex2Column'
                                value={numOpponents} 
                                onChange={(e) => {
                                    if (isGameActive()) {
                                        setSettingsWarning('Cannot change number of opponents during active game! Please finish or fold the current hand first.');
                                        setTimeout(() => setSettingsWarning(''), 5000);
                                    } else {
                                        setNumOpponents(Number(e.target.value));
                                    }
                                }}
                                disabled={isGameActive()}
                                style={isGameActive() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <option value='1'>1</option>
                                <option value='2'>2</option>
                                <option value='3'>3</option>
                                <option value='4'>4</option>
                                <option value='5'>5</option>
                            </select>
                        </div>
                        {settingsWarning && (
                            <div className='containerDetail p-10 bg-red color-yellow mb-5 contentLeft'>
                                ⚠️ {settingsWarning}
                            </div>
                        )}
                        <div className='containerDetail contentLeft flexContainer'>
                            <label className='flexColumn'>
                                <div className='containerDetail color-yellow bg-lite p-10'>
                                    AI Difficulty:
                                </div>
                                </label>
                            <select 
                                className='containerDetail color-lite width--5 p-10 flex2Column'
                                value={aiDifficulty} 
                                onChange={(e) => setAiDifficulty(e.target.value)}
                            >
                                <option value='easy'>Easy</option>
                                <option value='medium'>Medium</option>
                                <option value='hard'>Hard</option>
                            </select>
                        </div>
                        <div className='containerDetail contentLeft flexContainer'>
                            <label className='flexColumn'>
                                <div className='containerDetail color-yellow bg-lite p-10'>
                                    Small Blind:
                                </div>
                            </label>
                            <input 
                                className='containerDetail color-lite width--5 p-10 flex2Column'
                                type='number' 
                                value={smallBlind} 
                                onChange={(e) => setSmallBlind(Number(e.target.value))}
                                min='1'
                            />
                        </div>
                        <div className='containerDetail contentLeft flexContainer'>
                            <label className='flexColumn'>
                                <div className='containerDetail color-yellow bg-lite p-10'>
                                    Big Blind:
                                </div>
                            </label>
                            <input 
                                className='containerDetail color-lite width--5 p-10 flex2Column'
                                type='number' 
                                value={bigBlind} 
                                onChange={(e) => setBigBlind(Number(e.target.value))}
                                min='2'
                            />
                        </div>
                        {/*
                            <div className='containerDetail contentLeft p-20'>
                                <input 
                                    type='checkbox'
                                    checked={useAntes} 
                                    onChange={(e) => setUseAntes(e.target.checked)}
                                />
                                <label className='color-yellow bg-lite p-10 contentLeft'>
                                    Use Antes:
                                </label>
                            </div>
                        */}
                        {useAntes && (
                            <div className='containerDetail flexContainer'>
                                <label className='flexColumn'>
                                    <div className='containerDetail color-yellow bg-lite p-10 contentLeft'>
                                        Ante Amount:
                                    </div>
                                </label>
                                <input 
                                    className='flex2Column containerDetail color-lite p-10 contentLeft'
                                    type='number' 
                                    value={anteAmount} 
                                    onChange={(e) => setAnteAmount(Number(e.target.value))}
                                    min='1'
                                />
                            </div>
                        )}
                        <div className='containerDetail contentLeft flexContainer mt-5'>
                            <label className='flexColumn'>
                                <div className='containerDetail color-yellow bg-lite p-10'>
                                    History:
                                </div>
                            </label>
                            <div
                                className='containerDetail button flex2Column ml-5 bg-red color-yellow p-10'
                                onClick={clearHistory}
                            >
                                Clear History
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Panel */}
            {showStats && (
                <div className='containerDetail contentLeft'>
                    <div className='containerDetail contentLeft p-10 bg-lite color-yellow mb-5 size20'>
                        📊 Statistics
                    </div>
                    <div className='stats-grid'>
                        <div className='stat-item'>
                            <span className='size15'>Hands Played:</span>
                            <span className='stat-value'>{stats.handsPlayed}</span>
                        </div>
                        <div className='stat-item'>
                            <span className='size15'>Hands Won:</span>
                            <span className='stat-value'>{stats.handsWon}</span>
                        </div>
                        <div className='stat-item'>
                            <span className='size15'>Win Rate:</span>
                            <span className='stat-value'>
                                {stats.handsPlayed > 0 ? ((stats.handsWon / stats.handsPlayed) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='size15'>Biggest Pot:</span>
                            <span className='stat-value'>${stats.biggestPot}</span>
                        </div>
                        <div className='stat-item'>
                            <span className='size15'>Total Winnings:</span>
                            <span className='stat-value stat-positive'>${stats.totalWinnings}</span>
                        </div>
                        <div className='stat-item'>
                            <span className='size15'>Total Losses:</span>
                            <span className='stat-value stat-negative'>${stats.totalLosses}</span>
                        </div>
                        <div className='stat-item'>
                            <span className='size15'>Net:</span>
                            <span className={`stat-value ${stats.totalWinnings - stats.totalLosses >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                                ${stats.totalWinnings - stats.totalLosses}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='size15'>Best Hand:</span>
                            <span className='stat-value'>{stats.bestHand}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* History Panel */}
            {showHistory && (
                <div className='containerDetail contentLeft'>
                    <div className='containerDetail contentLeft p-10 bg-lite color-yellow mb-5 size20'>
                        📜 History
                    </div>
                    <div className='height500'>
                        {handHistory.length === 0 ? (
                            <p className='empty-history'>No hands played yet</p>
                        ) : (
                            handHistory.map((entry, idx) => {
                                const results = getResults(entry);
                                const { isPlayerWinner } = results;
                                const winnerNames = entry.winnerNames || [];
                                return (
                                    <div key={getKey(`history-${entry.hand}-${idx}`)} className='containerDetail bg-lite mb-5' open={idx === 0}>
                                        <div className='containerDetail mb-5 bg-lite'>
                                            <div className='containerDetail mb-5 size12 p-10 flexContainer'>
                                                <div className='flex6Column contentLeft'>
                                                    <div className='size15'>Hand #{entry.hand}</div>
                                                    <div className='color-yellow'>{entry.timestamp}</div>
                                                </div>
                                                <div className='flexColumn contentRight'>
                                                    <div
                                                        className='history-delete-button'
                                                        onClick={() => deleteHistoryEntry(idx)}
                                                    >
                                                        Delete
                                                    </div>
                                                </div>
                                            </div>
                                            {getSummary(entry, isPlayerWinner)}
                                            </div>
                                            {getHandSummary(entry, isPlayerWinner, winnerNames)}
                                        </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Game Table */}
            <div className='poker-table'>
                {/* Opponents */}
                <div className='opponents-area'>
                    {opponents.map((opp, idx) => (
                        <div key={opp.id} className={`opponent ${opp.folded ? 'folded' : ''} ${activePlayerIndex === idx ? 'active-player' : ''}`}>
                            <div className='flexContainer'>  
                                <div className='opponent-name flex2Column contentLeft'>
                                    {opp.name}
                                </div>
                                <div className='opponent-chips flex2Column  contentRight'>
                                    ${opp.chips}
                                </div>
                            </div>
                            {opp.currentBet > 0 && <div className='opponent-bet'>Bet: ${opp.currentBet}</div>}
                            <div className='opponent-cards'>
                                {opp.hand.map((card, i) => (
                                    <div key={i}>
                                        {renderCard(card, gamePhase !== 'showdown')}
                                    </div>
                                ))}
                            </div>
                            {opp.allIn && <div className='all-in-badge'>ALL IN</div>}
                        </div>
                    ))}
                </div>

                {/* Community Cards & Pot */}
                <div className=''>
                    <div className='pot-display'>
                        Pot: <span className='pot-amount'>${pot}</span>
                    </div>
                    {gameVariant === 'texasHoldem' && communityCards.length > 0 && (
                        <div className='community-cards'>
                            {communityCards.map((card, i) => (
                                <div key={i}>{renderCard(card)}</div>
                            ))}
                        </div>
                    )}
                    <div className='game-message mb-30'>{message}</div>
                    {gamePhase === 'preGame' && (
                        <div
                            className='containerDetail btn-pulse color-yellow size20 bg-green p-20 width--10 m-5'
                            onClick={dealNewHand}
                        >
                            Deal Hand
                        </div>
                    )}

                </div>

                {/* Player Area */}
                {playerBet > 0 && 
                    <div className={`player-area ${activePlayerIndex === numOpponents ? 'active-player' : ''}`}>
                        {playerBet > 0 && <div className='player-bet'>Bet: ${playerBet}</div>}
                        <div className='player-cards'>
                            {playerHand.map((card, i) => (
                                <div key={i}>
                                    {renderCard(
                                        card, 
                                        false, 
                                        gameVariant === 'fiveCardDraw' && gamePhase === 'betting',
                                        selectedCards.includes(i),
                                        i
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
            <div className=''>
                {/* Action Buttons */}
                <div className='ml-5'>
                    {gamePhase !== 'preGame' && gamePhase !== 'showdown' && gamePhase !== 'gameOver' && activePlayerIndex === numOpponents && (
                        <div>
                            <div className='flexContainer'>
                                {gameVariant === 'fiveCardDraw' && selectedCards.length > 0 && (
                                    <div className='containerDetail bg-green color-yellow size20 p-30 button flex2Column m-10' onClick={drawCards}>
                                        Draw {selectedCards.length} Card{selectedCards.length !== 1 ? 's' : ''}
                                    </div>
                                )}
                                
                                <div 
                                    className='containerDetail p-30 size20 bg-red button color-yellow mb-5 flex2Column m-10' 
                                    onClick={playerFold}
                                >
                                    Fold
                                </div>
                                {currentBet === playerBet && (
                                    <div className='containerDetail btn-pulse mb-5 flex2Column p-30 bkg-yellow color-yellow size20 m-10' onClick={playerCheck}>
                                        Check
                                    </div>
                                )}

                                {currentBet > playerBet && (
                                    <div className='containerDetail btn-pulse mb-5 flex2Column' onClick={playerCall}>
                                        Call ${currentBet - playerBet}
                                    </div>
                                )}
                            </div> 
                            {bettingStructure !== 'callFold' && (
                                <div className='flexContainer m-10 p-10 bkg-yellow'>
                                    <div className='containerDetail pt-20 size20 width--10 btn-warning btn-pulse mr-10 flex4Column' onClick={playerRaise}>
                                        Raise
                                    </div>
                                    <input
                                        type='number'
                                        className='raise-input flexColumn p-20'
                                        value={raiseAmount}
                                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                                        min={bigBlind}
                                        max={balance}
                                        placeholder='Raise amount'
                                    />
                                </div>
                            )}
                            <div className='containerDetail btn-all-in p-20 size20 m-10' onClick={playerAllIn}>
                                All In (${balance})
                            </div>

                            {gamePhase === 'gameOver' && (
                                <div className='containerDetail' onClick={resetGame}>
                                    🔄 Reset
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
             </div>
        </div>
    );
};

export default Poker;
