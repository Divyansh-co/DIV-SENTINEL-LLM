import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Flag, ExternalLink, X, Copy, Check } from 'lucide-react';
import VerdictBadge from './VerdictBadge';
import { fetchHistory, submitScanFeedback } from '../services/api';

export default function IncidentHistoryTable({ onReportFeedback }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [verdict, setVerdict] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchHistory(limit, offset, verdict, search);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [offset, verdict]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    loadData();
  };

  const copyPayload = (p, id) => {
    navigator.clipboard.writeText(p);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-4 font-mono">
      {/* Search & Filter Toolbar */}
      <div className="obsidian-card p-4 border border-[#242429] bg-[#121215] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        {/* Verdict filter tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'BLOCKED', 'SUSPICIOUS', 'SAFE'].map((v) => (
            <button
              key={v}
              onClick={() => { setVerdict(v); setOffset(0); }}
              className={`text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                verdict === v
                  ? (v === 'BLOCKED' ? 'bg-gradient-to-r from-ember-700 to-ember-600 text-white shadow-ember-sm font-bold border border-ember-400/50' :
                     v === 'SUSPICIOUS' ? 'bg-[#23180D] text-amber-300 font-bold border border-ember-500/50' :
                     v === 'SAFE' ? 'bg-[#091F1C] text-jade-300 font-bold border border-jade-400/50' :
                     'bg-gradient-to-r from-ember-600 to-ember-500 text-white font-bold border border-ember-400/40 shadow-ember-sm')
                  : 'bg-[#161618] text-pearl-400 hover:text-white hover:bg-[#1C1C20] border border-[#242429]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-pearl-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompt payload, rule..."
              className="bg-[#0D0D0F] border border-[#242429] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-pearl-500 focus:outline-none focus:border-ember-500/60 w-52 sm:w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-[#161618] hover:bg-[#1C1C20] text-xs text-pearl-200 border border-[#242429] cursor-pointer hover:text-white hover:border-ember-500/40"
          >
            Find
          </button>
          <button
            type="button"
            onClick={loadData}
            title="Refresh"
            className="p-1.5 rounded-xl bg-[#161618] hover:bg-[#1C1C20] text-pearl-400 hover:text-white border border-[#242429] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-ember-400' : ''}`} />
          </button>
        </form>
      </div>

      {/* Incidents Table */}
      <div className="obsidian-card border border-[#242429] overflow-hidden bg-[#121215] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161618] border-b border-[#242429] text-[11px] text-pearl-400 uppercase">
              <tr>
                <th className="py-3.5 px-4 font-bold">Timestamp / ID</th>
                <th className="py-3.5 px-4 font-bold">Verdict</th>
                <th className="py-3.5 px-4 font-bold">Risk Score</th>
                <th className="py-3.5 px-4 font-bold">Attack Category</th>
                <th className="py-3.5 px-4 font-bold">Prompt Payload Preview</th>
                <th className="py-3.5 px-4 font-bold">Latency</th>
                <th className="py-3.5 px-4 text-right font-bold">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C20]">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-pearl-400">
                    {loading ? 'Retrieving historical security telemetry...' : 'No incident records match query.'}
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedIncident(row)}
                    className="hover:bg-[#161618] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-white block font-mono font-semibold">
                        {new Date(row.timestamp).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-pearl-500 font-mono">
                        {row.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <VerdictBadge verdict={row.verdict} size="sm" pulse={row.verdict === 'BLOCKED'} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-bold font-mono ${
                        row.verdict === 'BLOCKED' ? 'text-ember-400' :
                        row.verdict === 'SUSPICIOUS' ? 'text-amber-400' :
                        'text-jade-400'
                      }`}>
                        {Math.round(row.risk_score * 100)}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#161618] text-pearl-300 border border-[#242429]">
                        {row.attack_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-pearl-300">
                      {row.prompt}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-jade-400 font-semibold">
                      {row.latency_ms}ms
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPayload(row.prompt, row.id);
                        }}
                        className="p-1 rounded-lg text-pearl-400 hover:text-white hover:bg-[#1C1C20] transition-colors cursor-pointer"
                        title="Copy Payload"
                      >
                        {copiedId === row.id ? <Check className="w-3.5 h-3.5 text-jade-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setFeedbackStatus((prev) => ({ ...prev, [row.id]: 'saving' }));
                          try {
                            await submitScanFeedback(row.id, false, 'Marked as false positive by analyst');
                            setFeedbackStatus((prev) => ({ ...prev, [row.id]: 'marked' }));
                          } catch (err) {
                            setFeedbackStatus((prev) => ({ ...prev, [row.id]: 'error' }));
                          }
                        }}
                        disabled={feedbackStatus[row.id] === 'marked'}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all inline-flex items-center space-x-1 cursor-pointer ${
                          feedbackStatus[row.id] === 'marked' || row.is_false_positive
                            ? 'bg-[#091F1C] text-jade-300 border border-jade-400/50'
                            : 'bg-[#161618] hover:bg-ember-950/80 hover:text-ember-300 hover:border-ember-500/50 text-pearl-300 border border-[#242429]'
                        }`}
                        title="Submit false positive feedback to tune firewall models"
                      >
                        {feedbackStatus[row.id] === 'marked' || row.is_false_positive ? (
                          <span>✓ Marked FP</span>
                        ) : feedbackStatus[row.id] === 'saving' ? (
                          <span>Saving...</span>
                        ) : (
                          <span>Mark FP</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 bg-[#121215] border-t border-[#242429] flex items-center justify-between text-xs text-pearl-400 font-mono">
          <div>
            Showing <strong className="text-white">{items.length}</strong> of{' '}
            <strong className="text-white">{total}</strong> incidents
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1.5 rounded-xl bg-[#161618] hover:bg-[#1C1C20] disabled:opacity-40 disabled:cursor-not-allowed border border-[#242429] text-white flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="px-2 text-pearl-300">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-[#161618] hover:bg-[#1C1C20] disabled:opacity-40 disabled:cursor-not-allowed border border-[#242429] text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="obsidian-card p-6 border border-ember-500/50 w-full max-w-xl bg-[#121215] shadow-ember-lg relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#242429]">
              <div className="flex items-center space-x-2.5">
                <VerdictBadge verdict={selectedIncident.verdict} size="md" pulse={selectedIncident.verdict === 'BLOCKED'} />
                <span className="text-xs text-pearl-300 font-bold">Scan ID: {selectedIncident.id}</span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-pearl-400 hover:text-white p-1 rounded-lg hover:bg-[#1C1C20] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] text-pearl-400 uppercase block mb-1.5">Submitted Raw Payload</span>
                <div className="p-3.5 rounded-xl bg-[#0D0D0F] border border-[#242429] text-white text-xs break-all select-all font-mono leading-relaxed">
                  {selectedIncident.prompt}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-[#161618] border border-[#242429]">
                  <span className="text-[10px] text-pearl-400 uppercase block">Verdict</span>
                  <span className="text-white font-bold text-sm">{selectedIncident.verdict}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161618] border border-[#242429]">
                  <span className="text-[10px] text-pearl-400 uppercase block">Risk Score</span>
                  <span className="text-ember-400 font-bold text-sm">{Math.round(selectedIncident.risk_score * 100)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161618] border border-[#242429]">
                  <span className="text-[10px] text-pearl-400 uppercase block">Latency</span>
                  <span className="text-jade-400 font-bold text-sm">{selectedIncident.latency_ms || 1.2}ms</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161622] border border-[#22222E]">
                <span className="text-[10px] text-pearl-400 uppercase block mb-1">Defense Rationale</span>
                <p className="text-pearl-100 text-xs leading-relaxed font-sans">{selectedIncident.reasoning}</p>
              </div>

              <div className="pt-3.5 border-t border-[#22222E] flex items-center justify-between">
                <button
                  onClick={() => {
                    const inc = selectedIncident;
                    setSelectedIncident(null);
                    if (onReportFeedback) onReportFeedback(inc);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 font-bold cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report False Positive</span>
                </button>
                <button
                  onClick={() => setSelectedIncident(null)}
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
