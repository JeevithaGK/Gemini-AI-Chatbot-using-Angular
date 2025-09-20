const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
console.log("GEMINI API KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");

const app = express();

// ✅ CORS for Angular frontend
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ✅ Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Chat route
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const normalizedPrompt = prompt.trim().toLowerCase();

    // ✅ Flexible override for today's date
    const dateKeywords = [
      "today's date", "todays date", "what is today's date", "what is todays date",
      "date today", "current date", "what date is it", "today date", "date"
    ];

    if (dateKeywords.some(keyword => normalizedPrompt.includes(keyword))) {
      const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
      return res.json({ response: `Today is ${today}.` });
    }

    // ✅ Request structured response from Gemini
    const structuredPrompt = `Please respond in an ordered format (numbered list or bullet points) for clarity:\n${prompt}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(structuredPrompt);

    // 🔍 Log full response for debugging
    console.log("Gemini full result:", JSON.stringify(result, null, 2));

    // ✅ Correct response extraction
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    res.json({ response: responseText || "🤖 I didn’t catch that." });
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err);
    res.status(500).json({
      error: "AI Error",
      details: err.response?.data || err.message || err
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
