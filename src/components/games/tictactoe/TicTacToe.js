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

    const Square = ({
        value,
        onSquareClick 
    }) => {
        const isWinner = calculateWinner(currentSquares) || [null,null];
        let winningRow = (isWinner[0] && isWinner[0].includes(value)) ? true : false;
        return (
            <button 
                title={(currentSquares[value] === null) ? `select square ${(xIsNext ? 'X' : 'O')}` : `occupied by ${currentSquares[value]}`}
                className='square' 
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
            status = <div className='color-neogreen blinking-fade'>Winner: {winner[1]} </div>;
        } else {
            status = 'Next player: ' + (xIsNext ? 'X' : 'O');
        }
    
        return (
            <div className=''>
                <div className='containerDetail color-dark bold size35 m-5 p-20'>{status}</div>
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

    const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = 'Go to move #' + move;
        } else {
            description = 'Go to game start';
        }
        return (
            <button 
                title={description}
                key={move} 
                className='containerBox button width-100-percent color-dark' 
                onClick={() => jumpTo(move)}
            >
                {description}
            </button>
        );
    }).reverse();

    return (
        <div className='game containerBox width-100-percent'>
            { displayBoard() }
            <div className='containerBox'>
                <div className='maxWidth300 m-auto'>
                    {moves}
                </div>
            </div>
        </div>
    );
}
export default Game;