const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: "FAKE_API_KEY" });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: "hi",
      config: {
        systemInstruction: "You are a helpful travel assistant."
      }
    });
  } catch (err) {
    console.error("ERROR NAME:", err.name);
    console.error("ERROR MESSAGE:", err.message);
  }
}
test();
