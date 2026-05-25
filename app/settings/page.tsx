'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULTS = {
  riskThreshold: 85,
  probCutoff: 0.75,
  s3Weight: 4.5,
  iamWeight: 3.8,
  ec2Weight: 2.0,
  lookback: '30',
  recalcFreq: 'daily',
};

export default function SettingsPage() {
  const [riskThreshold, setRiskThreshold] = useState(DEFAULTS.riskThreshold);
  const [probCutoff, setProbCutoff] = useState(DEFAULTS.probCutoff);
  const [s3Weight, setS3Weight] = useState(DEFAULTS.s3Weight);
  const [iamWeight, setIamWeight] = useState(DEFAULTS.iamWeight);
  const [ec2Weight, setEc2Weight] = useState(DEFAULTS.ec2Weight);
  const [lookback, setLookback] = useState(DEFAULTS.lookback);
  const { user } = useAuth();
  const [recalcFreq, setRecalcFreq] = useState(DEFAULTS.recalcFreq);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  const handleReset = () => {
    setRiskThreshold(DEFAULTS.riskThreshold);
    setProbCutoff(DEFAULTS.probCutoff);
    setS3Weight(DEFAULTS.s3Weight);
    setIamWeight(DEFAULTS.iamWeight);
    setEc2Weight(DEFAULTS.ec2Weight);
    setLookback(DEFAULTS.lookback);
    setRecalcFreq(DEFAULTS.recalcFreq);
    setSaveStatus('idle');
  };

  const handleSave = () => {
    setSaveStatus('saved');
  };

  const handleSync = () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  return (
    <div className="flex flex-col gap-lg max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-base mb-sm">
        <h1 className="text-on-surface font-display-lg text-4xl lg:text-5xl">System Configuration</h1>
        <p className="text-on-surface-variant font-body-lg">Control center for tuning the detection engine and integration parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Core Engine Settings */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {/* Model Sensitivity Card */}
          <section className="bg-[var(--surface-container-lowest)] border border-[var(--surface-container)] rounded-lg p-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary)] opacity-50" />
            <div className="flex items-center gap-sm mb-md border-b border-[var(--surface-container)] pb-sm">
              <span className="material-symbols-outlined text-[var(--primary)]">tune</span>
              <h2 className="font-headline-sm text-[var(--on-surface)]">Model Sensitivity</h2>
            </div>
            <div className="flex flex-col gap-lg">
              {/* Global Risk Threshold */}
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-end">
                  <div>
                    <label className="font-body-md text-[var(--on-surface)] font-medium block">Global Risk Threshold</label>
                    <span className="text-[var(--on-surface-variant)] text-xs">Minimum score required to trigger an active alert.</span>
                  </div>
                  <span className="font-mono text-[var(--primary)] text-lg">{riskThreshold}</span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={riskThreshold}
                    onChange={(e) => setRiskThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--on-surface-variant)] mt-1 font-mono">
                  <span>0 (Noisy)</span>
                  <span>100 (Strict)</span>
                </div>
              </div>

              {/* Sequence Probability Cutoff */}
              <div className="flex flex-col gap-xs mt-sm">
                <div className="flex justify-between items-end">
                  <div>
                    <label className="font-body-md text-[var(--on-surface)] font-medium block">Sequence Probability Cutoff</label>
                    <span className="text-[var(--on-surface-variant)] text-xs">Confidence interval for anomaly classification.</span>
                  </div>
                  <span className="font-mono text-[var(--primary)] text-lg">{probCutoff.toFixed(2)}</span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={probCutoff}
                    onChange={(e) => setProbCutoff(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--on-surface-variant)] mt-1 font-mono">
                  <span>0.0</span>
                  <span>1.0</span>
                </div>
              </div>
            </div>
          </section>

          {/* Sequence Weighting Card */}
          <section className="bg-[var(--surface-container-lowest)] border border-[var(--surface-container)] rounded-lg p-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-md border-b border-[var(--surface-container)] pb-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[var(--secondary)]">weight</span>
                <h2 className="font-headline-sm text-[var(--on-surface)]">Sequence Weighting</h2>
              </div>
              <span className="text-xs text-[var(--on-surface-variant)] font-label-caps bg-[var(--surface-container)] px-2 py-1 rounded">HEURISTIC RULES</span>
            </div>
            <p className="text-[var(--on-surface-variant)] text-sm mb-md">Adjust the priority multiplier for specific AWS action categories. High weights will escalate risks faster.</p>
            <div className="flex flex-col gap-4">
              {/* S3 Weight */}
              <div className="flex items-center justify-between p-md bg-[var(--surface-container)] border border-[var(--surface-container-high)] rounded-md hover:border-[var(--surface-container-highest)] transition-colors">
                <div className="flex items-center gap-md w-1/3">
                  <div className="size-10 rounded bg-[var(--surface-container-highest)] flex items-center justify-center border border-[var(--outline-variant)]">
                    <span className="material-symbols-outlined text-[var(--primary)] text-sm">storage</span>
                  </div>
                  <div>
                    <h3 className="font-code-md text-[var(--on-surface)]">S3:BulkData</h3>
                    <p className="text-xs text-[var(--on-surface-variant)]">Exfiltration indicators</p>
                  </div>
                </div>
                <div className="w-1/2 flex items-center gap-md">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={s3Weight}
                    onChange={(e) => setS3Weight(Number(e.target.value))}
                    className="w-full danger-slider"
                  />
                  <span className="font-mono text-[var(--secondary)] w-12 text-right font-bold" style={{ textShadow: '0 0 8px rgba(248,113,113,0.4)' }}>
                    x{s3Weight.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* IAM Weight */}
              <div className="flex items-center justify-between p-md bg-[var(--surface-container)] border border-[var(--surface-container-high)] rounded-md hover:border-[var(--surface-container-highest)] transition-colors">
                <div className="flex items-center gap-md w-1/3">
                  <div className="size-10 rounded bg-[var(--surface-container-highest)] flex items-center justify-center border border-[var(--outline-variant)]">
                    <span className="material-symbols-outlined text-[var(--primary)] text-sm">admin_panel_settings</span>
                  </div>
                  <div>
                    <h3 className="font-code-md text-[var(--on-surface)]">IAM:PrivEsc</h3>
                    <p className="text-xs text-[var(--on-surface-variant)]">Privilege escalation</p>
                  </div>
                </div>
                <div className="w-1/2 flex items-center gap-md">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={iamWeight}
                    onChange={(e) => setIamWeight(Number(e.target.value))}
                    className="w-full danger-slider"
                  />
                  <span className="font-mono text-[var(--secondary)] w-12 text-right font-bold" style={{ textShadow: '0 0 8px rgba(248,113,113,0.4)' }}>
                    x{iamWeight.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* EC2 Weight */}
              <div className="flex items-center justify-between p-md bg-[var(--surface-container)] border border-[var(--surface-container-high)] rounded-md hover:border-[var(--surface-container-highest)] transition-colors">
                <div className="flex items-center gap-md w-1/3">
                  <div className="size-10 rounded bg-[var(--surface-container-highest)] flex items-center justify-center border border-[var(--outline-variant)]">
                    <span className="material-symbols-outlined text-[var(--primary)] text-sm">dns</span>
                  </div>
                  <div>
                    <h3 className="font-code-md text-[var(--on-surface)]">EC2:Compute</h3>
                    <p className="text-xs text-[var(--on-surface-variant)]">Crypto-mining / C2</p>
                  </div>
                </div>
                <div className="w-1/2 flex items-center gap-md">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={ec2Weight}
                    onChange={(e) => setEc2Weight(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="font-mono text-[var(--on-surface-variant)] w-12 text-right font-bold">
                    x{ec2Weight.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Settings & Integrations */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {user?.isAdmin && (
            <Link href="/settings/users" className="block bg-[var(--surface-container-lowest)] border border-[var(--surface-container)] rounded-lg p-lg hover:border-[var(--primary)]/40 transition-colors group">
              <div className="flex items-center gap-sm mb-md border-b border-[var(--surface-container)] pb-sm">
                <span className="material-symbols-outlined text-[var(--primary)]">admin_panel_settings</span>
                <h2 className="font-headline-sm text-[var(--on-surface)]">User Management</h2>
              </div>
              <p className="text-sm text-[var(--on-surface-variant)]">Manage authentication users, roles, and access permissions</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-[var(--primary)] group-hover:gap-3 transition-all">
                <span>Manage Users</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </Link>
          )}

          {/* Behavioral Baselines */}
          <section className="bg-[var(--surface-container-lowest)] border border-[var(--surface-container)] rounded-lg p-lg">
            <div className="flex items-center gap-sm mb-md border-b border-[var(--surface-container)] pb-sm">
              <span className="material-symbols-outlined text-[var(--on-surface-variant)]">history</span>
              <h2 className="font-headline-sm text-[var(--on-surface)]">Behavioral Baselines</h2>
            </div>
            <div className="flex flex-col gap-md">
              <div>
                <label className="font-body-md text-[var(--on-surface)] font-medium block mb-xs">Lookback Window</label>
                <select
                  className="w-full bg-[var(--surface-container)] border border-[var(--surface-container-high)] rounded text-[var(--on-surface)] font-code-md p-2 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                  value={lookback}
                  onChange={(e) => setLookback(e.target.value)}
                >
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>
              <div>
                <label className="font-body-md text-[var(--on-surface)] font-medium block mb-xs">Recalculation Frequency</label>
                <select
                  className="w-full bg-[var(--surface-container)] border border-[var(--surface-container-high)] rounded text-[var(--on-surface)] font-code-md p-2 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                  value={recalcFreq}
                  onChange={(e) => setRecalcFreq(e.target.value)}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </section>

          {/* Data Ingestion Status */}
          <section className="bg-[var(--surface-container-lowest)] border border-[var(--surface-container)] rounded-lg p-lg flex-1">
            <div className="flex items-center justify-between mb-md border-b border-[var(--surface-container)] pb-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[var(--on-surface-variant)]">sync_alt</span>
                <h2 className="font-headline-sm text-[var(--on-surface)]">Data Ingestion</h2>
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-md">
              {/* CloudTrail */}
              <div className="flex items-center justify-between bg-[var(--surface-container-low)] p-2 rounded border border-[var(--surface-container)]">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[var(--primary)]" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.8)' }} />
                  <span className="font-code-sm text-[var(--on-surface)]">AWS CloudTrail</span>
                </div>
                <span className="font-code-sm text-[var(--on-surface-variant)]">Active</span>
              </div>
              {/* VPC Flow Logs */}
              <div className="flex items-center justify-between bg-[var(--surface-container-low)] p-2 rounded border border-[var(--surface-container)]">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[var(--primary)]" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.8)' }} />
                  <span className="font-code-sm text-[var(--on-surface)]">VPC Flow Logs</span>
                </div>
                <span className="font-code-sm text-[var(--on-surface-variant)]">Active</span>
              </div>
              {/* GuardDuty */}
              <div className="flex items-center justify-between bg-[var(--surface-container-low)] p-2 rounded border border-[var(--surface-container)]">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[#f59e0b]" style={{ boxShadow: '0 0 4px rgba(245,158,11,0.8)' }} />
                  <span className="font-code-sm text-[var(--on-surface)]">GuardDuty</span>
                </div>
                <span className="font-code-sm text-[var(--on-surface-variant)]">Lagging (2m)</span>
              </div>
            </div>
            <button
              className="w-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] border border-[var(--surface-container-high)] text-[var(--on-surface)] font-body-md py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Synced' : 'Sync Now'}
            </button>
          </section>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-md mt-sm border-t border-[var(--surface-container-high)] pt-md items-center">
        {saveStatus === 'saved' && (
          <span className="text-xs text-[var(--on-surface-variant)]">Changes saved.</span>
        )}
        <button
          className="bg-transparent border border-[var(--surface-container-high)] text-[var(--on-surface)] font-body-md py-2 px-6 rounded hover:bg-[var(--surface-container-low)] transition-colors"
          onClick={handleReset}
        >
          Reset to Defaults
        </button>
        <button
          className="bg-[var(--primary)] text-black font-body-md font-semibold py-2 px-8 rounded hover:bg-[var(--primary-fixed)] transition-colors"
          style={{ boxShadow: '0 0 12px rgba(74,222,128,0.3)' }}
          onClick={handleSave}
        >
          {saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
