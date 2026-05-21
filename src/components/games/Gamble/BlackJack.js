import React, { useState, useEffect } from 'react';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const getDeck = () => {
    const deck = [];
    SUITS.forEach((suit) => {
        RANKS.forEach((rank) => {
            deck.push({ suit, rank });
        });
    });
    return deck;
};

const shuffle = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const calculateValue = (hand) => {
    let value = 0;
    let aces = 0;
    
    // Validate that hand is an array
    if (!Array.isArray(hand)) {
        console.error('calculateValue => hand is not an array:', hand);
        return 0;
    }

    hand.forEach(({ rank }) => {
        console.log('calculateValue => rank:', rank);
        if (['K', 'Q', 'J'].includes(rank)) value += 10;
        else if (rank === 'A') {
            value += 11;
            aces++;
        } else value += Number(rank);
    });

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
};

const Card = ({ card }) => (
    <div className='flexColumn containerDetail p-5 m-10 w-100 bg-white color-dark'>
        <div className='flexContainer pb-15 pt-5'>
            <div className='flex3Column'>
                {card.rank}
            </div>
            <div className='flex3Column'>
            </div>
            <div className='flex3Column'>
            </div>
        </div>
        <div className='flexContainer'>
            <div className='flex3Column'>
            </div>
            <div className='flex3Column size100'>
                {card.suit}
            </div>
            <div className='flex3Column'>
            </div>
        </div>
        <div className='flexContainer pt-40'>
            <div className='flex3Column'>
            </div>
            <div className='flex3Column'>
            </div>
            <div className='flex3Column'>
                {card.rank}
            </div>
        </div>
    </div>
);

const BlackJack = () => {
    const [deck, setDeck] = useState(shuffle(getDeck()));
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [balance, setBalance] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [betPlaced, setBetPlaced] = useState(false);
    const [insuranceBet, setInsuranceBet] = useState(0);
    const [insuranceOffered, setInsuranceOffered] = useState(false);
    const [showInitModal, setShowInitModal] = useState(true);

    const CHIP_VALUES = [5, 10, 25, 50, 100, 500];
    const CHIP_COLORS = [
        { bg: '#ff0000a1', text: '#FF0000' },  // $5 - Red
        { bg: '#0066CCa1', text: '#0066CC' },  // $10 - Blue
        { bg: '#00AA00a1', text: '#00AA00' },  // $25 - Green
        { bg: '#000000', text: '#CCCCCC' },  // $50 - Black
        { bg: '#800080a1', text: '#800080' },  // $100 - Purple
        { bg: '#FF6600a1', text: '#FF6600' }   // $500 - Orange
    ];


    // Initialize balance on mount
    useEffect(() => {
        const savedBalance = localStorage.getItem('blackJackBalance');
        if (savedBalance && parseFloat(savedBalance) > 0) {
            // Saved balance exists, modal will ask user what to do
            setBalance(parseFloat(savedBalance));
            setShowInitModal(true);
        } else {
            // No saved balance, use default
            setBalance(1000);
            setShowInitModal(false);
        }
    }, []);

    // Save balance to localStorage whenever it changes
    useEffect(() => {
        if (balance >= 0) {
            localStorage.setItem('blackJackBalance', balance.toString());
        }
    }, [balance]);
    useEffect(() => {
        if ((currentBet > 0) && (playerHand.length === 0)) {
            dealInitialCards();
        }
        // dealInitialCards is intentionally excluded to avoid re-trigger loops from function identity changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBet, playerHand.length]);

    const handleContinueWithSaved = () => {
        const savedBalance = localStorage.getItem('blackJackBalance');
        setBalance(parseFloat(savedBalance) || 1000);
        setShowInitModal(false);
    };

    const handleStartNew = () => {
        const newBalance = prompt('Enter starting balance:', '1000');
        const parsedBalance = parseFloat(newBalance);
        
        if (!isNaN(parsedBalance) && parsedBalance > 0) {
            setBalance(parsedBalance);
            localStorage.setItem('blackJackBalance', parsedBalance.toString());
        } else {
            setBalance(1000);
            localStorage.setItem('blackJackBalance', '1000');
        }
        
        setShowInitModal(false);
    };

    const placeBet = (amount) => {
        if (balance >= amount) {
            setCurrentBet(prev => prev + amount);
            setBalance(prev => prev - amount);
        }
    };

    const clearBet = () => {
        setBalance(prev => prev + currentBet);
        setCurrentBet(0);
    };

    const dealInitialCards = () => {
        if (currentBet === 0) {
            setMessage('Place a bet first!');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Create a fresh deck to avoid running out of cards
        const freshDeck = shuffle(getDeck());
        
        if (freshDeck.length < 4) {
            setMessage('Error: Deck issue. Please refresh.');
            return;
        }
        
        const player = [freshDeck.pop(), freshDeck.pop()];
        const dealer = [freshDeck.pop(), freshDeck.pop()];

        setPlayerHand(player);
        setDealerHand(dealer);
        setDeck(freshDeck);
        setGameOver(false);
        setMessage('');
        setBetPlaced(true);
        setInsuranceOffered(false);
        setInsuranceBet(0);

        // Check for blackjack
        const playerValue = calculateValue(player);
        const dealerValue = calculateValue(dealer);

        // Offer insurance if dealer shows Ace
        if (dealer[0].rank === 'A' && playerValue !== 21) {
            setInsuranceOffered(true);
            return; // Wait for insurance decision
        }

        // Check for immediate blackjack
        if (playerValue === 21 && dealerValue === 21) {
            setGameOver(true);
            setMessage('Push - Both Blackjack!');
            setBalance(prev => prev + currentBet);
        } else if (playerValue === 21) {
            setGameOver(true);
            setMessage('Blackjack! You Win 3:2');
            setBalance(prev => prev + currentBet + Math.floor(currentBet * 1.5));
        } else if (dealerValue === 21) {
            setGameOver(true);
            setMessage('Dealer Blackjack! Dealer Wins.');
        }
    };

    const handleInsurance = (accept) => {
        const insuranceAmount = currentBet / 2;
        
        if (accept && balance >= insuranceAmount) {
            setInsuranceBet(insuranceAmount);
            setBalance(prev => prev - insuranceAmount);
        }
        
        setInsuranceOffered(false);

        // Check if dealer has blackjack
        if (calculateValue(dealerHand) === 21) {
            setGameOver(true);
            if (accept) {
                setMessage('Dealer Blackjack! Insurance pays 2:1');
                setBalance(prev => prev + insuranceAmount * 3); // Return bet + 2:1 payout
            } else {
                setMessage('Dealer Blackjack! Dealer Wins.');
            }
        }
    };

    const handleHit = () => {
        console.log('Handle Hit called');
        if (gameOver || insuranceOffered) {
            console.log('Handle Hit called!!! Game over or insurance offered, cannot hit.');
            return;
        }

        console.log('Handle Hit called!!! Game continues.');

        let newDeck = [...deck];
        
        // Check if deck needs reshuffling
        if (newDeck.length === 0) {
            newDeck = shuffle(getDeck());
        }
        console.log('Handle Hit called!!! Deck checked.');
        const newCard = newDeck.pop();
        const newHand = [...playerHand, newCard];

        setPlayerHand(newHand);
        setDeck(newDeck);
        console.log('Handle Hit called!!! Player hand and deck updated.');

        const value = calculateValue(newHand);
        console.log('Handle Hit called!!! Player hand value calculated:', value);
        
        if (value > 21) {
            setGameOver(true);
            setMessage('You Busted! Dealer Wins.');
        } else if (value === 21) {
            // Automatically stand when player hits 21
            console.log('Handle Hit called!!! Player has 21, auto-standing.');
            
            // Resolve dealer hand immediately
            let dealerDeck = [...newDeck];
            let finalDealerHand = [...dealerHand];

            while (calculateValue(finalDealerHand) < 17) {
                if (dealerDeck.length === 0) {
                    dealerDeck = shuffle(getDeck());
                }
                finalDealerHand.push(dealerDeck.pop());
            }

            const dealerValue = calculateValue(finalDealerHand);

            setDealerHand(finalDealerHand);
            setDeck(dealerDeck);
            setGameOver(true);

            if (dealerValue > 21) {
                setMessage('Dealer Busted! You Win!');
                setBalance(prev => prev + currentBet * 2);
            } else if (dealerValue < 21) {  // FIXED: dealer value less than 21
                setMessage('You Win!');
                setBalance(prev => prev + currentBet * 2);
            } else {  // dealerValue === 21
                setMessage('Push (Tie).');
                setBalance(prev => prev + currentBet);
            }
        }
    };

    const handleDouble = () => {
        console.log('Handle Double called');
        if (balance >= currentBet && playerHand.length === 2 && !gameOver && !insuranceOffered) {
            setBalance(prev => prev - currentBet);
            const doubledBet = currentBet * 2;
            setCurrentBet(doubledBet);

            const newDeck = [...deck];
            const newCard = newDeck.pop();
            const newHand = [...playerHand, newCard];

            setPlayerHand(newHand);
            setDeck(newDeck);

            const value = calculateValue(newHand);
            if (value > 21) {
                setGameOver(true);
                setMessage('You Busted! Dealer Wins.');
            } else {
                // Immediately resolve dealer hand
                let dealerDeck = [...newDeck];
                let finalDealerHand = [...dealerHand];

                while (calculateValue(finalDealerHand) < 17) {
                    if (dealerDeck.length === 0) {
                        dealerDeck = shuffle(getDeck());
                    }
                    finalDealerHand.push(dealerDeck.pop());
                }

                const playerValue = calculateValue(newHand);
                const dealerValue = calculateValue(finalDealerHand);

                setDealerHand(finalDealerHand);
                setDeck(dealerDeck);
                setGameOver(true);

                if (dealerValue > 21) {
                    setMessage('Dealer Busted! You Win!');
                    setBalance(prev => prev + doubledBet * 2);
                } else if (playerValue > dealerValue) {
                    setMessage('You Win!');
                    setBalance(prev => prev + doubledBet * 2);
                } else if (playerValue < dealerValue) {
                    setMessage('Dealer Wins.');
                } else {
                    setMessage('Push (Tie).');
                    setBalance(prev => prev + doubledBet);
                }
            }
        }
    };

    const handleStand = () => {
        console.log('Handle Stand called');
        console.log('Handle Stand => playerHand:', playerHand);
        console.log('Handle Stand => dealerHand:', dealerHand);
        
        if (gameOver || insuranceOffered) {
            console.log('Handle Stand called!!! Game over or insurance offered, cannot stand.');
            return;
        }
        console.log('Handle Stand called!!! Game continues.');
        let newDeck = [...deck];
        let newDealerHand = [...dealerHand];

        // Dealer draws until 17 or higher
        while (calculateValue(newDealerHand) < 17) {
            if (newDeck.length === 0) {
                newDeck = shuffle(getDeck()); // Reshuffle if needed
            }
            newDealerHand.push(newDeck.pop());
        }
        console.log('Handle Stand called!!! Dealer finished drawing.');
        console.log('Handle Stand => newDealerHand:', newDealerHand);
        
        const playerValue = calculateValue(playerHand);
        const dealerValue = calculateValue(newDealerHand);

        console.log('Handle Stand called!!! Game over set to true. Player:', playerValue, 'Dealer:', dealerValue);
        console.log('Handle Stand => Comparison: playerValue > dealerValue =', playerValue > dealerValue);
        console.log('Handle Stand => Comparison: playerValue < dealerValue =', playerValue < dealerValue);
        console.log('Handle Stand => Comparison: playerValue === dealerValue =', playerValue === dealerValue);

        setDealerHand(newDealerHand);
        setDeck(newDeck);
        setGameOver(true);
        
        if (dealerValue > 21) {
            console.log('Handle Stand => Result: Dealer Busted!');
            setMessage('Dealer Busted! You Win!');
            setBalance(prev => prev + currentBet * 2);
        } else if (playerValue > dealerValue) {
            console.log('Handle Stand => Result: Player Wins!');
            setMessage('You Win!');
            setBalance(prev => prev + currentBet * 2);
        } else if (playerValue < dealerValue) {
            console.log('Handle Stand => Result: Dealer Wins!');
            setMessage('Dealer Wins.');
        } else {
            console.log('Handle Stand => Result: Push!');
            setMessage('Push (Tie).');
            setBalance(prev => prev + currentBet);
        }
    };

    const handleRestart = () => {
        setDeck(shuffle(getDeck()));
        setPlayerHand([]);
        setDealerHand([]);
        setGameOver(false);
        setMessage('');
        setCurrentBet(0);
        setBetPlaced(false);
        setInsuranceBet(0);
        setInsuranceOffered(false);
    };

    const resetBalance = () => {
        const newBalance = prompt('Enter new starting balance:', '1000');
        const parsedBalance = parseFloat(newBalance);
        
        if (!isNaN(parsedBalance) && parsedBalance > 0) {
            setBalance(parsedBalance);
            handleRestart();
        }
    };

    if (showInitModal) {
        return (
            <div className='mt--30 color-lite'>
                <div className='containerDetail size30 p-20 m-5 bg-yellow color-dark'>BlackJack 🃏</div>
                <div className='containerDetail m-5 bg-tintedMedium p-20'>
                    <div className='containerDetail p-10 color-yellow size25 mb-20'>
                        Welcome Back!
                    </div>
                    <div className='containerDetail p-10 color-lite size20 mb-20'>
                        Saved Balance: ${parseFloat(balance || 0).toFixed(2)}
                    </div>
                    <div className='flexContainer'>
                        <div
                            className='button flex2Column containerDetail m-5 p-20 size20 bg-green color-lite'
                            onClick={handleContinueWithSaved}
                        >
                            Continue Playing
                        </div>
                        <div
                            className='button flex2Column containerDetail m-5 p-20 size20 bg-blue color-lite'
                            onClick={handleStartNew}
                        >
                            Start New Game
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='mt--30 color-lite'>
            <div className='containerDetail size30 p-20 m-5 bg-yellow color-dark'>BlackJack 🃏</div>
            
            {/* Balance Display */}
            <div className='containerDetail p-10 m-5 bg-lite mt-5 color-yellow size20'>
                <div className='flexContainer p-5'>
                    <div className='flex2Column contentRight'>
                        Balance: 
                    </div>
                    <div className='flex2Column contentLeft ml-10 color-lite'>
                        ${balance.toFixed(2)}
                    </div>
                </div>
                <div className='flexContainer p-5'>
                    <div className='flex2Column contentRight'>
                        Bet: 
                    </div>
                    <div className='flex2Column contentLeft ml-10 color-lite'>
                        ${currentBet.toFixed(2)}
                    </div>
                </div>
                {insuranceBet > 0 && (
                    <div className='flexContainer p-5'>
                        <div className='flex2Column contentRight'>
                            Insurance:
                        </div>
                        <div className='flex2Column contentLeft ml-10 color-lite'>
                            ${insuranceBet.toFixed(2)}
                        </div>
                    </div>
                )}
            </div>
            <div
                className='m-5 button containerDetail p-10 size15 bg-tinted color-lite'
                onClick={resetBalance}
                title='Reset balance to new amount'
            >
                Reset Balance
            </div>
            {/* Betting Chips */}
            {!betPlaced && currentBet <= 0 && (
                <div className='containerDetail m-5 bg-tintedMedium p-10 completedSelector'>
                    <div className='containerDetail p-10 color-yellow size20'>
                        Place Your Bet
                    </div>
                    <div className='containerDetail mt-5'>
                        {CHIP_VALUES.map((value, index) => (
                        <div
                            key={value}
                            className={`m-10 button fl-left p-20 size20 r-65 ${
                                balance >= value ? '' : 'bg-tinted color-lite'
                            }`}
                            onClick={() => balance >= value && placeBet(value)}
                            style={{ 
                                opacity: balance >= value ? 1 : 0.5,
                                cursor: balance >= value ? 'pointer' : 'not-allowed',
                                width: '130px',
                                height: '130px',
                                backgroundColor: balance >= value ? CHIP_COLORS[index].bg : undefined,
                                color: balance >= value ? CHIP_COLORS[index].text : undefined,
                                border: balance >= value ? `3px solid ${CHIP_COLORS[index].text}` : undefined,
                                boxShadow: balance >= value ? '0 4px 8px rgba(0,0,0,0.3)' : undefined,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            title={balance >= value ? `Add $${value} to bet` : `Insufficient funds`}
                        >
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '80px',
                                    opacity: 0.5,
                                    zIndex: 0,
                                    pointerEvents: 'none'
                                }}
                            >
                                { 
                                    (value < 20)
                                    ? '💵'
                                    : (value < 100)
                                        ? '💰'
                                        : '🤑'
                                }
                            </div>
                            <div style={{ position: 'relative', zIndex: 1 }} className='size35 mt-30 bold color-yellow'>
                                {value}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            )}
            
            {currentBet > 0 && !betPlaced && (
                <div className='flexContainer p-10'>
                    <div
                        className='button flex2Column containerDetail m-5 p-15 size20 bg-red color-lite'
                        onClick={clearBet}
                        title='Remove all bets and return chips'
                    >
                        Clear Bet
                    </div>
                </div>
            )}

            {/* Insurance Offer */}
            {insuranceOffered && (
                <div className='containerDetail m-5 bg-yellow color-dark p-20'>
                    <div className='size20 pb-10'>Dealer shows Ace. Insurance?</div>
                    <div className='flexContainer'>
                        <div
                            className='button flex2Column containerDetail m-5 p-15 size20 bg-green color-dark'
                            onClick={() => handleInsurance(true)}
                            disabled={balance < currentBet / 2}
                        >
                            Yes (${(currentBet / 2).toFixed(2)})
                        </div>
                        <div
                            className='button flex2Column containerDetail m-5 p-15 size20 bg-red color-lite'
                            onClick={() => handleInsurance(false)}
                        >
                            No
                        </div>
                    </div>
                </div>
            )}
            <div className={`containerBox bg-${(message === 'You Win!' || message.includes('Blackjack!')) ? 'green' : (message === 'Dealer Wins.' || message === 'You Busted! Dealer Wins.') ? 'red' : 'green'}`}>
                {message && <div className='size20 p-10'>{message}</div>}
            </div>
            {betPlaced && currentBet > 0 && (
                <div className={`containerDetail size20 m-5 bg-${(message === 'You Win!' || message.includes('Blackjack!')) ? 'green completedSelector' : (message === 'Dealer Wins.' || message === 'You Busted! Dealer Wins.') ? 'green' : 'green'}`}>
                    <div className='containerDetail p-20 color-yellow size25 m-5'>
                        You: {calculateValue(playerHand)}
                    </div>
                    <div className='containerDetail p-5 flexContainer m-5 h-scroll ht-150'>
                        {   
                            (playerHand.length === 0) ? (
                                <div className='containerDetail p-20 color-yellow ht-150'>
                                    No Cards Dealt
                                </div>
                            ) : playerHand.map((card, i) => (
                                <Card key={i} card={card} />
                            ))
                        }
                    </div>
                    <div className=''>
                        {playerHand.length === 0 ? (
                            <div 
                                className={`button containerDetail m-5 p-20 flex2Column size25 ${
                                    currentBet > 0 ? 'bg-green color-yellow' : 'bg-tinted color-lite'
                                }`}
                                onClick={dealInitialCards}
                            >
                                Deal
                            </div>
                        ) : gameOver ? (
                            <div className='button containerDetail m-5 p-20 flex2Column bg-yellow size25 color-dark' onClick={handleRestart}>
                                Deal New Hand
                            </div>
                        ) : !insuranceOffered ? (
                            <div className='flexContainer color-dark size25 m-5'>
                                <div className='button containerDetail bg-yellow pt-20 pb-20 flex3Column' onClick={handleHit}>
                                    Hit
                                </div>
                                <div className='button containerDetail bg-yellow ml-5 pt-20 pb-20 flex3Column' onClick={handleStand}>
                                    Stand
                                </div>
                                {playerHand.length === 2 && balance >= currentBet && (
                                    <div className='button containerDetail bg-yellow  ml-5 pt-20 pb-20 flex3Column' onClick={handleDouble}>
                                        Double
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
            {betPlaced && currentBet > 0 && (
                <div className={`containerDetail m-5 size20 bg-${(message === 'You Win!' || message.includes('Blackjack!')) ? 'red' : (message === 'Dealer Wins.' || message === 'You Busted! Dealer Wins.') ? 'blue completedSelector' : 'blue'}`}>
                    <div className='containerDetail p-20 color-yellow m-5 size25 '>
                        Dealer: {calculateValue(dealerHand)}
                    </div>
                    <div className='containerDetail p-5 flexContainer m-5 h-scroll ht-150'>
                        {(dealerHand.length === 0) ? (
                            <div className='containerDetail p-20 color-yellow ht-150'>No Cards Dealt</div>
                        ) : dealerHand.map((card, i) => (
                            <Card key={i} card={card} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlackJack;