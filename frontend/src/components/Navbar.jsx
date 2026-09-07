import React, { useState } from 'react';
import { Shield, Sparkles, Activity, Flame, Terminal, Lock, Code, BookOpen, Check, Copy, ExternalLink, BarChart3, Zap } from 'lucide-react';
import Button from './ui/Button';
import { DEFAULT_API_KEY } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onOpenSdkModal }) {
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(DEFAULT_API_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'SOC Monitor', icon: Activity },
    { id: 'playground', label: 'Attack Lab', icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Incident Log', icon: Terminal },
    { id: 'rules', label: 'Firewall Rules', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 transition-all duration-200 py-3 bg-[#08080A]/95 backdrop-blur-md border-b border-[#242429] shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" aria-label="Main Navigation">
        {/* Brand Logo with Molten Ember Monogram */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 group cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ember-700 via-ember-500 to-ember-400 text-white flex items-center justify-center font-display font-black text-sm shadow-md shadow-ember-600/30 group-hover:scale-105 transition-transform duration-200 border border-ember-400/50">
            S
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-display font-black tracking-tight text-white group-hover:text-ember-300 transition-colors">
                SENTINEL<span className="text-ember-500">PROMPT</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-ember-950/80 text-ember-300 border border-ember-500/40 font-bold tracking-wider">
                v1.0
              </span>
            </div>
            <span className="text-[10px] text-pearl-400 font-mono hidden sm:inline -mt-0.5">
              LLM Prompt Injection Firewall
            </span>
          </div>
        </div>

        {/* Center Navigation Links / Tabs */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-[#121215] rounded-xl border border-[#242429]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-ember-600 to-ember-500 text-white shadow-ember-sm border border-ember-400/40 font-semibold'
                    : 'text-pearl-400 hover:text-white hover:bg-[#1C1C20]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pearl-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Live Engine Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121215] border border-jade-400/40 text-xs shadow-sm font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-jade-400"></span>
            </span>
            <span className="text-jade-400 text-[11px] font-bold">ONLINE</span>
            <span className="text-pearl-500/40 hidden lg:inline">|</span>
            <span className="text-pearl-300 text-[11px] hidden lg:inline">&lt; 5ms</span>
          </div>

          {/* Quick Copy API Key */}
          <button
            onClick={copyApiKey}
            title="Click to copy API Key"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121215] hover:bg-[#1C1C20] border border-[#242429] hover:border-ember-500/40 text-xs font-mono text-pearl-200 transition-all cursor-pointer"
          >
            <Lock className="w-3 h-3 text-ember-400" />
            <span className="hidden xl:inline text-pearl-400">Key:</span>
            <span className="text-white">sp_live...f1a</span>
            {copied ? (
              <Check className="w-3 h-3 text-jade-400 ml-0.5" />
            ) : (
              <Copy className="w-3 h-3 text-pearl-400 ml-0.5" />
            )}
          </button>

          {/* Python SDK Modal Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSdkModal}
            icon={Code}
            iconPosition="left"
            className="hidden lg:inline-flex"
          >
            Python SDK
          </Button>

          {/* Swagger Link */}
          <a href="/docs" target="_blank" rel="noreferrer" className="hidden sm:inline-block">
            <Button
              variant="primary"
              size="sm"
              icon={ExternalLink}
            >
              Docs
            </Button>
          </a>
        </div>
      </nav>

      {/* Mobile Navigation Row */}
      <div className="md:hidden flex items-center justify-around pt-2 mt-2 border-t border-[#242429] text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded font-mono cursor-pointer ${
                isActive ? 'text-ember-400 font-bold' : 'text-pearl-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
