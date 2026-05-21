// Express production server for /api/ai/recommendations
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());

// Production AI recommendations endpoint
app.post('/api/ai/recommendations', async (req, res) => {
  const prompt = req.body;
  // TODO: Replace with real AI logic or API call
  res.json({
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
  });
});

// Serve static files from build
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});