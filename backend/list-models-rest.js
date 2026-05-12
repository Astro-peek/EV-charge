const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAllModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // This might not be available in all SDK versions, but let's try
        // Actually, the REST API has a list models endpoint.
        const axios = require('axios');
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        console.log('Available Models:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('List Models Failed:', error.response ? error.response.data : error.message);
    }
}

listAllModels();
