# ⚡ Quickstart — Maintenance Wizard

## 1. Run it locally (30 seconds)

```bash
cp .env.example .env.local
# Edit .env.local and put your Gemini API key:
#   GEMINI_API_KEY=AIza...

npm install
npm run dev
# → http://localhost:8080
```

## 2. Deploy to Google Cloud Run (one command)

```bash
chmod +x deploy.sh
PROJECT_ID=your-gcp-project GEMINI_API_KEY=AIza... ./deploy.sh
```

The script prints your live URL when done (something like
`https://maintenance-wizard-XXXXX-as.a.run.app`).

For full deploy options see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## 3. What you'll see

- **Plant Assets Telemetry Core** — 4 live steel-plant assets (blast furnace,
  caster, hot strip mill, coke-oven compressor).
- **Active Alarms Ticker** — severity-tagged alerts you can click to bind.
- **Agentic Diagnosis & Planning** — Gemini 2.5 Flash returns a structured
  JSON diagnosis: probable fault, RCA, RUL, priority, step-by-step plan, KB
  citations.
- **Interactive Troubleshooter** — multi-turn chat bound to the active asset.
- **Autopilot Daemon Console** — the server-side autonomous loop keeps running
  even with all browser tabs closed.

## 4. Verify the daemon is autonomous (the 10-second test)

```bash
URL=https://your-cloud-run-url
sleep 10
curl -s $URL/api/autopilot/events?limit=3 | jq '.events[0].ts'
# The timestamp keeps advancing on every poll — proof the server is doing work
# on its own, not driven by a browser.
```
