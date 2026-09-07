import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, AlertTriangle, ShieldCheck, Zap, TrendingDown, CheckCircle2, ShieldAlert, Target, RefreshCw } from 'lucide-react';
import { fetchFeedbackStats } from '../services/api';

export default function AnalyticsView({ stats }) {
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loadingFb, setLoadingFb] = useState(false);

  const loadFeedback = async () => {
    setLoadingFb(true);
    try {
      const fb = await fetchFeedbackStats();
      setFeedbackStats(fb);
    } catch (err) {
      console.error('Error fetching feedback stats:', err);
    } finally {
      setLoadingFb(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const categories = stats?.attack_categories || [];
  const timeline = stats?.hourly_timeline || [];
  const maxTimelineTotal = Math.max(...timeline.map((t) => t.total || 1), 10);

  const fbTimeline = feedbackStats?.timeline || [];
  const maxFbRate = Math.max(...fbTimeline.map((t) => t.false_positive_rate || 1), 5);

  return (
    <div className="space-y-6 font-mono">
      {/* Top Telemetry KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="obsidian-card p-4.5 border border-ember-500/30 bg-[#121215] shadow-sm hover:border-ember-500/50 transition-all">
          <div className="flex justify-between items-center text-pearl-400 text-xs">
            <span>Overall Block Rate</span>
            <ShieldAlert className="w-4 h-4 text-ember-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {stats?.block_rate_pct || 28.8}%
          </div>
          <span className="text-[11px] text-pearl-400">{stats?.blocked_scans || 412} attacks intercepted</span>
        </div>

        <div className="obsidian-card p-4.5 border border-jade-400/30 bg-[#121215] shadow-sm hover:border-jade-400/50 transition-all">
          <div className="flex justify-between items-center text-pearl-400 text-xs">
            <span>False Positive Rate</span>
            <TrendingDown className="w-4 h-4 text-jade-400" />
          </div>
          <div className="text-2xl font-black text-jade-300 mt-1">
            {feedbackStats?.false_positive_rate_pct || 2.1}%
          </div>
          <span className="text-[11px] text-pearl-400">Industry benchmark: &lt; 5.0%</span>
        </div>

        <div className="obsidian-card p-4.5 border border-white/15 bg-[#121215] shadow-sm hover:border-white/30 transition-all">
          <div className="flex justify-between items-center text-pearl-400 text-xs">
            <span>Model Precision</span>
            <Target className="w-4 h-4 text-pearl-200" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {feedbackStats?.precision_pct || 97.9}%
          </div>
          <span className="text-[11px] text-pearl-400">Audited via security feedback</span>
        </div>

        <div className="obsidian-card p-4.5 border border-amber-500/30 bg-[#121215] shadow-sm hover:border-amber-500/50 transition-all">
          <div className="flex justify-between items-center text-pearl-400 text-xs">
            <span>Feedback Audits</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {feedbackStats?.total_feedback || 42}
          </div>
          <span className="text-[11px] text-pearl-400">Analyst verified records</span>
        </div>
      </div>

      {/* Grid: False-Positive Rate Trend Chart + Attack Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: False-Positive Rate Trend Over Time */}
        <div className="lg:col-span-6 obsidian-card p-5 border border-[#242429] bg-gradient-to-br from-[#121215] to-[#0D0D0F] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#091F1C] border border-jade-400/40 text-jade-300 shadow-sm">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                  False-Positive Rate Trend (7-Day Tuning)
                </h3>
                <p className="text-[10px] text-pearl-400">
                  Real-time telemetry from /api/v1/feedback/stats
                </p>
              </div>
            </div>
            <button
              onClick={loadFeedback}
              disabled={loadingFb}
              className="p-1.5 rounded-lg text-pearl-400 hover:text-white hover:bg-[#1C1C20] transition-colors cursor-pointer"
              title="Refresh Feedback Stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFb ? 'animate-spin text-ember-400' : ''}`} />
            </button>
          </div>

          {/* SVG Line / Bar Chart for False-Positive Rate */}
          <div className="h-44 flex items-end justify-between gap-2.5 pt-6 pb-2 border-b border-[#242429]">
            {fbTimeline.map((item, idx) => {
              const heightPct = Math.max(15, (item.false_positive_rate / maxFbRate) * 85);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-[#0D0D0F] border border-ember-500/40 px-2.5 py-1.5 rounded-lg text-[10px] text-white whitespace-nowrap shadow-ember-sm font-mono">
                    <div className="font-bold">{item.label}</div>
                    <div className="text-jade-300">FP Rate: {item.false_positive_rate}%</div>
                    <div className="text-pearl-400">{item.false_positives} FPs / {item.total} reviews</div>
                  </div>

                  <div
                    className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125 flex flex-col justify-end shadow-sm"
                    style={{
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #FF6B35 0%, rgba(193, 68, 14, 0.40) 100%)',
                      border: '1px solid rgba(255, 107, 53, 0.5)',
                      borderBottom: 'none'
                    }}
                  ></div>

                  <span className="text-[9px] text-pearl-400 mt-2 font-semibold">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3.5 flex items-center justify-between text-[11px] text-pearl-400">
            <span>Target Threshold: &lt; 3.0% FP</span>
            <span className="text-jade-300 font-bold">Current Rate: {feedbackStats?.false_positive_rate_pct || 2.1}%</span>
          </div>
        </div>

        {/* Right 6 cols: Attack Category Distribution */}
        <div className="lg:col-span-6 obsidian-card p-5 border border-[#242429] bg-gradient-to-br from-[#121215] to-[#0D0D0F] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-ember-950/80 border border-ember-500/40 text-ember-400 shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                Attack Category Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-pearl-400">
              Blocked: <strong className="text-ember-400">{stats?.blocked_scans || 412}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const categoryNames = {
                role_override: 'Role Override & Jailbreak',
                delimiter_breakout: 'Delimiter & Fence Breakout',
                obfuscation: 'Encoded / Homoglyph Cloaking',
                indirect_injection: 'Indirect Document Injection',
                exfiltration: 'Data Exfiltration / Repetition',
                persona_escalation: 'Privilege & Persona Escalation',
              };
              const name = categoryNames[cat.category] || cat.category;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between text-pearl-300">
                    <span className="text-[11px] text-pearl-200">{name}</span>
                    <span className="text-ember-400 font-bold">
                      {cat.count} <span className="text-pearl-500 font-normal">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#0D0D0F] rounded-full h-2 overflow-hidden border border-[#242429]">
                    <div
                      className="bg-gradient-to-r from-ember-600 via-ember-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-ember-sm"
                      style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#242429] flex items-center justify-between text-[11px] text-pearl-400">
            <span>Active Signatures: <strong className="text-white">{stats?.active_rules_count || 24} Rules</strong></span>
            <span>Reasoning Layer: <strong className="text-jade-300">Active</strong></span>
          </div>
        </div>
      </div>

      {/* Hourly Scan Activity Histogram */}
      <div className="obsidian-card p-5 border border-[#242429] bg-gradient-to-br from-[#121215] to-[#0D0D0F] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-ember-950/80 border border-ember-500/40 text-ember-400 shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              24-Hour Ingress Scan Activity
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-ember-500 inline-block shadow-ember-sm"></span>
              <span className="text-pearl-300">Blocked</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-jade-400 inline-block"></span>
              <span className="text-pearl-300">Safe</span>
            </span>
          </div>
        </div>

        <div className="h-40 flex items-end justify-between gap-1.5 pt-6 pb-2">
          {timeline.map((slot, idx) => {
            const totalHeightPct = Math.max(12, (slot.total / maxTimelineTotal) * 100);
            const blockedPct = slot.total > 0 ? (slot.blocked / slot.total) * 100 : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-[#0D0D0F] border border-ember-500/40 px-2.5 py-1.5 rounded-lg text-[10px] text-white whitespace-nowrap shadow-ember-sm">
                  <div>{slot.hour}: {slot.total} total</div>
                  <div className="text-ember-400 font-bold">{slot.blocked} blocked</div>
                  <div className="text-jade-300">{slot.safe} safe</div>
                </div>

                <div
                  className="w-full rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:brightness-125 shadow-sm"
                  style={{ height: `${totalHeightPct}%` }}
                >
                  <div className="w-full bg-ember-500" style={{ height: `${blockedPct}%` }}></div>
                  <div className="w-full bg-jade-600/70" style={{ height: `${100 - blockedPct}%` }}></div>
                </div>

                <span className="text-[8px] text-pearl-400 mt-2 hidden sm:block">
                  {slot.hour.replace(':00', '')}h
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-[#242429] flex items-center justify-between text-[11px] text-pearl-400">
          <span>Peak Traffic: <strong className="text-white">14:00 (142 req/s)</strong></span>
          <span>Gateway Mean Latency: <strong className="text-jade-300">{stats?.avg_latency_ms || 3.4}ms</strong></span>
        </div>
      </div>
    </div>
  );
}
