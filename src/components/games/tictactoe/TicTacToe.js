import { useState } from 'react';
import Sounds from '../../sound/Sounds.js';

const Game = () => {

    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const [ winningLine, setWinningLine] = useState(null);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];
    const [squaresDisplay, setSquaresDisplay] = useState(Array(9).fill(null));
    const [squares, setSquares] = useState(Array(9).fill(null));

    const boxes = [
        'squareTopLeft',
        'squareTopCenter',
        'squareTopRight',
        'squareLeftMiddle',
        'squareCenterMiddle',
        'squareCenterRight',
        'squareBottomLeft',
        'squareBottomCenter',
        'squareBottomRight'
    ];

    const Square = ({
        index,
        value,
        onSquareClick 
    }) => {
        const isWinner = calculateWinner(currentSquares) || [null,null];
        let winningRow = (isWinner[0] && isWinner[0].includes(value)) ? true : false;
        return (
            <button 
                title={(currentSquares[value] === null) ? `select square ${(xIsNext ? 'X' : 'O')}` : `occupied by ${currentSquares[value]}`}
                className={`${boxes[value]}`} 
                onClick={onSquareClick}
            >
                <span className={`${(winningRow) ? 'color-neogreen' : null}`}>
                    {currentSquares[value]}
                </span>
            </button>
        );
    }
    const handlePlay = (index, nextSquares) => {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        const newSquares = [...squaresDisplay];
        newSquares[index] = nextSquares[index];
        setSquaresDisplay(newSquares);
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }
    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squaresDisplay[a] && squaresDisplay[a] === squaresDisplay[b] && squaresDisplay[a] === squaresDisplay[c]) {
                return [lines[i], squaresDisplay[a]];
            }
        }        
        return null;
    }
    const displayBoard = () => {
        const handleClick = (i) => {
            const isWinner = calculateWinner(currentSquares) || [null,null]
            if (isWinner[1] || currentSquares[i]) {
                return;
            }
            const nextSquares = currentSquares.slice();
            if (xIsNext) {
                nextSquares[i] = 'X';
            } else {
                nextSquares[i] = 'O';
            }
            handlePlay(i, nextSquares);
        }
    
        const winner = calculateWinner(currentSquares) || [null,null];
        let status;
        if (winner[1]) {
            status = <div className='color-neogreen blinking-fade'>{winner[1]} Wins!</div>;
        } else {
            status = 'Next player: ' + (xIsNext ? 'X' : 'O');
        }
    
        return (
            <div className='containerDetail width-100-percent bg-lite mt--30'>
                <div className='containerDetail color-lite bold size35 m-5 p-20'>{status}</div>
                <div className='containerBox centeredContent mt-10 p-20'>
                    <div className='board-row'>
                        <Square value={0} onSquareClick={() => handleClick(0)} />
                        <Square value={1} onSquareClick={() => handleClick(1)} />
                        <Square value={2} onSquareClick={() => handleClick(2)} />
                    </div>
                    <div className='board-row'>
                        <Square value={3} onSquareClick={() => handleClick(3)} />
                        <Square value={4} onSquareClick={() => handleClick(4)} />
                        <Square value={5} onSquareClick={() => handleClick(5)} />
                    </div>
                    <div className='board-row'>
                        <Square value={6} onSquareClick={() => handleClick(6)} />
                        <Square value={7} onSquareClick={() => handleClick(7)} />
                        <Square value={8} onSquareClick={() => handleClick(8)} />
                    </div>
                </div>
            </div>
        );
    }

    const jumpTo = (nextMove) => {
        setCurrentMove(nextMove);
    }
    const restart = () => {
        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setWinningLine(null);
        setSquaresDisplay(Array(9).fill(null));
    }

    const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = 'move ' + move;
        } else {
            description = 'Go to game start';
        }
        return (
            <div 
                title={description}
                key={move} 
                className='containerDetail p-20 m-5 bg-lite button color-lite button' 
                onClick={() => jumpTo(move)}
            >
                {description}
            </div>
        );
    }).reverse();

    return (
        <div className='game containerDetail'>
            { displayBoard() }
            <div className='containerDetail bg-lite mt-5 size25'>
                <div onClick={() => restart()} className='containerDetail button bg-green size25 p-20 ml-5 mr-5 color-lite mt-5 mb-5'>
                    Restart
                </div>
                {moves}
            </div>
        </div>
    );
}
export default Game;