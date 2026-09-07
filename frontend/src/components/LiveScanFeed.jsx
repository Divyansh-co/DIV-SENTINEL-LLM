import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, ChevronRight, X, Clock, AlertTriangle, ShieldCheck, Flag, Search, Filter, Copy, Check, ShieldAlert } from 'lucide-react';
import VerdictBadge from './VerdictBadge';
import { fetchHistory } from '../services/api';

export default function LiveScanFeed({ onReportFeedback }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [filterVerdict, setFilterVerdict] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(50, 0, 'ALL');
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching live scan feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (!autoRefresh) return;
    const interval = setInterval(loadData, 3500);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  const copyPayload = (scan) => {
    navigator.clipboard.writeText(scan.prompt);
    setCopiedId(scan.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter = filterVerdict === 'ALL' || item.verdict === filterVerdict;
    const matchesSearch = !searchQuery.trim() || 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="obsidian-card border border-[#22222E] overflow-hidden flex flex-col h-full bg-[#101017] shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#242429] bg-[#121215] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex h-2.5 w-2.5">
            {autoRefresh && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember-400 opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ember-500"></span>
          </div>
          <h3 className="text-xs font-black font-mono text-white tracking-tight uppercase">
            Live Threat Stream & Ingress Feed
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Verdict Filter Buttons */}
          <div className="flex rounded-lg bg-[#0D0D0F] p-0.5 border border-[#242429] text-[10px] font-mono">
            {['ALL', 'BLOCKED', 'SUSPICIOUS', 'SAFE'].map((v) => (
              <button
                key={v}
                onClick={() => setFilterVerdict(v)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filterVerdict === v
                    ? 'bg-gradient-to-r from-ember-600 to-ember-500 text-white font-bold shadow-ember-sm'
                    : 'text-pearl-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-[10px] px-2.5 py-1 rounded-lg font-mono border transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-ember-950/80 text-ember-300 border-ember-500/50 font-bold shadow-sm'
                : 'bg-[#1C1C20] text-pearl-400 border-[#242429]'
            }`}
          >
            {autoRefresh ? 'STREAMING' : 'PAUSED'}
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-[#1C1C20] text-pearl-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#242429]"
            title="Refresh stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-ember-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-4 py-2.5 bg-[#121215] border-b border-[#242429] flex items-center space-x-2">
        <Search className="w-3.5 h-3.5 text-pearl-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter live stream by prompt substring, scan ID, or threat indicator..."
          className="w-full bg-transparent text-xs font-mono text-white placeholder-pearl-500 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-pearl-400 hover:text-white text-xs cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stream Items List */}
      <div className="divide-y divide-[#1C1C20] overflow-y-auto max-h-[520px]">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-pearl-400">
            No telemetry records match current filter criteria.
          </div>
        ) : (
          filteredItems.map((scan) => {
            const isBlocked = scan.verdict === 'BLOCKED';
            const isSuspicious = scan.verdict === 'SUSPICIOUS';
            return (
              <div
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className={`p-3.5 hover:bg-[#161618] transition-all cursor-pointer flex items-center justify-between group ${
                  isBlocked ? 'hover:border-l-2 hover:border-ember-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                  <div className="text-center font-mono shrink-0">
                    <span className="text-[10px] text-pearl-400 block">{formatTime(scan.timestamp)}</span>
                    <span className="text-[9px] text-pearl-500 font-mono">#{scan.id.substring(4, 9)}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <VerdictBadge verdict={scan.verdict} size="sm" pulse={isBlocked} />
                      <span className="text-[10px] font-mono text-pearl-400">
                        {scan.latency_ms}ms
                      </span>
                      {scan.layer_triggered && (
                        <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-ember-950/60 text-ember-300 uppercase border border-ember-500/30 font-semibold">
                          {scan.layer_triggered}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-pearl-200 font-mono truncate max-w-sm sm:max-w-md group-hover:text-white">
                      {scan.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPayload(scan);
                    }}
                    title="Copy payload"
                    className="p-1.5 rounded-lg text-pearl-400 hover:text-white hover:bg-[#1C1C20] transition-colors cursor-pointer"
                  >
                    {copiedId === scan.id ? <Check className="w-3.5 h-3.5 text-jade-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <ChevronRight className="w-4 h-4 text-pearl-500 group-hover:text-ember-400 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Slideover Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="obsidian-card p-6 border border-ember-500/50 w-full max-w-xl bg-[#121215] shadow-ember-lg relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#242429]">
              <div className="flex items-center space-x-2.5">
                <VerdictBadge verdict={selectedScan.verdict} size="md" pulse={selectedScan.verdict === 'BLOCKED'} />
                <span className="text-xs font-mono text-pearl-300 font-bold">Trace ID: {selectedScan.id}</span>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-pearl-400 hover:text-white p-1 rounded-lg hover:bg-[#1C1C20] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 font-mono text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] text-pearl-400 uppercase block mb-1.5">Submitted Prompt Payload</span>
                <div className="p-3.5 rounded-xl bg-[#0D0D0F] border border-[#242429] text-white text-xs break-all select-all font-mono leading-relaxed">
                  {selectedScan.prompt}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#161618] border border-[#242429]">
                  <span className="text-[10px] text-pearl-400 uppercase block mb-0.5">Calculated Threat Score</span>
                  <span className="text-white font-bold text-sm">{Math.round(selectedScan.risk_score * 100)} / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161618] border border-[#242429]">
                  <span className="text-[10px] text-pearl-400 uppercase block mb-0.5">Pipeline Latency</span>
                  <span className="text-jade-400 font-bold text-sm">{selectedScan.latency_ms} ms</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161618] border border-[#242429]">
                <span className="text-[10px] text-pearl-400 uppercase block mb-1">Defense Interception Rationale</span>
                <p className="text-pearl-100 text-xs font-sans leading-relaxed">{selectedScan.reasoning}</p>
              </div>

              {selectedScan.matches && selectedScan.matches.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#161618] border border-[#242429]">
                  <span className="text-[10px] text-pearl-400 uppercase block mb-1.5">Triggered Signatures & Indicators</span>
                  <div className="space-y-1.5">
                    {selectedScan.matches.map((m, idx) => (
                      <div key={idx} className="text-ember-300 text-[11px] p-2 rounded-lg bg-ember-950/50 border border-ember-500/30">
                        &bull; {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3.5 border-t border-[#242429] flex items-center justify-between">
                <button
                  onClick={() => {
                    const scan = selectedScan;
                    setSelectedScan(null);
                    if (onReportFeedback) onReportFeedback(scan);
                  }}
                  className="text-xs text-ember-400 hover:text-ember-300 flex items-center space-x-1.5 font-bold cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report False Positive</span>
                </button>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="btn-pearl px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
