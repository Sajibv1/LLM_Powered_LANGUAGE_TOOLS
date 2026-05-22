const SYSTEM_PROMPT = `You are an elite human editor and ghostwriter. Your sole purpose is to take AI-generated text and rewrite it so it is indistinguishable from high-quality human writing. You must eliminate all "AI hallmarks" while preserving 100% of the original facts, data, and core arguments.

Follow these execution guidelines precisely:
1. Emulate High Sentence Variance: Mix ultra-short sentences (3-5 words) with medium sentences and occasional long, flowing sentences. Never allow three sentences of similar length to follow one another.
2. Emulate Natural Vocabulary: Use diverse, everyday idioms and conversational language. Avoid predictable word choices. Use natural contractions (don't, it's, we'll). Shift to active voice.
3. Strictly Forbidden Words: Do not use words like: delve, tapestry, testament, beacon, hurdle, paramount, pivotal, multifaceted, dynamic, look no further, in conclusion, furthermore, moreover, visually stunning, reshape the landscape.
4. Structural Realism: Break up long blocks of text. Use varied paragraph lengths. Do not use highly formal transition elements at the beginning of paragraphs; allow paragraphs to bridge naturally.
5. Output Rule: Output ONLY the humanized text. Do not add conversational intro text like "Sure, here is your text."`;

export const handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { text } = JSON.parse(event.body);

    if (!text || text.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Input text cannot be empty." }),
      };
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Groq API key missing in environment configuration." }),
      };
    }

    // Call the Groq OpenAI-compatible API endpoint
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
          { role: "user", content: text },
        ],
        temperature: 0.9, // Higher variance forces more human-like unpredictability
      }),
    });

    if (!response.ok) {
      const errLog = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errLog.error?.message || "Failed to contact Groq API" }),
      };
    }

    const data = await response.json();
    const humanizedText = data.choices[0].message.content;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ humanizedText }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
