export const isIOS = () => {
    const userAgent = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
}