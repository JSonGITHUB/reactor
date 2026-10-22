const config = {
    unsplashAPI_KEY: process.env.REACT_APP_UNSPLASH_API_KEY || '',
    unsplashAPI_BASE_URL: 'https://api.unsplash.com/search/photos',
    openweatherAPI_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY || '',
    openweatherAPI_BASE_URL: 'https://api.openweathermap.org',
    youtubeAPI_KEY: process.env.REACT_APP_YOUTUBE_API_KEY || '',
    youtubeAPI_BASE_URL: 'https://www.googleapis.com/youtube/v3',
    googleAPI_KEY: process.env.REACT_APP_GOOGLE_API_KEY || '',
    googleAPI_BASE_URL: 'https://translation.googleapis.com/language/translate/v2'
}
export default config