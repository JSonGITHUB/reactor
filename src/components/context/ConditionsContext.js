import React from 'react';

export default React.createContext({
    module: 'Waves',
    pause: true,
    date: new Date(),
    edit: false,
    tide: 'low',
    stars: 1,
    waterTemp: '66.2',
    swell1Height: '2.0',
    swell1Interval: '17',
    swell1Direction: 'SSW',
    swell2Height: '2.0',
    swell2Interval: '9',
    swell2Direction: 'SSW',
    swell1Angle: 205,
    swell2Angle: 205,
    windDirection: 'E',
    distance: 20,
    isSwell1: true,
    isSwell2: false,
    isTide: true,
    isWind: false,
    locations: [],
    /*
    locations: JSON.stringify([{
            "name": "HB: 17th St.",
            "latitude": 33.663781,
            "longitude": -118.013605,
            "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "HB: Taco Bell Reef",
            "latitude": 33.657999,
            "longitude": -118.006578,
            "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "HB: North Pier",
            "latitude": 33.655927,
            "longitude": -118.003874,
            "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "HB: South Pier",
            "latitude": 33.655534,
            "longitude": -118.003145,
            "swell": ["SSE", "S", "SW", "WSW", "W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "HB: River Jetties",
            "latitude": 33.630302,
            "longitude": -117.961721,
            "swell": ["SSE", "S", "SW","W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Salt Creek",
            "latitude": 33.475456,
            "longitude": -117.722133,
            "swell": ["S", "SW", "W", "WNW"],
            "wind": ["E", "SE", "S"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Lowers",
            "latitude": 33.382848,
            "longitude": -117.588214,
            "swell": ["S", "SW","W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["medium"]
        },
        {
            "name": "O-Side: Harbor North",
            "latitude": 33.206684,
            "longitude": -117.397452,
            "swell": ["SSW", "SW", "W", "WNW", "SSE"],
            "wind": ["E"],
            "tide": ["medium", "high"]
        },
        {
            "name": "O-Side: Harbor South",
            "latitude": 33.202483,
            "longitude": -117.392796,
            "swell": ["SSW", "SW", "W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["medium", "high"]
        },
        {
            "name": "O-Side: Pier North",
            "latitude": 33.194686,
            "longitude": -117.385226,
            "swell": ["SSW", "SW", "W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "O-Side: Pier South",
            "latitude": 33.193630,
            "longitude": -117.384826,
            "swell": ["SSW", "SW", "W", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Carlsbad",
            "latitude": 33.144850,
            "longitude": -117.343638,
            "swell": ["WNW", "W", "SW", "SSW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Ponto: Jetties",
            "latitude": 33.086801,
            "longitude": -117.313695,
            "swell": ["W", "NW", "SW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Sea Bluff",
            "latitude": 33.081980,
            "longitude": -117.311783,
            "swell": ["W", "NW", "SW", "SSW", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Grandview",
            "latitude": 33.076397,
            "longitude": -117.310334,
            "swell": ["W", "NW", "SW", "SSW", "WNW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Beacons",
            "latitude": 33.065118,
            "longitude": -117.305518,
            "swell": ["W", "NW", "SW", "SSW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "D St.",
            "latitude": 33.046486,
            "longitude": -117.298161,
            "swell": ["W", "WNW", "NW", "SW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Swamis",
            "latitude": 33.034592,
            "longitude": -117.292734,
            "swell": ["W", "NW"],
            "wind": ["E"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Pipes",
            "latitude": 33.026892,
            "longitude": -117.287915,
            "swell": ["W", "NW", "SW"],
            "wind": ["E", "NE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Traps",
            "latitude": 33.025580,
            "longitude": -117.287165,
            "swell": ["NW","W"],
            "wind": ["E"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Cardiff Reef",
            "latitude": 33.015631,
            "longitude": -117.282085,
            "swell": ["NW","W"],
            "wind": ["E"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Georges",
            "latitude": 33.010952,
            "longitude": -117.280085,
            "swell": ["NW","W"],
            "wind": ["E"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Seaside Reef",
            "latitude": 33.001613,
            "longitude": -117.278393,
            "swell": ["NW","W"],
            "wind": ["E"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Del Mar",
            "latitude": 32.976395,
            "longitude": -117.270974,
            "swell": ["SW", "W", "NW"],
            "wind": ["E"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Torrey Pines",
            "latitude": 32.938600,
            "longitude": -117.261978,
            "swell": ["SW", "WNW", "NW"],
            "wind": ["NE", "E", "SE"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Blacks",
            "latitude": 32.881882,
            "longitude": -117.252467,
            "swell": ["W","NW", "SW"],
            "wind": ["E", "SE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Scripps",
            "latitude": 32.865358,
            "longitude": -117.254981,
            "swell": ["W", "NW", "SW"],
            "wind": ["E", "SE", "S"],
            "tide": ["medium"]
        },
        {
            "name": "La Jolla Shores",
            "latitude": 32.858424,
            "longitude": -117.256791,
            "swell": ["W", "NW"],
            "wind": ["E"],
            "tide": ["medium"]
        },
        {
            "name": "Mission Beach",
            "latitude": 32.767649,
            "longitude": -117.252731,
            "swell": ["W", "NW", "SW"],
            "wind": ["E", "S"],
            "tide": ["medium"]
        },
        {
            "name": "OB Jetti",
            "latitude": 32.754755,
            "longitude": -117.253815,
            "swell": ["W", "NW", "SW"],
            "wind": ["E"],
            "tide": ["medium"]
        },
        {
            "name": "OB Avalanche",
            "latitude": 32.751873,
            "longitude": -117.252972,
            "swell": ["W", "NW", "SW"],
            "wind": ["E"],
            "tide": ["medium"]
        },
        {
            "name": "OB Pier",
            "latitude": 32.747869,
            "longitude": -117.253615,
            "swell": ["W", "NW", "SW"],
            "wind": ["E"],
            "tide": ["medium"]
        },
        {
            "name": "Sunset Cliffs",
            "latitude": 32.725570,
            "longitude": -117.258111,
            "swell": ["W", "NW", "SW"],
            "wind": ["E"],
            "tide": ["medium"]
        },
        {
            "name": "Rosarito",
            "latitude": 32.333760,
            "longitude": -117.056838,
            "swell": ["S", "SW"],
            "wind": ["E"],
            "tide": ["medium"]
        },
        {
            "name": "K-38s",
            "latitude": 32.259594,
            "longitude": -116.987307,
            "swell": ["S", "SW", "W", "WNW"],
            "wind": ["NE","E"],
            "tide": ["medium", "low"]
        },
        {
            "name": "Gaviotas",
            "latitude": 32.252500,
            "longitude": -116.961600,
            "swell": ["S", "SW", "W", "WNW"],
            "wind": ["NE", "ENE", "E", "ESE", "SE"],
            "tide": ["high", "medium", "low"]
        },
        {
            "name": "La Fonda",
            "latitude": 32.121058,
            "longitude": -116.885713,
            "swell": ["SW", "W"],
            "wind": ["E"],
            "tide": ["medium", "low"]
        },
        {
            "name": "Punta Baja",
            "latitude": 29.954293,
            "longitude": -115.807737,
            "swell": ["SW", "SSW", "S", "WNW", "W"],
            "wind": ["N", "NE"],
            "tide": ["high", "medium", "low"]
        },
        {
            "name": "Elijandros",
            "latitude": 28.706507,
            "longitude": -114.288678,
            "swell": ["W", "WNW", "NW"],
            "wind": ["N","NE", "E", "NW"],
            "tide": ["high", "medium", "low"]
        },
        {
            "name": "Harbor",
            "latitude": 28.666795,
            "longitude": -114.239317,
            "swell": ["WNW", "NW"],
            "wind": ["N"],
            "tide": ["medium", "low"]
        },
        {
            "name": "Notch",
            "latitude": 28.666800,
            "longitude": -114.224431,
            "swell": ["WNW", "NW"],
            "wind": ["N"],
            "tide": ["medium", "low"]
        },
        {
            "name": "Wall",
            "latitude": 28.566481,
            "longitude": -114.158590,
            "swell": ["W", "WNW", "NW"],
            "wind": ["N", "NE", "ENE"],
            "tide": ["high", "medium", "low"]
        },
        {
            "name": "Abreojos",
            "latitude": 26.722327,
            "longitude": -113.546932,
            "swell": ["S"],
            "wind": ["N", "NE", "NW"],
            "tide": ["high", "medium"]
        },
        {
            "name": "Scorpion Bay",
            "latitude": 26.239488,
            "longitude": -112.477709,
            "swell": ["SW","SSW"],
            "wind": ["N", "NW"],
            "tide": ["medium", "low"]
        },
        {
            "name": "Estuary",
            "latitude": 23.050415,
            "longitude": -109.678612,
            "swell": ["S", "SE"],
            "wind": ["N"],
            "tide": ["high", "medium", "low"]
        },
        {
            "name": "Colorados",
            "latitude": 11.406466,
            "longitude": -86.048310,
            "swell": ["SW"],
            "wind": ["E", "NE"],
            "tide": ["high", "medium"]
        },
        
        {
            "name": "Kuta", 
            "latitude": -8.712246,
            "longitude": 115.167092,
            "swell": ["S","SW"],
            "wind": ["N"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Pantai Ujung",
            "latitude": -8.441250, 
            "longitude": 115.628332,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Jasri Beach",
            "latitude": -8.481000, 
            "longitude": 115.624708,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Ceningan",
            "latitude": -8.706210, 
            "longitude": 115.438362,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Nusa Lembongan",
            "latitude": -8.674861, 
            "longitude": 115.446459,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Playgrounds",
            "latitude": -8.679103, 
            "longitude": 115.446534,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Lacerations",
            "latitude": -8.675495, 
            "longitude": 115.440282,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Padangbai",
            "latitude": -8.541541, 
            "longitude": 115.506547,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Shipwrecks & Razors",
            "latitude": -8.664464, 
            "longitude": 115.441342,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Keramas",
            "latitude": -8.599642, 
            "longitude": 115.335284,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Keramas KFC",
            "latitude": -8.599642, 
            "longitude": 115.335284,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Ketewel",
            "latitude": -8.643518,
            "longitude": 115.284854,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Sanur",
            "latitude": -8.708116, 
            "longitude": 115.262292,
            "swell": ["S","SW"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Sindhu Beach",
            "latitude": -8.683479, 
            "longitude": 115.265382,
            "swell": ["S","SW", "W"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Tanhung Sari",
            "latitude": -8.688290,
            "longitude": 115.265543,
            "swell": ["S","SW", "W"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Hyatt Reef",
            "latitude": -8.703481,
            "longitude": 115.264745,
            "swell": ["S","SW", "W"],
            "wind": ["W", "NW"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Serangan",
            "latitude": -8.737929,
            "longitude": 115.252158,
            "swell": ["S","SW", "W"],
            "wind": ["W", "NW"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Pantai Nusadua",
            "latitude": -8.795649,
            "longitude": 115.233057,
            "swell": ["S","SW", "W"],
            "wind": ["W", "NW"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Nusa Dua",
            "latitude": -8.803974,
            "longitude": 115.240768,
            "swell": ["S","SW", "W"],
            "wind": ["W", "NW"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Green Ball",
            "latitude": -8.847979,
            "longitude": 115.172189,
            "swell": ["S","SW", "W"],
            "wind": ["W","NW"],
            "tide": ["medium"]
        },
        {
            "name": "Nyang Nyang",
            "latitude": -8.837901,
            "longitude": 115.096285,
            "swell": ["S","SW", "W"],
            "wind": ["W","NW"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Uluwatu",
            "latitude": -8.813893,
            "longitude": 115.088251,
            "swell": ["S","SW"],
            "wind": ["S", "SE", "E", "NE", "N"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Padang Padang",
            "latitude": -8.810544,
            "longitude": 115.103698,
            "swell": ["S","SW", "WSW"],
            "wind": ["SE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Impossibles",
            "latitude": -8.808672,
            "longitude": 115.107576,
            "swell": ["S","SW"],
            "wind": ["SE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Bingin",
            "latitude": -8.806190, 
            "longitude": 115.112204,
            "swell": ["S","SW"],
            "wind": ["E"],
            "tide": ["medium", "low"]
        },
        {
            "name": "Dreamland",
            "latitude": -8.794446,
            "longitude": 115.118715,
            "swell": ["S","SW"],
            "wind": ["SE"],
            "tide": ["low"]
        },
        {
            "name": "Balangan",
            "latitude": -8.793512,
            "longitude": 115.122462,
            "swell": ["S","SW"],
            "wind": ["SE"],
            "tide": ["medium", "low"]
        },
        {
            "name": "Airport Rights",
            "latitude": -8.740792, 
            "longitude": 115.152650,
            "swell": ["S","SW", "W"],
            "wind": ["SE"],
            "tide": ["high"]
        },
        {
            "name": "Kuta Reef",
            "latitude": -8.740844,
            "longitude": 115.161233,
            "swell": ["S","SW", "W"],
            "wind": ["SE"],
            "tide": ["high"]
        },
        {
            "name": "Kuta Beach",
            "latitude": -8.717862,
            "longitude": 115.168326,
            "swell": ["S","SW"],
            "wind": ["SE"],
            "tide": ["medium", "high"]
        },
        {
            "name": "Padma",
            "latitude": -8.705850,
            "longitude": 115.166688,
            "swell": ["S","SW"],
            "wind": ["SE"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Legian Beach",
            "latitude": -8.703682,
            "longitude": 115.163184,
            "swell": ["S","SW"],
            "wind": ["N", "N", "SE"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Seminyak",
            "latitude": -8.691377, 
            "longitude": 115.155161,
            "swell": ["S","SW", "W"],
            "wind": ["SE"],
            "tide": ["low", "medium"]
        },
        {
            "name": "Berawa",
            "latitude": -8.662332, 
            "longitude": 115.139058,
            "swell": ["S","SW", "W"],
            "wind": ["NE"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Nelayan Beach",
            "latitude": -8.660919,
            "longitude": 115.134384,
            "swell": ["S","SW"],
            "wind": ["N", "N", "SE"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Canggu",
            "latitude": -8.655084,
            "longitude": 115.124594,
            "swell": ["S","SW"],
            "wind": ["N", "N", "SE"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Old Mans - Batu-Balong",
            "latitude": -8.658846,
            "longitude": 115.134739,
            "swell": ["SW"],
            "wind": ["NE"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Pererenan",
            "latitude": -8.651677,
            "longitude": 115.122052,
            "swell": ["S","SW", "W"],
            "wind": ["N", "NW"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Yeh Gangga",
            "latitude": -8.591730,
            "longitude": 115.070753,
            "swell": ["S","SW","SSW"],
            "wind": ["N", "NW"],
            "tide": ["low", "medium", "high"]
        },
        {
            "name": "Balian",
            "latitude": -8.501839,
            "longitude": 114.969953,
            "swell": ["S","SW"],
            "wind": ["N", "NW"],
            "tide": ["medium", "hi"]
        },
        {
            "name": "Medewi",
            "latitude": -8.417937,
            "longitude": 114.791239,
            "swell": ["S","SW", "W"],
            "wind": ["N"],
            "tide": ["medium", "hi"]
        }]),
    */
    matches: []
});