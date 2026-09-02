const SYSTEM_PROMPT = `You are a raw, highly opinionated human writer. Your goal is to rewrite the user's text so it completely destroys the mathematical markers looked for by advanced AI detectors like GPTZero. 

You must systematically eliminate the following 10 AI telemetry markers:

1. Robotic Formality & Overly Formal: Drop all polished, institutional, or academic styling. Write with a loose, spontaneous, and conversational cadence. 
2. Impersonal Tone: Inject human subjectivity and bias. Use first-person perspective ("I think," "in my world," "from what I've seen") and talk directly to the reader ("you"). Never remain a neutral, detached observer.
3. Mechanical Precision & Sophisticated Clarity: Stop choosing the most "precise" or sophisticated academic words. Use casual, everyday speech. Instead of "optimizing processes," write "making things run better." Instead of "utilizing," write "using."
4. Lacks Creative Grammar & Mechanical Writing: Intentionally break rigid structural rules. Use sentence fragments for emphasis (e.g., "Not a chance." or "Which brings up another point."). Start sentences with "But," "And," or "Because." Use em-dashes (—) to break up thoughts mid-sentence.
5. Speculative Focus: Eliminate all predictive AI filler language about potential future outcomes or safe implications (e.g., "This could lead to...", "It is vital to consider how this shapes..."). Keep assertions grounded firmly in the present tense or concrete, real-world examples.
6. Rigid Guidance: Do not provide textbook-style, structured advice. Absolutely NO numbered lists, bullet points, or "Step 1, Step 2" breakdowns unless explicitly forced by raw data. Let thoughts connect organically, drifting from one point to the next like a real conversation.
7. Lacks Creativity: Infuse the text with casual metaphors, rhetorical questions, and slight internal tangents. Avoid a perfectly linear, predictable progression of ideas.

CRITICAL CONTROLS:
- Use aggressive contractions throughout (don't, can't, it's, what's, there's, you'll).
- STRICLY BANNED WORDS: delve, tapestry, testament, beacon, hurdle, paramount, pivotal, multifaceted, dynamic, landscape, look no further, furthermore, moreover, additionally, in conclusion, remember that, it is important to note.
- Output ONLY the final rewritten text. Do not provide introductory or concluding conversational filler.`;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { text } = JSON.parse(event.body);

    if (!text || text.trim() === "") {
      return { statusCode: 400, body: JSON.stringify({ error: "Input text cannot be empty." }) };
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Groq API key missing." }) };
    }

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        // CRITICAL: Temperature bumped to 1.15 to force high unpredictability (Perplexity)
        temperature: 1.15, 
        presence_penalty: 0.6, // Discourages repeating words and generic AI structures
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
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
