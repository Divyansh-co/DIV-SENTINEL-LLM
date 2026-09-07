import React, { useState, useEffect } from 'react';
import { Flame, Shield, Terminal, Zap, ArrowRight, RefreshCw, CheckCircle2, AlertOctagon, Info, Cpu, Layers, Eye, ShieldAlert, Sparkles, Copy, Check, Trash2, Plus, CornerDownRight } from 'lucide-react';
import VerdictBadge from './VerdictBadge';
import Button from './ui/Button';
import { analyzePrompt, fetchPresetAttacks } from '../services/api';

export default function AttackPlayground({ onScanCompleted }) {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContextField, setShowContextField] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPresetAttacks().then((data) => {
      setPresets(data);
      if (data.length > 0 && !prompt) {
        setPrompt(data[0].prompt);
      }
    });
  }, []);

  const handleSelectPreset = (preset) => {
    setPrompt(preset.prompt);
    setContext(preset.context || '');
    if (preset.context) setShowContextField(true);
    setScanResult(null);
  };

  const handleRunScan = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await analyzePrompt(prompt, context);
      setScanResult(result);
      if (onScanCompleted) {
        onScanCompleted(result);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearPrompt = () => {
    setPrompt('');
    setScanResult(null);
  };

  const categories = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'role_override', label: 'Role Override' },
    { id: 'delimiter_breakout', label: 'Delimiter Breakout' },
    { id: 'obfuscation', label: 'Obfuscation & Ciphers' },
    { id: 'indirect_injection', label: 'Indirect Injection' },
    { id: 'persona_escalation', label: 'Persona Escalation' },
    { id: 'benign', label: 'Benign Controls' },
  ];

  const filteredPresets = selectedCategory === 'all'
    ? presets
    : presets.filter((p) => p.category === selectedCategory);

  const isBlocked = scanResult?.verdict === 'BLOCKED';
  const isSuspicious = scanResult?.verdict === 'SUSPICIOUS';
  const isSafe = scanResult?.verdict === 'SAFE';

  // Threat score as integer 0-100
  const riskPercentage = scanResult ? Math.round(scanResult.risk_score * 100) : null;

  return (
    <div className="space-y-6">
      {/* Top Window Mockup Container (Modeled after NOVA 3.0 Dashboard Window) */}
      <div className="rounded-2xl bg-[#0B0B12] border border-pearl-500/15 shadow-2xl overflow-hidden">
        {/* Window Top Bar with 3 Window Control Dots (red, amber, green) */}
        <div className="px-4 py-3 bg-[#121215] border-b border-[#242429] flex items-center justify-between text-xs text-pearl-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ember-600 inline-block shadow-sm" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-jade-400 inline-block" />
            </div>
            <span className="font-mono text-[11px] text-pearl-400 ml-2 font-semibold">
              sentinel-gateway / core-engine / prompt-sanitizer
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-jade-400 animate-pulse" />
            <span className="text-jade-300 font-bold">Defense Grid Operational</span>
          </div>
        </div>

        {/* Preset Selector Header Inside Window */}
        <div className="p-5 border-b border-[#242429] bg-[#0D0D0F]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-ember-500/15 border border-ember-500/30 text-ember-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight font-mono uppercase">
                  Adversarial Preset Vectors
                </h3>
                <p className="text-[11px] text-pearl-400">
                  Select a pre-configured attack vector or enter your own custom prompt buffer below.
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-[11px] px-3 py-1 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-ember-600 to-ember-500 text-white shadow-ember-sm font-semibold'
                      : 'bg-[#161618] text-pearl-400 hover:text-white hover:bg-[#1C1C20] border border-[#242429]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Attack Chips */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
            {filteredPresets.map((preset) => {
              const isBenign = preset.category === 'benign';
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#121215] hover:bg-[#161618] border border-[#242429] hover:border-ember-500/50 text-pearl-300 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isBenign ? 'bg-jade-400' : 'bg-ember-500 shadow-ember-sm'}`} />
                  <span className="font-mono text-[11px] font-medium text-pearl-200 group-hover:text-white">
                    {preset.name}
                  </span>
                  <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isBenign ? 'text-jade-300 bg-[#091F1C] border border-jade-400/30' : 'text-ember-300 bg-ember-950/80 border border-ember-500/40'
                  }`}>
                    {preset.severity || 'TEST'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Application Dashboard Grid: Left Buffer (7 cols), Right Telemetry (5 cols) */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-left bg-[#08080A]">
          {/* Left Column: Buffer & Prompt Input */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-[#242429] overflow-hidden bg-[#121215] shadow-sm">
              {/* Buffer Bar */}
              <div className="px-4 py-2.5 bg-[#161618] border-b border-[#242429] flex items-center justify-between text-xs font-mono">
                <span className="text-pearl-300 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-ember-400" />
                  payload-buffer://raw-input
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-pearl-400 text-[11px]">{prompt.length} chars</span>
                  <button
                    onClick={clearPrompt}
                    className="text-pearl-400 hover:text-ember-400 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                    title="Clear input"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                  <button
                    onClick={copyPrompt}
                    className="text-pearl-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                    title="Copy Prompt"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-jade-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="p-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={7}
                  placeholder="Type or paste prompt injection attack payload, jailbreak string, or benign query..."
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none resize-y selection:bg-ember-500/40 leading-relaxed placeholder-pearl-500"
                />

                {/* Optional Context Field */}
                {showContextField && (
                  <div className="mt-3 pt-3 border-t border-[#242429]">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-pearl-400 uppercase">
                        External Untrusted Context (RAG Document / Scraped Web Text)
                      </label>
                      <button
                        onClick={() => setShowContextField(false)}
                        className="text-[10px] font-mono text-pearl-400 hover:text-white cursor-pointer"
                      >
                        Hide Context
                      </button>
                    </div>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={3}
                      placeholder="Enter secondary context to test indirect injection attacks..."
                      className="w-full bg-[#0D0D0F] p-3 rounded-lg border border-[#242429] text-white font-mono text-xs focus:outline-none focus:border-ember-500/60"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="px-4 py-3 bg-[#161618] border-t border-[#242429] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowContextField(!showContextField)}
                  className="text-xs font-mono text-pearl-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-ember-400" />
                  <span>{showContextField ? 'Remove Context' : 'Add Context (RAG/Doc)'}</span>
                </button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRunScan}
                  disabled={loading || !prompt.trim()}
                  icon={loading ? RefreshCw : Shield}
                  className="shadow-ember-glow"
                >
                  {loading ? 'INSPECTING PACKET...' : 'INTERCEPT & INSPECT PROMPT'}
                </Button>
              </div>
            </div>

            {/* Token Protection Card */}
            <div className="p-3.5 rounded-xl bg-[#121215] border border-[#242429] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-ember-400" />
                <div>
                  <span className="text-pearl-400">Downstream Model Shield: </span>
                  <span className="text-white font-semibold">Zero Adversarial Tokens Ingested</span>
                </div>
              </div>
              <span className="text-jade-300 font-bold px-2.5 py-0.5 rounded-full bg-[#091F1C] border border-jade-400/40 text-[11px]">
                100% LLM TOKENS SAVED
              </span>
            </div>
          </div>

        {/* Right Column: Real-Time Threat Inspection HUD (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {scanResult ? (
            <div className={`obsidian-card p-5 border transition-all ${
              isBlocked ? 'border-ember-500/80 shadow-ember-sm blocked-ember-border' : isSuspicious ? 'border-amber-500/60' : 'border-jade-400/60'
            }`}>
              {/* Verdict Header with Risk Score Gauge */}
              <div className="flex items-center justify-between pb-4 border-b border-[#242429]">
                <div>
                  <span className="text-[10px] font-mono text-pearl-400 uppercase tracking-wider block mb-1">
                    Firewall Decision
                  </span>
                  <VerdictBadge verdict={scanResult.verdict} size="lg" pulse={isBlocked} />
                </div>

                {/* Circular Threat Risk Gauge */}
                <div className="text-center font-mono">
                  <div className="text-[10px] text-pearl-400 uppercase">Risk Level</div>
                  <div className={`text-2xl font-black ${
                    isBlocked ? 'text-ember-400' : isSuspicious ? 'text-amber-400' : 'text-jade-400'
                  }`}>
                    {riskPercentage}/100
                  </div>
                </div>
              </div>

              {/* Threat Details */}
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-[#121215] border border-[#242429]">
                  <div className="text-pearl-400 text-[10px] uppercase mb-1">Firewall Reasoning</div>
                  <div className="text-white text-xs leading-relaxed font-sans">
                    {scanResult.reasoning}
                  </div>
                </div>

                {/* Threat Category & Latency telemetry */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#121215] border border-[#242429]">
                    <div className="text-pearl-400 text-[10px] uppercase">Attack Vector</div>
                    <div className="text-white font-bold text-xs mt-0.5 uppercase">
                      {scanResult.threat_category || 'Benign / None'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#121215] border border-[#242429]">
                    <div className="text-pearl-400 text-[10px] uppercase">Execution Speed</div>
                    <div className="text-jade-400 font-bold text-xs mt-0.5">
                      {scanResult.latency_ms} ms
                    </div>
                  </div>
                </div>

                {/* Layer Triggered Highlight */}
                <div className="p-3.5 rounded-xl bg-[#121215] border border-[#242429]">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-pearl-400 uppercase">Interception Layer</span>
                    <span className="text-ember-400 font-bold">{scanResult.layer_triggered || 'None (Passed All Clean)'}</span>
                  </div>

                  {/* Matched Patterns */}
                  {scanResult.matches && scanResult.matches.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="text-[10px] text-pearl-400 uppercase">Matched Signatures:</div>
                      {scanResult.matches.map((m, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#161618] text-[11px] text-ember-300 border border-ember-500/30">
                          &bull; {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Decoded Obfuscation Inspector if available */}
                {scanResult.decoded_text && scanResult.decoded_text !== scanResult.original_text && (
                  <div className="p-3.5 rounded-xl bg-ember-950/40 border border-ember-500/50">
                    <div className="flex items-center space-x-1.5 text-ember-300 text-[11px] font-bold mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-ember-400" />
                      <span>Decoded Cloaked Payload Buffer</span>
                    </div>
                    <p className="text-[11px] text-pearl-200 bg-[#0D0D0F] p-2.5 rounded-lg border border-[#242429] break-all font-mono">
                      {scanResult.decoded_text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="obsidian-card p-8 border border-[#242429] text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-14 h-14 rounded-2xl bg-[#161618] border border-ember-500/30 flex items-center justify-center mb-3.5 text-ember-400 shadow-ember-sm">
                <Terminal className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-mono font-bold text-white mb-1.5">
                Ready for Payload Inspection
              </h3>
              <p className="text-xs text-pearl-400 max-w-xs leading-relaxed">
                Choose an adversarial attack vector from above or enter custom test text, then click "Intercept & Inspect Prompt".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
