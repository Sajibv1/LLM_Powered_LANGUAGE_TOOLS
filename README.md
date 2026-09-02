# Language Tools

A free collection of AI-powered language utilities, deployed at
[translatedby-ai.netlify.app](https://translatedby-ai.netlify.app/). No sign-up,
no stored text — paste something in, get something better out.

Built as a set of static pages on top of [Netlify Functions](https://docs.netlify.com/functions/),
with the LLM work done by models served through [Groq](https://groq.com/).

## The tools

| Tool | What it does |
|---|---|
| [Translate](https://translatedby-ai.netlify.app/translate) | Move text between 16 languages, keeping tone and context. PDF export included. |
| [Fix grammar](https://translatedby-ai.netlify.app/grammerfixer) | Correct English grammar, spelling, and punctuation without changing your voice. |
| [Humanize](https://translatedby-ai.netlify.app/humanize) | Rewrite AI-generated text so it reads like a person wrote it. |
| [Clean symbols](https://translatedby-ai.netlify.app/sremover) | Strip asterisks and hashtags from pasted text — runs entirely in the browser. |
| [Practice English](https://translatedby-ai.netlify.app/chat) | Chat with a tutor that keeps the conversation going and quietly corrects mistakes. |

## How it's built

- **Frontend** — plain HTML/CSS/JS, no framework. A shared design system
  ([`public/assets/site.css`](public/assets/site.css)) gives every page the same
  graph-paper workbench look, with one ink color per tool used for wayfinding.
  Light mode is the default; dark mode is a toggle, remembered per visitor.
- **Backend** — Netlify Functions in [`functions/`](functions/) call Groq's
  OpenAI-compatible chat completions endpoint (`openai/gpt-oss-120b`):
  - `translate.js` — translation between 16 languages
  - `grammar.js` — grammar correction
  - `humanize.js` — AI-text humanizing
  - `chat.js` — conversation tutoring with structured tool-call responses
- **`sremover.html`** needs no backend at all; the cleaning is a regex in the page.

## Project structure

```
public/            static pages (the publish directory)
  assets/          shared CSS + theme script
functions/         Netlify Functions (server-side Groq calls)
netlify.toml       build & deploy config
```

## Running locally

Serve the `public/` directory with any static server, and run the functions
with the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install -g netlify-cli
export GROQ_API_KEY=your_key_here
netlify dev
```

The `GROQ_API_KEY` environment variable must be set for the four AI tools;
the site expects it to be configured in Netlify's environment for deploys.

## Deploying

Pushes to `main` deploy automatically via Netlify. The publish directory is
`public/` and the functions live in `functions/`, both wired up in
[`netlify.toml`](netlify.toml).
