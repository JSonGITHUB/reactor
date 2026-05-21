exports.handler = async function (event, context) {
    const prompt = event.body ? JSON.parse(event.body) : {};

    // TODO: Replace with real AI logic or API call
    return {
        statusCode: 200,
        body: JSON.stringify({
            iso: 200,
            shutterSpeed: '1/60s',
            aperture: 'f/4',
            explanation: 'For indoor shots, use a higher ISO and a moderate aperture.',
            tips: [
                'Stabilize your camera.',
                'Use available light.',
                'Mind your background.'
            ],
            mock: false
        })
    };
};