export function buildPhotographyPrompt(context) {
  return {
    system: {
      role: 'Photography Expert',
      instructions: [
        'Provide concise manual camera recommendations.',
        'Explain settings clearly.',
        'Include warnings for low-light or motion blur risks.'
      ]
    },

    user: {
      subject: context.subject,
      lighting: context.lighting,
      motion: context.motion,
      mode: context.mode,
      style: context.style
    },

    outputFormat: {
      iso: 'number',
      shutterSpeed: 'string',
      aperture: 'string',
      explanation: 'string',
      tips: 'array'
    }
  };
}