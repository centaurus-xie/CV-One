# CV-One
A CV specialization tool.

## Environment

Create a local environment file before running the app:

```bash
cp .env.example .env.local
```

Then place your API keys in `.env.local`.

At minimum, you will likely need:

- `DATABASE_URL`
- either shared `LLM_API_URL` + `LLM_API_KEY`
- or `OPENAI_API_KEY` and optionally `OPENAI_MODEL`

Per-module `*_LLM_*` variables still work, but the code now supports a single shared key setup.

## Minimal run steps

```bash
cp .env.example .env.local
```

Then configure either:

```bash
LLM_API_URL="https://your-provider.example/v1/responses"
LLM_API_KEY="your-key"
LLM_MODEL="your-model"
```

or:

```bash
OPENAI_API_KEY="your-key"
OPENAI_MODEL="gpt-4.1-mini"
```

If a given LLM config is not present, the implementation usually falls back to a conservative non-LLM path where available.
