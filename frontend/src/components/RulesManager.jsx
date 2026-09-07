import React, { useState, useEffect } from 'react';
import { Lock, Sliders, Shield, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { fetchRules, updateRule } from '../services/api';

export default function RulesManager() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savingId, setSavingId] = useState(null);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchRules();
      setRules(data || []);
    } catch (err) {
      console.error('Failed to load firewall rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (rule) => {
    setSavingId(rule.id);
    const updatedStatus = !rule.is_enabled;
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, is_enabled: updatedStatus } : r))
    );
    try {
      await updateRule(rule.id, updatedStatus, rule.weight);
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    } finally {
      setSavingId(null);
    }
  };

  const categories = [
    { id: 'all', label: 'All Rules' },
    { id: 'role_override', label: 'Role Override' },
    { id: 'delimiter_breakout', label: 'Delimiter Breakout' },
    { id: 'obfuscation', label: 'Obfuscation & Ciphers' },
    { id: 'indirect_injection', label: 'Indirect Injection' },
    { id: 'exfiltration', label: 'Exfiltration' },
  ];

  const filteredRules = selectedCategory === 'all'
    ? rules
    : rules.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-6 font-mono">
      <div className="obsidian-card p-6 border border-[#242429] bg-gradient-to-r from-[#121215] via-[#0F0F12] to-[#0D0D0F] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-ember-950/70 border border-ember-500/40 text-ember-400 shadow-ember-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight">
                  Firewall Rules & Signature Management
                </h2>
                <p className="text-xs text-pearl-400 mt-1">
                  Active heuristic signatures and sensitivity weights. Toggle switches modify the runtime engine immediately with zero downtime.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={loadRules}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#161618] hover:bg-[#1C1C20] text-xs text-pearl-200 border border-[#242429] self-start sm:self-auto cursor-pointer transition-all hover:border-ember-500/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-ember-400' : ''}`} />
            <span>Reload Rules</span>
          </button>
        </div>

        {/* Category selector */}
        <div className="mt-5 pt-4 border-t border-[#242429] flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-gradient-to-r from-ember-600 to-ember-500 text-white shadow-ember-sm font-bold border border-ember-400/40'
                  : 'bg-[#161618] text-pearl-400 hover:text-white hover:bg-[#1C1C20] border border-[#242429]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Table */}
      <div className="obsidian-card border border-[#242429] overflow-hidden bg-[#121215] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161618] border-b border-[#242429] text-[11px] text-pearl-400 uppercase">
              <tr>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Signature Name</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Severity</th>
                <th className="py-3.5 px-4 font-bold">Weight</th>
                <th className="py-3.5 px-4 font-bold">Regex Pattern</th>
                <th className="py-3.5 px-4 text-right font-bold">Hit Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C20]">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#161618] transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggle(rule)}
                      disabled={savingId === rule.id}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.is_enabled ? 'bg-ember-600 shadow-ember-sm' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          rule.is_enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {rule.name}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-pearl-400 uppercase text-[11px]">
                    {rule.category}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rule.severity === 'CRITICAL' ? 'bg-ember-950/90 text-ember-300 border border-ember-500/80 shadow-ember-sm' :
                      rule.severity === 'HIGH' ? 'bg-ember-950/70 text-ember-300 border border-ember-500/50' :
                      rule.severity === 'MEDIUM' ? 'bg-[#23180D] text-amber-300 border border-amber-500/40' :
                      'bg-[#091F1C] text-jade-300 border border-jade-400/40'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white font-black">
                    {rule.weight}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-pearl-300">
                    <code className="text-[11px] bg-[#0D0D0F] px-2 py-0.5 rounded border border-[#242429] text-ember-300 font-mono">
                      {rule.pattern}
                    </code>
                  </td>
                  <td className="py-3.5 px-4 text-right text-pearl-200 font-bold">
                    {rule.hit_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
