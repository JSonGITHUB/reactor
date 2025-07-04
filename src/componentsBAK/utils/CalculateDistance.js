const CalculateDistance = (state, item) => {
        
    const { latitude, longitude } = state;
    const lat1 = item.latitude;
    const lat2 = latitude;
    const lon1 = item.longitude;
    const lon2 = longitude;
    const unit = "Miles"
    //console.log(`POOP latitude: ${latitude}\nlongitude: ${longitude}\nSTATE: ${JSON.stringify(state, null,2)}`)
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist.toFixed(1);
        if (unit==="Kilometers") { dist = dist * 1.609344 }
        if (unit==="Nautical") { dist = dist * 0.8684 }
        //console.log(`DISTANCE => ${dist}`)
        return dist;
    }
}
export default CalculateDistance