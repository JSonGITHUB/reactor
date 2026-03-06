const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
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