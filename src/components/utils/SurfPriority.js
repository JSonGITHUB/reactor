export const getSurferIndexWithPriority = (players, priorityIndex) => {
    for (let i = 0; i < players.length; i++) {
        if (Number(players[i].surfPriority) === priorityIndex) {
            return i;
        }
    }
    return null;
}
export const losePriority = (players, setPlayers, selectedPriority) => {
    const newPlayers = [...players];
    newPlayers.map((player, index) => {
        if (player.surfPriority == selectedPriority) {
            player.surfPriority = newPlayers.length;
        } else if (player.surfPriority != 1 && selectedPriority != newPlayers.length) {
            const shift = player.surfPriority - 1;
            player.surfPriority = (shift > 0) ? shift : newPlayers.length;
        }
    });
    localStorage.setItem('players', JSON.stringify(newPlayers, null, 2));
    setPlayers(newPlayers);
}
export const shiftPriority = (players, setPlayers, priorityIndex) => {
    const newPlayers = [...players];
    newPlayers.map((player, index) => {
        if (player.surfPriority === (priorityIndex - 1)) {
            player.surfPriority = priorityIndex;
        } else if (player.surfPriority === priorityIndex) {
            player.surfPriority = (priorityIndex - 1);
        }
    });
    localStorage.setItem('players', JSON.stringify(newPlayers, null, 2));
    setPlayers(newPlayers);
}