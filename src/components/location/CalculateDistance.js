import initializeData from '../utils/InitializeData';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 3958.8; // Radius of the Earth in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
    
};

const CalculateDistance = (state, item) => {

    const lat1 = item.latitude;
    const lat2 = initializeData('latitude', null);
    const lon1 = item.longitude;
    const lon2 = initializeData('longitude', null);
    const unit = "Miles"
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    } else {
        /*
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist.toFixed(1);
        if (unit === "Kilometers") { dist = dist * 1.609344 }
        if (unit === "Nautical") { dist = dist * 0.8684 }
        */
        const dist = haversineDistance(lat1, lon1, lat2, lon2).toFixed(2);
        //console.log(`CalculateDistance => spot: ${item.name} \nDISTANCE => ${dist}\nlong: ${lon1} \nlat: ${lat1}  \nlatitude: ${lat2}\nlongitude: ${lon2}`)
        return dist;

    }
}
export default CalculateDistance