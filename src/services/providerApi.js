const PROVIDER_ENDPOINT = import.meta.env.VITE_PROVIDER_API_URL
    || 'https://keepfrothalive.netlify.app/.netlify/functions/providers';

export const requestProvider = async (provider, parameters = {}, options = {}) => {
    const endpoint = new URL(PROVIDER_ENDPOINT, window.location.origin);
    endpoint.searchParams.set('provider', provider);

    const method = options.method || 'GET';
    const requestOptions = { method, signal: options.signal };
    if (method === 'GET') {
        Object.entries(parameters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                endpoint.searchParams.set(key, String(value));
            }
        });
    } else {
        requestOptions.headers = { 'Content-Type': 'application/json' };
        requestOptions.body = JSON.stringify(parameters);
    }

    const response = await fetch(endpoint.toString(), requestOptions);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error || `Provider request failed (${response.status})`);
    }
    return data;
};

export const searchGooglePlacesNearby = async ({
    lat,
    lon,
    radius,
    type,
    keyword,
    maxPages = 2,
}) => {
    const results = [];
    let pageToken;
    const pageLimit = Math.min(Math.max(Number(maxPages) || 1, 1), 3);

    for (let page = 0; page < pageLimit; page += 1) {
        const data = await requestProvider('googlePlacesNearby', {
            lat, lon, radius, type, keyword, pagetoken: pageToken,
        });
        if (Array.isArray(data?.results)) results.push(...data.results);
        pageToken = data?.next_page_token;
        if (!pageToken || page + 1 >= pageLimit) break;
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return results;
};

export const searchGooglePlacesText = (parameters) => requestProvider(
    'googlePlacesText',
    parameters,
    { method: 'POST' },
);
