import React from 'react';
import { Shield, Lock, Search, Cpu, Zap, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Server } from 'lucide-react';

export default function DefensePipelineVisualizer({ lastResult }) {
  const isBlocked = lastResult?.verdict === 'BLOCKED';
  const isSuspicious = lastResult?.verdict === 'SUSPICIOUS';
  const isSafe = lastResult?.verdict === 'SAFE';

  return (
    <div className="obsidian-card p-5 border border-[#22222E] bg-gradient-to-br from-[#14141D] via-[#0E0E14] to-[#09090D] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-ember-950/70 border border-ember-500/40 text-ember-400 shadow-ember-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black font-mono text-white uppercase tracking-wider">
              Cascading 3-Layer Defense Pipeline
            </h3>
            <p className="text-[11px] text-pearl-400">
              Deterministic Zero-Trust packet inspection before downstream LLM execution
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#181824] border border-[#2A2A38] text-pearl-200">
            <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse"></span>
            <span>Gateway SLA: &lt; 7ms</span>
          </span>
        </div>
      </div>

      {/* Visual Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Step 1: Input Payload */}
        <div className="p-3.5 rounded-xl bg-[#101017] border border-[#22222E] flex flex-col justify-between relative group hover:border-[#38384C] transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-pearl-400 uppercase tracking-wider">Gateway Ingress</span>
              <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-[#181824] text-pearl-200 border border-[#282838]">REST / SDK</span>
            </div>
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-pearl-400" />
              <span className="text-xs font-bold text-white">Untrusted Payload</span>
            </div>
            <p className="text-[11px] text-pearl-400 mt-1">
              Sanitizes unicode, checks rate limits, starts distributed trace.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#22222E] flex items-center justify-between text-[10px] font-mono text-pearl-400">
            <span>Stage 0</span>
            <span className="text-jade-400 font-semibold">&lt; 0.2ms</span>
          </div>
        </div>

        {/* Step 2: Layer 1 Rules & Decoders */}
        <div className={`p-3.5 rounded-xl border transition-all relative ${
          isBlocked && lastResult?.layer_triggered === 'layer1'
            ? 'bg-gradient-to-b from-ember-950/60 to-[#101017] border-ember-500/80 shadow-ember-sm'
            : 'bg-[#101017] border-[#22222E] hover:border-ember-500/40'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-ember-400 uppercase tracking-wider font-bold">Layer 1 Heuristics</span>
              <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-ember-950/80 text-ember-300 border border-ember-500/40 font-bold">25+ REGEX</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-ember-400" />
              <span className="text-xs font-bold text-white">Rules & Decoders</span>
            </div>
            <p className="text-[11px] text-pearl-400 mt-1">
              Base64, Rot13, homoglyphs, role-overrides, delimiter breakouts.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#22222E] flex items-center justify-between text-[10px] font-mono">
            <span className="text-pearl-400">Deterministic Gate</span>
            <span className="text-ember-400 font-bold">&lt; 1.2ms</span>
          </div>
        </div>

        {/* Step 3: Layer 2 Vector Similarity */}
        <div className={`p-3.5 rounded-xl border transition-all relative ${
          isBlocked && lastResult?.layer_triggered === 'layer2'
            ? 'bg-gradient-to-b from-amber-950/60 to-[#101017] border-amber-500/80 shadow-sm'
            : 'bg-[#101017] border-[#22222E] hover:border-amber-500/40'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">Layer 2 Semantic</span>
              <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">COSINE VEC</span>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Vector Similarity</span>
            </div>
            <p className="text-[11px] text-pearl-400 mt-1">
              Sub-word & character n-gram cosine matching against jailbreaks.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#22222E] flex items-center justify-between text-[10px] font-mono">
            <span className="text-pearl-400">Paraphrase Catch</span>
            <span className="text-amber-400 font-bold">&lt; 3.8ms</span>
          </div>
        </div>

        {/* Step 4: Layer 3 Intent Reasoning */}
        <div className={`p-3.5 rounded-xl border transition-all relative ${
          (isSuspicious || (isBlocked && lastResult?.layer_triggered === 'layer3'))
            ? 'bg-gradient-to-b from-jade-950/60 to-[#101017] border-jade-500/80 shadow-sm'
            : 'bg-[#101017] border-[#22222E] hover:border-jade-500/40'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-jade-400 uppercase tracking-wider font-bold">Layer 3 Contextual</span>
              <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-jade-950/80 text-jade-300 border border-jade-500/40 font-bold">INTENT AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-jade-400" />
              <span className="text-xs font-bold text-white">Intent Reasoning</span>
            </div>
            <p className="text-[11px] text-pearl-400 mt-1">
              Disambiguates hostile injections from benign instructional context.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#22222E] flex items-center justify-between text-[10px] font-mono">
            <span className="text-pearl-400">Contextual Gate</span>
            <span className="text-jade-400 font-bold">Tiered</span>
          </div>
        </div>
      </div>

      {/* Dynamic verdict outcome banner */}
      {lastResult && (
        <div className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shadow-sm ${
          isBlocked
            ? 'bg-ember-950/50 border-ember-500/60 text-ember-200 shadow-ember-sm'
            : isSuspicious
            ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
            : 'bg-jade-950/50 border-jade-500/50 text-jade-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            {isBlocked ? (
              <ShieldAlert className="w-4 h-4 text-ember-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-jade-400 shrink-0" />
            )}
            <span>
              <strong className="text-white">PIPELINE VERDICT:</strong> {lastResult.verdict} — {lastResult.reasoning}
            </span>
          </div>
          <div className="text-[11px] font-bold text-right shrink-0 text-white">
            Latency: {lastResult.latency_ms}ms | Trigger: {lastResult.layer_triggered || 'None (Clean)'}
          </div>
        </div>
      )}
    </div>
  );
}
