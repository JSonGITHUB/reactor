const randomColor = () => {
    const colorArray = ['color-red', 'color-yellow', 'color-neogreen', 'white', 'color-dark', 'color-lite', 'color-orange', 'color-black', 'color-blue', 'color-graphite']
    const randomColor = colorArray[((Math.random()*10).toFixed(0))];
    return randomColor;
}
export default randomColor;