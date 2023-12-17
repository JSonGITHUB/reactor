const getWindMPH = (windGusts) => {
    let mph = Number(windGusts)+1;
    mph = mph + 'mph';
    return mph
}
export default getWindMPH;