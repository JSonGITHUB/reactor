const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const NOAA_PROXY_BASE = isLocalDev ? '/api/noaa' : 'https://api.tidesandcurrents.noaa.gov';
const NOAA_BASE = '/api/prod/datagetter';
const USGS_PROXY_BASE = isLocalDev ? '/api/usgs' : 'https://waterservices.usgs.gov';

const parseNumeric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const parseNoaaTimestamp = (timestampValue) => {
    if (!timestampValue) return null;
    const parsed = new Date(timestampValue.replace(' ', 'T'));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Fetch water quality metrics from NOAA
 * Includes conductivity, salinity, and visibility where available
 * La Jolla Cove: Station 9410230
 */
const fetchNoaaWaterQuality = async (stationId) => {
    try {
        const params = new URLSearchParams({
            date: 'latest',
            station: stationId,
            product: 'salinity',
            units: 'english',
            time_zone: 'lst_ldt',
            application: 'reactor_water_quality',
            format: 'json',
        });

        const response = await fetch(`${NOAA_PROXY_BASE}${NOAA_BASE}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`NOAA water quality request failed (${response.status})`);
        }

        const payload = await response.json();
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const latestRow = rows[rows.length - 1] || null;

        const salinity = parseNumeric(latestRow?.v);
        const timestamp = parseNoaaTimestamp(latestRow?.t);

        if (!Number.isFinite(salinity)) {
            throw new Error('NOAA salinity data unavailable');
        }

        return {
            salinity: {
                value: salinity,
                unit: 'PSU',
                timestamp,
            },
            source: `NOAA CO-OPS station ${stationId}`,
            timestamp,
        };
    } catch (error) {
        throw new Error(`NOAA water quality unavailable: ${error.message}`);
    }
};

/**
 * Fetch water visibility using NOAA turbidity or estimate from NDBC Hs (wave height)
 * Higher waves typically indicate lower visibility
 */
const estimateVisibilityFromWaveHeight = (waveHeightFeet) => {
    if (!Number.isFinite(waveHeightFeet)) return null;

    // Empirical relationship: higher waves = lower visibility
    // Based on wave action reducing water clarity
    // Flat water (0-1 ft): 30-50 ft visibility
    // Calm (1-2 ft): 25-40 ft
    // Small (2-3 ft): 15-30 ft
    // Moderate (3-4 ft): 10-20 ft
    // Rough (4-6 ft): 5-15 ft
    // Very rough (6+ ft): 3-10 ft

    if (waveHeightFeet < 1) return 40; // good visibility
    if (waveHeightFeet < 2) return 32;
    if (waveHeightFeet < 3) return 22;
    if (waveHeightFeet < 4) return 15;
    if (waveHeightFeet < 6) return 10;
    return 5; // poor visibility in rough conditions
};

/**
 * Fetch visibility from NOAA's Air-Sea Interaction Toolkit data
 * Falls back to wave-height-based estimation
 */
const fetchNoaaVisibility = async (stationId, fallbackWaveHeightFeet = null) => {
    try {
        // Try direct visibility fetch (not always available)
        const params = new URLSearchParams({
            date: 'latest',
            station: stationId,
            product: 'visibility',
            units: 'english',
            time_zone: 'lst_ldt',
            application: 'reactor_water_quality',
            format: 'json',
        });

        const response = await fetch(`${NOAA_PROXY_BASE}${NOAA_BASE}?${params.toString()}`);
        if (response.ok) {
            const payload = await response.json();
            const rows = Array.isArray(payload?.data) ? payload.data : [];
            const latestRow = rows[rows.length - 1] || null;

            const visibility = parseNumeric(latestRow?.v);
            const timestamp = parseNoaaTimestamp(latestRow?.t);

            if (Number.isFinite(visibility)) {
                return {
                    visibilityFeet: visibility,
                    timestamp,
                    source: `NOAA station ${stationId}`,
                    method: 'direct',
                };
            }
        }
    } catch (error) {
        // Continue to fallback
    }

    // Fallback: estimate from wave height if available
    if (Number.isFinite(fallbackWaveHeightFeet)) {
        const estimated = estimateVisibilityFromWaveHeight(fallbackWaveHeightFeet);
        return {
            visibilityFeet: estimated,
            timestamp: new Date(),
            source: 'Estimated from wave conditions',
            method: 'estimated',
            confidence: 'low',
        };
    }

    throw new Error('NOAA visibility data unavailable and no fallback available');
};

/**
 * Estimate water quality assessment based on salinity and conditions
 * Returns a quality rating: excellent, good, fair, poor
 */
const assessWaterQuality = (salinity = null, waveHeightFeet = null, waterTempF = null) => {
    const assessments = [];

    // Salinity assessment
    // Normal Pacific seawater: 33-35 PSU
    // Outside this range indicates freshwater input or evaporation
    if (Number.isFinite(salinity)) {
        if (salinity >= 33 && salinity <= 35) {
            assessments.push({ factor: 'Salinity', status: 'normal', value: salinity });
        } else if (salinity < 33) {
            assessments.push({ factor: 'Salinity', status: 'low (freshwater input)', value: salinity });
        } else {
            assessments.push({ factor: 'Salinity', status: 'high', value: salinity });
        }
    }

    // Wave/turbidity assessment
    if (Number.isFinite(waveHeightFeet)) {
        if (waveHeightFeet < 2) {
            assessments.push({ factor: 'Conditions', status: 'calm/clear', value: waveHeightFeet });
        } else if (waveHeightFeet < 4) {
            assessments.push({ factor: 'Conditions', status: 'moderate/murky', value: waveHeightFeet });
        } else {
            assessments.push({ factor: 'Conditions', status: 'rough/turbid', value: waveHeightFeet });
        }
    }

    // Temperature assessment
    if (Number.isFinite(waterTempF)) {
        if (waterTempF >= 55 && waterTempF <= 75) {
            assessments.push({ factor: 'Temperature', status: 'safe for diving', value: waterTempF });
        } else if (waterTempF < 55) {
            assessments.push({ factor: 'Temperature', status: 'cold', value: waterTempF });
        } else if (waterTempF > 75) {
            assessments.push({ factor: 'Temperature', status: 'warm', value: waterTempF });
        }
    }

    // Overall rating: count positive vs negative factors
    const positiveFactors = assessments.filter((a) => a.status.includes('normal') || a.status.includes('safe')).length;
    const negativeFactors = assessments.filter((a) => a.status.includes('low') || a.status.includes('high') || a.status.includes('cold') || a.status.includes('rough')).length;

    let overallRating = 'unknown';
    if (assessments.length > 0) {
        if (negativeFactors === 0 && positiveFactors >= 2) {
            overallRating = 'excellent';
        } else if (negativeFactors === 0) {
            overallRating = 'good';
        } else if (negativeFactors === 1) {
            overallRating = 'fair';
        } else {
            overallRating = 'poor';
        }
    }

    return {
        rating: overallRating,
        assessments,
        timestamp: new Date(),
    };
};

/**
 * Fetch comprehensive water quality data from multiple sources
 */
const fetchWaterQuality = async ({
    noaaStationId = '9410230',
    waveHeightFeet = null,
    waterTempF = null,
} = {}) => {
    const results = {
        salinity: null,
        visibility: null,
        qualityAssessment: null,
        sources: [],
        timestamp: new Date(),
        error: null,
    };

    try {
        // Fetch salinity from NOAA
        const qualityData = await fetchNoaaWaterQuality(noaaStationId);
        results.salinity = qualityData.salinity;
        results.sources.push(qualityData.source);
    } catch (error) {
        results.error = (results.error ? `${results.error}; ` : '') + error.message;
    }

    try {
        // Fetch visibility from NOAA or estimate from wave height
        const visibilityData = await fetchNoaaVisibility(noaaStationId, waveHeightFeet);
        results.visibility = {
            feet: visibilityData.visibilityFeet,
            timestamp: visibilityData.timestamp,
            method: visibilityData.method,
            confidence: visibilityData.confidence,
        };
        results.sources.push(visibilityData.source);
    } catch (error) {
        results.error = (results.error ? `${results.error}; ` : '') + error.message;
    }

    // Generate quality assessment
    results.qualityAssessment = assessWaterQuality(
        results.salinity?.value,
        waveHeightFeet,
        waterTempF
    );

    return results;
};

export default fetchWaterQuality;
export { fetchNoaaWaterQuality, fetchNoaaVisibility, estimateVisibilityFromWaveHeight, assessWaterQuality };
