import React from 'react';

export default function MetricCard({ title, value, unit, subtitle, icon: Icon, trend, colorScheme = 'ember' }) {
  const schemeStyles = {
    ember: {
      border: 'border-ember-500/30 hover:border-ember-500/60',
      iconBg: 'bg-ember-950/70 text-ember-400 border-ember-500/40 shadow-sm',
      glow: 'hover:shadow-ember-sm',
      badgeBg: 'bg-ember-950/80 text-ember-300 border border-ember-500/50',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      iconBg: 'bg-[#23180D] text-amber-400 border-amber-500/40 shadow-sm',
      glow: 'hover:shadow-ember-sm',
      badgeBg: 'bg-[#23180D] text-amber-300 border border-amber-500/50',
    },
    pearl: {
      border: 'border-white/15 hover:border-white/40',
      iconBg: 'bg-white/10 text-white border-white/20 shadow-sm',
      glow: 'hover:shadow-pearl-glow',
      badgeBg: 'bg-white/10 text-white border border-white/20',
    },
    jade: {
      border: 'border-jade-400/30 hover:border-jade-400/60',
      iconBg: 'bg-[#091F1C] text-jade-400 border-jade-400/40',
      glow: 'hover:shadow-sm',
      badgeBg: 'bg-[#091F1C] text-jade-300 border border-jade-400/50',
    },
    obsidian: {
      border: 'border-[#242429] hover:border-ember-500/30',
      iconBg: 'bg-[#161618] text-pearl-300 border-[#242429]',
      glow: 'hover:shadow-sm',
      badgeBg: 'bg-[#161618] text-pearl-300 border border-[#242429]',
    },
  };

  const current = schemeStyles[colorScheme] || schemeStyles.ember;

  return (
    <div
      className={`obsidian-card p-4 sm:p-5 transition-all duration-200 border ${current.border} ${current.glow} hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-pearl-400 font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${current.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
          {value}
        </span>
        {unit && <span className="text-sm font-mono text-pearl-400">{unit}</span>}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
        <span className="text-[11px] text-pearl-400">{subtitle}</span>
        {trend && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? current.badgeBg
                : 'bg-ember-950/80 text-ember-300 border border-ember-500/50'
            }`}
          >
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}
