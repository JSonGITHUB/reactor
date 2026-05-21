const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

const quietProxyErrorHandler = (err) => {
    // Upstream market APIs can reset sockets intermittently; avoid flooding dev logs.
    if (err?.code === 'ECONNRESET' || err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT') return;
    console.error('[HPM] Proxy error:', err?.message || err);
};

module.exports = function setupProxy(app) {
    // Local dev mock for AI recommendations
    if (process.env.NODE_ENV === 'development') {
        app.post('/api/ai/recommendations', async (req, res) => {
            let prompt = req.body;
            if (typeof prompt === 'string') {
                try { prompt = JSON.parse(prompt); } catch {}
            }
            // Simulate AI response with expected properties
            res.json({
                iso: 100,
                shutterSpeed: '1/125s',
                aperture: 'f/2.8',
                explanation: 'Use a low ISO for daylight and a wide aperture for shallow depth of field.',
                tips: [
                    'Keep your hands steady.',
                    'Focus on the subject.',
                    'Check your lighting.'
                ],
                mock: true
            });
        });
    }
    app.get('/api/google/places/primo-nearby', async (req, res) => {
        const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'Missing REACT_APP_GOOGLE_PLACES_API_KEY in environment.' });
            return;
        }

        const lat = Number(req.query.lat);
        const lon = Number(req.query.lon);
        const radius = Number(req.query.radius || 5000);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            res.status(400).json({ error: 'lat and lon query params are required numbers.' });
            return;
        }

        try {
            const requestBody = {
                textQuery: 'Primo Water refill',
                maxResultCount: 20,
                locationBias: {
                    circle: {
                        center: { latitude: lat, longitude: lon },
                        radius,
                    },
                },
            };

            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': [
                        'places.id',
                        'places.displayName',
                        'places.formattedAddress',
                        'places.location',
                        'places.regularOpeningHours.openNow',
                        'places.businessStatus',
                        'places.types',
                    ].join(','),
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                res.json({
                    ...data,
                    source: 'google-places-new',
                    debug: {
                        requestedRadius: radius,
                        source: 'places-api-new',
                    },
                });
                return;
            }

            const errorText = await response.text();
            let newApiErrorMessage = errorText;
            let newApiErrorStatus = response.status;
            
            try {
                const errorJson = JSON.parse(errorText);
                newApiErrorMessage = errorJson?.error?.message || errorText;
                newApiErrorStatus = errorJson?.error?.code || response.status;
            } catch {
                // errorText is not JSON, use as-is
            }

            // Fallback to legacy Places Text Search when Places API (New) is disabled.
            const legacyQueries = [
                'Primo Water Refill',
                'Primo Water Refill Station',
                'Primo Water dispenser',
                'Primo Water exchange',
                'Primo Water',
                'water refill station',
                'drinking water refill',
            ];
            const legacyRadii = [radius, Math.max(radius, 10000), 20000, 30000, 50000];

            let legacyResults = [];
            let lastLegacyStatus = null;
            let lastLegacyPayloadStatus = null;
            let lastLegacyErrorMessage = null;
            const legacyAttemptLog = [];

            for (const legacyRadius of legacyRadii) {
                for (const legacyQuery of legacyQueries) {
                    const legacyUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
                    legacyUrl.searchParams.set('query', legacyQuery);
                    legacyUrl.searchParams.set('location', `${lat},${lon}`);
                    legacyUrl.searchParams.set('radius', String(legacyRadius));
                    legacyUrl.searchParams.set('key', apiKey);

                    const legacyResponse = await fetch(legacyUrl.toString());
                    lastLegacyStatus = legacyResponse.status;
                    if (!legacyResponse.ok) {
                        legacyAttemptLog.push({
                            api: 'textsearch',
                            query: legacyQuery,
                            radius: legacyRadius,
                            httpStatus: legacyResponse.status,
                        });
                        continue;
                    }

                    const legacyData = await legacyResponse.json();
                    lastLegacyPayloadStatus = legacyData?.status || null;
                    lastLegacyErrorMessage = legacyData?.error_message || null;
                    const results = Array.isArray(legacyData?.results) ? legacyData.results : [];
                    legacyAttemptLog.push({
                        api: 'textsearch',
                        query: legacyQuery,
                        radius: legacyRadius,
                        httpStatus: legacyResponse.status,
                        status: legacyData?.status || null,
                        count: results.length,
                    });
                    if (results.length > 0) {
                        legacyResults = results;
                        break;
                    }
                }

                if (legacyResults.length > 0) {
                    break;
                }
            }

            // Secondary fallback: nearby search can return location-biased stations that text search misses.
            if (legacyResults.length === 0) {
                const nearbyKeywords = ['Primo Water', 'water refill', 'water dispenser'];
                for (const legacyRadius of legacyRadii) {
                    for (const keyword of nearbyKeywords) {
                        const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
                        nearbyUrl.searchParams.set('location', `${lat},${lon}`);
                        nearbyUrl.searchParams.set('radius', String(legacyRadius));
                        nearbyUrl.searchParams.set('keyword', keyword);
                        nearbyUrl.searchParams.set('key', apiKey);

                        const nearbyResponse = await fetch(nearbyUrl.toString());
                        lastLegacyStatus = nearbyResponse.status;
                        if (!nearbyResponse.ok) {
                            legacyAttemptLog.push({
                                api: 'nearbysearch',
                                keyword,
                                radius: legacyRadius,
                                httpStatus: nearbyResponse.status,
                            });
                            continue;
                        }

                        const nearbyData = await nearbyResponse.json();
                        lastLegacyPayloadStatus = nearbyData?.status || null;
                        lastLegacyErrorMessage = nearbyData?.error_message || null;
                        const results = Array.isArray(nearbyData?.results) ? nearbyData.results : [];
                        legacyAttemptLog.push({
                            api: 'nearbysearch',
                            keyword,
                            radius: legacyRadius,
                            httpStatus: nearbyResponse.status,
                            status: nearbyData?.status || null,
                            count: results.length,
                        });

                        if (results.length > 0) {
                            legacyResults = results;
                            break;
                        }
                    }

                    if (legacyResults.length > 0) {
                        break;
                    }
                }
            }

            if (legacyResults.length === 0 && lastLegacyStatus && lastLegacyStatus >= 400) {
                res.status(response.status).json({
                    error: errorText || 'Google Places request failed.',
                    fallbackError: `Legacy places request failed with status ${lastLegacyStatus}.`,
                });
                return;
            }

            const normalized = legacyResults.map((place) => ({
                id: place.place_id,
                displayName: { text: place.name || 'Primo Water Refill' },
                formattedAddress: place.formatted_address || '',
                location: {
                    latitude: Number(place?.geometry?.location?.lat),
                    longitude: Number(place?.geometry?.location?.lng),
                },
                regularOpeningHours: { openNow: Boolean(place?.opening_hours?.open_now) },
                businessStatus: place.business_status || '',
                types: Array.isArray(place?.types) ? place.types : [],
            }));

            res.json({
                places: normalized,
                source: 'google-legacy',
                debug: {
                    requestedRadius: radius,
                    newApiStatus: newApiErrorStatus,
                    newApiErrorMessage,
                    legacyAttemptCount: legacyAttemptLog.length,
                    lastLegacyHttpStatus: lastLegacyStatus,
                    lastLegacyApiStatus: lastLegacyPayloadStatus,
                    lastLegacyErrorMessage,
                    attempts: legacyAttemptLog,
                },
            });
        } catch (error) {
            res.status(500).json({ error: error?.message || 'Unexpected proxy failure.' });
        }
    });

    app.use(
        '/api/nasdaq',
        createProxyMiddleware({
            target: 'https://api.nasdaq.com',
            changeOrigin: true,
            secure: true,
            logLevel: 'silent',
            onError: quietProxyErrorHandler,
            headers: {
                'user-agent': 'Mozilla/5.0',
                accept: 'application/json',
                origin: 'https://www.nasdaq.com',
                referer: 'https://www.nasdaq.com/',
            },
            pathRewrite: {
                '^/api/nasdaq': '',
            },
        })
    );

    app.use(
        '/api/yahoo',
        createProxyMiddleware({
            target: 'https://query1.finance.yahoo.com',
            changeOrigin: true,
            secure: true,
            logLevel: 'silent',
            onError: quietProxyErrorHandler,
            pathRewrite: {
                '^/api/yahoo': '',
            },
        })
    );

    app.use(
        '/api/sdbeachinfo',
        createProxyMiddleware({
            target: 'https://www.sdbeachinfo.com',
            changeOrigin: true,
            secure: true,
            pathRewrite: {
                '^/api/sdbeachinfo': '',
            },
        })
    );

    app.use(
        '/api/noaa',
        createProxyMiddleware({
            target: 'https://api.tidesandcurrents.noaa.gov',
            changeOrigin: true,
            secure: true,
            pathRewrite: {
                '^/api/noaa': '',
            },
        })
    );

    app.use(
        '/api/stooq',
        createProxyMiddleware({
            target: 'https://stooq.com',
            changeOrigin: true,
            secure: true,
            logLevel: 'silent',
            onError: quietProxyErrorHandler,
            pathRewrite: {
                '^/api/stooq': '',
            },
        })
    );

    app.use(
        '/api/ndbc',
        createProxyMiddleware({
            target: 'https://www.ndbc.noaa.gov',
            changeOrigin: true,
            secure: true,
            pathRewrite: {
                '^/api/ndbc': '',
            },
        })
    );
};