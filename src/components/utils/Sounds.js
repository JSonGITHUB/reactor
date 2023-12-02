var audioContext = new AudioContext(),
oscillator;

const playSound = (winner, score) => {

    // Create an oscillator node
    oscillator = audioContext.createOscillator();

    // Connect the oscillator to the audio context's destination (your speakers)
    oscillator.connect(audioContext.destination);

    const treeScores = [5, 10, 55, 60, 105, 110, 155, 160];
    const treeTotals = [50, 100, 150, 200];
    const treeClosed = () => treeTotals.includes(score);
    const isTree = () => treeScores.includes(score);
    const isTree1 = () => (score > 0 && score < 55);
    const isTree2 = () => (score > 50 && score < 105);
    const isTree3 = () => (score > 100 && score < 155);
    const isTree4 = () => (score > 150);
    const isTreeComplete = () => (score > 150);
    // Set the oscillator type to 'sine' (you can experiment with other types like 'square', 'sawtooth', 'triangle')

    const getType = () => (score === winner || treeClosed()) ? 'sawtooth' : 'triangle';
    oscillator.type = getType();

    //const note = (treeClosed()) ? 1000 : (440 + (score * 2));
    const note = (treeClosed()) ? 1000 : 440;
    // Set the frequency (Hz) - in this case, 440 Hz is an 'A' note
    oscillator.frequency.setValueAtTime(note, audioContext.currentTime);

    // Start the oscillator
    oscillator.start();

    const soundLength = (score == winner) ? 1 : 0.05;
    console.log(`soundLength: ${soundLength} score: ${score} winner: ${winner}`)
    // Stop the oscillator after 0.5 seconds (you can adjust this time)
    oscillator.stop(audioContext.currentTime + soundLength);
}

var audioContext = new AudioContext(),
oscillator1;

const playSiren = () => {

    let highPitch = false;

    const getHighPitch = () => {
        highPitch = !highPitch;
        return highPitch;
    }

    //const AudioContext = window.AudioContext || window.webkitAudioContext;
    //const audioContext = new AudioContext();

    oscillator1 = audioContext.createOscillator();
    oscillator1.type = 'sine'; // First oscillator is a sine wave
    oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);

    const oscillator2 = audioContext.createOscillator();
    oscillator2.type = 'sine'; // Second oscillator is a square wave
    oscillator2.frequency.setValueAtTime(400, audioContext.currentTime);

    // Gain nodes to control volume
    const gainNode1 = audioContext.createGain();
    const gainNode2 = audioContext.createGain();

    oscillator1.connect(gainNode1);
    oscillator2.connect(gainNode2);

    gainNode1.connect(audioContext.destination);
    gainNode2.connect(audioContext.destination);

    oscillator1.start();
    oscillator2.start();

    const sirenInterval = setInterval(() => {
        const frequency = (getHighPitch()) ? 1200 : 400; // Random frequency between 400 and 1200 Hz
        oscillator1.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(frequency, audioContext.currentTime);
    }, 100); // Change frequency every 10th of a second

    // Stop the siren after 10 seconds
    setTimeout(() => {
        clearInterval(sirenInterval);
        oscillator1.stop();
        oscillator2.stop();
    }, 1000);

}

const Sounds = {
    playSound,
    playSiren
};

export default Sounds;
