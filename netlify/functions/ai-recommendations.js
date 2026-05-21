// Netlify Function: ai-recommendations.js
// Uses calculatePhotoSettings for dynamic recommendations

const path = require('path');
const calculatePhotoSettings = require('../../src/components/utils/calculatePhotoSettings').default;

exports.handler = async function(event, context) {
  const prompt = event.body ? JSON.parse(event.body) : {};
  // Use the utility to calculate settings
  const settings = calculatePhotoSettings(prompt);
  // Map to expected API response shape
  return {
    statusCode: 200,
    body: JSON.stringify({
      iso: settings.iso,
      shutterSpeed: settings.shutter,
      aperture: settings.aperture,
      focalLength: settings.focalLength,
      whiteBalance: settings.whiteBalance,
      metering: settings.metering,
      explanation: settings.notes,
      tips: [
        'Adjust settings as needed for your camera.',
        'Review histogram for exposure.',
        'Use a tripod for stability if required.'
      ],
      mock: false
    })
  };
};
