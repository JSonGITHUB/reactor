import React, { useState } from 'react';

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

    hand.forEach(({ rank }) => {
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
    <div className='flexColumn containerDetail p-5 m-10 width-100 bg-white ht-150 color-dark'>
        <div className='flexContainer pb-25 pt-10'>
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
        <div className='flexContainer pt-40 pb-10'>
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

    const dealInitialCards = () => {
        const newDeck = [...deck];
        const player = [newDeck.pop(), newDeck.pop()];
        const dealer = [newDeck.pop(), newDeck.pop()];

        setPlayerHand(player);
        setDealerHand(dealer);
        setDeck(newDeck);
        setGameOver(false);
        setMessage('');
    };

    const handleHit = () => {
        const newDeck = [...deck];
        const newCard = newDeck.pop();
        const newHand = [...playerHand, newCard];

        setPlayerHand(newHand);
        setDeck(newDeck);

        const value = calculateValue(newHand);
        if (value > 21) {
            setGameOver(true);
            setMessage('You Busted! Dealer Wins.');
        }
    };

    const handleStand = () => {
        let newDeck = [...deck];
        let newDealerHand = [...dealerHand];

        while (calculateValue(newDealerHand) < 17) {
            newDealerHand.push(newDeck.pop());
        }

        const playerValue = calculateValue(playerHand);
        const dealerValue = calculateValue(newDealerHand);

        setDealerHand(newDealerHand);
        setDeck(newDeck);
        setGameOver(true);

        if (dealerValue > 21 || playerValue > dealerValue) {
            setMessage('You Win!');
        } else if (playerValue < dealerValue) {
            setMessage('Dealer Wins.');
        } else {
            setMessage('Push (Tie).');
        }
    };

    const handleRestart = () => {
        setDeck(shuffle(getDeck()));
        setPlayerHand([]);
        setDealerHand([]);
        setGameOver(false);
        setMessage('');
    };

    return (
        <div className='containerDetail mt--30 color-lite'>
            <div className='containerDetail size30 p-20 m-5 bg-yellow color-dark'>BlackJack 🃏</div>
            <div className='containerBox'>
                <div className='containerBox bg-lite'>
                    <div className='containerDetail p-20 color-yellow size25 m-5'>
                        You: {calculateValue(playerHand)}
                    </div>
                    <div className='containerDetail p-20 flexContainer m-5 bg-green'>
                        {playerHand.map((card, i) => (
                            <Card key={i} card={card} />
                        ))}
                    </div>
                </div>
                <div className='controls'>
                    {playerHand.length === 0 ? (
                        <div className='button containerBox flex2Column bg-dkYellow' onClick={dealInitialCards}>
                            Deal
                        </div>
                    ) : gameOver ? (
                            <div className='button containerBox flex2Column bg-dkYellow' onClick={handleRestart}>
                                Restart
                            </div>
                    ) : (
                        <div className='containerBox flexContainer'>
                            <div className='button containerBox flex2Column bg-green' onClick={handleHit}>
                                Hit
                            </div>
                            <div className='button containerBox flex2Column bg-dkYellow' onClick={handleStand}>
                                Stand
                            </div>
                        </div>
                    )}
                </div>
                <div className={`containerBox bg-${(message === 'You Win!') ? 'green' : (message === 'Dealer Wins.' || message === 'You Busted! Dealer Wins.') ? 'red' : 'lite'}`}>
                    {message && <div>{message}</div>}
                </div>
                <div className='containerBox bg-lite'>
                    <div className='containerDetail p-20 color-yellow m-5 size25'>
                        Dealer: {calculateValue(dealerHand)}
                    </div>
                    <div className='containerDetail p-20 flexContainer m-5 bg-blue'>
                        {dealerHand.map((card, i) => (
                            <Card key={i} card={card} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlackJack;