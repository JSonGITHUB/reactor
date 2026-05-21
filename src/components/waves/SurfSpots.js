import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';

export const clearLocalData = () => {
    localStorage.removeItem('locations');
    getSurfSpots();
}
export const getSurfSpots = () => {

    const localLocations = initializeData('locations', null);
    const surfSpots = [
        {"name":"C St.","latitude":34.273282,"longitude":-119.304653,"swell":["S","SW","W","NW"],"wind":["E"],"tide":["low","medium"]},
        {"name":"HB: 17th St.","latitude":33.663781,"longitude":-118.013605,"swell":["SSE","S","SW","WSW","W","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"HB: Taco Bell Reef","latitude":33.657999,"longitude":-118.006578,"swell":["SSE","S","SW","WSW","W","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"HB: North Pier","latitude":33.655927,"longitude":-118.003874,"swell":["SSE","S","SW","WSW","W","WNW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/huntington-beach-pier-northside/5842041f4e65fad6a7708827"},
        {"name":"HB: South Pier","latitude":33.655534,"longitude":-118.003145,"swell":["SSE","S","SW","WSW","W","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"HB: River Jetties","latitude":33.630302,"longitude":-117.961721,"swell":["SSE","S","SW","W","WNW"],"wind":["E","NE"],"tide":["low","medium","high"]},
        {"name":"Salt Creek","latitude":33.475456,"longitude":-117.722133,"swell":["S","SW","W","WNW"],"wind":["E","SE","S"],"tide":["medium","high"],"cam":"https://www.surfline.com/surf-report/salt-creek/5842041f4e65fad6a770882e"},
        {"name":"Lowers","latitude":33.382848,"longitude":-117.588214,"swell":["S","SW","W","WNW"],"wind":["E","NE"],"tide":["medium"],"cam":"https://www.surfline.com/surf-report/lower-trestles/5842041f4e65fad6a770888a"},
        {"name":"O-Side: Harbor North","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"],"cam":"https://www.surfline.com/surf-report/oceanside-harbor/5842041f4e65fad6a7708832"},
        {"name":"O-Side: Harbor South","latitude":33.202483,"longitude":-117.392796,"swell":["SSW","SW","W","WNW"],"wind":["E","NE"],"tide":["medium","high"],"cam":"https://www.surfline.com/surf-report/oceanside-harbor/5842041f4e65fad6a7708832"},
        {"name":"O-Side: Pier North","latitude":33.194686,"longitude":-117.385226,"swell":["SSW","SW","W","WNW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/oceanside-pier/5842041f4e65fad6a7708835"},
        {"name":"O-Side: Pier South","latitude":33.19363,"longitude":-117.384826,"swell":["SSW","SW","W","WNW"],"wind":["E","NE"],"tide":["medium","high"],"cam":"https://www.surfline.com/surf-report/oceanside-pier/5842041f4e65fad6a7708835"},
        {"name":"Carlsbad","latitude":33.14485,"longitude":-117.343638,"swell":["WNW","W","SW","SSW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/carlsbad-state-beach/5bfdced06871990001fd9ff2"},
        {"name":"Ponto: Jetties","latitude":33.086801,"longitude":-117.313695,"swell":["W","NW","SW","WSW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/ponto/5842041f4e65fad6a77088a5"},
        {"name":"Sea Bluff","latitude":33.08198,"longitude":-117.311783,"swell":["W","NW","SW","SSW","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Grandview","latitude":33.076397,"longitude":-117.310334,"swell":["W","NW","SW","SSW","WNW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/grandview/5842041f4e65fad6a770889f"},
        {"name":"Beacons","latitude":33.065118,"longitude":-117.305518,"swell":["W","NW","SW","SSW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/beacons/5842041f4e65fad6a77088a0"},
        {"name":"D St.","latitude":33.046486,"longitude":-117.298161,"swell":["W","WNW","NW","SW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/d-street/5842041f4e65fad6a77088b7"},
        {"name":"Swamis","latitude":33.034592,"longitude":-117.292734,"swell":["W","NW"],"wind":["E"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/swami-s/5842041f4e65fad6a77088b4"},
        {"name":"Pipes","latitude":33.026892,"longitude":-117.287915,"swell":["W","NW","SW"],"wind":["E","NE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/pipes/5c008f5313603c0001df5318"},
        {"name":"Traps","latitude":33.02558,"longitude":-117.287165,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Cardiff Reef","latitude":33.015631,"longitude":-117.282085,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/cardiff-reef/5842041f4e65fad6a77088b1"},
        {"name":"Georges","latitude":33.010952,"longitude":-117.280085,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/george-s/584204214e65fad6a7709d1a"},
        {"name":"Seaside Reef","latitude":33.001613,"longitude":-117.278393,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/seaside-reef/5842041f4e65fad6a77088b3"},
        {"name":"Del Mar","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"],"cam":"https://www.surfline.com/surf-report/del-mar-rivermouth/5842041f4e65fad6a77088b0"},
        {"name":"Torrey Pines","latitude":32.9386,"longitude":-117.261978,"swell":["SW","WNW","NW"],"wind":["NE","E","SE"],"tide":["medium","high"]},
        {"name":"Blacks","latitude":32.881882,"longitude":-117.252467,"swell":["W","NW","SW"],"wind":["E","SE"],"tide":["low","medium"],"cam":"https://www.surfline.com/surf-report/blacks/5842041f4e65fad6a770883b"},
        {"name":"Scripps","latitude":32.865358,"longitude":-117.254981,"swell":["W","NW","SW"],"wind":["E","SE","S"],"tide":["medium"],"cam":"https://www.surfline.com/surf-report/scripps/5842041f4e65fad6a7708839"},
        {"name":"La Jolla Shores","latitude":32.858424,"longitude":-117.256791,"swell":["W","NW"],"wind":["E"],"tide":["medium"]},
        {"name":"Mission Beach","latitude":32.767649,"longitude":-117.252731,"swell":["W","NW","SW"],"wind":["E","S"],"tide":["medium"],"cam":"https://www.surfline.com/surf-report/pacific-beach/5842041f4e65fad6a7708841"},
        {"name":"OB Jetti","latitude":32.754755,"longitude":-117.253815,"swell":["W","NW","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"OB Avalanche","latitude":32.751873,"longitude":-117.252972,"swell":["W","NW","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"OB Pier","latitude":32.747869,"longitude":-117.253615,"swell":["W","NW","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"Sunset Cliffs","latitude":32.72557,"longitude":-117.258111,"swell":["W","NW","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"Rosarito","latitude":32.33376,"longitude":-117.056838,"swell":["S","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"K-38s","latitude":32.259594,"longitude":-116.987307,"swell":["S","SW","W","WNW"],"wind":["NE","E"],"tide":["medium","low"]},
        {"name":"Gaviotas","latitude":32.2525,"longitude":-116.9616,"swell":["S","SW","W","WNW"],"wind":["NE","ENE","E","ESE","SE"],"tide":["high","medium","low"]},
        {"name":"La Fonda","latitude":32.121058,"longitude":-116.885713,"swell":["SW","W"],"wind":["E"],"tide":["medium","low"]},
        {"name":"Punta Baja","latitude":29.954293,"longitude":-115.807737,"swell":["SW","SSW","S","WNW","W"],"wind":["N","NE"],"tide":["high","medium","low"]},
        /*
        {"name":"Elijandros","latitude":28.706507,"longitude":-114.288678,"swell":["W","WNW","NW"],"wind":["N","NE","E","NW"],"tide":["high","medium","low"]},
        {"name":"Harbor","latitude":28.666795,"longitude":-114.239317,"swell":["WNW","NW"],"wind":["N"],"tide":["medium","low"]},
        {"name":"Notch","latitude":28.6668,"longitude":-114.224431,"swell":["WNW","NW"],"wind":["N"],"tide":["medium","low"]},
        {"name":"Wall","latitude":28.566481,"longitude":-114.15859,"swell":["W","WNW","NW"],"wind":["N","NE","ENE"],"tide":["high","medium","low"]},
        {"name":"Abreojos","latitude":26.722327,"longitude":-113.546932,"swell":["S"],"wind":["N","NE","NW"],"tide":["high","medium"]},
        */
        {"name":"Scorpion Bay","latitude":26.239488,"longitude":-112.477709,"swell":["SW","SSW"],"wind":["N","NW"],"tide":["medium","low"]},
        {"name":"Estuary","latitude":23.050415,"longitude":-109.678612,"swell":["S","SE"],"wind":["N"],"tide":["high","medium","low"]},
        {"name":"Colorados","latitude":11.406466,"longitude":-86.04831,"swell":["SW"],"wind":["E","NE"],"tide":["high","medium"]},
        {"name":"Balangan","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        /*
        {"name":"Winter Beach Break","latitude":26.707714,"longitude":-113.582542,"swell":["S","SW","SSW"],"wind":["N","NW","NNW"],"tide":["low","medium","high"]},
        {"name":"Blue House","latitude":26.749928,"longitude":-113.527283,"swell":["S","SW","SSW"],"wind":["N","NE","NNE"],"tide":["low","medium","high"]},
        {"name":"Secretos","latitude":26.76202,"longitude":-113.5193,"swell":["S","SW","SSW"],"wind":["N","NW","NNW"],"tide":["low","medium"]},
        {"name":"Betecis","latitude":26.77792,"longitude":-113.5167,"swell":["S","SW","SSW"],"wind":["N","NE","NNE"],"tide":["low","medium"]},
        */
        {"name":"Pismo","latitude":35.138991,"longitude":-120.642989,"swell":["W","NW","SW"],"wind":["E","NE"],"tide":["low","medium"]},
        /*
        {"name":"Ninja's","latitude":33.0799858,"longitude":-117.2418013,"swell":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],"wind":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],"tide":["low","medium","high"]},
        */
        {"name":"HB: Sanchos","latitude":33.657999,"longitude":-118.006578,"swell":["SSE","S","SW","WSW","W","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"O-Side: Harbor Middles","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"]},
        {"name":"O-Side: Jettie Southside","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"]},
        {"name":"O-Side: Tyson","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"]},
        {"name":"O-Side: Trenchtown","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"]},
        {"name":"O-Side: Blvd","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"]},
        {"name":"O-Side: Rock","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"]},
        {"name":"O-Side: Poo Poos","latitude":33.206684,"longitude":-117.397452,"swell":["SSW","SW","W","WNW","SSE"],"wind":["E"],"tide":["medium","high"]},
        {"name":"C-Bad: Northend","latitude":33.14485,"longitude":-117.343638,"swell":["WNW","W","SW","SSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"C-Bad: Southside","latitude":33.14485,"longitude":-117.343638,"swell":["WNW","W","SW","SSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Ponto: North","latitude":33.086801,"longitude":-117.313695,"swell":["W","NW","SW","WSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Ponto: Proper","latitude":33.086801,"longitude":-117.313695,"swell":["W","NW","SW","WSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Ponto: South","latitude":33.086801,"longitude":-117.313695,"swell":["W","NW","SW","WSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Sandbags","latitude":33.076397,"longitude":-117.310334,"swell":["W","NW","SW","SSW","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Grandview: Proper","latitude":33.076397,"longitude":-117.310334,"swell":["W","NW","SW","SSW","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Avocados","latitude":33.076397,"longitude":-117.310334,"swell":["W","NW","SW","SSW","WNW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Beacons: North","latitude":33.065118,"longitude":-117.305518,"swell":["W","NW","SW","SSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Beacons: Out Front","latitude":33.065118,"longitude":-117.305518,"swell":["W","NW","SW","SSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Beacons: Wall","latitude":33.065118,"longitude":-117.305518,"swell":["W","NW","SW","SSW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"D St.: North","latitude":33.046486,"longitude":-117.298161,"swell":["W","WNW","NW","SW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"D St.: Diamond House","latitude":33.046486,"longitude":-117.298161,"swell":["W","WNW","NW","SW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"D St.: Hollywood Squares","latitude":33.046486,"longitude":-117.298161,"swell":["W","WNW","NW","SW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Boneyards","latitude":33.034592,"longitude":-117.292734,"swell":["W","NW"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Brown House","latitude":33.026892,"longitude":-117.287915,"swell":["W","NW","SW"],"wind":["E","NE"],"tide":["low","medium"]},
        {"name":"Barneys","latitude":33.02558,"longitude":-117.287165,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Turtles","latitude":33.02558,"longitude":-117.287165,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"85s","latitude":33.02558,"longitude":-117.287165,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Tippers","latitude":33.015631,"longitude":-117.282085,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Suckouts","latitude":33.015631,"longitude":-117.282085,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Cardiff Reef South","latitude":33.015631,"longitude":-117.282085,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Bus Stops","latitude":33.010952,"longitude":-117.280085,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"P-Lots","latitude":33.010952,"longitude":-117.280085,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Palis","latitude":33.001613,"longitude":-117.278393,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Tabletops","latitude":33.001613,"longitude":-117.278393,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Cherry Hill","latitude":33.001613,"longitude":-117.278393,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Rock Piles","latitude":33.001613,"longitude":-117.278393,"swell":["NW","W"],"wind":["E"],"tide":["low","medium"]},
        {"name":"Del Mar Rivermouth","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"]},
        {"name":"Del Mar: 29th","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"]},
        {"name":"Del Mar: 19th","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"]},
        {"name":"Del Mar: 15th","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"]},
        {"name":"Del Mar: 11th","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"]},
        {"name":"Del Mar: 8th","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"]},
        {"name":"Del Mar: Mouse Hole","latitude":32.976395,"longitude":-117.270974,"swell":["SW","W","NW"],"wind":["E"],"tide":["low","medium","high"]},
        {"name":"Torrey Pines: North","latitude":32.9386,"longitude":-117.261978,"swell":["SW","WNW","NW"],"wind":["NE","E","SE"],"tide":["medium","high"]},
        {"name":"Torrey Pines: South","latitude":32.9386,"longitude":-117.261978,"swell":["SW","WNW","NW"],"wind":["NE","E","SE"],"tide":["medium","high"]},
        {"name":"Scripps: Northside","latitude":32.865358,"longitude":-117.254981,"swell":["W","NW","SW"],"wind":["E","SE","S"],"tide":["medium"]},
        {"name":"Marine Room","latitude":32.858424,"longitude":-117.256791,"swell":["W","NW"],"wind":["E"],"tide":["medium"]},
        {"name":"Mission Drive","latitude":32.767649,"longitude":-117.252731,"swell":["W","NW","SW"],"wind":["E","S"],"tide":["medium"]},
        {"name":"Mission: San Fernando","latitude":32.767649,"longitude":-117.252731,"swell":["W","NW","SW"],"wind":["E","S"],"tide":["medium"]},
        {"name":"South Mission Jetti","latitude":32.767649,"longitude":-117.252731,"swell":["W","NW","SW"],"wind":["E","S"],"tide":["medium"]},
        {"name":"Loscombs","latitude":32.72557,"longitude":-117.258111,"swell":["W","NW","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"Rosarito: Smoke Stacks","latitude":32.33376,"longitude":-117.056838,"swell":["S","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"Rosarito: Pier","latitude":32.33376,"longitude":-117.056838,"swell":["S","SW"],"wind":["E"],"tide":["medium"]},
        {"name":"Abreojos: 3 pole","latitude":26.722327,"longitude":-113.546932,"swell":["S"],"wind":["N","NE","NW"],"tide":["high","medium"]},
        {"name":"Abreojos: Razors","latitude":26.722327,"longitude":-113.546932,"swell":["S"],"wind":["N","NE","NW"],"tide":["high","medium"]},
        {"name":"Kuta","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Pantai Ujung","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Jasri Beach","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Ceningan","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Nusa Lembongan","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Playgrounds","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Lacerations","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Padangbai","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Shipwrecks & Razors","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Keramas","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Keramas KFC","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Ketewel","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Sanur","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Sindhu Beach","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Tanhung Sari","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Hyatt Reef","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Serangan","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Pantai Nusadua","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Nusa Dua","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Green Ball","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Nyang Nyang","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Uluwatu","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Lurches","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Secrets","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Racetracks","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"The Temples","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"The Peak","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Padang Padang","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Impossibles","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Bingin","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Dreamland","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Airport Rights","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Kuta Reef","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Kuta Beach","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Padma","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Legian Beach","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Seminyak","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Berawa","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Nelayan Beach","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Canggu","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Old Mans - Batu-Balong","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Pererenan","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Yeh Gangga","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Balian","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Medewi","latitude":-8.793402,"longitude":115.122438,"swell":["S","SW","W"],"wind":["SE"],"tide":["low","medium"]},
        {"name":"Jeanette's Pier N.","latitude":35.910811,"longitude":-75.59549,"swell":["SE","NE"],"wind":["SW","W"],"tide":["low","medium"]},
        {"name":"Jeanette's Pier S.","latitude":35.909929,"longitude":-75.59298,"swell":["SE","NE"],"wind":["SW","W"],"tide":["low","medium"]},
        {"name":"Kure, Alabama Ave","latitude":34.013474,"longitude":-77.8991,"swell":["S","SE"],"wind":["W"],"tide":["low","medium"]},
        {"name":"Johnny's","latitude":33.0261779,"longitude":-117.287065,"swell":["W","SW","NW"],"wind":["SE","E","NE"],"tide":["low","medium"]},
        {"name":"Morro Bay","latitude":35.378154,"longitude":-120.86589,"swell":["W","NW","SW"],"wind":["NE","E","SE"],"tide":["medium"]},
        {"name":"Punta Roca","latitude":13.479739,"longitude":-89.32655,"swell":["SSW","SW"],"wind":["N"],"tide":["high","low","medium"]},
        {"name":"Las Flores","latitude":13.167687,"longitude":-88.11798,"swell":["SE","S"],"wind":["NW","N"],"tide":["low","medium","high"]},
        {"name":"Punta Mango","latitude":13.164,"longitude":-88.19,"swell":["S","SW"],"wind":["N"],"tide":["low","medium","high"]},
        {"name":"La Paz","latitude":13.483474,"longitude":-89.32376,"swell":["SSW","SW"],"wind":["N"],"tide":["low","medium","high"]},
        {"name":"La Bocana","latitude":13.491597,"longitude":-89.38104,"swell":["SSW","SW"],"wind":["N"],"tide":["low","medium","high"]},
        {"name":"Sunzal","latitude":13.491676,"longitude":-89.39,"swell":["SSW","SW"],"wind":["N"],"tide":["low","medium"]},
        {"name":"El Zonte","latitude":13.493319,"longitude":-89.43945,"swell":["SSW","SW"],"wind":["N"],"tide":["low","medium","high"]},
        {"name":"Mizata","latitude":13.509,"longitude":-89.597,"swell":["SSW","SW"],"wind":["N"],"tide":["low","medium"]}
    ];

    const syncCamLinks = (locations) => {
        const surfSpotsByName = new Map(surfSpots.map((location) => [location.name, location]));
        let hasUpdates = false;

        const syncedLocations = locations.map((location) => {
            const matchingSurfSpot = surfSpotsByName.get(location.name);

            if (!matchingSurfSpot || !matchingSurfSpot.cam || location.cam) {
                return location;
            }

            hasUpdates = true;
            return {
                ...location,
                cam: matchingSurfSpot.cam
            };
        });

        const missingLocations = surfSpots.filter((defaultLocation) => !syncedLocations.some((location) => location.name === defaultLocation.name));
        const mergedLocations = [...syncedLocations, ...missingLocations];

        if (hasUpdates || missingLocations.length > 0) {
            localStorage.setItem('locations', JSON.stringify(mergedLocations));
        }

        return mergedLocations;
    };

    if (localLocations && (validate(localLocations) !== null)) {
        return syncCamLinks(localLocations);
    }

    return surfSpots;

}
export default getSurfSpots;