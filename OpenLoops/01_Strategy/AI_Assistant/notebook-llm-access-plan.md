# Notebook LLM Access Plan

Date: 2026-02-28
Owner: Jordan + Aden
Status: Implemented (baseline local route)

## Goal
Enable reliable access to a local notebook-capable LLM from the working environment for drafting, analysis, and planning tasks.

---

## Environment Findings
- `ollama` binary is installed: `/usr/local/bin/ollama`
- Ollama server was initially not running
- Started Ollama server successfully
- Available models include (sample):
  - `qwen3:8b`
  - `gpt-oss:20b`
  - `mistral:latest`
  - cloud proxies (`kimi-k2.5:cloud`, `glm-5:cloud`, `minimax-m2.5:cloud`)
- Functional test executed:
  - `ollama run qwen3:8b "Reply with exactly: OLLAMA_OK"`
  - returned `OLLAMA_OK`

---

## Recommended Access Route (Primary)
### Route A — Ollama local API (recommended default)
Use Ollama as the local model runtime and call its HTTP API from scripts/agents.

- Base URL: `http://127.0.0.1:11434`
- Chat endpoint: `/api/chat`
- Generate endpoint: `/api/generate`

### Quick health check
```bash
curl -s http://127.0.0.1:11434/api/tags
```

### Quick generate test
```bash
curl -s http://127.0.0.1:11434/api/generate \
  -d '{"model":"qwen3:8b","prompt":"Say OLLAMA_OK","stream":false}'
```

---

## Operating Procedure
1. Start server if needed:
   ```bash
   ollama serve
   ```
2. Verify model inventory:
   ```bash
   ollama list
   ```
3. Run workload with preferred local model (`qwen3:8b` for speed, `gpt-oss:20b` for heavier tasks).
4. If local latency is too high, selectively route to cloud-tagged models.

---

## Model Routing Recommendation
- **Fast iteration / planning / indexing:** `qwen3:8b`
- **Higher-quality deep reasoning:** `gpt-oss:20b`
- **Fallback (if local resources constrained):** cloud-tagged models in Ollama list

---

## Security & Reliability Notes
- Keep API bound to localhost only.
- Avoid sending sensitive records to cloud-tagged models unless explicitly intended.
- Add a startup check in scripts to fail fast if Ollama server is down.

---

## Next Improvements
- Add wrapper script: `scripts/llm/local-ask.sh`
- Add model-selection policy file for automatic routing
- Add simple benchmark note (tokens/sec + quality notes)
