const medals = ['🥇','🥈','🥉'];
const getMedal = (place) => {
    if (place < 3) {
        return medals[place];
    }
    return '';
}

export default getMedal;