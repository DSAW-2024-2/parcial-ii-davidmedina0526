const express = require('express');
const router = express.Router();
const axios = require('axios');

//Define the route to obtain the climate
router.get('/', async (req, res) => {
    //Validate both parameters are present
    if (!req.query.latitude || !req.query.longitude) {
        return res.status(400).json({ message: 'Latitude and longitude parameters required' });
    }

    try {
    //Make a request to Open Meteo
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
            latitude: req.query.latitude,
            longitude: req.query.longitude,
            current_weather: true
        }
    });

    //Verify if the response contains climate data
    const { data } = response;
    if (data && data.current_weather) {
        return res.json({ temperature: data.current_weather.temperature });
    }

    // Check if latitude/longitude was not found
    if (data.error || !data.current_weather) {
        return res.status(404).json({ message: 'Location not found. Please check the latitude and longitude values.' });
    }

    return res.status(500).json({ message: 'Temperature could not be obtained from the server. Please try again later.' });

    } catch (error) {
        return res.status(500).json({ message: 'Error consulting the Open Meteo API. Please try again later.', error: error.message });
    }
});

router.post('/', (req, res) => {
    res.status(405).json({ message: 'POST method is not allowed' });
});

router.put('/', (req, res) => {
    res.status(405).json({ message: 'PUT method is not allowed' });
});

router.delete('/', (req, res) => {
    res.status(405).json({ message: 'DELETE method is not allowed' });
});

module.exports = router;