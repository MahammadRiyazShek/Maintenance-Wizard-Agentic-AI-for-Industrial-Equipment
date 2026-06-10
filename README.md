<<<<<<< HEAD
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/282e859a-f4b6-482f-b818-1236dea4c9d8

## Run Locally

**Prerequisites:**  Node.js
=======
## Instructions to Run

OPTION 1 — Use the Live Deployment (Recommended)
═══════════════════════════════════════════════════════════
1. Open: https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/
2. Click any of the 4 plant asset nodes in the "Plant Assets Telemetry Core"
   panel (Blast Furnace #4, Caster #2, Hot Strip Mill, Coke Oven Compressor)
3. OR click an Active Alarm in the ticker (ALT-001 CRITICAL / ALT-002 MEDIUM)
   to bind diagnostic context to the chat
4. Use the "Interactive Troubleshooter" panel on the right to ask questions
   such as: "What's the recommended SOP for tuyere over-temperature?"
5. Inspect the "Agentic Diagnosis & Planning" panel for traceable SOP
   analysis and failure predictions
>>>>>>> 8a85f2a5dfe92c29e3f845711ffef53f611136aa


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
