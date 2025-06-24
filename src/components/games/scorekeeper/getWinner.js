const getWinner = (game) => {

    if (game === 'golf') {
        return 3000;
    } else if (game === 'surf') {
        return 15;
    } else if (game === 'dominos') {
        return 200;
    }
    return 21;
}
export default getWinner;