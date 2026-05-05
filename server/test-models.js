const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyCKiT51oVb36RWureOjTBDuYWtEBd9GUzI" });
    const response = await ai.models.list();
    for await (const model of response) {
      console.log(model.name);
    }
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}
test();
