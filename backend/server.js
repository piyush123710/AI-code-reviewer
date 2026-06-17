require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// Initialize Gemini (note: the sdk might have updated, we will use fetch or @google/genai depending on the installed package)
// The new official package is @google/genai or using global fetch. 
// We will use standard GoogleGenerativeAI if it's the older @google/generative-ai package, but since we installed @google/genai let's just do a basic fetch call if we run into API changes. Wait, @google/generative-ai is the standard npm package. 
// Let's change the import to use the correct library:
// Wait, I installed @google/genai, let's use the standard fetch API for simplicity and robust prompt engineering if the library requires specific setup.
// Let me stick to a standard generic implementation that works.

app.post('/api/review', async (req, res) => {
    try {
        const { code, language } = req.body;
        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Gemini API key is missing. Please add it to the backend .env file." });
        }

        const prompt = `You are an expert AI code reviewer. Your task is to analyze the following ${language || 'code'} for syntax errors, logical issues, and overall best practices.

Code:
\`\`\`
${code}
\`\`\`

Return a JSON object in exactly this format:
{
  "issues": [
    {
      "line": "line number or 'N/A'",
      "description": "description of the issue",
      "suggestion": "code suggestion"
    }
  ],
  "summary": "Overall summary of the code quality and logic",
  "rating": "A score out of 10"
}
Ensure the output is raw JSON and no markdown formatting outside of the JSON block. Do not wrap the JSON in \`\`\`json.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
             throw new Error(data.error.message);
        }

        const text = data.candidates[0].content.parts[0].text;
        
        // Parse the JSON
        let parsedResult;
        try {
            // Strip any markdown code block wrappers if they accidentally get included
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedResult = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            // Fallback
            parsedResult = {
                summary: text,
                issues: [],
                rating: "N/A"
            };
        }

        res.json(parsedResult);

    } catch (error) {
        console.error("Error during code review:", error);
        res.status(500).json({ error: "An error occurred during code review." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
