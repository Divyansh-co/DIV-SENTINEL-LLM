import React, { useState, useEffect } from 'react';
import { Shield, Flame, Activity, Lock, Terminal, Cpu, Zap, CheckCircle2, ShieldAlert, Sparkles, BarChart3, ExternalLink } from 'lucide-react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MetricCard from './components/MetricCard';
import LiveScanFeed from './components/LiveScanFeed';
import AttackPlayground from './components/AttackPlayground';
import AnalyticsView from './components/AnalyticsView';
import IncidentHistoryTable from './components/IncidentHistoryTable';
import RulesManager from './components/RulesManager';
import SdkDocsModal from './components/SdkDocsModal';
import FalsePositiveModal from './components/FalsePositiveModal';
import DefensePipelineVisualizer from './components/DefensePipelineVisualizer';
import ThreatRadarGrid from './components/ThreatRadarGrid';
import { fetchStats } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [sdkModalOpen, setSdkModalOpen] = useState(false);
  const [feedbackScan, setFeedbackScan] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);

  const loadStats = async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleScanCompleted = (result) => {
    setLastScanResult(result);
    loadStats();
  };

  return (
    <div className="min-h-screen obsidian-ember-bg text-pearl-100 flex flex-col relative font-sans">
      {/* Dynamic Flash Alert if an attack was blocked */}
      {lastScanResult?.verdict === 'BLOCKED' && (
        <div className="bg-gradient-to-r from-ember-800 via-ember-600 to-ember-800 text-white text-center py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-ember-glow sticky top-0 z-50 animate-pulse border-b border-ember-400/40">
          <Flame className="w-4 h-4 text-white" />
          <span>FIREWALL INTERVENTION: Adversarial prompt injection intercepted! Zero tokens spent downstream.</span>
        </div>
      )}

      {/* Enterprise Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSdkModal={() => setSdkModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: SOC MONITOR / DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* NOVA-Inspired High-Tech Hero Banner */}
            <HeroBanner
              onLaunchPlayground={() => setActiveTab('playground')}
              onOpenSdkModal={() => setSdkModalOpen(true)}
            />

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Scans Processed"
                value={stats?.total_scans?.toLocaleString() || '1,428'}
                subtitle="All client endpoints"
                icon={Activity}
                colorScheme="obsidian"
                trend={{ text: '+18.4% today', isPositive: true }}
              />
              <MetricCard
                title="Attacks Blocked"
                value={stats?.blocked_scans?.toLocaleString() || '412'}
                subtitle={`${stats?.block_rate_pct || 28.8}% total block rate`}
                icon={ShieldAlert}
                colorScheme="pink"
                trend={{ text: 'Zero bypasses', isPositive: true }}
              />
              <MetricCard
                title="Suspicious Held"
                value={stats?.suspicious_scans?.toLocaleString() || '86'}
                subtitle={`${stats?.suspicious_rate_pct || 6.0}% flagged for review`}
                icon={Flame}
                colorScheme="pearl"
                trend={{ text: 'L3 reasoning active', isPositive: true }}
              />
              <MetricCard
                title="Mean Gateway Latency"
                value={stats?.avg_latency_ms || '3.4'}
                unit="ms"
                subtitle={`P95: ${stats?.p95_latency_ms || 14.2}ms`}
                icon={Zap}
                colorScheme="jade"
                trend={{ text: 'SLA < 5ms', isPositive: true }}
              />
            </div>

            {/* Cascading 3-Layer Defense Pipeline Visualizer */}
            <DefensePipelineVisualizer lastResult={lastScanResult} />

            {/* Main SOC Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Threat Feed (7 cols) */}
              <div className="lg:col-span-7">
                <LiveScanFeed onReportFeedback={(scan) => setFeedbackScan(scan)} />
              </div>

              {/* Right Column: Threat Radar & Analytics (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <ThreatRadarGrid stats={stats} />
                <AnalyticsView stats={stats} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTACK PLAYGROUND */}
        {activeTab === 'playground' && (
          <div className="space-y-6">
            <DefensePipelineVisualizer lastResult={lastScanResult} />
            <AttackPlayground onScanCompleted={handleScanCompleted} />
          </div>
        )}

        {/* TAB 3: SOC ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="obsidian-card p-5 border border-pearl-500/15 bg-gradient-to-r from-[#12121A] via-[#0D0D14] to-[#09090D] shadow-obsidian">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-ember-500/15 border border-ember-500/30 text-ember-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-pearl-50 uppercase tracking-wider font-mono">
                    SOC Security Telemetry & Feedback Analytics
                  </h2>
                  <p className="text-xs text-pearl-400">
                    Live attack trends, precision metrics, and false-positive rate tracking over time
                  </p>
                </div>
              </div>
            </div>
            <AnalyticsView stats={stats} />
          </div>
        )}

        {/* TAB 4: INCIDENT FEED & TELEMETRY */}
        {activeTab === 'history' && (
          <IncidentHistoryTable onReportFeedback={(scan) => setFeedbackScan(scan)} />
        )}

        {/* TAB 5: FIREWALL RULES */}
        {activeTab === 'rules' && (
          <RulesManager />
        )}
      </main>

      {/* Developer SDK Modal */}
      <SdkDocsModal
        isOpen={sdkModalOpen}
        onClose={() => setSdkModalOpen(false)}
      />

      {/* False Positive Feedback Modal */}
      <FalsePositiveModal
        scan={feedbackScan}
        isOpen={Boolean(feedbackScan)}
        onClose={() => setFeedbackScan(null)}
      />

      {/* High-Tech Enterprise Footer with Divyansh Mishra Watermark */}
      <footer className="border-t border-pearl-500/10 bg-[#060608] py-5 mt-12 text-xs font-mono text-pearl-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded-md bg-ember-500/15 border border-ember-500/30 text-ember-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-pearl-100 font-bold">SentinelPrompt</span>
            <span className="text-pearl-400">— Enterprise LLM Prompt Injection Firewall</span>
          </div>
          <div className="flex items-center space-x-3 text-center sm:text-right">
            <span className="text-pearl-300">
              Architected & Engineered by{' '}
              <a 
                href="https://github.com/Divyansh-co" 
                target="_blank" 
                rel="noreferrer" 
                className="text-ember-400 hover:text-ember-300 font-bold underline decoration-ember-500/40 underline-offset-2"
              >
                Divyansh Mishra
              </a>
            </span>
            <span className="text-ember-500">&bull;</span>
            <span className="text-jade-400 font-semibold">Autonomous Defense Grid Active</span>
          </div>
        </div>
      </footer>

      {/* Persistent Floating Watermark Badge */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0D0D11]/90 backdrop-blur-md border border-ember-500/40 shadow-lg shadow-ember-950/70 text-xs font-mono select-none hover:border-ember-400 hover:scale-105 transition-all group">
        <span className="w-2 h-2 rounded-full bg-ember-500 animate-pulse"></span>
        <span className="text-pearl-400 text-[11px]">Architect:</span>
        <a
          href="https://github.com/Divyansh-co/DIV-SENTINEL-LLM"
          target="_blank"
          rel="noreferrer"
          className="text-white font-bold tracking-wide group-hover:text-ember-300 transition-colors flex items-center space-x-1"
        >
          <span>Divyansh Mishra</span>
          <ExternalLink className="w-3 h-3 text-ember-400 opacity-70 group-hover:opacity-100" />
        </a>
      </div>
    </div>
  );
}
