const randomBackgroundColor = () => {
    const bgArray = ['bg-dkRed', 'bg-dkYellow', 'bg-dkGreen', 'bg-dkRed', 'bg-dkYellow', 'bg-dkGreen', 'bg-dkRed', 'bg-dkYellow', 'bg-dkGreen', 'bg-dkRed', 'bg-dkYellow', 'bg-dkGreen'];
    const randomColor = bgArray[((Math.random()*10).toFixed(0))];
    return randomColor;
}
export default randomBackgroundColor;