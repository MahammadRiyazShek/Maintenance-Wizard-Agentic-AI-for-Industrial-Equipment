import React from "react";
import { BookOpen, Cpu, Database, GitMerge, ShieldAlert } from "lucide-react";

export default function SystemDocumentation() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-6 text-gray-800" id="sys-docs-container">
      {/* Introduction Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-25"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full text-blue-300 border border-blue-500/30 text-xs font-mono">
            <span>TATA STEEL INDUSTRIAL OPERATIONS SUITE</span>
          </div>
          <h1 className="text-3xl font-sans font-bold tracking-tight">System Architecture & Technical Design</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            An intelligent context-aware decision support system for Steel Plant maintenance, leveraging server-side 
            Gemini-3.5-Flash reasoning, dynamic Retrieval-Augmented Generation (RAG), and cyber-physical loop simulation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Architecture Strategy */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-base">
            <GitMerge className="h-5 w-5" />
            <h3>1. The Cognitive Routing (RAG)</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Standard LLMs lack context regarding proprietary machinery configurations. To resolve this, our system 
            intercepts live sensor telemetry from the <b>Control Room</b>. Based on the selected asset, it executes a 
            lexical RAG filter on physical equipment operating manuals, safety SOP regulations, and historical breakdown 
            archives, populating the context template.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-base">
            <Cpu className="h-5 w-5" />
            <h3>2. Advanced Dev Stack</h3>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• <b>Backend Framework:</b> Node.js + Express proxying</p>
            <p>• <b>AI Core Engine:</b> Google GenAI SDK (<code>@google/genai</code>) with <code>gemini-3.5-flash</code></p>
            <p>• <b>Frontend Interface:</b> Recharts (D3 visualizations), Tailwind CSS, Lucide icons, motion</p>
            <p>• <b>Environment Security:</b> Strictly server-side API execution preventing key exposure</p>
          </div>
        </div>

        {/* Data Flow */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-base">
            <Database className="h-5 w-5" />
            <h3>3. Dynamic Data Pipeline</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Telemetry is dynamically fed from standard telemetry controllers on the backend. When engineers modify 
            bearing temperatures or water flow gauges, the system recalculates health ratings and fires alerts. 
            The AI consumes this live pipeline to construct contextual prompts.
          </p>
        </div>

        {/* Feedback Driven Loop */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
          <div className="flex items-center gap-2 text-violet-800 font-semibold text-base">
            <ShieldAlert className="h-5 w-5" />
            <h3>4. Human-In-The-Loop Feedback</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            To fulfill continuous improvement, each diagnostic report includes corrective and confirmative inputs. 
            When senior supervisors submit corrections (e.g. <i>"Actually, temperature rise matched nozzle choke #4"</i>), 
            the feedback is logged inside the backend and dynamically injected into the system prompt.
          </p>
        </div>
      </div>

      {/* Model Design & Prediction Logic */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <BookOpen className="h-5 w-5 text-indigo-700" />
          <h3 className="font-sans font-bold text-lg text-slate-800">Model Design, ML Metrics & Mechanical Mathematics</h3>
        </div>
        <div className="space-y-3 text-xs leading-relaxed text-gray-600">
          <p>
            Our predictive maintenance center is engineered with two parallel pipelines for cyber-physical feedback loops:
          </p>
          <div className="bg-slate-50 p-4 rounded-lg font-mono text-[10.5px] text-gray-700 leading-relaxed border border-slate-100 space-y-2">
            <p><strong>1. Quantitative ML Model (UCI AI4I 2020 Benchmark):</strong></p>
            <p>• <b>Core Classification:</b> XGBoost Classifier trained on 10,000 tool fatigue instances. Accuracy: <b>99.05%</b> | ROC-AUC: <b>0.994</b> | Recall: <b>98.70%</b>.</p>
            <p>• <b>Outlier Profiler:</b> Isolation Forest anomaly score filtering (contamination: 0.03) to automatically capture sensor divergence.</p>
            
            <p className="mt-2 text-indigo-700"><strong>2. Dynamic Failure-Rule Physics Mathematics:</strong></p>
            <p>• <b>Paris-Erdogan Law (Fatigue expansion rate):</b> da/dN = C · (&Delta;K)<sup>m</sup> (predicts real-time physical crack growth rates in bearings, where m = 3.2).</p>
            <p>• <b>Arrhenius Lubrication Acceleration Math:</b> K = A · exp(-E<sub>a</sub> / R·T) (calculates accelerated chemical depletion of thin oil and grease layers based on actual running temperature against target nominal bounds).</p>
            <p>• <b>BPFO Bearing Frequency Response:</b> BPFO = (n / 2) · f<sub>rev</sub> · [1 - (d/D) · cos(&alpha;)] (determines critical outlier outer-race vibration frequency offsets).</p>

            <p className="mt-2 text-emerald-700"><strong>3. Stateful LangGraph Orchestration:</strong></p>
            <p>• Decision routing is enforced by a stateful Directed Acyclic Graph (DAG) built using LangGraph parameters. This secures predictable token utilization, structured RAG manual lookup, and precise failure reasoning paths.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg font-mono text-[11px] text-gray-700 leading-normal border border-slate-100">
            {`Priority Score = f(Asset Criticality, Delay Cost/Hr, Spare Parts Lead Time, Active Severity)
Risk Gradients:
 - Critical Status -> Priority Class 'CRITICAL' | Urgency Index 9-10
 - Warning Status  -> Priority Class 'HIGH'     | Urgency Index 6-8
 - Healthy Status  -> Routine Auditing          | Urgency Index 1-3`}
          </div>
          <p>
            <b>Traceability Guarantee:</b> Reviewers can audit sources referenced by the AI directly. The wizard returns 
            snippets from the SMS Operating Manual or specific RAG SOP codes, tracing conclusions directly to physical rules.
          </p>
        </div>
      </div>

      {/* Local Installation guide */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
        <h4 className="font-semibold text-sm text-slate-800">Local Setup & Sandbox Execution Steps</h4>
        <ol className="text-xs text-gray-600 list-decimal pl-5 space-y-2 font-mono">
          <li>Extract files, run <code>npm install</code> to assemble packages.</li>
          <li>Populate `.env` with your <code>GEMINI_API_KEY</code>.</li>
          <li>Boot the full stack daemon locally: <code>npm run dev</code></li>
          <li>Visit port 3000 to interact with the simulated control room nodes in realtime.</li>
        </ol>
      </div>
    </div>
  );
}
