require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModels() {
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-001',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemma-3-1b-it',
    'gemini-flash-latest'
  ];

  for (const model of modelsToTest) {
    try {
      console.log(`Testing ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: "Hello",
      });
      console.log(`Success with ${model}:`, response.text);
      return;
    } catch (error) {
      console.error(`Failed with ${model}:`, error.message);
    }
  }
}

testModels();
