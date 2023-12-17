const getSurface = (windGusts) => {
    const surfaces = ['oily glass', 'glassy', 'textured', 'choppy', 'victory at sea'];
    let surface = Math.floor((Number(windGusts)+1)/3);
    surface = (surfaces > 3) ? surfaces[4] : surfaces[surface];
    return surface;
}
export default getSurface;