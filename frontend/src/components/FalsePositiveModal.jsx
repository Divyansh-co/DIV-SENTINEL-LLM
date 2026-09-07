import React, { useState } from 'react';
import { Flag, X, Check, AlertCircle } from 'lucide-react';
import { submitFeedback } from '../services/api';

export default function FalsePositiveModal({ scan, isOpen, onClose }) {
  const [reportedVerdict, setReportedVerdict] = useState('SAFE');
  const [actualIntent, setActualIntent] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !scan) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitFeedback({
        scan_id: scan.id,
        reported_verdict: reportedVerdict,
        actual_intent: actualIntent,
        user_notes: userNotes,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono">
      <div className="obsidian-card border border-ember-500/50 max-w-lg w-full p-6 bg-[#12121A] shadow-ember-lg space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#22222E] pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-ember-950/80 border border-ember-500/40 text-ember-400 shadow-ember-sm">
              <Flag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              Report False Positive / Tuning Feedback
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1E1E2C] text-pearl-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-jade-950/90 border border-jade-500 flex items-center justify-center mx-auto text-jade-400 shadow-sm">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Feedback Submitted</h4>
            <p className="text-xs text-pearl-300">
              Telemetry sample queued for firewall heuristic refinement and vector corpus re-indexing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#09090D] border border-[#22222E]">
              <span className="text-[10px] text-pearl-400 uppercase block mb-1">Payload Sample</span>
              <p className="text-pearl-200 truncate font-mono">{scan.prompt}</p>
            </div>

            <div>
              <label className="block text-pearl-300 text-[10px] uppercase mb-1 font-semibold">
                Intended Verdict
              </label>
              <select
                value={reportedVerdict}
                onChange={(e) => setReportedVerdict(e.target.value)}
                className="w-full bg-[#161622] border border-[#262634] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-ember-500"
              >
                <option value="SAFE">SAFE — Benign business text mistakenly flagged</option>
                <option value="SUSPICIOUS">SUSPICIOUS — Needs human review or sandboxing</option>
                <option value="BLOCKED">BLOCKED — Malicious attack that bypassed filters</option>
              </select>
            </div>

            <div>
              <label className="block text-pearl-300 text-[10px] uppercase mb-1 font-semibold">
                Actual User Intent / Business Context
              </label>
              <input
                type="text"
                value={actualIntent}
                onChange={(e) => setActualIntent(e.target.value)}
                placeholder="e.g. User was quoting technical docs or benign prompt example"
                className="w-full bg-[#161622] border border-[#262634] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-ember-500 placeholder-pearl-500"
              />
            </div>

            <div>
              <label className="block text-pearl-300 text-[10px] uppercase mb-1 font-semibold">
                Analyst Notes
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes about rule sensitivity or prompt context..."
                className="w-full bg-[#161622] border border-[#262634] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-ember-500 placeholder-pearl-500"
              />
            </div>

            <div className="pt-3 border-t border-[#22222E] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#181824] hover:bg-[#202030] text-pearl-300 text-xs font-semibold cursor-pointer border border-[#262634]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-ember px-5 py-2 rounded-xl text-white text-xs font-bold shadow-ember-sm cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Submit Tuning Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
