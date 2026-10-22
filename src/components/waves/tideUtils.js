export const getStoredTideSeries = () => {
    if (typeof window === 'undefined') return [];

    try {
        const tideChart = JSON.parse(window.localStorage.getItem('tideChart') || 'null');
        const tideChartRows = tideChart?.shortIntervalData?.predictions;
        if (Array.isArray(tideChartRows) && tideChartRows.length) {
            return tideChartRows;
        }

        const tideData = JSON.parse(window.localStorage.getItem('tideData') || 'null');
        const waterLevelRows = Array.isArray(tideData?.data?.data)
            ? tideData.data.data
            : Array.isArray(tideData?.data)
                ? tideData.data
                : [];
        return waterLevelRows;
    } catch (_error) {
        return [];
    }
};

export const getTidePhaseFromLevel = (level) => {
    if (!Number.isFinite(level)) return null;
    if (level > 3) return 'high';
    if (level < 2) return 'low';
    return 'mid';
};

const toRowTimestamp = (row) => new Date(String(row?.t || '').replace(' ', 'T')).getTime();

export const getTideAtTime = (rows, targetTime) => {
    if (!Array.isArray(rows) || !rows.length || !targetTime) return null;

    const normalized = rows
        .map((row) => ({
            timestamp: toRowTimestamp(row),
            level: Number.parseFloat(row?.v),
        }))
        .filter((row) => Number.isFinite(row.timestamp) && Number.isFinite(row.level))
        .sort((a, b) => a.timestamp - b.timestamp);

    if (!normalized.length) return null;

    if (normalized.length === 1) {
        const level = Number(normalized[0].level.toFixed(1));
        return {
            phase: getTidePhaseFromLevel(level),
            level,
            direction: null,
        };
    }

    let left = normalized[0];
    let right = normalized[normalized.length - 1];

    if (targetTime <= normalized[0].timestamp) {
        left = normalized[0];
        right = normalized[1];
    } else if (targetTime >= normalized[normalized.length - 1].timestamp) {
        left = normalized[normalized.length - 2];
        right = normalized[normalized.length - 1];
    } else {
        for (let i = 0; i < normalized.length - 1; i++) {
            const a = normalized[i];
            const b = normalized[i + 1];
            if (targetTime >= a.timestamp && targetTime <= b.timestamp) {
                left = a;
                right = b;
                break;
            }
        }
    }

    let interpolatedLevel = left.level;
    if (right.timestamp !== left.timestamp) {
        const ratio = (targetTime - left.timestamp) / (right.timestamp - left.timestamp);
        interpolatedLevel = left.level + ((right.level - left.level) * ratio);
    }

    const direction = right.level >= left.level ? 'rising' : 'falling';
    const level = Number(interpolatedLevel.toFixed(1));

    return {
        phase: getTidePhaseFromLevel(level),
        level,
        direction,
    };
};