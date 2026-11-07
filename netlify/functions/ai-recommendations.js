// Netlify Function: ai-recommendations.js
// Uses calculatePhotoSettings for dynamic recommendations

const path = require('path');
const calculatePhotoSettings = require('../../src/components/utils/calculatePhotoSettings');

exports.handler = async function(event, context) {
  const prompt = event.body ? JSON.parse(event.body) : {};
  // Support both top-level and nested 'user' fields
  const user = prompt.user || prompt;
  // Map form values to expected values for calculatePhotoSettings
  const lightingMap = {
    'daylight': 'bright',
    'golden-hour': 'mixed',
    'low-light': 'low'
  };
  const motionMap = {
    'still': 'stationary',
    'fast': 'fast',
    'moving': 'moving'
  };
  // You can expand this as needed for effect/mode
  const mapped = {
    ...user,
    lighting: lightingMap[user.lighting] || 'normal',
    motion: motionMap[user.motion] || 'stationary',
    effect: user.effect || 'portrait',
    scene: user.scene || ''
  };
  const settings = calculatePhotoSettings(mapped);
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
