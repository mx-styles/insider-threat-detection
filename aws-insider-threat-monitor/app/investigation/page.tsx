'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  User,
  Clock,
  MapPin,
  Brain,
  FolderOpen,
  Download,
  LogIn,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Network,
} from 'lucide-react';

export default function InvestigationPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/alerts"
              className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Alerts
            </Link>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold flex items-center gap-3 text-[var(--on-surface)]">
            Investigation A-102
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--error-container)]/20 border border-[var(--error)] text-[var(--error)] text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-3 h-3 rounded-full bg-[var(--error)]" />
              Critical
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="bg-[var(--surface-container)] border border-[var(--outline-variant)] hover:border-[var(--outline)] text-[var(--on-surface)] px-4 py-2 rounded text-sm transition-colors">
            Acknowledge
          </button>
          <button className="bg-[var(--primary)] text-[var(--on-primary)] px-4 py-2 rounded text-sm font-semibold hover:bg-[var(--primary-fixed)] transition-colors">
            Create Case
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Overview & Detection */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Overview Card */}
          <div className="bg-[var(--surface-container-low)] rounded-lg p-4 border border-[var(--outline-variant)] flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex items-start justify-end">
              <div className="text-right">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1">
                  Risk Score
                </div>
                <div className="text-2xl font-mono font-bold text-[var(--error)]">0.92</div>
              </div>
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1">
              Entity Profile
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-container)] flex items-center justify-center border border-[var(--outline-variant)]">
                <User className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-lg font-semibold text-[var(--on-surface)]">user_12</div>
                <div className="text-sm text-[var(--on-surface-variant)]">Data Engineering</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  First Seen
                </div>
                <div className="text-sm text-[var(--on-surface)]">Oct 24, 01:45 AM</div>
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Location
                </div>
                <div className="text-sm text-[var(--on-surface)]">Seattle, US (VPN)</div>
              </div>
            </div>
          </div>

          {/* Explanation Card */}
          <div className="bg-[var(--surface-container)] rounded-lg p-4 border border-[var(--outline-variant)] flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold text-[var(--on-surface)]">Model Explanation</h2>
            </div>
            <p className="text-base text-[var(--on-surface)] leading-relaxed">
              User accessed sensitive resource after privilege escalation during abnormal hours.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface-variant)] text-xs font-mono font-bold uppercase tracking-wider border border-[var(--outline-variant)]">
                After Hours
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface-variant)] text-xs font-mono font-bold uppercase tracking-wider border border-[var(--outline-variant)]">
                Privilege Escalation
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface-variant)] text-xs font-mono font-bold uppercase tracking-wider border border-[var(--outline-variant)]">
                Sensitive Access
              </span>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-[var(--surface-container)] rounded-lg p-4 border border-[var(--outline-variant)] flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
              Feature Contributions
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>Resource Sensitivity</span>
                  <span className="text-[var(--error)]">92%</span>
                </div>
                <div className="w-full bg-[var(--surface-variant)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--error)] h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>Time of Day Anomaly</span>
                  <span className="text-[var(--error)]">85%</span>
                </div>
                <div className="w-full bg-[var(--surface-variant)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--error)] h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>Role Deviation</span>
                  <span className="text-[var(--tertiary-container)]">64%</span>
                </div>
                <div className="w-full bg-[var(--surface-variant)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--tertiary-container)] h-full rounded-full" style={{ width: '64%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Graph & Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Graph View */}
          <div className="bg-[var(--surface-container-low)] rounded-lg border border-[var(--outline-variant)] flex flex-col h-[400px] relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Network className="w-4 h-4 text-[var(--on-surface-variant)]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                Entity Graph
              </span>
            </div>

            {/* Graph visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-lg max-h-64 flex items-center justify-center">
                {/* User Node */}
                <div className="absolute left-[10%] top-[40%] flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-[var(--surface-variant)] border-2 border-[var(--primary)] flex items-center justify-center">
                    <User className="w-7 h-7 text-[var(--primary)]" />
                  </div>
                  <span className="text-xs font-mono text-[var(--on-surface-variant)]">user_12</span>
                </div>

                {/* Edge 1 - dashed line */}
                <div className="absolute left-[22%] top-[45%] w-[20%] h-px border-t-2 border-dashed border-[var(--outline-variant)]" />

                {/* Laptop Node */}
                <div className="absolute left-[45%] top-[20%] flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-container)] border border-[var(--outline-variant)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--on-surface-variant)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="12" rx="2" />
                      <line x1="2" y1="20" x2="22" y2="20" />
                    </svg>
                  </div>
                  <span className="text-xs font-mono text-[var(--on-surface-variant)]">ws-882</span>
                </div>

                {/* Edge 2 - anomalous line */}
                <div className="absolute left-[55%] top-[35%] w-[20%] h-[25%] rotate-12">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <line x1="0" y1="0" x2="100" y2="100" stroke="var(--error)" strokeWidth="2" />
                  </svg>
                </div>

                {/* S3 Bucket Node */}
                <div className="absolute right-[15%] top-[50%] flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-lg bg-[var(--error-container)]/10 border-2 border-[var(--error)] flex items-center justify-center">
                    <FolderOpen className="w-7 h-7 text-[var(--error)]" />
                  </div>
                  <span className="text-xs font-mono text-[var(--error)]">finance_bucket</span>
                </div>
              </div>
            </div>

            {/* Graph Controls */}
            <div className="absolute bottom-4 right-4 flex gap-1 bg-[var(--surface)]/50 backdrop-blur rounded p-1 border border-[var(--outline-variant)] z-10">
              <button className="p-1 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-variant)] rounded">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button className="p-1 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-variant)] rounded">
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Event Sequence Timeline */}
          <div className="bg-[var(--surface-container)] rounded-lg border border-[var(--outline-variant)] p-4 flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-[var(--on-surface)] border-b border-[var(--outline-variant)] pb-3">
              Sequence of Events
            </h3>
            <div className="relative flex flex-col gap-0 pl-2">
              {/* Vertical Line */}
              <div className="absolute left-[23px] top-4 bottom-4 w-px bg-[var(--outline-variant)]" />

              {/* Event 1 - Normal */}
              <div className="flex gap-4 relative pb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--outline-variant)] flex items-center justify-center z-10 text-[var(--on-surface-variant)]">
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="flex flex-col pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--on-surface-variant)]">01:45 AM</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-variant)] text-[var(--on-surface-variant)]">
                      NORMAL
                    </span>
                  </div>
                  <div className="text-base text-[var(--on-surface)]">Initial Authentication</div>
                  <div className="text-sm font-mono text-[var(--on-surface-variant)] mt-1">
                    Console login via SSO
                  </div>
                </div>
              </div>

              {/* Event 2 - Anomaly */}
              <div className="flex gap-4 relative pb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--error-container)]/20 border-2 border-[var(--error)] flex items-center justify-center z-10 text-[var(--error)]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex flex-col pt-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--error)]">02:05 AM</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--error)] text-[var(--on-error)] font-bold tracking-wider">
                        ANOMALY
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[var(--on-surface-variant)]">T +20m</span>
                  </div>
                  <div className="text-base text-[var(--error)] font-semibold">Role Assumption Deviation</div>
                  <div className="bg-[var(--surface-variant)] p-3 rounded mt-2 text-xs font-mono border-l-2 border-[var(--error)]">
                    <span className="text-[var(--on-surface-variant)]">Assumed Role: </span>
                    <span className="text-[var(--on-surface)]">arn:aws:iam::123456789012:role/FinanceDataAdmin</span>
                  </div>
                </div>
              </div>

              {/* Event 3 - Anomaly */}
              <div className="flex gap-4 relative pb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--error-container)]/20 border-2 border-[var(--error)] flex items-center justify-center z-10 text-[var(--error)]">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="flex flex-col pt-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--error)]">02:13 AM</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--error)] text-[var(--on-error)] font-bold tracking-wider">
                        ANOMALY
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[var(--on-surface-variant)]">T +28m</span>
                  </div>
                  <div className="text-base text-[var(--error)] font-semibold">Sensitive Bucket Access</div>
                  <div className="bg-[var(--surface-variant)] p-3 rounded mt-2 text-xs font-mono border-l-2 border-[var(--error)]">
                    <span className="text-[var(--on-surface-variant)]">Action: </span>
                    <span className="text-[var(--on-surface)]">s3:ListBucket</span>
                    <br />
                    <span className="text-[var(--on-surface-variant)]">Resource: </span>
                    <span className="text-[var(--on-surface)]">s3://finance_bucket</span>
                  </div>
                </div>
              </div>

              {/* Event 4 - Anomaly */}
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-[var(--error-container)]/20 border-2 border-[var(--error)] flex items-center justify-center z-10 text-[var(--error)]">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex flex-col pt-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--error)]">02:15 AM</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--error)] text-[var(--on-error)] font-bold tracking-wider">
                        ANOMALY
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[var(--on-surface-variant)]">T +30m</span>
                  </div>
                  <div className="text-base text-[var(--error)] font-semibold">High Volume Exfiltration Suspicion</div>
                  <div className="bg-[var(--surface-variant)] p-3 rounded mt-2 text-xs font-mono border-l-2 border-[var(--error)]">
                    <span className="text-[var(--on-surface-variant)]">Action: </span>
                    <span className="text-[var(--on-surface)]">s3:GetObject (Bulk)</span>
                    <br />
                    <span className="text-[var(--on-surface-variant)]">Volume: </span>
                    <span className="text-[var(--error)] font-bold">4.2 GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
