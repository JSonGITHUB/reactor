// CrosswordPuzzle.js
import React, { useState, useEffect } from 'react';
import { PUZZLES } from './puzzles'; // your puzzles.js with 10 themes

const GRID_SIZE = 10;

const CrosswordPuzzle = () => {
    const themes = Object.keys(PUZZLES);

    const [selectedTheme, setSelectedTheme] = useState(themes[0]);
    const [grid, setGrid] = useState([]);
    const [clues, setClues] = useState({ across: [], down: [] });
    const [numberedGrid, setNumberedGrid] = useState([]);

    useEffect(() => {
        // Pick a random theme from PUZZLES keys
        const themes = Object.keys(PUZZLES);
        const index = Math.floor(Math.random() * themes.length);
        const themeKey = themes[index];
        setSelectedTheme(themeKey);
        initializePuzzle(PUZZLES[themeKey]);
    }, []);

    const initializePuzzle = (themeData) => {
        // themeData should be an array of word objects
        const emptyGrid = Array(GRID_SIZE)
            .fill(null)
            .map(() => Array(GRID_SIZE).fill(''));

        const numberingGrid = Array(GRID_SIZE)
            .fill(null)
            .map(() => Array(GRID_SIZE).fill(null));

        let clueNum = 1;
        const acrossClues = [];
        const downClues = [];

        themeData.forEach((wordObj) => {
            const { word, clue, direction, row, col } = wordObj;
            if (!word) return;

            for (let i = 0; i < word.length; i++) {
                const r = direction === 'across' ? row : row + i;
                const c = direction === 'across' ? col + i : col;
            
                // Only set if within grid bounds
                if (
                    r >= 0 && r < GRID_SIZE &&
                    c >= 0 && c < GRID_SIZE
                ) {
                    // Mark cell as part of a word
                    emptyGrid[r][c] = '';
            
                    // Number cell if it's the start of a word
                    if (i === 0 && !numberingGrid[r][c]) {
                        numberingGrid[r][c] = clueNum;
                        if (direction === 'across') acrossClues.push({ num: clueNum, clue });
                        else downClues.push({ num: clueNum, clue });
                        clueNum++;
                    }
                }
            }
        });

        setGrid(emptyGrid);
        setNumberedGrid(numberingGrid);
        setClues({ across: acrossClues, down: downClues });
    };

    const handleChange = (row, col, val) => {
        if (val.length > 1) return;
        const newGrid = [...grid];
        newGrid[row][col] = val.toUpperCase();
        setGrid(newGrid);
    };

    return (
        <div>
            <h2>Crossword Puzzle</h2>
            <label>
                Select Theme:{" "}
                <select value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)}>
                    {themes.map((theme) => (
                        <option key={theme} value={theme}>{theme}</option>
                    ))}
                </select>
            </label>

            <div style={{ display: 'inline-block', marginTop: '20px' }}>
                {grid.map((rowArr, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex' }}>
                        {rowArr.map((cell, colIdx) => {
                            const number = numberedGrid[rowIdx][colIdx];
                            const isBlack = !PUZZLES[selectedTheme].some(
                                w => {
                                    const positions = Array.from({ length: w.word.length }, (_, i) =>
                                        w.direction === 'across'
                                            ? [w.row, w.col + i]
                                            : [w.row + i, w.col]
                                    );
                                    return positions.some(([r, c]) => r === rowIdx && c === colIdx);
                                }
                            );
                            return (
                                <div
                                    key={colIdx}
                                    style={{
                                        color: 'green',
                                        width: 35,
                                        height: 35,
                                        border: '1px solid black',
                                        position: 'relative',
                                        backgroundColor: isBlack ? 'black' : 'white'
                                    }}
                                >
                                    {number && !isBlack && (
                                        <span style={{ fontSize: 10, position: 'absolute', top: 0, left: 0 }}>
                                            {number}
                                        </span>
                                    )}
                                    {!isBlack && (
                                        <input
                                            type="text"
                                            maxLength="1"
                                            value={grid[rowIdx][colIdx]}
                                            onChange={(e) => handleChange(rowIdx, colIdx, e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                textAlign: 'center',
                                                textTransform: 'uppercase',
                                                border: 'none',
                                                outline: 'none',
                                                fontWeight: 'bold',
                                                fontSize: '16px'
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
                <div>
                    <h3>Across</h3>
                    <ul>
                        {clues.across.map(c => <li key={c.num}>{c.num}. {c.clue}</li>)}
                    </ul>
                </div>
                <div>
                    <h3>Down</h3>
                    <ul>
                        {clues.down.map(c => <li key={c.num}>{c.num}. {c.clue}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CrosswordPuzzle;