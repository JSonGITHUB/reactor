// lib/surfEngine.js

/**
 * Returns a tide score bonus/penalty based on the actual tide level and
 * the location's preferred tide phases (from WavesContext location data).
 *
 * @param {object} tide - { phase: 'low'|'mid'|'high', level: number (feet) }
 * @param {string[]} preferredPhases - e.g. ['low', 'medium'] from location prefs
 */
function tideMatchScore(tide, preferredPhases) {
    if (!preferredPhases?.length || !tide) return 0;

    // Normalize API 'mid' to match locationPrefs 'medium'
    const phase = tide.phase === 'mid' ? 'medium' : tide.phase;
    const level = tide.level ?? null; // feet above MLLW from NOAA

    if (!preferredPhases.includes(phase)) return -15; // wrong tide for this spot

    // Preferred phase — bonus scaled by how strongly the level matches
    if (level != null) {
        if (phase === 'low')    return level < 2 ? 20 : 0;              // < 2 ft = ideal low
        if (phase === 'high')   return level > 4 ? 20 : 0;              // > 4 ft = ideal high
        if (phase === 'medium') return (level >= 2 && level <= 4) ? 20 : 0; // 2–4 ft = ideal mid
    }
    return 15; // preferred phase, no precise level data
}

function windDirectionToDegrees(direction) {
    const lookup = {
        N: 0,
        NE: 45,
        E: 90,
        SE: 135,
        S: 180,
        SW: 225,
        W: 270,
        NW: 315
    };

    return lookup[direction] ?? null;
}

function angularDifference(a, b) {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
}

function windMatchScore(windDir, windSpeed, preferredDirections) {
    if (!Array.isArray(preferredDirections) || !preferredDirections.length) {
        return -(windSpeed * 2);
    }

    const actualDegrees = windDirectionToDegrees(windDir);
    if (actualDegrees == null) {
        return -(windSpeed * 2);
    }

    const preferredDegrees = preferredDirections
        .map(windDirectionToDegrees)
        .filter((direction) => direction != null);

    if (!preferredDegrees.length) {
        return -(windSpeed * 2);
    }

    const smallestDifference = preferredDegrees.reduce((smallest, preferred) => {
        const difference = angularDifference(actualDegrees, preferred);
        return Math.min(smallest, difference);
    }, 180);

    if (smallestDifference <= 45) {
        return 5;
    }

    if (smallestDifference >= 135) {
        return -Math.max(30, windSpeed * 3.5);
    }

    return -(windSpeed * 1.25);
}

export function calculateSurfScore({ waveHeight, wavePeriod, windSpeed, tide }, locationPrefs) {
    let score = 0;

    // Wave height (feet)
    //if (waveHeight > 1 && waveHeight < 2.5) score += 35;
    score += (waveHeight);

    // Period
    score += (wavePeriod);

    // Wind direction matters more than raw speed when the breeze is offshore.
    score += windMatchScore(locationPrefs?.windDir ?? locationPrefs?.wind, windSpeed, locationPrefs?.wind);

    // Tide — preference-aware additive scoring
    score += tideMatchScore(tide, locationPrefs?.tide);

    return Math.min(100, Math.round(score));
}

// Simple surf interpretation
export function surfLabel(dataObj) {
    console.log('Calculating surf label for dataObj:', dataObj);
    const score = (dataObj?.latestScore != null) ? dataObj.latestScore : (dataObj?.score != null) ? dataObj.score : null;
    if (score == null) return `${((dataObj?.waveHeight != null) && (dataObj.waveHeight < 2)) ? '🌊' : ((dataObj?.windSpeed != null) && (dataObj.windSpeed > 10)) ? '💨' : '🌕'} Poor`;
    if (score > 80) return `🔥 Epic`;
    if (score > 60) return `👍 Good`;
    if (score > 40) return `🌊 Ok`;
    return `${((dataObj?.waveHeight != null) && (dataObj.waveHeight < 2)) ? '🌊' : ((dataObj?.windSpeed != null) && (dataObj.windSpeed > 10)) ? '💨' : '🌕'} Poor`;
}