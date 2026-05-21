export async function fetchNOAA() {
    const res = await fetch(
        "https://www.ndbc.noaa.gov/data/realtime2/46232.json"
    );
    const data = await res.json();

    return {
        observedWaveHeight: parseFloat(data.WVHT)
    };
}