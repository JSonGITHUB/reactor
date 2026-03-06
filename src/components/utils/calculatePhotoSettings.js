// src/components/PhotoAssistant/calculatePhotoSettings.js

/**
 * Calculates recommended photo settings based on user input.
 * @param {Object} options - User selected options from SubjectForm, ModeSelector, ConditionSelectors
 * @param {string} options.subject
 * @param {string} options.description
 * @param {string} options.lighting - e.g., 'bright', 'low', 'mixed'
 * @param {string} options.motion - e.g., 'stationary', 'moving', 'fast'
 * @param {string} options.effect - e.g., 'portrait', 'landscape', 'action', 'macro'
 * @param {string} options.scene - optional scene type
 * @returns {Object} - Recommended camera settings
 */
export default function calculatePhotoSettings({
    subject = '',
    description = '',
    lighting = 'normal',
    motion = 'stationary',
    effect = 'portrait',
    scene = ''
}) {
    const settings = {
        aperture: 'f/5.6',
        shutter: '1/125',
        iso: '100',
        focalLength: '50mm',
        whiteBalance: 'Auto',
        metering: 'Matrix',
        notes: ''
    };

    const enteredNotes = `${subject}, ${description}, ${lighting}, ${motion}, ${effect}, ${scene}`;
    
    // Adjust settings based on lighting
    switch (lighting) {
        case 'low':
            settings.iso = '800';
            settings.aperture = 'f/2.8';
            settings.shutter = '1/60';
            settings.notes += `${enteredNotes} => Increase ISO and open aperture for low light.`;
            break;
        case 'bright':
            settings.iso = '100';
            settings.aperture = 'f/8';
            settings.shutter = '1/250';
            settings.notes += `${enteredNotes} => Bright lighting, lower ISO and smaller aperture. `;
            break;
        case 'mixed':
            settings.iso = '200';
            settings.aperture = 'f/5.6';
            settings.shutter = '1/125';
            settings.notes += `${enteredNotes} => Mixed lighting, moderate settings. `;
            break;
        default:
            break;
    }

    // Adjust settings based on motion
    switch (motion) {
        case 'moving':
            settings.shutter = '1/500';
            settings.notes += `${enteredNotes} => Faster shutter to freeze motion. `;
            break;
        case 'fast':
            settings.shutter = '1/1000';
            settings.notes += `${enteredNotes} => Very fast motion, use fast shutter. `;
            break;
        case 'stationary':
        default:
            break;
    }

    // Adjust settings based on effect / style
    switch (effect) {
        case 'portrait':
            settings.aperture = 'f/2.8';
            settings.focalLength = '85mm';
            settings.notes += `${enteredNotes} => Shallow depth of field for portraits. `;
            break;
        case 'landscape':
            settings.aperture = 'f/11';
            settings.focalLength = '24mm';
            settings.notes += `${enteredNotes} => Deep depth of field for landscapes. `;
            break;
        case 'action':
            settings.shutter = '1/500';
            settings.notes += `${enteredNotes} => Capture action with fast shutter. `;
            break;
        case 'macro':
            settings.aperture = 'f/4';
            settings.focalLength = '100mm';
            settings.notes += `${enteredNotes} => Macro photography, moderate aperture. `;
            break;
        default:
            break;
    }

    // Optional: adjust white balance for scene
    if (scene === 'sunset') {
        settings.whiteBalance = 'Shade';
        settings.notes += `${enteredNotes} => Warm tone for sunset. `;
    } else if (scene === 'indoors') {
        settings.whiteBalance = 'Incandescent';
        settings.notes += `${enteredNotes} => Indoor lighting adjustments. `;
    }

    return settings;
}