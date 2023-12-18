export const getTwoHighestScores = (players, index) => {
    const player = players[index];
    const scores = player.surfScores;
    const [highestIndex, secondHighestIndex] = findTwoHighestIndices(scores);
    //console.log(`getTwoHighestScores => playerIndex: ${index} player: ${JSON.stringify(player,null,2)} name: ${(player.player || player.name)}: Highest score at index ${highestIndex}, Second highest score at index ${secondHighestIndex}`);
    return {
        highScoreIndex: highestIndex,
        secondHighScoreIndex: secondHighestIndex
    };
};

export const findTwoHighestIndices = (scores) => {
    const newScores = (scores !== undefined) ? scores : ['', '', '', '', '', '', '', '', '', ''];
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