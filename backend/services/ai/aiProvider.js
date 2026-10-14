// The only file that talks to an AI company. To switch provider later, change just this file.
// If ANTHROPIC_API_KEY is not set, everything returns null and the app falls back to
// its built-in (database based) logic, so the app works with or without a key.
const API_URL = "https://api.anthropic.com/v1/messages";

exports.isAIEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

exports.askAI = async (system, userText) => {
  if (!exports.isAIEnabled()) return null;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-sonnet-5-5",
        max_tokens: 800,
        system,
        messages: [{ role: "user", content: userText }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content && data.content[0] ? data.content[0].text : null;
  } catch (err) {
    console.error("AI request failed");
    return null;
  }
};

// Asks for JSON and safely parses it. Returns null when the answer is not valid JSON.
exports.askAIForJSON = async (system, userText) => {
  const text = await exports.askAI(system + " Reply with JSON only, no extra text.", userText);
  if (!text) return null;
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    return null;
  }
};
