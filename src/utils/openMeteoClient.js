const inMemoryCache = new Map();
const inFlightRequests = new Map();

const CACHE_PREFIX = 'openMeteoCache:';
const RATE_LIMIT_UNTIL_KEY = 'openMeteoRateLimitUntil';
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 15 * 60 * 1000;

const getStorage = () => {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage;
    } catch (error) {
        return null;
    }
};

const getCachedEntry = (cacheKey) => {
    const memoryEntry = inMemoryCache.get(cacheKey);
    if (memoryEntry) return memoryEntry;

    const storage = getStorage();
    if (!storage) return null;

    const raw = storage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.timestamp !== 'number') {
            return null;
        }
        inMemoryCache.set(cacheKey, parsed);
        return parsed;
    } catch (error) {
        return null;
    }
};

const setCachedEntry = (cacheKey, data) => {
    const entry = {
        timestamp: Date.now(),
        data
    };

    inMemoryCache.set(cacheKey, entry);

    const storage = getStorage();
    if (!storage) return;

    try {
        storage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify(entry));
    } catch (error) {
        // ignore localStorage quota/availability failures
    }
};

const getRateLimitUntil = () => {
    const storage = getStorage();
    if (!storage) return 0;
    const value = Number(storage.getItem(RATE_LIMIT_UNTIL_KEY) || 0);
    return Number.isFinite(value) ? value : 0;
};

const setRateLimitUntil = (timestampMs) => {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(RATE_LIMIT_UNTIL_KEY, String(Math.max(0, timestampMs || 0)));
};

const getRetryAfterMs = (response) => {
    const retryAfter = response.headers.get('retry-after');
    if (!retryAfter) return DEFAULT_RATE_LIMIT_COOLDOWN_MS;
    const asNumber = Number(retryAfter);
    if (Number.isFinite(asNumber) && asNumber > 0) {
        return asNumber * 1000;
    }
    return DEFAULT_RATE_LIMIT_COOLDOWN_MS;
};

export async function fetchOpenMeteoJson(url, options = {}) {
    const {
        cacheKey = url,
        ttlMs = 5 * 60 * 1000,
        allowStaleOnError = true,
        fetchOptions = {}
    } = options;

    const now = Date.now();
    const cached = getCachedEntry(cacheKey);
    const hasFreshCache = Boolean(cached && now - cached.timestamp < ttlMs);
    const hasStaleCache = Boolean(cached?.data);

    if (hasFreshCache) {
        return cached.data;
    }

    const rateLimitUntil = getRateLimitUntil();
    if (now < rateLimitUntil) {
        if (allowStaleOnError && hasStaleCache) {
            return cached.data;
        }
        throw new Error(`Open-Meteo cooldown active until ${new Date(rateLimitUntil).toISOString()}`);
    }

    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    const request = fetch(url, fetchOptions)
        .then(async (response) => {
            if (!response.ok) {
                if (response.status === 429) {
                    const retryAfterMs = getRetryAfterMs(response);
                    setRateLimitUntil(Date.now() + retryAfterMs);
                }
                const error = new Error(`Open-Meteo request failed: ${response.status}`);
                error.status = response.status;
                throw error;
            }
            const json = await response.json();
            setCachedEntry(cacheKey, json);
            return json;
        })
        .catch((error) => {
            if (allowStaleOnError && hasStaleCache) {
                return cached.data;
            }
            throw error;
        })
        .finally(() => {
            inFlightRequests.delete(cacheKey);
        });

    inFlightRequests.set(cacheKey, request);
    return request;
}

export const roundCoord = (value, decimals = 3) => {
    const factor = 10 ** decimals;
    return Math.round(Number(value) * factor) / factor;
};
