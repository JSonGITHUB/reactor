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
function calculatePhotoSettings({
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

    // 1. Set aperture and focal length based on effect (creative intent)
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
        case 'macro':
            settings.aperture = 'f/4';
            settings.focalLength = '100mm';
            settings.notes += `${enteredNotes} => Macro photography, moderate aperture. `;
            break;
        case 'action':
            settings.aperture = 'f/4.5';
            settings.focalLength = '70mm';
            settings.notes += `${enteredNotes} => Action: moderate aperture, mid-telephoto. `;
            break;
        case 'nightSky':
            settings.aperture = 'f/2.0';
            settings.focalLength = '14mm';
            settings.shutter = '20s';
            settings.iso = '3200';
            settings.notes += `${enteredNotes} => Night sky: wide aperture, high ISO, long exposure. `;
            break;
        case 'smoothWater':
            settings.aperture = 'f/8';
            settings.focalLength = '24mm';
            settings.shutter = '2s';
            settings.notes += `${enteredNotes} => Smooth water: long exposure, use tripod, ND filter. `;
            break;
        case 'bokeh':
            settings.aperture = 'f/1.8';
            settings.focalLength = '85mm';
            settings.notes += `${enteredNotes} => Bokeh: very wide aperture, telephoto. `;
            break;
        default:
            settings.aperture = 'f/5.6';
            settings.focalLength = '50mm';
            settings.notes += `${enteredNotes} => General purpose settings. `;
            break;
    }

    // 2. Adjust ISO and shutter for lighting
    switch (lighting) {
        case 'low':
            settings.iso = '1600';
            settings.shutter = settings.shutter === '1/125' ? '1/60' : settings.shutter;
            settings.notes += `${enteredNotes} => Low light: high ISO, slower shutter. `;
            break;
        case 'medium':
            settings.iso = '400';
            settings.shutter = settings.shutter === '1/125' ? '1/100' : settings.shutter;
            settings.notes += `${enteredNotes} => Indoor/mixed: moderate ISO/shutter. `;
            break;
        case 'bright':
            settings.iso = '100';
            settings.shutter = settings.shutter === '1/125' ? '1/500' : settings.shutter;
            settings.notes += `${enteredNotes} => Bright sunlight: low ISO, fast shutter. `;
            break;
        case 'backlit':
            settings.iso = '200';
            settings.shutter = settings.shutter === '1/125' ? '1/200' : settings.shutter;
            settings.notes += `${enteredNotes} => Backlit: expose for subject, use fill flash if needed. `;
            break;
        case 'studio':
            settings.iso = '100';
            settings.shutter = settings.shutter === '1/125' ? '1/160' : settings.shutter;
            settings.notes += `${enteredNotes} => Studio: low ISO, sync shutter. `;
            break;
        default:
            break;
    }

    // 3. Adjust shutter for motion (priority for action/moving)
    switch (motion) {
        case 'fast':
            settings.shutter = '1/1000';
            settings.notes += `${enteredNotes} => Fast motion: very fast shutter. `;
            break;
        case 'slow':
            settings.shutter = '1/60';
            settings.notes += `${enteredNotes} => Slow motion: slower shutter, use tripod if needed. `;
            break;
        case 'still':
        case 'stationary':
        default:
            break;
    }

    // 4. Optional: adjust white balance for scene
    if (scene === 'sunset') {
        settings.whiteBalance = 'Shade';
        settings.notes += `${enteredNotes} => Warm tone for sunset. `;
    } else if (scene === 'indoor' || scene === 'indoors') {
        settings.whiteBalance = 'Incandescent';
        settings.notes += `${enteredNotes} => Indoor lighting adjustments. `;
    } else if (scene === 'studio') {
        settings.whiteBalance = 'Flash';
        settings.notes += `${enteredNotes} => Studio: use flash/strobe white balance. `;
    } else if (scene === 'city') {
        settings.whiteBalance = 'Auto';
        settings.notes += `${enteredNotes} => City/urban: auto white balance. `;
    } else if (scene === 'nature') {
        settings.whiteBalance = 'Daylight';
        settings.notes += `${enteredNotes} => Nature/forest: daylight white balance. `;
    }

    return settings;
}

export default calculatePhotoSettings;