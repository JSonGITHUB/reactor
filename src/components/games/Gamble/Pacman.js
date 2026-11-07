import React, { useState, useEffect, useRef } from 'react';
import './Pacman.css';

// Maze legend: 0 = empty, 1 = wall, 2 = pellet, 3 = power pellet
const MAZE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,1,0,0,0,1,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,0,0,0,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,1,0,0,0,1,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,2,2,2,1,2,2,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const INIT_PACMAN = { x: 9, y: 13, dir: 'LEFT', nextDir: 'LEFT' };
const DIRS = {
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
};

const PELLET_SCORE = 10;
const POWER_PELLET_SCORE = 50;
const POWER_MODE_DURATION = 7000; // ms

const GHOSTS_INIT = [
  { name: 'blinky', x: 9, y: 7, dir: 'UP', color: '#ff4444', mode: 'scatter' }, // red, above house
  { name: 'pinky', x: 9, y: 9, dir: 'LEFT', color: '#ffb8ff', mode: 'scatter' }, // pink, in house
  { name: 'inky', x: 8, y: 9, dir: 'RIGHT', color: '#00ffff', mode: 'scatter' }, // cyan, in house
  { name: 'clyde', x: 10, y: 9, dir: 'LEFT', color: '#ffb852', mode: 'scatter' }, // orange, in house
];

const GHOST_CORNERS = {
  blinky: { x: 18, y: 0 },
  pinky: { x: 0, y: 0 },
  inky: { x: 18, y: 16 },
  clyde: { x: 0, y: 16 },
};


function getRandomDir(x, y, maze, excludeDir) {
  const dirs = Object.keys(DIRS).filter(d => d !== excludeDir);
  const valid = dirs.filter(d => {
    const nx = x + DIRS[d].x;
    const ny = y + DIRS[d].y;
    return maze[ny] && maze[ny][nx] !== 1;
  });
  if (valid.length === 0) return excludeDir;
  return valid[Math.floor(Math.random() * valid.length)];
}

function getTargetDir(x, y, target, maze, excludeDir) {
  // Choose the direction that minimizes Manhattan distance to target
  let bestDir = excludeDir;
  let minDist = Infinity;
  Object.keys(DIRS).forEach(d => {
    if (d === excludeDir) return;
    const nx = x + DIRS[d].x;
    const ny = y + DIRS[d].y;
    if (maze[ny] && maze[ny][nx] !== 1) {
      const dist = Math.abs(nx - target.x) + Math.abs(ny - target.y);
      if (dist < minDist) {
        minDist = dist;
        bestDir = d;
      }
    }
  });
  return bestDir;
}

const SCATTER_CHASE_CYCLE = [7000, 20000, 7000, 20000, 5000, 20000, 5000, 0]; // ms

const Pacman = () => {
    // canMove: Pac-Man cannot enter ghost house (4,5), ghosts can enter/exit house and door (4,5)
    function canMove(x, y, isGhost = false) {
      if (!Array.isArray(maze) || !maze[y] || maze[y][x] === undefined) return false;
      const cell = maze[y][x];
      if (cell === 1) return false;
      if (isGhost) {
        // Ghosts can move through house (4) and door (5)
        return cell !== 1;
      } else {
        // Pac-Man cannot enter house (4) or door (5)
        return cell !== 1 && cell !== 4 && cell !== 5;
      }
    }
  const [maze, setMaze] = useState(MAZE_LAYOUT);
  const [pacman, setPacman] = useState(INIT_PACMAN);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('pacmanHighScore')) || 0);
  const [powerMode, setPowerMode] = useState(false);
  const powerTimeout = useRef(null);
  const [ghosts, setGhosts] = useState(GHOSTS_INIT);
  const [running, setRunning] = useState(true);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState('');
  const [overlay, setOverlay] = useState(''); // '', 'gameover', 'win', 'pause'
  const [ghostMode, setGhostMode] = useState('scatter');
  const ghostModeIndex = useRef(0);
  const ghostModeTimeout = useRef(null);

  const queueDirection = (direction) => {
    setPacman((p) => ({ ...p, nextDir: direction }));
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') queueDirection('LEFT');
      if (e.key === 'ArrowRight') queueDirection('RIGHT');
      if (e.key === 'ArrowUp') queueDirection('UP');
      if (e.key === 'ArrowDown') queueDirection('DOWN');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pac-Man movement loop
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setPacman(prev => {
        let { x, y, dir, nextDir } = prev;
        // Try to turn if possible
        const tryDir = DIRS[nextDir];
        const nx = x + tryDir.x;
        const ny = y + tryDir.y;
        if (canMove(nx, ny)) {
          dir = nextDir;
        }
        const move = DIRS[dir];
        let tx = x + move.x;
        let ty = y + move.y;
        // Tunnel wrap
      if (canMove(tx, ty, true)) {
          if (tx < 0) tx = maze[0].length - 1;
          if (tx >= maze[0].length) tx = 0;
        }
        if (canMove(tx, ty)) {
          // Pellet logic
          setMaze(oldMaze => {
            const cell = oldMaze[ty][tx];
            if (cell === 2 || cell === 3) {
              const newMaze = oldMaze.map(row => [...row]);
              newMaze[ty][tx] = 0;
              if (cell === 2) setScore(s => s + PELLET_SCORE);
              if (cell === 3) {
                setScore(s => s + POWER_PELLET_SCORE);
                setPowerMode(true);
                if (powerTimeout.current) clearTimeout(powerTimeout.current);
                powerTimeout.current = setTimeout(() => setPowerMode(false), POWER_MODE_DURATION);
              }
              // Win check: no pellets left
              const pelletsLeft = newMaze.flat().some(c => c === 2 || c === 3);
              if (!pelletsLeft) {
                setOverlay('win');
                setRunning(false);
                setMessage('You Win!');
              }
              return newMaze;
            }
            return oldMaze;
          });
          return { x: tx, y: ty, dir, nextDir };
        }
        return { x, y, dir, nextDir };
      });
    }, 160);
    return () => clearInterval(interval);
  }, [running, maze]);

  // Ghost mode switching (scatter/chase)
  useEffect(() => {
    if (!running) return;
    if (powerMode) return; // Pause mode switching during frightened
    if (ghostModeTimeout.current) clearTimeout(ghostModeTimeout.current);
    const nextIdx = ghostModeIndex.current;
    const nextMode = nextIdx % 2 === 0 ? 'scatter' : 'chase';
    setGhostMode(nextMode);
    const duration = SCATTER_CHASE_CYCLE[nextIdx] || 7000;
    ghostModeTimeout.current = setTimeout(() => {
      ghostModeIndex.current = Math.min(nextIdx + 1, SCATTER_CHASE_CYCLE.length - 1);
      setGhostMode(ghostModeIndex.current % 2 === 0 ? 'scatter' : 'chase');
    }, duration);
    return () => clearTimeout(ghostModeTimeout.current);
  }, [running, powerMode]);

  // Ghost movement loop (scatter/chase/frightened)
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setGhosts(prevGhosts => prevGhosts.map(g => {
        let { x, y, dir, color, name, mode } = g;
        let newMode = mode;
        if (powerMode) newMode = 'frightened';
        else newMode = ghostMode;
        let nextDir = dir;
        if (newMode === 'frightened') {
          nextDir = getRandomDir(x, y, maze, reverseDir(dir));
        } else if (newMode === 'scatter') {
          nextDir = getTargetDir(x, y, GHOST_CORNERS[name], maze, reverseDir(dir));
        } else if (newMode === 'chase') {
          nextDir = getTargetDir(x, y, pacman, maze, reverseDir(dir));
        }
        const move = DIRS[nextDir];
        let tx = x + move.x;
        let ty = y + move.y;
        if (maze[ty] && maze[ty][tx] === undefined) {
          if (tx < 0) tx = maze[0].length - 1;
          if (tx >= maze[0].length) tx = 0;
        }
        if (maze[ty] && maze[ty][tx] !== 1) {
          return { ...g, x: tx, y: ty, dir: nextDir, mode: newMode };
        } else {
          // Pick a new random direction (not reverse)
          const fallbackDir = getRandomDir(x, y, maze, reverseDir(dir));
          return { ...g, dir: fallbackDir, mode: newMode };
        }
      }));
    }, 200);
    return () => clearInterval(interval);
  }, [running, maze, pacman, powerMode, ghostMode]);

  // Collision detection: Pac-Man vs Ghosts
  useEffect(() => {
    if (!running) return;
    ghosts.forEach(g => {
      if (g.x === pacman.x && g.y === pacman.y) {
        if (powerMode) {
          // Eat ghost: reset to home
          setGhosts(gs => gs.map(ghost => ghost.name === g.name ? { ...ghost, x: 9, y: 9 } : ghost));
          setScore(s => s + 200);
        } else {
          // Pac-Man dies
          setLives(l => l - 1);
          setOverlay('pause');
          setMessage('Ouch! Press any key to continue.');
          setRunning(false);
        }
      }
    });
  }, [pacman, ghosts, powerMode, running]);

  // Resume after death or win/gameover
  useEffect(() => {
    if (!running && overlay === 'pause' && lives > 0) {
      const handler = () => {
        setPacman(INIT_PACMAN);
        setGhosts(GHOSTS_INIT);
        setMessage('');
        setOverlay('');
        setRunning(true);
        ghostModeIndex.current = 0;
        setGhostMode('scatter');
        window.removeEventListener('keydown', handler);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
    if (!running && overlay === 'win') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('pacmanHighScore', String(score));
      }
      const handler = () => {
        setPacman(INIT_PACMAN);
        setGhosts(GHOSTS_INIT);
        setMaze(MAZE_LAYOUT);
        setScore(0);
        setMessage('');
        setOverlay('');
        setRunning(true);
        setLives(3);
        ghostModeIndex.current = 0;
        setGhostMode('scatter');
        window.removeEventListener('keydown', handler);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
    if (!running && lives === 0 && overlay !== 'gameover') {
      setOverlay('gameover');
      setMessage('Game Over! Press any key to restart.');
    }
    if (!running && overlay === 'gameover') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('pacmanHighScore', String(score));
      }
      const handler = () => {
        setPacman(INIT_PACMAN);
        setGhosts(GHOSTS_INIT);
        setMaze(MAZE_LAYOUT);
        setScore(0);
        setMessage('');
        setOverlay('');
        setRunning(true);
        setLives(3);
        ghostModeIndex.current = 0;
        setGhostMode('scatter');
        window.removeEventListener('keydown', handler);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [lives, running, overlay, score, highScore]);

  function canMove(x, y) {
    return maze[y] && maze[y][x] !== 1;
  }
  function reverseDir(dir) {
    if (dir === 'LEFT') return 'RIGHT';
    if (dir === 'RIGHT') return 'LEFT';
    if (dir === 'UP') return 'DOWN';
    if (dir === 'DOWN') return 'UP';
    return dir;
  }

  // Render maze grid with Pac-Man and ghosts
  const renderMaze = () => (
    <div
      className='pacman-maze'
      style={{
        display: 'inline-block',
        background: '#111',
        border: '4px solid #222',
        margin: '1em auto',
        position: 'relative',
      }}
      role='grid'
      aria-label='Pac-Man Maze'
      tabIndex={0}
    >
      {maze.map((row, y) => (
        <div key={y} style={{ display: 'flex' }}>
          {row.map((cell, x) => {
            let cellClass = 'pacman-cell';
            if (cell === 1) cellClass += ' pacman-wall';
            const isPacman = pacman.x === x && pacman.y === y;
            const ghostHere = ghosts.find(g => g.x === x && g.y === y);
            return (
              <div
                key={x}
                className={cellClass}
                style={{ position: 'relative' }}
                aria-label={
                  cell === 1 ? 'Wall' :
                  cell === 2 ? 'Pellet' :
                  cell === 3 ? 'Power Pellet' : isPacman ? 'Pac-Man' : ghostHere ? ghostHere.name : 'Empty'
                }
                tabIndex={cell === 1 ? -1 : 0}
              >
                {cell === 2 && <div className='pacman-pellet' aria-label='Pellet'></div>}
                {cell === 3 && <div className='pacman-power-pellet' aria-label='Power Pellet'></div>}
                {isPacman && (
                  <div
                    className='pacman-player pacman-focus-outline'
                    aria-label='Pac-Man'
                    role='img'
                  ></div>
                )}
                {ghostHere && (
                  <div
                    className={`pacman-ghost ${ghostHere.name} ${ghostHere.mode === 'frightened' ? 'frightened' : ''}`}
                    aria-label={ghostHere.name + (ghostHere.mode === 'frightened' ? ' (frightened)' : '')}
                    role='img'
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className='containerDetail color-yellow mt--25 bg-dark p-20 pacman-root' role='region' aria-label='Pac-Man Game'>
      <h2 style={{ textAlign: 'center', fontFamily: 'inherit', fontSize: '1.5rem' }}>Pac-Man</h2>
      <div className='pacman-ui' aria-live='polite'>
        <span className='pacman-score' aria-label={`Score: ${score}`}>Score: {score}</span>
        <span className='pacman-score' aria-label={`High Score: ${highScore}`}>High: {highScore}</span>
        <span className='pacman-lives' aria-label={`Lives: ${lives}`}>Lives: {Array.from({ length: lives }).map((_, i) => (
          <span key={i} className='pacman-life' aria-label='Life'></span>
        ))}</span>
        <span className='pacman-mode' aria-label={`Ghost Mode: ${powerMode ? 'Frightened' : ghostMode}`}>Ghost Mode: {powerMode ? 'Frightened' : ghostMode.charAt(0).toUpperCase() + ghostMode.slice(1)}</span>
      </div>
      <div style={{ position: 'relative' }}>
        {renderMaze()}
        {overlay && (
          <div className='pacman-overlay' role='alertdialog' aria-modal='true' tabIndex={0}>
            <div>{message}</div>
            {overlay === 'win' && <div style={{ marginTop: 8 }}>Press any key to play again.</div>}
            {overlay === 'gameover' && <div style={{ marginTop: 8 }}>Press any key to restart.</div>}
            {overlay === 'pause' && <div style={{ marginTop: 8 }}>Press any key to continue.</div>}
          </div>
        )}
      </div>
      <div className='pacman-touch-panel'>
        <div id='pacman-touch-controls' className='pacman-touch-controls'>
          <div className='pacman-dpad' role='group' aria-label='Game movement controls'>
            <div className='pacman-dpad-empty' aria-hidden='true'></div>
            <button
              type='button'
              className={`pacman-touch-btn ${pacman.nextDir === 'UP' ? 'is-active' : ''}`}
              onClick={() => queueDirection('UP')}
              aria-label='Move up'
              aria-pressed={pacman.nextDir === 'UP'}
            >
              ▲
            </button>
            <div className='pacman-dpad-empty' aria-hidden='true'></div>
            <button
              type='button'
              className={`pacman-touch-btn ${pacman.nextDir === 'LEFT' ? 'is-active' : ''}`}
              onClick={() => queueDirection('LEFT')}
              aria-label='Move left'
              aria-pressed={pacman.nextDir === 'LEFT'}
            >
              ◀
            </button>
            <div className='pacman-dpad-empty' aria-hidden='true'></div>
            <button
              type='button'
              className={`pacman-touch-btn ${pacman.nextDir === 'RIGHT' ? 'is-active' : ''}`}
              onClick={() => queueDirection('RIGHT')}
              aria-label='Move right'
              aria-pressed={pacman.nextDir === 'RIGHT'}
            >
              ▶
            </button>
            <div className='pacman-dpad-empty' aria-hidden='true'></div>
            <button
              type='button'
              className={`pacman-touch-btn ${pacman.nextDir === 'DOWN' ? 'is-active' : ''}`}
              onClick={() => queueDirection('DOWN')}
              aria-label='Move down'
              aria-pressed={pacman.nextDir === 'DOWN'}
            >
              ▼
            </button>
            <div className='pacman-dpad-empty' aria-hidden='true'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pacman;
