import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  try {
    const userQuestion = req.body.question;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: `You are SchemeAI, a helpful assistant that answers questions about Indian government welfare schemes.
Keep answers short, simple and in plain English.
Only answer questions related to government schemes, eligibility, documents needed, and how to apply.
If asked something unrelated, politely say you only help with government schemes.`,
        messages: [
          { role: "user", content: userQuestion }
        ]
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "No response from AI";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
