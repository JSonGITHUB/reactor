const courseData = [
    {
        'name': 'Brookside Golf Course',
        'address': '1133 Rosemont Ave, Pasadena, CA 91103',
        'holes': [
            {
                'number': 1,
                'par': 5,
                'distance': 520,
                'latitude': 34.1618,
                'longitude': -118.1640
            },
            {
                'number': 2,
                'par': 4,
                'distance': 420,
                'latitude': 34.1622,
                'longitude': -118.1625
            },
            {
                'number': 3,
                'par': 3,
                'distance': 180,
                'latitude': 34.1620,
                'longitude': -118.1610
            },
            {
                'number': 4,
                'par': 4,
                'distance': 400,
                'latitude': 34.1615,
                'longitude': -118.1595
            },
            {
                'number': 5,
                'par': 4,
                'distance': 430,
                'latitude': 34.1610,
                'longitude': -118.1580
            },
            {
                'number': 6,
                'par': 5,
                'distance': 550,
                'latitude': 34.1605,
                'longitude': -118.1565
            },
            {
                'number': 7,
                'par': 3,
                'distance': 210,
                'latitude': 34.1600,
                'longitude': -118.1550
            },
            {
                'number': 8,
                'par': 4,
                'distance': 440,
                'latitude': 34.1595,
                'longitude': -118.1535
            },
            {
                'number': 9,
                'par': 4,
                'distance': 410,
                'latitude': 34.1590,
                'longitude': -118.1520
            }
        ],
        'pars': [5, 4, 3, 4, 4, 5, 3, 4, 4],
        'fees': 50,
        'latitude': 34.1613,
        'longitude': -118.1633,
        'distances': [520, 420, 180, 400, 430, 550, 210, 440, 410],
        'totalDistance': 7220
    },
    {
        'name': 'Torrey Pines Golf Course - South Course',
        'address': '11480 N Torrey Pines Rd, La Jolla, CA 92037',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 450,
                'latitude': 32.9054,
                'longitude': -117.2431
            },
            {
                'number': 2,
                'par': 4,
                'distance': 389,
                'latitude': 32.9051,
                'longitude': -117.2422
            },
            {
                'number': 3,
                'par': 3,
                'distance': 198,
                'latitude': 32.9049,
                'longitude': -117.2413
            },
            {
                'number': 4,
                'par': 4,
                'distance': 488,
                'latitude': 32.9047,
                'longitude': -117.2404
            },
            {
                'number': 5,
                'par': 4,
                'distance': 454,
                'latitude': 32.9045,
                'longitude': -117.2395
            },
            {
                'number': 6,
                'par': 5,
                'distance': 560,
                'latitude': 32.9043,
                'longitude': -117.2386
            },
            {
                'number': 7,
                'par': 4,
                'distance': 462,
                'latitude': 32.9041,
                'longitude': -117.2377
            },
            {
                'number': 8,
                'par': 3,
                'distance': 176,
                'latitude': 32.9039,
                'longitude': -117.2368
            },
            {
                'number': 9,
                'par': 5,
                'distance': 614,
                'latitude': 32.9037,
                'longitude': -117.2359
            }
        ],
        'pars': [4, 4, 3, 4, 4, 5, 4, 3, 5],
        'fees': 63,
        'latitude': 32.9049,
        'longitude': -117.2425,
        'distances': [450, 389, 198, 488, 454, 560, 462, 176, 614],
        'totalDistance': 7807
    },
    {
        'name': 'Encinitas Ranch Golf Course',
        'address': '1275 Quail Gardens Drive, Encinitas, CA 92024',
        'holes': [
            { 'number': 1, 'par': 4, 'distance': 389, 'latitude': 33.0650, 'longitude': -117.2795 },
            { 'number': 2, 'par': 4, 'distance': 365, 'latitude': 33.0655, 'longitude': -117.2780 },
            { 'number': 3, 'par': 3, 'distance': 178, 'latitude': 33.0660, 'longitude': -117.2765 },
            { 'number': 4, 'par': 5, 'distance': 512, 'latitude': 33.0665, 'longitude': -117.2750 },
            { 'number': 5, 'par': 4, 'distance': 401, 'latitude': 33.0670, 'longitude': -117.2735 },
            { 'number': 6, 'par': 4, 'distance': 384, 'latitude': 33.0675, 'longitude': -117.2720 },
            { 'number': 7, 'par': 3, 'distance': 176, 'latitude': 33.0680, 'longitude': -117.2705 },
            { 'number': 8, 'par': 5, 'distance': 527, 'latitude': 33.0685, 'longitude': -117.2690 },
            { 'number': 9, 'par': 4, 'distance': 407, 'latitude': 33.0690, 'longitude': -117.2675 },
            { 'number': 10, 'par': 4, 'distance': 400, 'latitude': 33.0695, 'longitude': -117.2660 },
            { 'number': 11, 'par': 5, 'distance': 525, 'latitude': 33.0700, 'longitude': -117.2645 },
            { 'number': 12, 'par': 4, 'distance': 392, 'latitude': 33.0705, 'longitude': -117.2630 },
            { 'number': 13, 'par': 3, 'distance': 184, 'latitude': 33.0710, 'longitude': -117.2615 },
            { 'number': 14, 'par': 4, 'distance': 408, 'latitude': 33.0715, 'longitude': -117.2600 },
            { 'number': 15, 'par': 4, 'distance': 389, 'latitude': 33.0720, 'longitude': -117.2585 },
            { 'number': 16, 'par': 3, 'distance': 202, 'latitude': 33.0725, 'longitude': -117.2570 },
            { 'number': 17, 'par': 5, 'distance': 512, 'latitude': 33.0730, 'longitude': -117.2555 },
            { 'number': 18, 'par': 4, 'distance': 418, 'latitude': 33.0735, 'longitude': -117.2540 }
        ],
        'pars': [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 5, 4, 3, 4, 4, 3, 5, 4],
        'fees': 103,
        'latitude': 33.0650,
        'longitude': -117.2795,
        'distances': [389, 365, 178, 512, 401, 384, 176, 527, 407, 400, 525, 392, 184, 408, 389, 202, 512, 418],
        'totalDistance': 6587
    },
    {
        'name': 'Mission Bay Golf Course',
        'address': '2702 N Mission Bay Dr, San Diego, CA 92109',
        'holes': [
            { 'number': 1, 'par': 4, 'distance': 262 },
            { 'number': 2, 'par': 3, 'distance': 90 },
            { 'number': 3, 'par': 3, 'distance': 134 },
            { 'number': 4, 'par': 3, 'distance': 95 },
            { 'number': 5, 'par': 3, 'distance': 121 },
            { 'number': 6, 'par': 3, 'distance': 75 },
            { 'number': 7, 'par': 4, 'distance': 265 },
            { 'number': 8, 'par': 3, 'distance': 135 },
            { 'number': 9, 'par': 3, 'distance': 124 },
            { 'number': 10, 'par': 4, 'distance': 250 },
            { 'number': 11, 'par': 3, 'distance': 134 },
            { 'number': 12, 'par': 3, 'distance': 141 },
            { 'number': 13, 'par': 3, 'distance': 115 },
            { 'number': 14, 'par': 3, 'distance': 125 },
            { 'number': 15, 'par': 3, 'distance': 100 },
            { 'number': 16, 'par': 4, 'distance': 270 },
            { 'number': 17, 'par': 3, 'distance': 140 },
            { 'number': 18, 'par': 3, 'distance': 130 }
        ],
        'pars': [4, 3, 3, 3, 3, 3, 4, 3, 3, 4, 3, 3, 3, 3, 3, 4, 3, 3],
        'fees': 30,
        'latitude': 32.8006044,
        'longitude': -117.2164246,
        'distances': [262, 90, 134, 95, 121, 75, 265, 135, 124, 250, 134, 141, 115, 125, 100, 270, 140, 130],
        'totalDistance': 2719
    },
    {
        'name': 'Balboa Park Golf Course',
        'address': '2600 Golf Course Dr, San Diego, CA 92102',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 375,
                'latitude': 32.7211,
                'longitude': -117.1445
            },
            {
                'number': 2,
                'par': 3,
                'distance': 170,
                'latitude': 32.7213,
                'longitude': -117.1432
            },
            {
                'number': 3,
                'par': 4,
                'distance': 395,
                'latitude': 32.7216,
                'longitude': -117.1420
            },
            {
                'number': 4,
                'par': 5,
                'distance': 515,
                'latitude': 32.7220,
                'longitude': -117.1410
            },
            {
                'number': 5,
                'par': 4,
                'distance': 405,
                'latitude': 32.7225,
                'longitude': -117.1402
            },
            {
                'number': 6,
                'par': 3,
                'distance': 190,
                'latitude': 32.7230,
                'longitude': -117.1390
            },
            {
                'number': 7,
                'par': 4,
                'distance': 435,
                'latitude': 32.7235,
                'longitude': -117.1380
            },
            {
                'number': 8,
                'par': 5,
                'distance': 520,
                'latitude': 32.7240,
                'longitude': -117.1370
            },
            {
                'number': 9,
                'par': 4,
                'distance': 400,
                'latitude': 32.7245,
                'longitude': -117.1360
            }
        ],
        'pars': [4, 3, 4, 5, 4, 3, 4, 5, 4],
        'fees': 45,
        'latitude': 32.7211,
        'longitude': -117.1445,
        'distances': [375, 170, 395, 515, 405, 190, 435, 520, 400],
        'totalDistance': 3405
    },
    {
        'name': 'The Links at Lakehouse',
        'address': '1750 San Pablo Dr, San Marcos, CA 92078',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 310,
                'latitude': 33.1290,
                'longitude': -117.1990
            },
            {
                'number': 2,
                'par': 4,
                'distance': 394,
                'latitude': 33.1295,
                'longitude': -117.1985
            },
            {
                'number': 3,
                'par': 3,
                'distance': 208,
                'latitude': 33.1300,
                'longitude': -117.1980
            },
            {
                'number': 4,
                'par': 4,
                'distance': 447,
                'latitude': 33.1305,
                'longitude': -117.1975
            },
            {
                'number': 5,
                'par': 4,
                'distance': 343,
                'latitude': 33.1310,
                'longitude': -117.1970
            },
            {
                'number': 6,
                'par': 3,
                'distance': 163,
                'latitude': 33.1315,
                'longitude': -117.1965
            },
            {
                'number': 7,
                'par': 5,
                'distance': 487,
                'latitude': 33.1320,
                'longitude': -117.1960
            },
            {
                'number': 8,
                'par': 4,
                'distance': 359,
                'latitude': 33.1325,
                'longitude': -117.1955
            },
            {
                'number': 9,
                'par': 4,
                'distance': 343,
                'latitude': 33.1330,
                'longitude': -117.1950
            },
            {
                'number': 10,
                'par': 4,
                'distance': 460,
                'latitude': 33.1335,
                'longitude': -117.1945
            },
            {
                'number': 11,
                'par': 3,
                'distance': 174,
                'latitude': 33.1340,
                'longitude': -117.1940
            },
            {
                'number': 12,
                'par': 5,
                'distance': 606,
                'latitude': 33.1345,
                'longitude': -117.1935
            },
            {
                'number': 13,
                'par': 3,
                'distance': 167,
                'latitude': 33.1350,
                'longitude': -117.1930
            },
            {
                'number': 14,
                'par': 4,
                'distance': 369,
                'latitude': 33.1355,
                'longitude': -117.1925
            },
            {
                'number': 15,
                'par': 5,
                'distance': 466,
                'latitude': 33.1360,
                'longitude': -117.1920
            },
            {
                'number': 16,
                'par': 4,
                'distance': 412,
                'latitude': 33.1365,
                'longitude': -117.1915
            },
            {
                'number': 17,
                'par': 3,
                'distance': 210,
                'latitude': 33.1370,
                'longitude': -117.1910
            },
            {
                'number': 18,
                'par': 5,
                'distance': 480,
                'latitude': 33.1375,
                'longitude': -117.1905
            }
        ],
        'pars': [4, 4, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 3, 4, 5, 4, 3, 5],
        'fees': 60,
        'latitude': 33.1290,
        'longitude': -117.1990,
        'distances': [310, 394, 208, 447, 343, 163, 487, 359, 343, 460, 174, 606, 167, 369, 466, 412, 210, 480],
        'totalDistance': 6398
    },
    {
        'name': 'The Crossings Golf Course',
        'address': '5800 The Crossings Drive, Carlsbad, CA 92008',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 423,
                'latitude': 33.1402,
                'longitude': -117.2785
            },
            {
                'number': 2,
                'par': 3,
                'distance': 171,
                'latitude': 33.1398,
                'longitude': -117.2780
            },
            {
                'number': 3,
                'par': 4,
                'distance': 389,
                'latitude': 33.1395,
                'longitude': -117.2770
            },
            {
                'number': 4,
                'par': 5,
                'distance': 552,
                'latitude': 33.1392,
                'longitude': -117.2762
            },
            {
                'number': 5,
                'par': 4,
                'distance': 432,
                'latitude': 33.1388,
                'longitude': -117.2753
            },
            {
                'number': 6,
                'par': 3,
                'distance': 198,
                'latitude': 33.1385,
                'longitude': -117.2744
            },
            {
                'number': 7,
                'par': 4,
                'distance': 389,
                'latitude': 33.1380,
                'longitude': -117.2736
            },
            {
                'number': 8,
                'par': 5,
                'distance': 514,
                'latitude': 33.1377,
                'longitude': -117.2727
            },
            {
                'number': 9,
                'par': 4,
                'distance': 436,
                'latitude': 33.1373,
                'longitude': -117.2718
            },
            {
                'number': 10,
                'par': 4,
                'distance': 421,
                'latitude': 33.1369,
                'longitude': -117.2710
            },
            {
                'number': 11,
                'par': 3,
                'distance': 191,
                'latitude': 33.1366,
                'longitude': -117.2701
            },
            {
                'number': 12,
                'par': 4,
                'distance': 390,
                'latitude': 33.1362,
                'longitude': -117.2693
            },
            {
                'number': 13,
                'par': 5,
                'distance': 544,
                'latitude': 33.1359,
                'longitude': -117.2684
            },
            {
                'number': 14,
                'par': 4,
                'distance': 420,
                'latitude': 33.1355,
                'longitude': -117.2676
            },
            {
                'number': 15,
                'par': 4,
                'distance': 405,
                'latitude': 33.1352,
                'longitude': -117.2667
            },
            {
                'number': 16,
                'par': 3,
                'distance': 180,
                'latitude': 33.1348,
                'longitude': -117.2658
            },
            {
                'number': 17,
                'par': 5,
                'distance': 553,
                'latitude': 33.1345,
                'longitude': -117.2649
            },
            {
                'number': 18,
                'par': 4,
                'distance': 422,
                'latitude': 33.1341,
                'longitude': -117.2641
            }
        ],
        'pars': [4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4],
        'fees': 75,
        'latitude': 33.1400,
        'longitude': -117.2780,
        'distances': [423, 171, 389, 552, 432, 198, 389, 514, 436, 421, 191, 390, 544, 420, 405, 180, 553, 422],
        'totalDistance': 7817
    },
    {
        'name': 'Aviara Golf Course',
        'address': '7447 Batiquitos Dr, Carlsbad, CA 92011',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 408,
                'latitude': 33.1002,
                'longitude': -117.2761
            },
            {
                'number': 2,
                'par': 4,
                'distance': 413,
                'latitude': 33.0998,
                'longitude': -117.2754
            },
            {
                'number': 3,
                'par': 3,
                'distance': 184,
                'latitude': 33.0994,
                'longitude': -117.2747
            },
            {
                'number': 4,
                'par': 4,
                'distance': 438,
                'latitude': 33.0989,
                'longitude': -117.2739
            },
            {
                'number': 5,
                'par': 5,
                'distance': 532,
                'latitude': 33.0985,
                'longitude': -117.2732
            },
            {
                'number': 6,
                'par': 4,
                'distance': 422,
                'latitude': 33.0981,
                'longitude': -117.2725
            },
            {
                'number': 7,
                'par': 3,
                'distance': 205,
                'latitude': 33.0977,
                'longitude': -117.2718
            },
            {
                'number': 8,
                'par': 4,
                'distance': 453,
                'latitude': 33.0973,
                'longitude': -117.2711
            },
            {
                'number': 9,
                'par': 5,
                'distance': 574,
                'latitude': 33.0969,
                'longitude': -117.2704
            },
            {
                'number': 10,
                'par': 4,
                'distance': 411,
                'latitude': 33.0965,
                'longitude': -117.2697
            },
            {
                'number': 11,
                'par': 3,
                'distance': 194,
                'latitude': 33.0961,
                'longitude': -117.2690
            },
            {
                'number': 12,
                'par': 4,
                'distance': 415,
                'latitude': 33.0957,
                'longitude': -117.2683
            },
            {
                'number': 13,
                'par': 5,
                'distance': 555,
                'latitude': 33.0953,
                'longitude': -117.2676
            },
            {
                'number': 14,
                'par': 4,
                'distance': 419,
                'latitude': 33.0949,
                'longitude': -117.2669
            },
            {
                'number': 15,
                'par': 4,
                'distance': 400,
                'latitude': 33.0945,
                'longitude': -117.2662
            },
            {
                'number': 16,
                'par': 3,
                'distance': 195,
                'latitude': 33.0941,
                'longitude': -117.2655
            },
            {
                'number': 17,
                'par': 5,
                'distance': 574,
                'latitude': 33.0937,
                'longitude': -117.2648
            },
            {
                'number': 18,
                'par': 4,
                'distance': 434,
                'latitude': 33.0933,
                'longitude': -117.2641
            }
        ],
        'pars': [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4],
        'fees': 100,
        'latitude': 33.1002,
        'longitude': -117.2761,
        'distances': [408, 413, 184, 438, 532, 422, 205, 453, 574, 411, 194, 415, 555, 419, 400, 195, 574, 434],
        'totalDistance': 7740
    },
    {
        'name': 'La Costa Golf Course',
        'address': '2100 Costa Del Mar Rd, Carlsbad, CA 92009',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 400,
                'latitude': 33.0931,
                'longitude': -117.2563
            },
            {
                'number': 2,
                'par': 5,
                'distance': 520,
                'latitude': 33.0935,
                'longitude': -117.2549
            },
            {
                'number': 3,
                'par': 3,
                'distance': 190,
                'latitude': 33.0938,
                'longitude': -117.2534
            },
            {
                'number': 4,
                'par': 4,
                'distance': 450,
                'latitude': 33.0942,
                'longitude': -117.2518
            },
            {
                'number': 5,
                'par': 4,
                'distance': 420,
                'latitude': 33.0945,
                'longitude': -117.2503
            },
            {
                'number': 6,
                'par': 5,
                'distance': 560,
                'latitude': 33.0948,
                'longitude': -117.2487
            },
            {
                'number': 7,
                'par': 3,
                'distance': 210,
                'latitude': 33.0951,
                'longitude': -117.2472
            },
            {
                'number': 8,
                'par': 4,
                'distance': 440,
                'latitude': 33.0954,
                'longitude': -117.2456
            },
            {
                'number': 9,
                'par': 4,
                'distance': 410,
                'latitude': 33.0957,
                'longitude': -117.2440
            },
            {
                'number': 10,
                'par': 4,
                'distance': 430,
                'latitude': 33.0960,
                'longitude': -117.2425
            },
            {
                'number': 11,
                'par': 3,
                'distance': 200,
                'latitude': 33.0963,
                'longitude': -117.2410
            },
            {
                'number': 12,
                'par': 5,
                'distance': 600,
                'latitude': 33.0966,
                'longitude': -117.2394
            },
            {
                'number': 13,
                'par': 4,
                'distance': 480,
                'latitude': 33.0969,
                'longitude': -117.2379
            },
            {
                'number': 14,
                'par': 4,
                'distance': 470,
                'latitude': 33.0972,
                'longitude': -117.2364
            },
            {
                'number': 15,
                'par': 3,
                'distance': 180,
                'latitude': 33.0975,
                'longitude': -117.2348
            },
            {
                'number': 16,
                'par': 4,
                'distance': 440,
                'latitude': 33.0978,
                'longitude': -117.2332
            },
            {
                'number': 17,
                'par': 5,
                'distance': 550,
                'latitude': 33.0981,
                'longitude': -117.2317
            },
            {
                'number': 18,
                'par': 4,
                'distance': 460,
                'latitude': 33.0984,
                'longitude': -117.2301
            }
        ],
        'pars': [4, 5, 3, 4, 4, 5, 3, 4, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4],
        'fees': 75,
        'latitude': 33.0930,
        'longitude': -117.2560,
        'distances': [400, 520, 190, 450, 420, 560, 210, 440, 410, 430, 200, 600, 480, 470, 180, 440, 550, 460],
        'totalDistance': 7800
    },
    {
        'name': 'Rancho Santa Fe Golf Club',
        'address': '5827 Via de la Cumbre, Rancho Santa Fe, CA 92067',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 400,
                'latitude': 33.0245,
                'longitude': -117.2165
            },
            {
                'number': 2,
                'par': 3,
                'distance': 180,
                'latitude': 33.0247,
                'longitude': -117.2163
            },
            {
                'number': 3,
                'par': 4,
                'distance': 420,
                'latitude': 33.0249,
                'longitude': -117.2161
            },
            {
                'number': 4,
                'par': 5,
                'distance': 550,
                'latitude': 33.0251,
                'longitude': -117.2159
            },
            {
                'number': 5,
                'par': 4,
                'distance': 430,
                'latitude': 33.0253,
                'longitude': -117.2157
            },
            {
                'number': 6,
                'par': 3,
                'distance': 200,
                'latitude': 33.0255,
                'longitude': -117.2155
            },
            {
                'number': 7,
                'par': 4,
                'distance': 460,
                'latitude': 33.0257,
                'longitude': -117.2153
            },
            {
                'number': 8,
                'par': 5,
                'distance': 600,
                'latitude': 33.0259,
                'longitude': -117.2151
            },
            {
                'number': 9,
                'par': 4,
                'distance': 410,
                'latitude': 33.0261,
                'longitude': -117.2149
            },
            {
                'number': 10,
                'par': 4,
                'distance': 420,
                'latitude': 33.0263,
                'longitude': -117.2147
            },
            {
                'number': 11,
                'par': 3,
                'distance': 190,
                'latitude': 33.0265,
                'longitude': -117.2145
            },
            {
                'number': 12,
                'par': 5,
                'distance': 550,
                'latitude': 33.0267,
                'longitude': -117.2143
            },
            {
                'number': 13,
                'par': 4,
                'distance': 430,
                'latitude': 33.0269,
                'longitude': -117.2141
            },
            {
                'number': 14,
                'par': 3,
                'distance': 200,
                'latitude': 33.0271,
                'longitude': -117.2139
            },
            {
                'number': 15,
                'par': 4,
                'distance': 460,
                'latitude': 33.0273,
                'longitude': -117.2137
            },
            {
                'number': 16,
                'par': 5,
                'distance': 600,
                'latitude': 33.0275,
                'longitude': -117.2135
            },
            {
                'number': 17,
                'par': 4,
                'distance': 420,
                'latitude': 33.0277,
                'longitude': -117.2133
            },
            {
                'number': 18,
                'par': 4,
                'distance': 400,
                'latitude': 33.0279,
                'longitude': -117.2131
            }
        ],
        'pars': [4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 3, 4, 5, 4, 4],
        'fees': 150,
        'latitude': 33.0245,
        'longitude': -117.2165,
        'distances': [400, 180, 420, 550, 430, 200, 460, 600, 410, 420, 190, 550, 430, 200, 460, 600, 420, 400],
        'totalDistance': 7600
    },
    {
        'name': 'Rancho Santa Fe Country Club Golf Course',
        'address': '5827 Via De La Cima, Rancho Santa Fe, CA 92091',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 395,
                'latitude': 33.0265,
                'longitude': -117.2051
            },
            {
                'number': 2,
                'par': 4,
                'distance': 425,
                'latitude': 33.0270,
                'longitude': -117.2037
            },
            {
                'number': 3,
                'par': 3,
                'distance': 180,
                'latitude': 33.0275,
                'longitude': -117.2023
            },
            {
                'number': 4,
                'par': 5,
                'distance': 520,
                'latitude': 33.0280,
                'longitude': -117.2010
            },
            {
                'number': 5,
                'par': 4,
                'distance': 440,
                'latitude': 33.0285,
                'longitude': -117.1997
            },
            {
                'number': 6,
                'par': 3,
                'distance': 215,
                'latitude': 33.0290,
                'longitude': -117.1983
            },
            {
                'number': 7,
                'par': 4,
                'distance': 405,
                'latitude': 33.0295,
                'longitude': -117.1970
            },
            {
                'number': 8,
                'par': 4,
                'distance': 480,
                'latitude': 33.0300,
                'longitude': -117.1956
            },
            {
                'number': 9,
                'par': 5,
                'distance': 550,
                'latitude': 33.0305,
                'longitude': -117.1942
            },
            {
                'number': 10,
                'par': 4,
                'distance': 430,
                'latitude': 33.0310,
                'longitude': -117.1930
            },
            {
                'number': 11,
                'par': 3,
                'distance': 190,
                'latitude': 33.0315,
                'longitude': -117.1917
            },
            {
                'number': 12,
                'par': 5,
                'distance': 560,
                'latitude': 33.0320,
                'longitude': -117.1903
            },
            {
                'number': 13,
                'par': 4,
                'distance': 440,
                'latitude': 33.0325,
                'longitude': -117.1890
            },
            {
                'number': 14,
                'par': 4,
                'distance': 420,
                'latitude': 33.0330,
                'longitude': -117.1877
            },
            {
                'number': 15,
                'par': 3,
                'distance': 200,
                'latitude': 33.0335,
                'longitude': -117.1863
            },
            {
                'number': 16,
                'par': 5,
                'distance': 600,
                'latitude': 33.0340,
                'longitude': -117.1850
            },
            {
                'number': 17,
                'par': 4,
                'distance': 450,
                'latitude': 33.0345,
                'longitude': -117.1837
            },
            {
                'number': 18,
                'par': 4,
                'distance': 430,
                'latitude': 33.0350,
                'longitude': -117.1823
            }
        ],
        'pars': [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 3, 5, 4, 4, 3, 5, 4, 4],
        'fees': 125,
        'latitude': 33.0270,
        'longitude': -117.1985,
        'distances': [395, 425, 180, 520, 440, 215, 405, 480, 550, 430, 190, 560, 440, 420, 200, 600, 450, 430],
        'totalDistance': 7905
    },
    {
        'name': 'Rancho Carlsbad Golf Course',
        'address': '5200 El Camino Real, Carlsbad, CA 92010',
        'holes': [
            {
                'number': 1,
                'par': 3,
                'distance': 151,
                'latitude': 33.1265,
                'longitude': -117.2900
            },
            {
                'number': 2,
                'par': 3,
                'distance': 107,
                'latitude': 33.1268,
                'longitude': -117.2895
            },
            {
                'number': 3,
                'par': 3,
                'distance': 145,
                'latitude': 33.1270,
                'longitude': -117.2890
            },
            {
                'number': 4,
                'par': 3,
                'distance': 125,
                'latitude': 33.1273,
                'longitude': -117.2885
            },
            {
                'number': 5,
                'par': 3,
                'distance': 80,
                'latitude': 33.1275,
                'longitude': -117.2880
            },
            {
                'number': 6,
                'par': 3,
                'distance': 92,
                'latitude': 33.1278,
                'longitude': -117.2875
            },
            {
                'number': 7,
                'par': 3,
                'distance': 120,
                'latitude': 33.1280,
                'longitude': -117.2870
            },
            {
                'number': 8,
                'par': 3,
                'distance': 130,
                'latitude': 33.1283,
                'longitude': -117.2865
            },
            {
                'number': 9,
                'par': 3,
                'distance': 85,
                'latitude': 33.1285,
                'longitude': -117.2860
            },
            {
                'number': 10,
                'par': 3,
                'distance': 151,
                'latitude': 33.1265,
                'longitude': -117.2900
            },
            {
                'number': 11,
                'par': 3,
                'distance': 107,
                'latitude': 33.1268,
                'longitude': -117.2895
            },
            {
                'number': 12,
                'par': 3,
                'distance': 145,
                'latitude': 33.1270,
                'longitude': -117.2890
            },
            {
                'number': 13,
                'par': 3,
                'distance': 125,
                'latitude': 33.1273,
                'longitude': -117.2885
            },
            {
                'number': 14,
                'par': 3,
                'distance': 80,
                'latitude': 33.1275,
                'longitude': -117.2880
            },
            {
                'number': 15,
                'par': 3,
                'distance': 92,
                'latitude': 33.1278,
                'longitude': -117.2875
            },
            {
                'number': 16,
                'par': 3,
                'distance': 120,
                'latitude': 33.1280,
                'longitude': -117.2870
            },
            {
                'number': 17,
                'par': 3,
                'distance': 130,
                'latitude': 33.1283,
                'longitude': -117.2865
            },
            {
                'number': 18,
                'par': 3,
                'distance': 85,
                'latitude': 33.1285,
                'longitude': -117.2860
            }
        ],
        'pars': [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        'fees': 26,
        'latitude': 33.1265,
        'longitude': -117.2900,
        'distances': [151, 107, 145, 125, 80, 92, 120, 130, 85, 151, 107, 145, 125, 80, 92, 120, 130, 85],
        'totalDistance': 2340
    },
    {
        'name': 'Goat Hill Park Golf Course',
        'address': '2323 Goat Hill Drive, Oceanside, CA 92054',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 290,
                'latitude': 33.1965,
                'longitude': -117.3140
            },
            {
                'number': 2,
                'par': 3,
                'distance': 182,
                'latitude': 33.1970,
                'longitude': -117.3135
            },
            {
                'number': 3,
                'par': 4,
                'distance': 289,
                'latitude': 33.1975,
                'longitude': -117.3130
            },
            {
                'number': 4,
                'par': 4,
                'distance': 328,
                'latitude': 33.1980,
                'longitude': -117.3125
            },
            {
                'number': 5,
                'par': 3,
                'distance': 145,
                'latitude': 33.1985,
                'longitude': -117.3120
            },
            {
                'number': 6,
                'par': 3,
                'distance': 179,
                'latitude': 33.1990,
                'longitude': -117.3115
            },
            {
                'number': 7,
                'par': 3,
                'distance': 162,
                'latitude': 33.1995,
                'longitude': -117.3110
            },
            {
                'number': 8,
                'par': 4,
                'distance': 328,
                'latitude': 33.2000,
                'longitude': -117.3105
            },
            {
                'number': 9,
                'par': 3,
                'distance': 135,
                'latitude': 33.2005,
                'longitude': -117.3100
            },
            {
                'number': 10,
                'par': 4,
                'distance': 305,
                'latitude': 33.2010,
                'longitude': -117.3095
            },
            {
                'number': 11,
                'par': 3,
                'distance': 175,
                'latitude': 33.2015,
                'longitude': -117.3090
            },
            {
                'number': 12,
                'par': 4,
                'distance': 329,
                'latitude': 33.2020,
                'longitude': -117.3085
            },
            {
                'number': 13,
                'par': 3,
                'distance': 175,
                'latitude': 33.2025,
                'longitude': -117.3080
            },
            {
                'number': 14,
                'par': 4,
                'distance': 285,
                'latitude': 33.2030,
                'longitude': -117.3075
            },
            {
                'number': 15,
                'par': 5,
                'distance': 451,
                'latitude': 33.2035,
                'longitude': -117.3070
            },
            {
                'number': 16,
                'par': 4,
                'distance': 346,
                'latitude': 33.2040,
                'longitude': -117.3065
            },
            {
                'number': 17,
                'par': 3,
                'distance': 178,
                'latitude': 33.2045,
                'longitude': -117.3060
            },
            {
                'number': 18,
                'par': 4,
                'distance': 300,
                'latitude': 33.2050,
                'longitude': -117.3055
            }
        ],
        'pars': [4, 3, 4, 4, 3, 3, 3, 4, 3, 4, 3, 4, 3, 4, 5, 4, 3, 4],
        'fees': 40,
        'latitude': 33.1965,
        'longitude': -117.3140,
        'distances': [290, 182, 289, 328, 145, 179, 162, 328, 135, 305, 175, 329, 175, 285, 451, 346, 178, 300],
        'totalDistance': 6000
    },
    {
        'name': 'Oceanside Municipal Golf Course',
        'address': '825 Douglas Drive, Oceanside, CA 92058',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 367,
                'latitude': 33.2015,
                'longitude': -117.3580
            },
            {
                'number': 2,
                'par': 4,
                'distance': 352,
                'latitude': 33.2020,
                'longitude': -117.3575
            },
            {
                'number': 3,
                'par': 3,
                'distance': 182,
                'latitude': 33.2025,
                'longitude': -117.3570
            },
            {
                'number': 4,
                'par': 5,
                'distance': 535,
                'latitude': 33.2030,
                'longitude': -117.3565
            },
            {
                'number': 5,
                'par': 3,
                'distance': 204,
                'latitude': 33.2035,
                'longitude': -117.3560
            },
            {
                'number': 6,
                'par': 4,
                'distance': 360,
                'latitude': 33.2040,
                'longitude': -117.3555
            },
            {
                'number': 7,
                'par': 4,
                'distance': 403,
                'latitude': 33.2045,
                'longitude': -117.3550
            },
            {
                'number': 8,
                'par': 5,
                'distance': 485,
                'latitude': 33.2050,
                'longitude': -117.3545
            },
            {
                'number': 9,
                'par': 4,
                'distance': 350,
                'latitude': 33.2055,
                'longitude': -117.3540
            },
            {
                'number': 10,
                'par': 4,
                'distance': 363,
                'latitude': 33.2060,
                'longitude': -117.3535
            },
            {
                'number': 11,
                'par': 3,
                'distance': 160,
                'latitude': 33.2065,
                'longitude': -117.3530
            },
            {
                'number': 12,
                'par': 4,
                'distance': 306,
                'latitude': 33.2070,
                'longitude': -117.3525
            },
            {
                'number': 13,
                'par': 3,
                'distance': 132,
                'latitude': 33.2075,
                'longitude': -117.3520
            },
            {
                'number': 14,
                'par': 5,
                'distance': 499,
                'latitude': 33.2080,
                'longitude': -117.3515
            },
            {
                'number': 15,
                'par': 4,
                'distance': 457,
                'latitude': 33.2085,
                'longitude': -117.3510
            },
            {
                'number': 16,
                'par': 4,
                'distance': 434,
                'latitude': 33.2090,
                'longitude': -117.3505
            },
            {
                'number': 17,
                'par': 5,
                'distance': 508,
                'latitude': 33.2095,
                'longitude': -117.3500
            },
            {
                'number': 18,
                'par': 4,
                'distance': 383,
                'latitude': 33.2100,
                'longitude': -117.3495
            }
        ],
        'pars': [4, 4, 3, 5, 3, 4, 4, 5, 4, 4, 3, 4, 3, 5, 4, 4, 5, 4],
        'fees': 50,
        'latitude': 33.2015,
        'longitude': -117.3580,
        'distances': [367, 352, 182, 535, 204, 360, 403, 485, 350, 363, 160, 306, 132, 499, 457, 434, 508, 383],
        'totalDistance': 6480
    },
    {
        'name': 'Twin Oaks Golf Course',
        'address': '1425 N. Twin Oaks Valley Road, San Marcos, CA 92069',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 375,
                'latitude': 33.1290,
                'longitude': -117.1710
            },
            {
                'number': 2,
                'par': 4,
                'distance': 422,
                'latitude': 33.1295,
                'longitude': -117.1705
            },
            {
                'number': 3,
                'par': 3,
                'distance': 151,
                'latitude': 33.1300,
                'longitude': -117.1700
            },
            {
                'number': 4,
                'par': 4,
                'distance': 406,
                'latitude': 33.1305,
                'longitude': -117.1695
            },
            {
                'number': 5,
                'par': 5,
                'distance': 516,
                'latitude': 33.1310,
                'longitude': -117.1690
            },
            {
                'number': 6,
                'par': 4,
                'distance': 390,
                'latitude': 33.1315,
                'longitude': -117.1685
            },
            {
                'number': 7,
                'par': 3,
                'distance': 170,
                'latitude': 33.1320,
                'longitude': -117.1680
            },
            {
                'number': 8,
                'par': 4,
                'distance': 379,
                'latitude': 33.1325,
                'longitude': -117.1675
            },
            {
                'number': 9,
                'par': 4,
                'distance': 387,
                'latitude': 33.1330,
                'longitude': -117.1670
            },
            {
                'number': 10,
                'par': 3,
                'distance': 216,
                'latitude': 33.1335,
                'longitude': -117.1665
            },
            {
                'number': 11,
                'par': 4,
                'distance': 425,
                'latitude': 33.1340,
                'longitude': -117.1660
            },
            {
                'number': 12,
                'par': 4,
                'distance': 405,
                'latitude': 33.1345,
                'longitude': -117.1655
            },
            {
                'number': 13,
                'par': 4,
                'distance': 307,
                'latitude': 33.1350,
                'longitude': -117.1650
            },
            {
                'number': 14,
                'par': 4,
                'distance': 308,
                'latitude': 33.1355,
                'longitude': -117.1645
            },
            {
                'number': 15,
                'par': 4,
                'distance': 407,
                'latitude': 33.1360,
                'longitude': -117.1640
            },
            {
                'number': 16,
                'par': 5,
                'distance': 575,
                'latitude': 33.1365,
                'longitude': -117.1635
            },
            {
                'number': 17,
                'par': 3,
                'distance': 150,
                'latitude': 33.1370,
                'longitude': -117.1630
            },
            {
                'number': 18,
                'par': 4,
                'distance': 403,
                'latitude': 33.1375,
                'longitude': -117.1625
            }
        ],
        'pars': [4, 4, 3, 4, 5, 4, 3, 4, 4, 3, 4, 4, 4, 4, 4, 5, 3, 4],
        'fees': 50,
        'latitude': 33.1290,
        'longitude': -117.1710,
        'distances': [375, 422, 151, 406, 516, 390, 170, 379, 387, 216, 425, 405, 307, 308, 407, 575, 150, 403],
        'totalDistance': 6535
    },
    {
        'name': 'Emerald Isle Golf Course',
        'address': '660 S. El Camino Real, Oceanside, CA 92057',
        'holes': [
            {
                'number': 1,
                'par': 3,
                'distance': 163,
                'latitude': 33.1915,
                'longitude': -117.3580
            },
            {
                'number': 2,
                'par': 4,
                'distance': 193,
                'latitude': 33.1918,
                'longitude': -117.3575
            },
            {
                'number': 3,
                'par': 3,
                'distance': 152,
                'latitude': 33.1921,
                'longitude': -117.3570
            },
            {
                'number': 4,
                'par': 3,
                'distance': 122,
                'latitude': 33.1924,
                'longitude': -117.3565
            },
            {
                'number': 5,
                'par': 3,
                'distance': 147,
                'latitude': 33.1927,
                'longitude': -117.3560
            },
            {
                'number': 6,
                'par': 3,
                'distance': 137,
                'latitude': 33.1930,
                'longitude': -117.3555
            },
            {
                'number': 7,
                'par': 4,
                'distance': 238,
                'latitude': 33.1933,
                'longitude': -117.3550
            },
            {
                'number': 8,
                'par': 3,
                'distance': 106,
                'latitude': 33.1936,
                'longitude': -117.3545
            },
            {
                'number': 9,
                'par': 3,
                'distance': 127,
                'latitude': 33.1939,
                'longitude': -117.3540
            },
            {
                'number': 10,
                'par': 3,
                'distance': 135,
                'latitude': 33.1942,
                'longitude': -117.3535
            },
            {
                'number': 11,
                'par': 3,
                'distance': 86,
                'latitude': 33.1945,
                'longitude': -117.3530
            },
            {
                'number': 12,
                'par': 3,
                'distance': 132,
                'latitude': 33.1948,
                'longitude': -117.3525
            },
            {
                'number': 13,
                'par': 3,
                'distance': 102,
                'latitude': 33.1951,
                'longitude': -117.3520
            },
            {
                'number': 14,
                'par': 3,
                'distance': 134,
                'latitude': 33.1954,
                'longitude': -117.3515
            },
            {
                'number': 15,
                'par': 3,
                'distance': 159,
                'latitude': 33.1957,
                'longitude': -117.3510
            },
            {
                'number': 16,
                'par': 4,
                'distance': 120,
                'latitude': 33.1960,
                'longitude': -117.3505
            },
            {
                'number': 17,
                'par': 3,
                'distance': 89,
                'latitude': 33.1963,
                'longitude': -117.3500
            },
            {
                'number': 18,
                'par': 3,
                'distance': 94,
                'latitude': 33.1966,
                'longitude': -117.3495
            }
        ],
        'pars': [3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3],
        'fees': 25,
        'latitude': 33.1915,
        'longitude': -117.3580,
        'distances': [163, 193, 152, 122, 147, 137, 238, 106, 127, 135, 86, 132, 102, 134, 159, 120, 89, 94],
        'totalDistance': 2452
    },
    {
        'name': 'Shadowridge Golf Course',
        'address': '1980 Gateway Dr, Vista, CA 92081',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 409,
                'latitude': 33.1480,
                'longitude': -117.2154
            },
            {
                'number': 2,
                'par': 3,
                'distance': 181,
                'latitude': 33.1477,
                'longitude': -117.2140
            },
            {
                'number': 3,
                'par': 4,
                'distance': 417,
                'latitude': 33.1474,
                'longitude': -117.2125
            },
            {
                'number': 4,
                'par': 5,
                'distance': 554,
                'latitude': 33.1470,
                'longitude': -117.2110
            },
            {
                'number': 5,
                'par': 4,
                'distance': 413,
                'latitude': 33.1466,
                'longitude': -117.2095
            },
            {
                'number': 6,
                'par': 3,
                'distance': 180,
                'latitude': 33.1463,
                'longitude': -117.2080
            },
            {
                'number': 7,
                'par': 4,
                'distance': 447,
                'latitude': 33.1459,
                'longitude': -117.2065
            },
            {
                'number': 8,
                'par': 5,
                'distance': 556,
                'latitude': 33.1455,
                'longitude': -117.2050
            },
            {
                'number': 9,
                'par': 4,
                'distance': 409,
                'latitude': 33.1452,
                'longitude': -117.2035
            },
            {
                'number': 10,
                'par': 4,
                'distance': 420,
                'latitude': 33.1449,
                'longitude': -117.2020
            },
            {
                'number': 11,
                'par': 3,
                'distance': 178,
                'latitude': 33.1446,
                'longitude': -117.2005
            },
            {
                'number': 12,
                'par': 4,
                'distance': 418,
                'latitude': 33.1442,
                'longitude': -117.1990
            },
            {
                'number': 13,
                'par': 5,
                'distance': 543,
                'latitude': 33.1439,
                'longitude': -117.1975
            },
            {
                'number': 14,
                'par': 4,
                'distance': 411,
                'latitude': 33.1436,
                'longitude': -117.1960
            },
            {
                'number': 15,
                'par': 4,
                'distance': 425,
                'latitude': 33.1432,
                'longitude': -117.1945
            },
            {
                'number': 16,
                'par': 3,
                'distance': 190,
                'latitude': 33.1429,
                'longitude': -117.1930
            },
            {
                'number': 17,
                'par': 5,
                'distance': 550,
                'latitude': 33.1426,
                'longitude': -117.1915
            },
            {
                'number': 18,
                'par': 4,
                'distance': 410,
                'latitude': 33.1423,
                'longitude': -117.1900
            }
        ],
        'pars': [4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4],
        'fees': 50,
        'latitude': 33.1450,
        'longitude': -117.2095,
        'distances': [409, 181, 417, 554, 413, 180, 447, 556, 409, 420, 178, 418, 543, 411, 425, 190, 550, 410],
        'totalDistance': 7707
    },
    {
        'name': 'Arrowood Golf Course',
        'address': '5201A Village Dr, Oceanside, CA 92057',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 416,
                'latitude': 33.2215,
                'longitude': -117.3140
            },
            {
                'number': 2,
                'par': 5,
                'distance': 622,
                'latitude': 33.2210,
                'longitude': -117.3125
            },
            {
                'number': 3,
                'par': 3,
                'distance': 186,
                'latitude': 33.2205,
                'longitude': -117.3110
            },
            {
                'number': 4,
                'par': 4,
                'distance': 413,
                'latitude': 33.2200,
                'longitude': -117.3095
            },
            {
                'number': 5,
                'par': 4,
                'distance': 361,
                'latitude': 33.2195,
                'longitude': -117.3080
            },
            {
                'number': 6,
                'par': 4,
                'distance': 282,
                'latitude': 33.2190,
                'longitude': -117.3065
            },
            {
                'number': 7,
                'par': 4,
                'distance': 367,
                'latitude': 33.2185,
                'longitude': -117.3050
            },
            {
                'number': 8,
                'par': 3,
                'distance': 193,
                'latitude': 33.2180,
                'longitude': -117.3035
            },
            {
                'number': 9,
                'par': 5,
                'distance': 539,
                'latitude': 33.2175,
                'longitude': -117.3020
            },
            {
                'number': 10,
                'par': 4,
                'distance': 389,
                'latitude': 33.2170,
                'longitude': -117.3005
            },
            {
                'number': 11,
                'par': 3,
                'distance': 183,
                'latitude': 33.2165,
                'longitude': -117.2990
            },
            {
                'number': 12,
                'par': 4,
                'distance': 417,
                'latitude': 33.2160,
                'longitude': -117.2975
            },
            {
                'number': 13,
                'par': 5,
                'distance': 532,
                'latitude': 33.2155,
                'longitude': -117.2960
            },
            {
                'number': 14,
                'par': 4,
                'distance': 373,
                'latitude': 33.2150,
                'longitude': -117.2945
            },
            {
                'number': 15,
                'par': 3,
                'distance': 187,
                'latitude': 33.2145,
                'longitude': -117.2930
            },
            {
                'number': 16,
                'par': 4,
                'distance': 465,
                'latitude': 33.2140,
                'longitude': -117.2915
            },
            {
                'number': 17,
                'par': 4,
                'distance': 401,
                'latitude': 33.2135,
                'longitude': -117.2900
            },
            {
                'number': 18,
                'par': 4,
                'distance': 395,
                'latitude': 33.2130,
                'longitude': -117.2885
            }
        ],
        'pars': [4, 5, 3, 4, 4, 4, 4, 3, 5, 4, 3, 4, 5, 4, 3, 4, 4, 4],
        'fees': 50,
        'latitude': 33.2215,
        'longitude': -117.3140,
        'distances': [416, 622, 186, 413, 361, 282, 367, 193, 539, 389, 183, 417, 532, 373, 187, 465, 401, 395],
        'totalDistance': 6721
    },
    {
        'name': 'Torrey Pines Golf Course',
        'address': '11480 N Torrey Pines Rd, La Jolla, CA 92037',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 450,
                'latitude': 32.9054,
                'longitude': -117.2431
            },
            {
                'number': 2,
                'par': 4,
                'distance': 389,
                'latitude': 32.9051,
                'longitude': -117.2422
            },
            {
                'number': 3,
                'par': 3,
                'distance': 198,
                'latitude': 32.9049,
                'longitude': -117.2413
            },
            {
                'number': 4,
                'par': 4,
                'distance': 488,
                'latitude': 32.9047,
                'longitude': -117.2404
            },
            {
                'number': 5,
                'par': 4,
                'distance': 454,
                'latitude': 32.9045,
                'longitude': -117.2395
            },
            {
                'number': 6,
                'par': 5,
                'distance': 560,
                'latitude': 32.9043,
                'longitude': -117.2386
            },
            {
                'number': 7,
                'par': 4,
                'distance': 462,
                'latitude': 32.9041,
                'longitude': -117.2377
            },
            {
                'number': 8,
                'par': 3,
                'distance': 176,
                'latitude': 32.9039,
                'longitude': -117.2368
            },
            {
                'number': 9,
                'par': 5,
                'distance': 614,
                'latitude': 32.9037,
                'longitude': -117.2359
            },
            {
                'number': 10,
                'par': 4,
                'distance': 416,
                'latitude': 32.9035,
                'longitude': -117.2349
            },
            {
                'number': 11,
                'par': 3,
                'distance': 221,
                'latitude': 32.9033,
                'longitude': -117.2339
            },
            {
                'number': 12,
                'par': 4,
                'distance': 504,
                'latitude': 32.9031,
                'longitude': -117.2329
            },
            {
                'number': 13,
                'par': 5,
                'distance': 621,
                'latitude': 32.9029,
                'longitude': -117.2319
            },
            {
                'number': 14,
                'par': 4,
                'distance': 437,
                'latitude': 32.9027,
                'longitude': -117.2309
            },
            {
                'number': 15,
                'par': 4,
                'distance': 478,
                'latitude': 32.9025,
                'longitude': -117.2299
            },
            {
                'number': 16,
                'par': 3,
                'distance': 227,
                'latitude': 32.9023,
                'longitude': -117.2289
            },
            {
                'number': 17,
                'par': 4,
                'distance': 442,
                'latitude': 32.9021,
                'longitude': -117.2279
            },
            {
                'number': 18,
                'par': 5,
                'distance': 570,
                'latitude': 32.9019,
                'longitude': -117.2269
            }
        ],
        'pars': [4, 4, 3, 4, 4, 5, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5],
        'fees': 63,
        'latitude': 32.9049,
        'longitude': -117.2425,
        'distances': [450, 389, 198, 488, 454, 560, 462, 176, 614, 416, 221, 504, 621, 437, 478, 227, 442, 570],
        'totalDistance': 7807
    },
    {
        'name': 'El Camino Country Club Golf Course',
        'address': '3202 Vista Way, Oceanside, CA 92056',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 385,
                'latitude': 33.1458,
                'longitude': -117.3022
            },
            {
                'number': 2,
                'par': 3,
                'distance': 190,
                'latitude': 33.1463,
                'longitude': -117.3007
            },
            {
                'number': 3,
                'par': 4,
                'distance': 420,
                'latitude': 33.1468,
                'longitude': -117.2992
            },
            {
                'number': 4,
                'par': 5,
                'distance': 530,
                'latitude': 33.1473,
                'longitude': -117.2977
            },
            {
                'number': 5,
                'par': 4,
                'distance': 415,
                'latitude': 33.1478,
                'longitude': -117.2962
            },
            {
                'number': 6,
                'par': 3,
                'distance': 180,
                'latitude': 33.1483,
                'longitude': -117.2947
            },
            {
                'number': 7,
                'par': 4,
                'distance': 460,
                'latitude': 33.1488,
                'longitude': -117.2932
            },
            {
                'number': 8,
                'par': 5,
                'distance': 540,
                'latitude': 33.1493,
                'longitude': -117.2917
            },
            {
                'number': 9,
                'par': 4,
                'distance': 400,
                'latitude': 33.1498,
                'longitude': -117.2902
            }
        ],
        'pars': [4, 3, 4, 5, 4, 3, 4, 5, 4],
        'fees': 75,
        'latitude': 33.1458,
        'longitude': -117.3022,
        'distances': [385, 190, 420, 530, 415, 180, 460, 540, 400],
        'totalDistance': 4125
    },
    {
        'name': 'The Farms Golf Club',
        'address': '9500 Farms Rd, Rancho Santa Fe, CA 92067',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 420,
                'latitude': 33.0190,
                'longitude': -117.2245
            },
            {
                'number': 2,
                'par': 5,
                'distance': 550,
                'latitude': 33.0185,
                'longitude': -117.2230
            },
            {
                'number': 3,
                'par': 3,
                'distance': 190,
                'latitude': 33.0180,
                'longitude': -117.2215
            },
            {
                'number': 4,
                'par': 4,
                'distance': 440,
                'latitude': 33.0175,
                'longitude': -117.2200
            },
            {
                'number': 5,
                'par': 4,
                'distance': 430,
                'latitude': 33.0170,
                'longitude': -117.2185
            },
            {
                'number': 6,
                'par': 5,
                'distance': 570,
                'latitude': 33.0165,
                'longitude': -117.2170
            },
            {
                'number': 7,
                'par': 4,
                'distance': 460,
                'latitude': 33.0160,
                'longitude': -117.2155
            },
            {
                'number': 8,
                'par': 3,
                'distance': 180,
                'latitude': 33.0155,
                'longitude': -117.2140
            },
            {
                'number': 9,
                'par': 5,
                'distance': 610,
                'latitude': 33.0150,
                'longitude': -117.2125
            },
            {
                'number': 10,
                'par': 4,
                'distance': 440,
                'latitude': 33.0145,
                'longitude': -117.2110
            },
            {
                'number': 11,
                'par': 3,
                'distance': 200,
                'latitude': 33.0140,
                'longitude': -117.2095
            },
            {
                'number': 12,
                'par': 4,
                'distance': 450,
                'latitude': 33.0135,
                'longitude': -117.2080
            },
            {
                'number': 13,
                'par': 5,
                'distance': 600,
                'latitude': 33.0130,
                'longitude': -117.2065
            },
            {
                'number': 14,
                'par': 4,
                'distance': 430,
                'latitude': 33.0125,
                'longitude': -117.2050
            },
            {
                'number': 15,
                'par': 4,
                'distance': 450,
                'latitude': 33.0120,
                'longitude': -117.2035
            },
            {
                'number': 16,
                'par': 3,
                'distance': 170,
                'latitude': 33.0115,
                'longitude': -117.2020
            },
            {
                'number': 17,
                'par': 4,
                'distance': 460,
                'latitude': 33.0110,
                'longitude': -117.2005
            },
            {
                'number': 18,
                'par': 5,
                'distance': 620,
                'latitude': 33.0105,
                'longitude': -117.1990
            }
        ],
        'pars': [4, 5, 3, 4, 4, 5, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5],
        'fees': 250,
        'latitude': 33.0190,
        'longitude': -117.2245,
        'distances': [420, 550, 190, 440, 430, 570, 460, 180, 610, 440, 200, 450, 600, 430, 450, 170, 460, 620],
        'totalDistance': 8120
    },
    {
        'name': 'The Bridges at Rancho Santa Fe Golf Course',
        'address': ' Rancho Santa Fe, CA 92091',
        'holes': [
            {
                'number': 1,
                'par': 4,
                'distance': 460,
                'latitude': 33.0321,
                'longitude': -117.2025
            },
            {
                'number': 2,
                'par': 4,
                'distance': 418,
                'latitude': 33.0330,
                'longitude': -117.2010
            },
            {
                'number': 3,
                'par': 3,
                'distance': 180,
                'latitude': 33.0338,
                'longitude': -117.1995
            },
            {
                'number': 4,
                'par': 5,
                'distance': 540,
                'latitude': 33.0346,
                'longitude': -117.1980
            },
            {
                'number': 5,
                'par': 4,
                'distance': 425,
                'latitude': 33.0354,
                'longitude': -117.1965
            },
            {
                'number': 6,
                'par': 3,
                'distance': 210,
                'latitude': 33.0362,
                'longitude': -117.1950
            },
            {
                'number': 7,
                'par': 4,
                'distance': 440,
                'latitude': 33.0370,
                'longitude': -117.1935
            },
            {
                'number': 8,
                'par': 5,
                'distance': 580,
                'latitude': 33.0378,
                'longitude': -117.1920
            },
            {
                'number': 9,
                'par': 4,
                'distance': 390,
                'latitude': 33.0386,
                'longitude': -117.1905
            },
            {
                'number': 10,
                'par': 4,
                'distance': 430,
                'latitude': 33.0394,
                'longitude': -117.1890
            },
            {
                'number': 11,
                'par': 5,
                'distance': 550,
                'latitude': 33.0402,
                'longitude': -117.1875
            },
            {
                'number': 12,
                'par': 3,
                'distance': 190,
                'latitude': 33.0410,
                'longitude': -117.1860
            },
            {
                'number': 13,
                'par': 4,
                'distance': 420,
                'latitude': 33.0418,
                'longitude': -117.1845
            },
            {
                'number': 14,
                'par': 4,
                'distance': 460,
                'latitude': 33.0426,
                'longitude': -117.1830
            },
            {
                'number': 15,
                'par': 5,
                'distance': 550,
                'latitude': 33.0434,
                'longitude': -117.1815
            },
            {
                'number': 16,
                'par': 3,
                'distance': 210,
                'latitude': 33.0442,
                'longitude': -117.1800
            },
            {
                'number': 17,
                'par': 4,
                'distance': 430,
                'latitude': 33.0450,
                'longitude': -117.1785
            },
            {
                'number': 18,
                'par': 5,
                'distance': 570,
                'latitude': 33.0458,
                'longitude': -117.1770
            }
        ],
        'pars': [4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 5, 3, 4, 4, 5, 3, 4, 5],
        'fees': 150,
        'latitude': 33.0366,
        'longitude': -117.1900,
        'distances': [460, 418, 180, 540, 425, 210, 440, 580, 390, 430, 550, 190, 420, 460, 550, 210, 430, 570],
        'totalDistance': 7983
    }
];

/*
const courseData = [
        {
            'name': 'Torrey Pines Golf Course - South Course',
            'address': '11480 N Torrey Pines Rd, La Jolla, CA 92037',
            'holes': [
                { 'hole': 1, 'par': 4 },
                { 'hole': 2, 'par': 4 },
                { 'hole': 3, 'par': 3 },
                { 'hole': 4, 'par': 4 },
                { 'hole': 5, 'par': 4 },
                { 'hole': 6, 'par': 5 },
                { 'hole': 7, 'par': 3 },
                { 'hole': 8, 'par': 4 },
                { 'hole': 9, 'par': 5 },
                { 'hole': 10, 'par': 4 },
                { 'hole': 11, 'par': 3 },
                { 'hole': 12, 'par': 4 },
                { 'hole': 13, 'par': 5 },
                { 'hole': 14, 'par': 4 },
                { 'hole': 15, 'par': 4 },
                { 'hole': 16, 'par': 3 },
                { 'hole': 17, 'par': 4 },
                { 'hole': 18, 'par': 5 }
            ]
        },
        {
            'name': 'Balboa Park Golf Course - 18 Hole Course',
            'address': '2600 Golf Course Dr, San Diego, CA 92102',
            'holes': [
                { 'hole': 1, 'par': 4 },
                { 'hole': 2, 'par': 3 },
                { 'hole': 3, 'par': 5 },
                { 'hole': 4, 'par': 4 },
                { 'hole': 5, 'par': 4 },
                { 'hole': 6, 'par': 4 },
                { 'hole': 7, 'par': 3 },
                { 'hole': 8, 'par': 4 },
                { 'hole': 9, 'par': 5 },
                { 'hole': 10, 'par': 4 },
                { 'hole': 11, 'par': 4 },
                { 'hole': 12, 'par': 3 },
                { 'hole': 13, 'par': 4 },
                { 'hole': 14, 'par': 4 },
                { 'hole': 15, 'par': 3 },
                { 'hole': 16, 'par': 4 },
                { 'hole': 17, 'par': 4 },
                { 'hole': 18, 'par': 5 }
            ]
        },
        {
            'name': 'Mission Bay Golf Course',
            'address': '2702 N Mission Bay Dr, San Diego, CA 92109',
            'holes': [
                { 'hole': 1, 'par': 3 },
                { 'hole': 2, 'par': 4 },
                { 'hole': 3, 'par': 4 },
                { 'hole': 4, 'par': 3 },
                { 'hole': 5, 'par': 4 },
                { 'hole': 6, 'par': 4 },
                { 'hole': 7, 'par': 3 },
                { 'hole': 8, 'par': 4 },
                { 'hole': 9, 'par': 3 }
            ]
        }
    ]; 
    */

export default courseData