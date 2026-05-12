const axios = require('axios');
require('dotenv').config();

async function printModelNames() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const names = response.data.models.map(m => m.name);
        console.log('Available Models:', names);
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

printModelNames();
