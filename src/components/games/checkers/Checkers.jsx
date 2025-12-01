import React, { useState, useEffect, useRef } from 'react';
import './checkers.css';
import icons from '../../site/icons';

/*
  Checkers Implementation Notes:
  - Board coordinates: 8x8
  - Board cells hold null or { player: 1|2, king: bool, id }
  - Standard American checkers rules: dark squares used, mandatory captures assumed in move generation where possible
  - History: array of board states + metadata, with historyIndex pointer for undo/redo
  - Persistence: saves 'lastGame' and 'games' (completed) into localStorage
  - AI: easy/medium/hard as described
*/

// Audio placeholders - replace with actual asset URLs if you like
const SOUNDS = {
    move: '/sounds/move.mp3', // required: your hosting of audio files
    capture: '/sounds/capture.mp3',
    win: '/sounds/win.mp3',
};

// Helper: play sound if available
const playSound = (name) => {
    const url = SOUNDS[name];
    if (!url) return;
    try {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(() => { });
    } catch (e) { }
};

// Utilities
const deepClone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

// Starting board generator (standard)
const createStartingBoard = () => {
    // Only dark squares used: we'll use r+c % 2 === 1 as playable
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 === 1) {
                board[r][c] = { player: 2, king: false, id: uid() }; // player 2 starts top
            }
        }
    }
    for (let r = 5; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 === 1) {
                board[r][c] = { player: 1, king: false, id: uid() }; // player 1 bottom
            }
        }
    }
    return board;
};

// Save / load keys
const STORAGE_KEYS = {
    LAST_GAME: 'checkers_last_game_v1',
    GAMES: 'checkers_games_v1',
    DARK: 'checkers_dark_v1',
};

// Move & capture logic
const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

// Return all moves for a player: each move is {from: [r,c], to: [r2,c2], captures: [[r,c],...]}
const generateAllMoves = (board, player) => {
    // First, compute capture moves (mandatory if present)
    const capturingMoves = [];

    const directions = (piece) => {
        if (piece.king) return [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        return piece.player === 1 ? [[-1, -1], [-1, 1]] : [[1, 1], [1, -1]];
    };

    const cloneAndApplyCapture = (b, fromR, fromC, pathCaptures, seq) => {
        // recursive DFS to find multi-jump sequences
        let piece = b[fromR][fromC];
        let moved = false;
        const dirs = directions(piece);
        for (const [dr, dc] of dirs) {
            const midR = fromR + dr;
            const midC = fromC + dc;
            const landR = fromR + dr * 2;
            const landC = fromC + dc * 2;
            if (
                inBounds(landR, landC) &&
                b[midR] &&
                b[midR][midC] &&
                b[midR][midC].player !== piece.player &&
                !b[landR][landC]
            ) {
                // perform capture
                const nb = deepClone(b);
                nb[landR][landC] = nb[fromR][fromC];
                nb[fromR][fromC] = null;
                nb[midR][midC] = null;
                // promote if reaches end
                if ((nb[landR][landC].player === 1 && landR === 0) || (nb[landR][landC].player === 2 && landR === 7)) {
                    nb[landR][landC].king = true;
                }
                // continue searching from landing square
                const newPath = [...pathCaptures, [midR, midC]];
                const subSeq = cloneAndApplyCapture(nb, landR, landC, newPath, seq);
                if (!subSeq.length) {
                    // end of chain
                    seq.push({ from: [fromR, fromC], to: [landR, landC], captures: newPath });
                } else {
                    // append sequences
                    for (const s of subSeq) {
                        seq.push({ from: [fromR, fromC], to: s.to, captures: newPath.concat(s.captures) });
                    }
                }
                moved = true;
            }
        }
        return moved ? seq : [];
    };

    // find captures
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.player === player) {
                const seq = [];
                cloneAndApplyCapture(board, r, c, [], seq);
                if (seq.length) capturingMoves.push(...seq);
            }
        }
    }
    if (capturingMoves.length) return capturingMoves;

    // if no captures, normal moves
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.player === player) {
                const dirs = directions(p);
                for (const [dr, dc] of dirs) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (inBounds(nr, nc) && !board[nr][nc]) {
                        moves.push({ from: [r, c], to: [nr, nc], captures: [] });
                    }
                }
            }
        }
    }
    return moves;
};

// Apply a move to a board, returning new board + whether it was capture
const applyMove = (board, move) => {
    const nb = deepClone(board);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const p = nb[fr][fc];
    nb[fr][fc] = null;
    nb[tr][tc] = p;
    if (move.captures && move.captures.length) {
        for (const [cr, cc] of move.captures) {
            nb[cr][cc] = null;
        }
    }
    // promote if reached far rank
    if ((p.player === 1 && tr === 0) || (p.player === 2 && tr === 7)) {
        nb[tr][tc].king = true;
    }
    return nb;
};

// Basic evaluation for minimax (material + king value + mobility)
const evaluateBoard = (board, perspective) => {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p) {
                const val = p.king ? 3 : 1;
                score += (p.player === perspective ? val : -val);
            }
        }
    }
    // mobility
    const myMoves = generateAllMoves(board, perspective).length;
    const oppMoves = generateAllMoves(board, perspective === 1 ? 2 : 1).length;
    score += (myMoves - oppMoves) * 0.1;
    return score;
};

// Minimax with alpha-beta, returns {score, move}
const minimax = (board, depth, maximizingPlayer, player, alpha = -Infinity, beta = Infinity) => {
    const moves = generateAllMoves(board, player);
    const opponent = player === 1 ? 2 : 1;
    if (depth === 0 || moves.length === 0) {
        return { score: evaluateBoard(board, maximizingPlayer) };
    }
    let best = null;
    if (player === maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const nb = applyMove(board, move);
            const evalRes = minimax(nb, depth - 1, maximizingPlayer, opponent, alpha, beta);
            if (evalRes.score > maxEval) {
                maxEval = evalRes.score;
                best = move;
            }
            alpha = Math.max(alpha, evalRes.score);
            if (beta <= alpha) break;
        }
        return { score: maxEval, move: best };
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const nb = applyMove(board, move);
            const evalRes = minimax(nb, depth - 1, maximizingPlayer, opponent, alpha, beta);
            if (evalRes.score < minEval) {
                minEval = evalRes.score;
                best = move;
            }
            beta = Math.min(beta, evalRes.score);
            if (beta <= alpha) break;
        }
        return { score: minEval, move: best };
    }
};

// AI move chooser
const chooseAIMove = (board, player, difficulty) => {
    const moves = generateAllMoves(board, player);
    if (!moves.length) return null;
    if (difficulty === 'easy') {
        const idx = Math.floor(Math.random() * moves.length);
        return moves[idx];
    }
    if (difficulty === 'medium') {
        // prefer captures
        const caps = moves.filter((m) => m.captures && m.captures.length);
        if (caps.length) return caps[Math.floor(Math.random() * caps.length)];
        // otherwise prefer moves that don't move into capture (simple heuristic)
        // pick moves that minimize opponent captures on next turn
        let best = moves[0];
        let bestScore = Infinity;
        for (const m of moves) {
            const nb = applyMove(board, m);
            const oppMoves = generateAllMoves(nb, player === 1 ? 2 : 1);
            const oppCapsCount = oppMoves.filter((om) => om.captures && om.captures.length).length;
            if (oppCapsCount < bestScore) {
                bestScore = oppCapsCount;
                best = m;
            }
        }
        return best;
    }
    // hard - minimax depth 3
    const depth = 3;
    const res = minimax(board, depth, player, player);
    return res.move || moves[Math.floor(Math.random() * moves.length)];
};

// Save & load games
const loadSavedGames = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.GAMES);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};
const saveCompletedGame = (gameMeta) => {
    const games = loadSavedGames();
    games.unshift(gameMeta);
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games.slice(0, 200))); // cap
};
const loadLastGame = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.LAST_GAME);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};
const saveLastGame = (state) => {
    localStorage.setItem(STORAGE_KEYS.LAST_GAME, JSON.stringify(state));
};
const clearLastGame = () => {
    localStorage.removeItem(STORAGE_KEYS.LAST_GAME);
};

const defaultTimerSettings = {
    enabled: false,
    perMoveSeconds: 30,
};

const Checkers = () => {
    // Core state
    const [board, setBoard] = useState(createStartingBoard());
    const [turn, setTurn] = useState(1); // 1 bottom, 2 top
    const [selected, setSelected] = useState(null); // [r,c] selected
    const [legalMoves, setLegalMoves] = useState([]); // for selected piece
    const [hoverHints, setHoverHints] = useState(false);
    const [history, setHistory] = useState([]); // each item {board, turn, moveMeta}
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);
    const [mode, setMode] = useState('local'); // local | ai
    const [aiDifficulty, setAIDifficulty] = useState('medium'); // easy, medium, hard
    const [aiLabel, setAILabel] = useState('Strategist');
    const [games, setGames] = useState(loadSavedGames());
    const [hoverTargets, setHoverTargets] = useState([]);
    const [dark, setDark] = useState(() => {
        const v = localStorage.getItem(STORAGE_KEYS.DARK);
        return v ? JSON.parse(v) : true;
    });

    // timer mode
    const [timer, setTimer] = useState(defaultTimerSettings);
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    const [panels, setPanels] = useState({
        board: true,
        stats: true,
        controls: true,
    });

    const [isAnimating, setIsAnimating] = useState(false);

    // accessibility cursor for keyboard navigation
    const [cursor, setCursor] = useState([5, 0]); // starting cursor near player 1 area

    const setHoverTargetsSafe = (value) => {
        if (Array.isArray(value)) setHoverTargets(value);
        else setHoverTargets([]); // fallback to empty array
    };
    
    // initialize from saved last game if exists
    useEffect(() => {
        const last = loadLastGame();
        if (last) {
            // leave to user to continue via Continue Last Game control
            setGames((g) => g); // no-op just ensure loaded
        }
        // set AI label from difficulty
        updateAILabel(aiDifficulty);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.DARK, JSON.stringify(dark));
        document.documentElement.classList.toggle('dark-ui', dark);
    }, [dark]);

    // history management helpers
    const pushHistory = (b, t, moveMeta = null) => {
        const entry = { board: deepClone(b), turn: t, moveMeta, time: new Date().toISOString() };
        const newHist = history.slice(0, historyIndex + 1).concat([entry]);
        setHistory(newHist);
        setHistoryIndex(newHist.length - 1);
        // save last game snapshot for resume
        saveLastGame({
            board: entry.board,
            turn: entry.turn,
            playerNames,
            mode,
            aiDifficulty,
            timer,
            createdAt: new Date().toISOString(),
        });
    };

    // start new game
    const startNewGame = (opts = {}) => {
        const {
            mode: newMode = 'local',
            aiDifficulty: newAIDifficulty = 'medium',
            p1 = 'Player 1',
            p2 = 'Player 2',
            timer: timerOpts = defaultTimerSettings,
        } = opts;
        const b = createStartingBoard();
        setBoard(b);
        setTurn(1);
        setSelected(null);
        setLegalMoves([]);
        setHistory([]);
        setHistoryIndex(-1);
        setPlayerNames([p1, p2]);
        setMode(newMode);
        setAIDifficulty(newAIDifficulty);
        updateAILabel(newAIDifficulty);
        setTimer(timerOpts);
        clearLastGame();
        pushHistory(b, 1, { note: 'start' });
        resetTimer();
    };

    // continue last game
    const continueLastGame = () => {
        const last = loadLastGame();
        if (!last) return alert('No saved game to continue.');
        setBoard(last.board);
        setTurn(last.turn);
        setPlayerNames(last.playerNames || ['Player 1', 'Player 2']);
        setMode(last.mode || 'local');
        setAIDifficulty(last.aiDifficulty || 'medium');
        setTimer(last.timer || defaultTimerSettings);
        setHistory([]);
        setHistoryIndex(-1);
        pushHistory(last.board, last.turn, { note: 'resume' });
    };

    // Undo / Redo
    const undo = () => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        const entry = history[newIndex];
        setBoard(deepClone(entry.board));
        setTurn(entry.turn);
        setHistoryIndex(newIndex);
        setSelected(null);
        setLegalMoves([]);
        playSound('move');
    };
    const redo = () => {
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        const entry = history[newIndex];
        setBoard(deepClone(entry.board));
        setTurn(entry.turn);
        setHistoryIndex(newIndex);
        setSelected(null);
        setLegalMoves([]);
        playSound('move');
    };

    // update AI label based on difficulty
    const updateAILabel = (dif) => {
        if (dif === 'easy') setAILabel('Rookie');
        if (dif === 'medium') setAILabel('Strategist');
        if (dif === 'hard') setAILabel('Veteran');
    };

    // generate moves for selected piece
    const pieceLegalMoves = (r, c) => {
        const p = board[r][c];
        if (!p) return [];
        const all = generateAllMoves(board, p.player);
        // filter moves that start at r,c
        return all.filter((m) => m.from[0] === r && m.from[1] === c);
    };

    // select or move
    const handleCellClick = (r, c) => {
        if (isAnimating) return;
        const piece = board[r][c];
        if (selected) {
            // try to move selected -> r,c if legal
            const move = legalMoves.find((m) => m.to[0] === r && m.to[1] === c);
            if (move) {
                performMove(move);
                return;
            } else {
                // select new piece if owned by current player
                if (piece && piece.player === turn) {
                    setSelected([r, c]);
                    const moves = pieceLegalMoves(r, c);
                    setLegalMoves(moves);
                    return;
                }
                // else clear selection
                setSelected(null);
                setLegalMoves([]);
                return;
            }
        } else {
            // no selection -> select piece if player's
            if (piece && piece.player === turn) {
                setSelected([r, c]);
                const moves = pieceLegalMoves(r, c);
                setLegalMoves(moves);
            }
        }
    };

    // perform move with animation & push history
    const performMove = (move) => {
        setIsAnimating(true);
        // minimal animation: set board to new state, but animation CSS will animate piece position by keyed element transform
        const newBoard = applyMove(board, move);
        const nextTurn = turn === 1 ? 2 : 1;
        setBoard(newBoard);
        setSelected(null);
        setLegalMoves([]);
        pushHistory(newBoard, nextTurn, { move });
        // play capture or move sound
        if (move.captures && move.captures.length) playSound('capture');
        else playSound('move');
        // short animation delay
        setTimeout(() => {
            setIsAnimating(false);
            // check win condition
            checkForWinOrNext(nextTurn);
        }, 300);
        resetTimer();
    };

    // check for win and switch to AI if needed
    const checkForWinOrNext = (nextTurn) => {
        // if opponent has no moves -> win
        const oppMoves = generateAllMoves(board, nextTurn);
        const playerPiecesExist = board.some((row) => row.some((cell) => cell && cell.player === nextTurn));
        if (!playerPiecesExist || oppMoves.length === 0) {
            // current player (other) wins (since we passed nextTurn)
            const winner = turn === 1 ? playerNames[0] : playerNames[1];
            finishGame(winner);
        } else {
            setTurn(nextTurn);
            // if AI mode and it's AI's turn
            if (mode === 'ai' && nextTurn === 2) {
                setTimeout(() => {
                    handleAIMove();
                }, 400);
            }
        }
    };

    const finishGame = (winnerName) => {
        playSound('win');
        const meta = {
            id: uid(),
            date: new Date().toISOString(),
            players: [...playerNames],
            winner: winnerName,
            duration: '00:00', // optional: could compute
        };
        saveCompletedGame(meta);
        setGames(loadSavedGames());
        clearLastGame();
        alert(`${winnerName} wins!`);
    };

    // AI move handler
    const handleAIMove = () => {
        if (isAnimating) return;
        const aiMove = chooseAIMove(board, 2, aiDifficulty);
        if (!aiMove) {
            // AI has no moves -> player wins
            finishGame(playerNames[0]);
            return;
        }
        performMove(aiMove);
    };

    // keyboard navigation / actions
    useEffect(() => {
        const onKey = (e) => {
            if (isAnimating) return;
            const [r, c] = cursor;
            if (e.key === 'ArrowUp') setCursor(([rr, cc]) => [Math.max(0, rr - 1), cc]);
            if (e.key === 'ArrowDown') setCursor(([rr, cc]) => [Math.min(7, rr + 1), cc]);
            if (e.key === 'ArrowLeft') setCursor(([rr, cc]) => [rr, Math.max(0, cc - 1)]);
            if (e.key === 'ArrowRight') setCursor(([rr, cc]) => [rr, Math.min(7, cc + 1)]);
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleCellClick(cursor[0], cursor[1]);
            }
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) undo();
            if (e.key === 'y' && (e.ctrlKey || e.metaKey)) redo();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line
    }, [cursor, board, selected, legalMoves, isAnimating, historyIndex]);

    // hover hint toggle handler
    useEffect(() => {
        if (!hoverHints) return;
        // show hints by CSS with data attributes in render - no JS here
    }, [hoverHints]);

    // timer logic
    useEffect(() => {
        if (!timer.enabled) {
            setTimeLeft(null);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }
        // start per-move countdown
        resetTimer();
        // eslint-disable-next-line
    }, [timer, turn]);

    const resetTimer = () => {
        if (!timer.enabled) return;
        setTimeLeft(timer.perMoveSeconds);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t === null) return null;
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    // forfeit current player's turn on timeout -> switch
                    const forfeiter = turn === 1 ? playerNames[0] : playerNames[1];
                    const winner = turn === 1 ? playerNames[1] : playerNames[0];
                    alert(`${forfeiter} timed out. ${winner} wins this round.`);
                    finishGame(winner);
                    return null;
                }
                return t - 1;
            });
        }, 1000);
    };

    // panel toggles
    const togglePanel = (name) => setPanels((p) => ({ ...p, [name]: !p[name] }));

    // hover hint helpers (compute move targets regardless of blockage)
    // computeHoverTargets: returns array of [r, c] coordinates
    // helpers
    const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

    const computeHoverTargets = (board, r, c) => {
        const piece = board[r] && board[r][c];
        if (!piece) return [];

        const dirs = piece.king
            ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
            : piece.player === 1 ? [[-1, -1], [-1, 1]] : [[1, 1], [1, -1]];

        const targets = [];
        for (const [dr, dc] of dirs) {
            const adjR = r + dr, adjC = c + dc;
            if (inBounds(adjR, adjC)) targets.push([adjR, adjC]);
            const landR = r + dr * 2, landC = c + dc * 2;
            if (inBounds(landR, landC)) targets.push([landR, landC]);
        }

        // dedupe
        const unique = [];
        const seen = new Set();
        for (const [rr, cc] of targets) {
            const key = `${rr},${cc}`;
            if (!seen.has(key)) { seen.add(key); unique.push([rr, cc]); }
        }
        return unique;
    };

    // Stats helpers
    const tallyWins = () => {
        const tallies = {};
        for (const g of games) {
            tallies[g.winner] = (tallies[g.winner] || 0) + 1;
        }
        return tallies;
    };

    // rendering helpers
    const cellKey = (r, c) => `cell-${r}-${c}-${board[r][c] ? board[r][c].id : 'empty'}`;

    // UI render
    return (
        <div className={`containerDetail mt--20 color-lite bg-lite ml-5 mr-5`}>
            <div className='containerDetail color-yellow contentLeft size20 p-10'>
                {icons.checkers} Checkers
            </div>
            <div className='containerDetail mt-5 mb-5'>
                <div className='flexContainer mt-5'>
                    <div 
                        className='containerDetail bg-blue p-10 color-yellow flex5Column mr-5' 
                        onClick={() => startNewGame({ mode: 'local' })}
                    >
                        New Local
                    </div>
                    <div 
                        className='containerDetail bg-blue p-10 color-yellow flex5Column mr-5' 
                        onClick={() => startNewGame({ mode: 'ai', aiDifficulty })}
                    >
                        New vs {aiLabel}
                    </div>
                    <div 
                        className='containerDetail bg-blue p-10 color-yellow flex5Column mr-5' 
                        onClick={continueLastGame}
                    >
                        Continue Last
                    </div>
                    <div 
                        className='containerDetail bg-blue p-10 color-yellow flex5Column mr-5' 
                        onClick={undo} 
                        disabled={historyIndex <= 0}
                    >
                        Undo
                    </div>
                    <div 
                        className='containerDetail bg-blue p-10 color-yellow flex5Column' 
                        onClick={redo} 
                        disabled={historyIndex >= history.length - 1}
                    >
                        Redo
                    </div>
                </div>
                <div className='flexContainer mt-5 mt-10 color-lite'>
                    <label className='containerDetail flex3Column toggle p-10 mr-5 bg-lite'>
                        <input 
                            type='checkbox' 
                            checked={hoverHints} 
                            onChange={(e) => setHoverHints(e.target.checked)} 
                        /> Hover Hints
                    </label>
                    <label className='containerDetail flex3Column toggle p-10 bg-lite'>
                        <input 
                            type='checkbox' 
                            checked={timer.enabled} 
                            onChange={(e) => setTimer({ ...timer, enabled: e.target.checked })} 
                        /> Timer
                    </label>
                    <select 
                        className='containerDetail flex3Column color-lite pt-10 pb-10 mt--2 bg-lite' 
                        value={aiDifficulty} 
                        onChange={(e) => { setAIDifficulty(e.target.value); updateAILabel(e.target.value); }}
                    >
                        <option value='easy'>
                            AI: Easy (Rookie)
                        </option>
                        <option value='medium'>
                            AI: Medium (Strategist)
                        </option>
                        <option value='hard'>
                            AI: Hard (Veteran)
                        </option>
                    </select>
                </div>
            </div>

            <div className='main-layout'>
                {/* Sidebar panels */}
                <aside className={`sidebar panels ${panels.stats ? 'open' : 'closed'}`}>
                    <div className='panel-header'>
                        <h4>Stats</h4>
                        <div onClick={() => togglePanel('stats')}>{panels.stats ? '▾' : '▸'}</div>
                    </div>
                    {panels.stats && (
                        <div className='panel-body'>
                            <div>Players:</div>
                            <input 
                                value={playerNames[0]} 
                                onChange={(e) => setPlayerNames([e.target.value, playerNames[1]])} 
                            />
                            <input 
                                value={playerNames[1]} 
                                onChange={(e) => setPlayerNames([playerNames[0], e.target.value])} 
                            />
                            <hr />
                            <div>Wins Tally</div>
                            <ul>
                                {Object.entries(tallyWins()).map(([name, wins]) => (
                                    <li key={name}>
                                        {name}: {wins} wins
                                    </li>
                                ))}
                            </ul>
                            <hr />
                            <div>Recent Games</div>
                            <ul className='games-list'>
                                {games.slice(0, 10).map(g => (
                                    <li key={g.id}>
                                        {new Date(g.date).toLocaleString()} — {g.players.join(' vs ')} — Winner: {g.winner}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>

                <section className='board-area'>
                    {/* Turn and timer indicator */}
                    <div className='turn-bar'>
                        <div className={`turn-indicator player${turn}`}>
                            {playerNames[turn - 1]}'s turn {timeLeft != null ? ` • ${timeLeft}s` : ''}
                        </div>
                        <div className='move-info'>History: {historyIndex + 1}/{history.length}</div>
                    </div>

                    {/* board */}
                    <div className='board-wrapper'>
                        <div className='board'>
                            {board.map((row, r) => (
                                <div key={`row-${r}`} className={`board-row ${(r === 0) ? null : 'mt--15'}`}>
                                    {row.map((cell, c) => {
                                        const playable = (r + c) % 2 === 1;
                                        const isSelected = selected && selected[0] === r && selected[1] === c;
                                        const isCursor = cursor[0] === r && cursor[1] === c;
                                        const showTargets = legalMoves.some(m => m.to[0] === r && m.to[1] === c);
                                        const hoverTargets = hoverHints && selected == null && computeHoverTargets(r, c).length > 0 && board[r][c] && board[r][c].player === turn;
                                        const isHoverTarget = Array.isArray(hoverTargets) && hoverTargets.some(([hr, hc]) => hr === r && hc === c);
                                        
                                        return (
                                            <div
                                                key={cellKey(r, c)}
                                                className={`cell ${playable ? 'playable' : 'blocked'} ${isHoverTarget ? 'hover-target' : ''}`}
                                                onClick={() => handleCellClick(r, c)}
                                                onMouseEnter={() => {
                                                    if (board[r][c] && board[r][c].player === turn) {
                                                        setHoverTargetsSafe(computeHoverTargets(board, r, c));
                                                    } else {
                                                        setHoverTargetsSafe([]);
                                                    }
                                                }}
                                                onMouseLeave={() => setHoverTargetsSafe([])}
                                                data-target={showTargets ? '1' : '0'}
                                            >
                                                {cell && (
                                                    <div className={`piece player${cell.player} ${cell.king ? 'king' : ''}`}>
                                                        <div className='piece-inner'>
                                                            {cell.king ? '👑' : ''}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls & panels */}
                    <div className='controls-area'>
                        <div className='panel'>
                            <div className='panel-header'>
                                <strong>Controls</strong>
                                <div onClick={() => togglePanel('controls')}>{panels.controls ? '▾' : '▸'}</div>
                            </div>
                            {panels.controls && (
                                <div className='panel-body'>
                                    <div className='row'>
                                        <div onClick={() => startNewGame({ mode: 'local' })}>Restart Local</div>
                                        <div onClick={() => startNewGame({ mode: 'ai', aiDifficulty })}>Restart vs AI</div>
                                        <div onClick={() => { // quick save completed game with current turn as winner for demo
                                            const winner = playerNames[turn - 1];
                                            saveCompletedGame({ id: uid(), date: new Date().toISOString(), players: [...playerNames], winner, duration: '00:00' });
                                            setGames(loadSavedGames());
                                        }}>Save Dummy Win</div>
                                    </div>
                                    <div className='row'>
                                        <label>Per-Move Seconds:
                                            <input type='number' min='5' value={timer.perMoveSeconds} onChange={(e) => setTimer({ ...timer, perMoveSeconds: Number(e.target.value) })} />
                                        </label>
                                    </div>
                                    <div className='row small'>Keyboard: Arrow keys to move cursor, Space/Enter to select. Ctrl+Z Undo, Ctrl+Y Redo</div>
                                </div>
                            )}
                        </div>

                        <div className='panel'>
                            <div className='panel-header'>
                                <strong>History</strong>
                                <div onClick={() => { setGames(loadSavedGames()); }}>{/* refresh */}↻</div>
                            </div>
                            <div className='panel-body'>
                                <ol className='history-list'>
                                    {history.map((h, idx) => (
                                        <li key={idx} className={idx === historyIndex ? 'active' : ''}>
                                            {new Date(h.time).toLocaleTimeString()} {h.moveMeta ? `${h.moveMeta.move ? `Move ${h.moveMeta.move.from.join(',')}→${h.moveMeta.move.to.join(',')}` : ''}` : ''}
                                        </li>
                                    ))}
                                </ol>
                                <div className='history-controls'>
                                    <div onClick={undo}>◀ Step Back</div>
                                    <div onClick={redo}>Step Forward ▶</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right sidebar for collapsed stats / info */}
                <aside className={`right-sidebar`}>
                    <div className='panel-header'><strong>Game History</strong></div>
                    <div className='panel-body'>
                        <div>Total games: {games.length}</div>
                        <ul>
                            {games.slice(0, 5).map(g => (
                                <li key={g.id}>{new Date(g.date).toLocaleString()} — {g.players.join(' vs ')} — Winner: {g.winner}</li>
                            ))}
                        </ul>
                        <div className='tally'>
                            <h5>Win Tally</h5>
                            {Object.entries(tallyWins()).map(([name, w]) => (
                                <div key={name}>{name}: {w} wins</div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Checkers;