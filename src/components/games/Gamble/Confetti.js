// src/Confetti.js
import React, { useEffect, useState } from 'react';
import './Confetti.css';

const Confetti = () => {
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        const colors = ['#FFC700', '#FF0000', '#2E3191', '#41BBC7', '#A5DC86'];
        const temp = Array.from({ length: 100 }).map((_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 2,
        }));
        setPieces(temp);
    }, []);

    return (
        <div className="confetti-wrapper">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        backgroundColor: piece.color,
                        left: `${piece.left}%`,
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;