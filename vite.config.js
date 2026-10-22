import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

const quietProxyErrorHandler = (err) => {
  if (err?.code === 'ECONNRESET' || err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT') {
    return;
  }
  console.error('[Vite Proxy] Proxy error:', err?.message || err);
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const processEnv = {
    ...env,
    NODE_ENV: mode,
    PUBLIC_URL: '/reactor',
  };

  return {
    base: '/reactor/',
    assetsInclude: ['**/*.MP4'],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('/node_modules/@material-ui/') || id.includes('/node_modules/@emotion/')) {
                return 'vendor-ui';
              }
              if (id.includes('/node_modules/react-icons/')) {
                return 'vendor-icons';
              }
              if (id.includes('/node_modules/moment/') || id.includes('/node_modules/luxon/')) {
                return 'vendor-dates';
              }
              if (id.includes('/node_modules/react-bootstrap/') || id.includes('/node_modules/bootstrap/')) {
                return 'vendor-bootstrap';
              }
              if (
                id.includes('/node_modules/redux/')
                || id.includes('/node_modules/react-redux/')
                || id.includes('/node_modules/redux-form/')
                || id.includes('/node_modules/redux-thunk/')
              ) {
                return 'vendor-redux';
              }
              if (id.includes('/node_modules/react-query/')) {
                return 'vendor-query';
              }
              if (id.includes('/node_modules/gsap/')) {
                return 'vendor-motion';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('/node_modules/three/')) {
                return 'vendor-3d';
              }
              if (id.includes('/node_modules/leaflet/')) {
                return 'vendor-maps';
              }
              return 'vendor';
            }

            if (id.includes('/src/components/waves/')) {
              return 'feature-waves';
            }

            const featureMatch = id.match(/\/src\/components\/([^/]+)\//);
            if (featureMatch) {
              const featureGroup = featureMatch[1];
              const safeFeatureGroups = new Set([
                'HomeDepot',
                'finance',
                'expense',
                'shop',
                'video',
                'news',
                'music',
                'garden',
                'fishing',
                'functional',
                'pics',
                'Residential',
                'Parks',
              ]);
              if (safeFeatureGroups.has(featureGroup)) {
                return `feature-${featureGroup}`;
              }
            }

            return undefined;
          },
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    define: {
      'process.env': JSON.stringify(processEnv),
    },
    server: {
      proxy: {
        '/api/nasdaq': {
          target: 'https://api.nasdaq.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/nasdaq/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('user-agent', 'Mozilla/5.0');
              proxyReq.setHeader('accept', 'application/json');
              proxyReq.setHeader('origin', 'https://www.nasdaq.com');
              proxyReq.setHeader('referer', 'https://www.nasdaq.com/');
            });
            proxy.on('error', quietProxyErrorHandler);
          },
        },
        '/api/yahoo': {
          target: 'https://query1.finance.yahoo.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
          configure: (proxy) => {
            proxy.on('error', quietProxyErrorHandler);
          },
        },
        '/api/sdbeachinfo': {
          target: 'https://www.sdbeachinfo.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/sdbeachinfo/, ''),
        },
        '/api/noaa': {
          target: 'https://api.tidesandcurrents.noaa.gov',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/noaa/, ''),
        },
        '/api/stooq': {
          target: 'https://stooq.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/stooq/, ''),
          configure: (proxy) => {
            proxy.on('error', quietProxyErrorHandler);
          },
        },
        '/api/ndbc': {
          target: 'https://www.ndbc.noaa.gov',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/ndbc/, ''),
        },
      },
    },
    plugins: [
      {
        name: 'treat-js-files-as-jsx',
        async transform(code, id) {
          if (!/\/src\/.*\.js$/.test(id)) {
            return null;
          }
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
      {
        name: 'legacy-proxy-middleware-parity',
        configureServer(server) {
          server.middlewares.use('/api/google/places/primo-nearby', async (req, res, next) => {
            if (req.method !== 'GET') {
              return next();
            }

            const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing REACT_APP_GOOGLE_PLACES_API_KEY in environment.' }));
              return;
            }

            try {
              const url = new URL(req.url || '', 'http://localhost');
              const lat = Number(url.searchParams.get('lat'));
              const lon = Number(url.searchParams.get('lon'));
              const radius = Number(url.searchParams.get('radius') || 5000);

              if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'lat and lon query params are required numbers.' }));
                return;
              }

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

              if (!response.ok) {
                const errorText = await response.text();
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: errorText || 'Google Places request failed.' }));
                return;
              }

              const data = await response.json();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ...data,
                source: 'google-places-new',
                debug: {
                  requestedRadius: radius,
                  source: 'places-api-new',
                },
              }));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error?.message || 'Unexpected proxy failure.' }));
            }
          });

          server.middlewares.use('/api/ai/recommendations', (req, res, next) => {
            if (req.method !== 'POST') {
              return next();
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', () => {
              const payload = body || '{}';
              let parsedPrompt = payload;
              try {
                parsedPrompt = JSON.parse(payload);
              } catch {
                // Keep raw payload when request body is not JSON.
              }

              const response = {
                iso: 100,
                shutterSpeed: '1/125s',
                aperture: 'f/2.8',
                explanation: 'Use a low ISO for daylight and a wide aperture for shallow depth of field.',
                tips: ['Keep your hands steady.', 'Focus on the subject.', 'Check your lighting.'],
                mock: true,
                prompt: parsedPrompt,
              };

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(response));
            });
          });
        },
      },
    ],
  };
});
