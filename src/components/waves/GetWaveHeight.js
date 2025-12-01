const getWaveHeight = (height) => {
    const heights = ['flat', 'knee high', 'waist high', 'chest high', 'shoulder high', 'head high', 'over head', 'foot over head', '2 feet over head' ,'double over head', 'triple over head'];
    height = height.replace('ft','');     
    height = Number(height) - 1;
    height = (height<0) ? heights[0] : heights[height];
    return height;     
}
export default getWaveHeight;