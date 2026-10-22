// Some bundled browser paths still reference process.env at runtime.
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
    window.process = { env: {} };
}
