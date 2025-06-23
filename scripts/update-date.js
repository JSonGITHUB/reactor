const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function fetchAndSaveData() {
    try {
        const response = await axios.get('https://marine-api.open-meteo.com/v1/marine', {
            params: {
                latitude: 33.08,
                longitude: -117.24,
                hourly: 'wave_height,wind_wave_height,swell_wave_height',
                timezone: 'auto'
            }
        });

        const filePath = path.join(__dirname, '..', 'public', 'data.json');
        fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));

        console.log('✅ Data updated successfully.');
    } catch (error) {
        console.error('❌ Failed to fetch data:', error);
        process.exit(1);
    }
}

fetchAndSaveData();