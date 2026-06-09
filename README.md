OPTION 1 — Use the Live Deployment (Recommended for reviewers)
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
   

OPTION 2 — Run Locally from Source
═══════════════════════════════════════════════════════════
Prerequisites: Node.js v18+, a Google Gemini API key

1. git clone https://github.com/MahammadRiyazShek/maintenance-wizard-agentic-ai-for-industrial-equipment.git
2. cd maintenance-wizard-agentic-ai-for-industrial-equipment
3. npm install
4. Create a file named  .env.local  in the project root with:
   GEMINI_API_KEY=your_gemini_api_key_here
5. npm run dev
6. Open http://localhost:5173 in your browser

Build for production:
  npm run build  &&  npm start

