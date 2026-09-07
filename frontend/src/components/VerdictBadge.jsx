import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function VerdictBadge({ verdict, score, size = 'md', pulse = false }) {
  const v = (verdict || 'SAFE').toUpperCase();

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 space-x-1 font-semibold',
    md: 'text-xs px-3 py-1 space-x-1.5 font-bold',
    lg: 'text-sm px-4 py-1.5 space-x-2 font-black',
  };

  if (v === 'BLOCKED') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider bg-ember-950/90 text-ember-300 border border-ember-500/80 shadow-ember-sm ${
          sizeClasses[size]
        } ${pulse ? 'blocked-ember-border' : ''}`}
      >
        <ShieldAlert className={size === 'lg' ? 'w-4 h-4 text-ember-400' : 'w-3.5 h-3.5 text-ember-400'} />
        <span className="font-extrabold text-ember-200">BLOCKED</span>
        {score !== undefined && (
          <span className="text-[10px] opacity-90 border-l border-ember-700/60 pl-1.5 font-mono text-pearl-100">
            {score}/100
          </span>
        )}
      </span>
    );
  }

  if (v === 'SUSPICIOUS') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider bg-[#23180D] text-amber-300 border border-ember-500/50 shadow-sm ${sizeClasses[size]}`}
      >
        <AlertTriangle className={size === 'lg' ? 'w-4 h-4 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />
        <span className="font-bold text-amber-300">SUSPICIOUS</span>
        {score !== undefined && (
          <span className="text-[10px] opacity-90 border-l border-amber-700/60 pl-1.5 font-mono text-pearl-100">
            {score}/100
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider bg-[#091F1C] text-jade-400 border border-jade-400/40 shadow-sm ${sizeClasses[size]}`}
    >
      <ShieldCheck className={size === 'lg' ? 'w-4 h-4 text-jade-400' : 'w-3.5 h-3.5 text-jade-400'} />
      <span className="font-bold text-jade-300">SAFE</span>
      {score !== undefined && (
        <span className="text-[10px] opacity-90 border-l border-jade-700/60 pl-1.5 font-mono text-pearl-200">
          {score}/100
        </span>
      )}
    </span>
  );
}
