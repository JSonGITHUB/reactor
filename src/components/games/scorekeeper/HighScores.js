import validate from "../../utils/validate";

export const findTwoHighestIndices = (scores) => {
    //const newScores = (scores !== undefined) ? scores : ['', '', '', '', '', '', '', '', '', ''];
    const newScores = (validate(scores) !== null) ? scores : ['', '', '', '', '', '', '', '', '', ''];
    let highestIndex = -1;
    let secondHighestIndex = -1;
    let highestScore = -Infinity;
    let secondHighestScore = -Infinity;
    for (let i = 0; i < newScores.length; i++) {
        if (newScores[i] > highestScore) {
            secondHighestIndex = highestIndex;
            secondHighestScore = highestScore;
            highestIndex = i;
            highestScore = newScores[i];
        } else if (newScores[i] > secondHighestScore) {
            secondHighestIndex = i;
            secondHighestScore = newScores[i];
        }
    }
    return [highestIndex, secondHighestIndex];
};

export const getTwoHighestScores = (players, index) => {
    const player = players[index];
    const scores = player.surfScores;
    const [highestIndex, secondHighestIndex] = findTwoHighestIndices(scores);
    return {
        highScoreIndex: highestIndex,
        secondHighScoreIndex: secondHighestIndex
    };
};