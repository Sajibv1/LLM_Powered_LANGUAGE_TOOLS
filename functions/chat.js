export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GROQ_API_KEY is not configured on the server." }),
      };
    }

    const { messages } = JSON.parse(event.body || "{}");
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Messages array is required" }),
      };
    }

    const SYSTEM_PROMPT = `You are an upbeat English conversation tutor for intermediate learners.

Your job each turn:
1) Silently inspect the LAST user message for grammar, spelling, word-choice, or naturalness issues.
2) Reply naturally to keep the conversation going — ask follow-up questions, react warmly, play along with roleplays. Keep replies to 1-3 sentences.

Always respond by calling the "return_tutor_response" tool with:
- correction: null if the user's last message has no meaningful issues. Otherwise an object with:
    - corrected: the user's message rewritten correctly and naturally
    - alternatives: 1-2 more natural or expressive ways to say the same idea (different from "corrected")
    - explanation: ONE short sentence explaining the main fix or why the alternative is better
- reply: your natural conversational response (do NOT mention corrections here)

Be encouraging. Do not correct minor stylistic choices that are already correct.`;

    // Using Groq's OpenAI-compatible endpoint and a powerful tool-compatible model
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_tutor_response",
              description: "Return tutor correction (or null) plus a natural reply.",
              parameters: {
                type: "object",
                properties: {
                  correction: {
                    anyOf: [
                      { type: "null" },
                      {
                        type: "object",
                        properties: {
                          corrected: { type: "string" },
                          alternatives: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 1,
                            maxItems: 2,
                          },
                          explanation: { type: "string" },
                        },
                        required: ["corrected", "alternatives", "explanation"],
                        additionalProperties: false,
                      },
                    ],
                  },
                  reply: { type: "string" },
                },
                required: ["correction", "reply"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_tutor_response" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Groq API Error", details: errorText }),
      };
    }

    const json = await response.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    if (!argsStr) {
      const fallback = json.choices?.[0]?.message?.content || "Sorry, can you say that again?";
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correction: null, reply: String(fallback) }),
      };
    }

    const parsedData = JSON.parse(argsStr);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedData),
    };

  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
