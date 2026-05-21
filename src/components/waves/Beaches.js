// lib/beaches.js
// NDBC buoy stations used for wave data:
//   46025 — Santa Monica Basin (34.0°N, -119.0°W) — primary offshore buoy for LA/OC/HB
//   46086 — San Clemente Basin (33.0°N, -118.1°W) — primary offshore buoy for NCSD
//   46274 — Point Loma South  (32.7°N, -117.4°W) — closer to southern SD beaches
// NOAA tide stations used for forecast water levels:
//   9410660 — Los Angeles / Long Beach area
//   9410230 — La Jolla
//   9410170 — San Diego
export const BEACHES = [
    // Orange County
    { id: "hb-pier",                     name: "HB Pier",                     lat: 33.6559, lon: -118.0039, buoyId: "46025", wind: ["E", "NE"], tide: ["low", "medium"] },

    // North County San Diego (north -> south)
    //{ id: "san-onofre-state-beach", name: "San Onofre State Beach", lat: 33.3812, lon: -117.5718, buoyId: "46086" },
    //{ id: "trails", name: "Trails", lat: 33.3577, lon: -117.5442, buoyId: "46086" },
    { id: "lowers",                      name: "Lower Trestles",              lat: 33.3828, lon: -117.5882, buoyId: "46086", wind: ["E", "NE"], tide: ["medium"] },
    { id: "turtles",                    name: "Turtles",                    lat: 33.3349, lon: -117.5143, buoyId: "46086", wind: ["E", "NE"], tide: ["low", "medium"] },
    //{ id: "oceanside-harbor-north-jetty", name: "Oceanside Harbor North Jetty", lat: 33.2237, lon: -117.4074, buoyId: "46086" },
    { id: "oceanside-harbor-south-jetty", name: "Oceanside Harbor South Jetty", lat: 33.2179, lon: -117.4018, buoyId: "46086", wind: ["E", "NE"], tide: ["medium", "high"] },
    { id: "oceanside-pier-north",         name: "Oceanside Pier North",         lat: 33.1951, lon: -117.3888, buoyId: "46086", wind: ["E", "NE"], tide: ["low", "medium"] },
    { id: "oceanside-pier-south",         name: "Oceanside Pier South",         lat: 33.1926, lon: -117.3873, buoyId: "46086", wind: ["E", "NE"], tide: ["medium", "high"] },
    //{ id: "tyson-street", name: "Tyson Street", lat: 33.1903, lon: -117.3861, buoyId: "46086" },
    //{ id: "wisconsin-street", name: "Wisconsin Street", lat: 33.1862, lon: -117.3834, buoyId: "46086" },
    //{ id: "cassidy-street", name: "Cassidy Street", lat: 33.1766, lon: -117.3777, buoyId: "46086" },
    //{ id: "terramar", name: "Terra Mar", lat: 33.1578, lon: -117.3537, buoyId: "46086" },
    //{ id: "warm-waters", name: "Warm Waters", lat: 33.1539, lon: -117.3502, buoyId: "46086" },
    //{ id: "tamarack", name: "Tamarack", lat: 33.1447, lon: -117.3436, buoyId: "46086" },
    //{ id: "grandview", name: "Grandview", lat: 33.0745, lon: -117.3119, buoyId: "46086" },
    { id: "ponto-jetties",               name: "Ponto Jetties",               lat: 33.0884, lon: -117.3149, buoyId: "46086", wind: ["E", "NE"], tide: ["low", "medium"] },
    //{ id: "south-ponto", name: "South Ponto", lat: 33.0812, lon: -117.3134, buoyId: "46086" },
    //{ id: "beacons", name: "Beacons", lat: 33.0584, lon: -117.3042, buoyId: "46086" },
    //{ id: "leucadia", name: "Leucadia", lat: 33.0648, lon: -117.3084, buoyId: "46086" },
    //{ id: "moonlight", name: "Moonlight", lat: 33.0487, lon: -117.2973, buoyId: "46086" },
    { id: "d-street",                     name: "D Street",                     lat: 33.0453, lon: -117.2948, buoyId: "46086", wind: ["E", "NE"], tide: ["low", "medium"] },
    { id: "swamis",                       name: "Swami's",                      lat: 33.0370, lon: -117.2920, buoyId: "46086", wind: ["E"], tide: ["low", "medium"] },
    { id: "pipes",                        name: "Pipes",                        lat: 33.0249, lon: -117.2825, buoyId: "46086", wind: ["E", "NE"], tide: ["low", "medium"] },
    { id: "cardiff-reef",                 name: "Cardiff Reef",                 lat: 33.0208, lon: -117.2799, buoyId: "46086", wind: ["E"], tide: ["low", "medium"] },
    { id: "seaside-reef",                 name: "Seaside Reef",                 lat: 33.0176, lon: -117.2785, buoyId: "46086", wind: ["E"], tide: ["low", "medium"] },
    //{ id: "tabletops", name: "Tabletops", lat: 33.0148, lon: -117.2767, buoyId: "46086" },
    { id: "del-mar-15th-street",          name: "Del Mar 15th Street",          lat: 32.9658, lon: -117.2677, buoyId: "46274", wind: ["E"], tide: ["medium"] },
    //{ id: "del-mar-11th-street", name: "Del Mar 11th Street", lat: 32.9578, lon: -117.2657, buoyId: "46274" },
    //{ id: "rivermouth", name: "Rivermouth", lat: 32.9515, lon: -117.2641, buoyId: "46274" },
    { id: "torrey-pines-state-beach",     name: "Torrey Pines State Beach",     lat: 32.9302, lon: -117.2594, buoyId: "46274", wind: ["NE", "E", "SE"], tide: ["low", "medium"] },

    // South County San Diego (north -> south)
    { id: "blacks",                       name: "Blacks Beach",                 lat: 32.8819, lon: -117.2525, buoyId: "46274", wind: ["E", "SE"],     tide: ["low", "medium"] },
    { id: "scripps",                      name: "Scripps",                      lat: 32.8654, lon: -117.2550, buoyId: "46274", wind: ["E", "SE", "S"], tide: ["medium"] },
    { id: "mission-beach",                name: "Mission Beach",                lat: 32.7676, lon: -117.2527, buoyId: "46274", wind: ["E", "S"],       tide: ["medium"] },
    { id: "ob-pier",                      name: "OB Pier",                      lat: 32.7479, lon: -117.2536, buoyId: "46274", wind: ["E"],            tide: ["medium"] },
    { id: "sunset-cliffs",                name: "Sunset Cliffs",                lat: 32.7256, lon: -117.2581, buoyId: "46274", wind: ["E"],            tide: ["medium"] }
];