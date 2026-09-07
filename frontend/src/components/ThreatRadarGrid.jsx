import React from 'react';
import { Shield, Radar, AlertTriangle, CheckCircle, Flame, Radio } from 'lucide-react';

export default function ThreatRadarGrid({ stats }) {
  const total = stats?.total_scans || 1428;
  const blocked = stats?.blocked_scans || 412;
  const suspicious = stats?.suspicious_scans || 86;
  const safe = total - blocked - suspicious;

  const blockRate = stats?.block_rate_pct || 28.8;

  return (
    <div className="obsidian-card p-5 border border-[#22222E] bg-gradient-to-br from-[#14141D] to-[#0E0E14] relative overflow-hidden shadow-sm">
      {/* Background ambient radar glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-ember-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-ember-950/70 border border-ember-500/40 text-ember-400 shadow-ember-sm">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black font-mono text-white uppercase tracking-wider">
              Autonomous Threat Intercept Radar
            </h3>
            <p className="text-[11px] text-pearl-400">
              Real-time heuristic spectrum & vector space monitor
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-jade-950/80 text-jade-300 border border-jade-500/50 flex items-center space-x-1 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-ping"></span>
          <span>GRID SECURE</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
        {/* Left: Interactive SVG Radar Circle */}
        <div className="md:col-span-5 flex justify-center items-center py-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border border-[#262634]"></div>
            <div className="absolute inset-4 rounded-full border border-ember-500/20 border-dashed"></div>
            <div className="absolute inset-10 rounded-full border border-[#262634]"></div>
            <div className="absolute inset-16 rounded-full border border-ember-500/30"></div>
            <div className="absolute inset-22 rounded-full border border-[#262634]"></div>

            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-[#262634]"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px bg-[#262634]"></div>
            </div>

            {/* Rotating radar scanner line */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="w-full h-full radar-scanner-line"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(255, 107, 53, 0) 0deg, rgba(255, 107, 53, 0) 270deg, rgba(255, 107, 53, 0.4) 360deg)'
                }}
              ></div>
            </div>

            {/* Threat Blips */}
            <div className="absolute top-10 right-10 w-2.5 h-2.5 rounded-full bg-ember-500 shadow-ember-sm animate-pulse" title="Blocked: Role Override"></div>
            <div className="absolute bottom-12 left-8 w-2 h-2 rounded-full bg-ember-500 shadow-ember-sm" title="Blocked: Base64 Obfuscation"></div>
            <div className="absolute top-14 left-12 w-2 h-2 rounded-full bg-amber-400" title="Suspicious: Delimiter Probe"></div>
            <div className="absolute bottom-8 right-12 w-2 h-2 rounded-full bg-jade-400" title="Safe Query"></div>

            {/* Center Core */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-ember-500 via-ember-600 to-ember-800 flex items-center justify-center shadow-ember-sm border border-ember-300/40">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Right: SOC Status Telemetry Breakdown */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#101017] border border-[#22222E]">
              <div className="text-pearl-400 text-[10px] uppercase">Shield Rate</div>
              <div className="text-lg font-black text-white flex items-baseline space-x-1 mt-0.5">
                <span className="text-ember-400">100%</span>
                <span className="text-[10px] text-pearl-400">Intercept</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#101017] border border-[#22222E]">
              <div className="text-pearl-400 text-[10px] uppercase">Target SLA</div>
              <div className="text-lg font-black text-white flex items-baseline space-x-1 mt-0.5">
                <span className="text-jade-400">&lt; 7ms</span>
                <span className="text-[10px] text-pearl-400">Real-Time</span>
              </div>
            </div>
          </div>

          {/* Progress bar metrics */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-pearl-300 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-ember-500 shadow-ember-sm"></span>
                <span>Threat Block Rate</span>
              </span>
              <span className="text-ember-400 font-bold">{blockRate}%</span>
            </div>
            <div className="w-full bg-[#101018] h-2 rounded-full overflow-hidden p-0.5 border border-[#22222E]">
              <div
                className="bg-gradient-to-r from-ember-600 via-ember-500 to-amber-400 h-full rounded-full transition-all duration-700 shadow-ember-sm"
                style={{ width: `${Math.min(blockRate * 2.5, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Quick status row */}
          <div className="pt-2.5 border-t border-[#22222E] flex items-center justify-between text-[11px] font-mono text-pearl-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-ember-500"></span>
              <span className="text-white font-semibold">{blocked} Neutralized</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-jade-400"></span>
              <span className="text-jade-300 font-semibold">0 Tokens Lost</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
