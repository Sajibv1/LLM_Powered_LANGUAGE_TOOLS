// functions/grammar.js
const fetch = require('node-fetch'); // Ensure you run: npm install node-fetch

exports.handler = async (event, context) => {
    // 1. Handle CORS (Cross-Origin Resource Sharing)
    const headers = {
        'Access-Control-Allow-Origin': '*', // Allow requests from any domain
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { text } = JSON.parse(event.body);
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'API key not configured' }),
            };
        }

        if (!text) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing text parameter' }),
            };
        }

        // 2. The Logic: Grammar specific prompting
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Using a versatile model good at language tasks
                model: 'openai/gpt-oss-120b',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert copy editor. Your goal is to fix grammatical errors, spelling mistakes, and awkward phrasing.'
                    },
                    {
                        role: 'user',
                        content: `Please correct the grammar and spelling of the following text. 
                        Do not change the underlying meaning or the tone. 
                        Do not add any conversational filler (like "Here is the corrected text"). 
                        Just provide the corrected version.
                        
                        Text: "${text}"`
                    }
                ],
                temperature: 0.1, // Low temperature for precision
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Groq API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const correctedText = data.choices[0]?.message?.content?.trim() || '';

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ corrected: correctedText }),
        };

    } catch (error) {
        console.error('Server Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process text' }),
        };
    }
};
