// src/components/PhotoAssistant/calculateVideoSettings.js

/**
 * Calculates recommended video camera settings based on user input.
 * @param {Object} options - User selected options
 * @param {string} options.lighting - 'bright', 'low', 'mixed'
 * @param {string} options.motion - 'stationary', 'moving', 'fast'
 * @param {string} options.effect - 'cinematic', 'vlog', 'action'
 * @param {string} options.resolution - e.g., '1080p', '4K'
 * @param {number} options.frameRate - e.g., 24, 30, 60
 * @returns {Object} - Recommended video settings
 */
export default function calculateVideoSettings({
    lighting = 'normal',
    motion = 'stationary',
    effect = 'cinematic',
    resolution = '1080p',
    frameRate = 30
}) {
    const settings = {
        aperture: 'f/5.6',
        shutter: '1/60',
        iso: '100',
        whiteBalance: 'Auto',
        frameRate,
        resolution,
        stabilization: 'Off',
        notes: ''
    };

    const enteredNotes = `${lighting}, ${motion}, ${effect}, ${resolution}, ${frameRate}`;

    // Adjust ISO and shutter based on lighting
    switch (lighting) {
        case 'low':
            settings.iso = '800';
            settings.aperture = 'f/2.8';
            settings.shutter = '1/30';
            settings.notes += `${enteredNotes} => Low light: increase ISO, open aperture, slow shutter. `;
            break;
        case 'bright':
            settings.iso = '100';
            settings.aperture = 'f/8';
            settings.shutter = '1/120';
            settings.notes += `${enteredNotes} => Bright light: reduce ISO, smaller aperture. `;
            break;
        case 'mixed':
            settings.iso = '200';
            settings.aperture = 'f/5.6';
            settings.shutter = '1/60';
            settings.notes += `${enteredNotes} => Mixed lighting: moderate settings. `;
            break;
        default:
            break;
    }

    // Adjust shutter based on motion
    if (motion === 'moving') {
        settings.shutter = frameRate * 2; // 180-degree rule for cinematic
        settings.notes += `${enteredNotes} => Moving subject: use 180-degree shutter rule. `;
    } else if (motion === 'fast') {
        settings.shutter = frameRate * 1; // faster shutter to freeze fast action
        settings.notes += `${enteredNotes} => Fast motion: use faster shutter. `;
    }

    // Adjust settings based on effect
    switch (effect) {
        case 'cinematic':
            settings.frameRate = 24;
            settings.notes += `${enteredNotes} => Cinematic look: 24fps. `;
            break;
        case 'vlog':
            settings.frameRate = 30;
            settings.notes += `${enteredNotes} => Vlog style: 30fps for smooth motion. `;
            break;
        case 'action':
            settings.frameRate = 60;
            settings.stabilization = 'On';
            settings.notes += `${enteredNotes} => Action video: 60fps and enable stabilization. `;
            break;
        default:
            break;
    }

    return settings;
}