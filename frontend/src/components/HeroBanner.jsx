import React from 'react';
import Button from './ui/Button';
import { Sparkles, Flame, Code, ExternalLink, Check, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function HeroBanner({ onLaunchPlayground, onOpenSdkModal }) {
  return (
    <div className="relative pt-6 pb-4 text-center max-w-4xl mx-auto">
      {/* Release Badge with Molten Ember accent & Watermark */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ember-950/60 border border-ember-500/40 text-ember-300 text-xs font-medium mb-4 shadow-ember-sm animate-fadeIn">
        <span className="w-2 h-2 rounded-full bg-ember-500 animate-pulse shadow-sm shadow-ember-500/50" />
        <span className="font-mono font-bold tracking-wider text-ember-300">SENTINEL SHIELD 3.0</span>
        <span className="text-pearl-500/30">|</span>
        <span className="flex items-center gap-1 font-mono text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-ember-400" />
          Engineered by <strong className="text-white font-semibold">Divyansh Mishra</strong>
        </span>
      </div>

      {/* Headline with molten ember gradient */}
      <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-[1.15] mb-3">
        Zero Token Waste.{' '}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-ember-400 via-ember-300 to-amber-200 block sm:inline">
          Absolute Model Protection.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-sm sm:text-base text-pearl-300 max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
        Autonomous firewall middleware intercepting adversarial jailbreaks, persona overrides, and indirect prompt injection attacks in <strong className="text-ember-400 font-mono">&lt; 5ms</strong> before downstream LLM tokens are consumed.
      </p>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <Button
          variant="primary"
          size="lg"
          onClick={onLaunchPlayground}
          icon={Flame}
          className="shadow-ember-glow"
        >
          Launch Attack Playground
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onOpenSdkModal}
          icon={Code}
          iconPosition="left"
        >
          Python SDK Quickstart
        </Button>
        <a href="/docs" target="_blank" rel="noreferrer" className="inline-block">
          <Button
            variant="secondary"
            size="lg"
            icon={ExternalLink}
          >
            REST API Swagger
          </Button>
        </a>
      </div>

      {/* Trust Guarantees Bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-pearl-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-jade-400" />
          <span>&lt; 5ms SLA Guarantee</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-jade-400" />
          <span>Zero Tokens Leaked Downstream</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-jade-400" />
          <span>SOC 2 Type II Compliant Audit Trail</span>
        </div>
      </div>
    </div>
  );
}
