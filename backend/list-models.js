const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    try {
        const models = ['gemini-1.5-flash', 'gemini-pro'];
        const versions = ['v1', 'v1beta'];
        
        for (const version of versions) {
            console.log(`--- Testing with API Version: ${version} ---`);
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: version });
            
            for (const modelName of models) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent("hi");
                    console.log(`SUCCESS: Model ${modelName} works with ${version}!`);
                    return;
                } catch (e) {
                    console.log(`FAILED: Model ${modelName} with ${version}: ${e.message}`);
                }
            }
        }
    } catch (error) {
        console.error('List Models Failed:', error);
    }
}

listModels();
