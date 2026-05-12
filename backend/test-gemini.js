const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    try {
        console.log('API Key Prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : 'MISSING');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent("Hello, respond with 'Success'");
        console.log('Gemini Response:', result.response.text());
    } catch (error) {
        console.error('Gemini Test Failed:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            stack: error.stack
        });
    }
}

testGemini();
