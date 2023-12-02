const initPlayers = [
    {
        name: 'You',
        score: 0,
        dominoScore: 0,
        golfScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        golfGIR: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        golfFW: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        golfPutts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        surfScores: ['', '', '', '', '', '', '', '', '', ''],
        surfJerseyColor: 0,
        surfPriority: 0,
        cricketScores: [0, 0, 0, 0, 0, 0, 0]
    },
    {
        name: 'Me',
        score: 0,
        dominoScore: 0,
        golfScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        golfGIR: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        golfFW: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        golfPutts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        surfScores: ['', '', '', '', '', '', '', '', '', ''],
        surfJerseyColor: 0,
        surfPriority: 0,
        cricketScores: [0, 0, 0, 0, 0, 0, 0]
    }
];
export default initPlayers;