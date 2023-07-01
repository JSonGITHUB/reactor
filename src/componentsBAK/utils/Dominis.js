import React, { useState } from 'react';

const Dominos = ({ player, index, scoreTotal, editPlayer, deletePlayer, getDominoTotal, updateTwoPlayerScores, winner }) => {
    const dominoKey = `${player}Domino${index}`;
    const getScore = () => localStorage.getItem(dominoKey) || 0;

    const [score, setScore] = useState(getScore());
    const [scoreTotalState, setScoreTotalState] = useState(scoreTotal);
    const [edit, setEdit] = useState(false);

    const [scoreState, setScoreState] = useState(Number(localStorage.getItem(player)));

    const dominoScores = (quadrant, score) => {
        const index = score - (quadrant * 10);
        if (index < 5) {
            return "";
        } else if (index < 10) {
            return "/";
        } else {
            return "X";
        }
    };

    const getDominoScore = (score, quadrant) => (
        <div className='white'>
            {dominoScores(quadrant, score)}
        </div>
    );

    const updateScore = (newScore) => {
        localStorage.setItem(player, newScore);
        setScore(Number(localStorage.getItem(player)));
        setScoreState(Number(localStorage.getItem(player)));
    };

    const updateDominos = () => {
        updateTwoPlayerScores(player, index, localStorage.getItem(dominoKey));
    };

    const addScore = () => {
        const playerScore = Number(getDominoTotal(player));
        if (playerScore < status.scoreTotal) {
            let newScore = playerScore + 5;
            localStorage.setItem(dominoKey, newScore);
            setStatus(prevState => ({
                ...prevState,
                score: newScore
            }));
            //setScore(newScore);
            updateDominos();
            console.log(`addScore => scoreTotal: ${status.scoreTotal}  status.score: ${status.score}  newScore: ${newScore} getScore(): ${getScore()} getDominoTotal(): ${playerScore}`);
        }
    }
    // eslint-disable-next-line
    const subtractScore = () => {
        let newScore = Number(status.score) - 1;
        newScore = (newScore < 0) ? 3 : newScore;
        updateDominos();
    }
    const editNav = () => {
        if (status.edit) {
            return <div className='subIndex t-0 relative flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                <div className="flex3Column"></div>
                <div className="flex3Column">
                    <div className='button color-green description r-5 p-5 m-5 bg-yellow' onClick={() => editPlayer(index)}>EDIT</div>
                    <div className='button color-red description r-5 p-5 m-5 bg-yellow' onClick={() => deletePlayer(index)}>DELETE</div>
                </div>
                <div className="flex3Column"></div>
            </div>
        }
    }
    const stockClasses = 'r-10 m-1 color-yellow bold bg-darker';
    const buttonClass = 'bg-darker';
    const getButtonClass = 'button flex3Column p-10 r-10 ' + buttonClass;
    // eslint-disable-next-line
    const dominoClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    // eslint-disable-next-line
    const scoreButtonClasses = 'glassy flex3Column button bg-green m-10 r-10 color-neogreen navBranding centeredContent';
    const scoreButton = (quadrant) => {
        return <div className={stockClasses}>
            <div className='flexContainer'>
                <span className={getButtonClass}>
                    <div className='p-5 r-5 navBranding'>
                        {getDominoScore(status.score, quadrant)}
                    </div>
                </span>
            </div>
        </div>
    }
    const quadrantClasses = (quadrant) => {
        if (quadrant === 1) {
            return (status.score > 4) ? ((status.score > 9) ? "quadrant on5Right onBottom10" : "quadrant on5Right") : "quadrant";
        } else if (quadrant === 2) {
            return (status.score > 4) ? ((status.score > 9) ? "quadrant on5Left onBottom10" : "quadrant on5Left") : "quadrant";
        } else if (quadrant === 3) {
            return (status.score > 4) ? ((status.score > 9) ? "quadrant on5Right onTop10" : "quadrant on5Right") : "quadrant";
        } else if (quadrant === 4) {
            return (status.score > 4) ? ((status.score > 9) ? "quadrant on5Left onTop10" : "quadrant on5Left") : "quadrant";
        }
    }
    return (
        <div>
            <a href='https://www.coololdgames.com/tile-games/dominoes/' target='_blank' rel='noopener noreferrer'>Rules {status.score}</a>
            <div className={stockClasses}>
                <div id="container" onClick={() => addScore()}>
                    <div id="top-left" class={quadrantClasses(1)}>{scoreButton(1)}</div>
                    <div id="top-right" class={quadrantClasses(2)}>{scoreButton(2)}</div>
                    <div id="bottom-left" class={quadrantClasses(3)}>{scoreButton(3)}</div>
                    <div id="bottom-right" class={quadrantClasses(4)}>{scoreButton(4)}</div>
                </div>
            </div>
            {editNav()}
        </div>

    )

}

export default Dominos;