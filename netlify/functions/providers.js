const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.regularOpeningHours.openNow',
  'places.businessStatus',
  'places.types',
].join(',');

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

const requiredKey = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
};

const numberParam = (value, name, min, max) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`Invalid ${name}`);
  }
  return number;
};

const textParam = (value, name, maxLength) => {
  const text = String(value || '').trim();
  if (!text || text.length > maxLength) throw new Error(`Invalid ${name}`);
  return text;
};

const fetchJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = await response.text();
    let data;
    try {
      data = body ? JSON.parse(body) : {};
    } catch {
      data = { error: 'The provider returned an invalid response.' };
    }
    return jsonResponse(response.status, data);
  } finally {
    clearTimeout(timeout);
  }
};

const googlePlacesText = async (body) => {
  const textQuery = textParam(body.textQuery, 'textQuery', 120);
  const latitude = numberParam(body.lat, 'lat', -90, 90);
  const longitude = numberParam(body.lon, 'lon', -180, 180);
  const radius = numberParam(body.radius, 'radius', 1, 50000);
  return fetchJson('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': requiredKey('REACT_APP_GOOGLE_PLACES_API_KEY'),
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 20,
      locationBias: {
        circle: { center: { latitude, longitude }, radius },
      },
    }),
  });
};

const googlePlacesNearby = async (params) => {
  const latitude = numberParam(params.lat, 'lat', -90, 90);
  const longitude = numberParam(params.lon, 'lon', -180, 180);
  const radius = numberParam(params.radius, 'radius', 1, 50000);
  const type = textParam(params.type, 'type', 40);
  const keyword = textParam(params.keyword, 'keyword', 100);
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${latitude},${longitude}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('type', type);
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('key', requiredKey('REACT_APP_GOOGLE_PLACES_API_KEY'));
  if (params.pagetoken) {
    url.searchParams.set('pagetoken', textParam(params.pagetoken, 'pagetoken', 512));
  }
  return fetchJson(url);
};

const providers = {
  weather: (params) => {
    const city = textParam(params.city, 'city', 100);
    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.set('q', `${city},us`);
    url.searchParams.set('appid', requiredKey('REACT_APP_OPENWEATHER_API_KEY'));
    return fetchJson(url);
  },
  photos: (params) => {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', textParam(params.query, 'query', 100));
    url.searchParams.set('per_page', '20');
    return fetchJson(url, {
      headers: { Authorization: `Client-ID ${requiredKey('REACT_APP_UNSPLASH_API_KEY')}` },
    });
  },
  news: (params) => {
    const url = new URL('https://api.mediastack.com/v1/news');
    url.searchParams.set('access_key', requiredKey('REACT_APP_MEDIASTACK_API_KEY'));
    url.searchParams.set('languages', 'en');
    url.searchParams.set('categories', textParam(params.category || 'general', 'category', 30));
    url.searchParams.set('countries', textParam(params.country || 'us', 'country', 2));
    url.searchParams.set('limit', '20');
    if (params.search) url.searchParams.set('keywords', textParam(params.search, 'search', 100));
    return fetchJson(url);
  },
  openChargeMap: (params) => {
    const url = new URL('https://api.openchargemap.io/v3/poi/');
    url.search = new URLSearchParams({
      output: 'json', countrycode: 'US',
      latitude: String(numberParam(params.lat, 'lat', -90, 90)),
      longitude: String(numberParam(params.lon, 'lon', -180, 180)),
      distance: '50', distanceunit: 'KM', maxresults: '30', compact: 'true', verbose: 'false',
    }).toString();
    return fetchJson(url, {
      headers: { 'X-API-Key': requiredKey('REACT_APP_OCM_API_KEY') },
    });
  },
  nrel: (params) => {
    const url = new URL('https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json');
    url.search = new URLSearchParams({
      api_key: process.env.REACT_APP_NREL_API_KEY || 'DEMO_KEY',
      fuel_type: 'ELEC',
      latitude: String(numberParam(params.lat, 'lat', -90, 90)),
      longitude: String(numberParam(params.lon, 'lon', -180, 180)),
      radius: String(numberParam(params.radius || 50, 'radius', 1, 500)),
      limit: '40', status: 'E',
    }).toString();
    return fetchJson(url);
  },
  surfline: (params) => {
    const latitude = numberParam(params.lat, 'lat', -90, 90);
    const longitude = numberParam(params.lon, 'lon', -180, 180);
    const range = numberParam(params.range || 0.05, 'range', 0.01, 1);
    const url = new URL('https://services.surfline.com/kbyg/buoys/bounds');
    url.search = new URLSearchParams({
      north: String(latitude + range), south: String(latitude - range),
      east: String(longitude + range), west: String(longitude - range),
      accesstoken: requiredKey('REACT_APP_SURFLINE_TOKEN'),
    }).toString();
    return fetchJson(url);
  },
  youtubeSearch: (params) => {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.search = new URLSearchParams({
      part: 'snippet', q: textParam(params.query, 'query', 100),
      type: 'video', maxResults: '10', key: requiredKey('REACT_APP_YOUTUBE_API_KEY'),
    }).toString();
    return fetchJson(url);
  },
  youtubeVideo: (params) => {
    const id = textParam(params.id, 'id', 20);
    if (!/^[\w-]+$/.test(id)) throw new Error('Invalid video id');
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.search = new URLSearchParams({
      part: 'snippet', id, key: requiredKey('REACT_APP_YOUTUBE_API_KEY'),
    }).toString();
    return fetchJson(url);
  },
  worldTides: (params) => {
    const url = new URL('https://www.worldtides.info/api/v3');
    url.search = new URLSearchParams({
      heights: '', extremes: '', date: 'now', length: '48',
      lat: String(numberParam(params.lat, 'lat', -90, 90)),
      lon: String(numberParam(params.lon, 'lon', -180, 180)),
      key: requiredKey('REACT_APP_WORLDTIDES_API_KEY'),
    }).toString();
    return fetchJson(url);
  },
};

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://jsongithub.github.io')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const isAllowedOrigin = allowedOrigins.includes(origin);
  const respond = (response) => ({
    ...response,
    headers: {
      ...response.headers,
      Vary: 'Origin',
      ...(isAllowedOrigin ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } : {}),
    },
  });

  if (event.httpMethod === 'OPTIONS') {
    return isAllowedOrigin
      ? respond({ statusCode: 204, headers: {}, body: '' })
      : jsonResponse(403, { error: 'Origin not allowed' });
  }
  if (origin && !isAllowedOrigin) return jsonResponse(403, { error: 'Origin not allowed' });

  const params = event.queryStringParameters || {};
  const provider = params.provider;
  try {
    if (provider === 'googlePlacesText') {
      if (event.httpMethod !== 'POST') return respond(jsonResponse(405, { error: 'Method not allowed' }));
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return respond(jsonResponse(400, { error: 'Invalid JSON body' }));
      }
      return respond(await googlePlacesText(body));
    }

    if (provider === 'googlePlacesNearby') {
      if (event.httpMethod !== 'GET') return respond(jsonResponse(405, { error: 'Method not allowed' }));
      return respond(await googlePlacesNearby(params));
    }

    if (event.httpMethod !== 'GET' || typeof providers[provider] !== 'function') {
      return respond(jsonResponse(404, { error: 'Provider not found' }));
    }
    return respond(await providers[provider](params));
  } catch (error) {
    const statusCode = error.message.startsWith('Missing server environment variable:') ? 503 : 400;
    return respond(jsonResponse(statusCode, { error: error.message }));
  }
};
