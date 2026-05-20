'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const investigations: any = {
  'A-102': {
    id: 'A-102',
    severity: 'critical',
    riskScore: '0.92',
    entity: 'user_12',
    department: 'Data Engineering',
    firstSeen: 'Oct 24, 01:45 AM',
    location: 'Seattle, US (VPN)',
    explanation: 'User accessed sensitive resource after privilege escalation during abnormal hours.',
    tags: ['AFTER HOURS', 'PRIVILEGE ESCALATION', 'SENSITIVE ACCESS'],
    features: [
      { name: 'Resource Sensitivity', value: 92, severity: 'error' },
      { name: 'Time of Day Anomaly', value: 85, severity: 'error' },
      { name: 'Role Deviation', value: 64, severity: 'tertiary' },
    ],
    events: [
      {
        time: '01:45 AM',
        type: 'NORMAL',
        title: 'Initial Authentication',
        detail: 'Console login via SSO',
        icon: 'login',
        anomaly: false,
      },
      {
        time: '02:05 AM',
        delta: 'T +20m',
        type: 'ANOMALY',
        title: 'Role Assumption Deviation',
        detail: (
          <>
            <span className="text-[var(--on-surface-variant)]">Assumed Role: </span>
            <span className="text-[var(--on-surface)]">arn:aws:iam::123456789012:role/FinanceDataAdmin</span>
          </>
        ),
        icon: 'admin_panel_settings',
        anomaly: true,
      },
      {
        time: '02:13 AM',
        delta: 'T +28m',
        type: 'ANOMALY',
        title: 'Sensitive Bucket Access',
        detail: (
          <>
            <span className="text-[var(--on-surface-variant)]">Action: </span>
            <span className="text-[var(--on-surface)]">s3:ListBucket</span>
            <br />
            <span className="text-[var(--on-surface-variant)]">Resource: </span>
            <span className="text-[var(--on-surface)]">s3://finance_bucket</span>
          </>
        ),
        icon: 'folder_open',
        anomaly: true,
      },
      {
        time: '02:15 AM',
        delta: 'T +30m',
        type: 'ANOMALY',
        title: 'High Volume Exfiltration Suspicion',
        detail: (
          <>
            <span className="text-[var(--on-surface-variant)]">Action: </span>
            <span className="text-[var(--on-surface)]">s3:GetObject (Bulk)</span>
            <br />
            <span className="text-[var(--on-surface-variant)]">Volume: </span>
            <span className="text-[var(--error)] font-bold">4.2 GB</span>
          </>
        ),
        icon: 'download',
        anomaly: true,
      },
    ],
  },
};

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === 'critical') {
    return (
      <span className="inline-flex items-center gap-xs px-sm py-base rounded-full bg-[var(--error-container)]/20 border border-[var(--error)] text-[var(--error)] font-label-caps text-label-caps glow-error">
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          error
        </span>{' '}
        CRITICAL
      </span>
    );
  }
  if (severity === 'warning') {
    return (
      <span className="inline-flex items-center gap-xs px-sm py-base rounded-full bg-[var(--tertiary-container)]/20 border border-[var(--tertiary)] text-[var(--tertiary)] font-label-caps text-label-caps">
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          warning
        </span>{' '}
        HIGH
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-xs px-sm py-base rounded-full bg-[var(--primary-container)]/20 border border-[var(--primary)] text-[var(--primary)] font-label-caps text-label-caps">
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>{' '}
      LOW
    </span>
  );
}

function InvestigationContent() {
  const searchParams = useSearchParams();
  const alertId = searchParams.get('id') || 'A-102';
  const inv = investigations[alertId] || investigations['A-102'];

  return (
    <div className="flex flex-col gap-gutter">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <Link
              href="/alerts"
              className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors flex items-center gap-xs font-label-caps text-label-caps"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> BACK TO ALERTS
            </Link>
          </div>
          <h1 className="font-display-lg text-display-lg flex items-center gap-md">
            Investigation {inv.id}
            <SeverityBadge severity={inv.severity} />
          </h1>
        </div>
        <div className="flex gap-sm">
          <button className="bg-[var(--surface-container)] border border-[var(--outline-variant)] hover:border-[var(--outline)] text-[var(--on-surface)] px-md py-sm rounded font-body-md text-body-md transition-colors">
            Acknowledge
          </button>
          <button className="bg-[var(--primary)] text-[var(--on-primary)] px-md py-sm rounded font-body-md text-body-md font-semibold hover:bg-[var(--primary-fixed)] transition-colors">
            Create Case
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column - 4 col */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Overview Card */}
          <div className="bg-[var(--surface-container-low)] rounded-lg p-md border border-[var(--outline-variant)] flex flex-col gap-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md flex items-start justify-end">
              <div className="text-right">
                <div className="font-label-caps text-label-caps text-[var(--on-surface-variant)] mb-base uppercase">
                  Risk Score
                </div>
                <div
                  className={`font-code-md text-code-md font-bold text-[24px] leading-none ${
                    inv.severity === 'critical' ? 'text-[var(--error)] glow-error' : inv.severity === 'warning' ? 'text-[var(--tertiary)]' : 'text-[var(--primary)]'
                  }`}
                >
                  {inv.riskScore}
                </div>
              </div>
            </div>
            <div className="font-label-caps text-label-caps text-[var(--on-surface-variant)] mb-xs">Entity Profile</div>
            <div className="flex items-center gap-md mb-sm">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-container)] flex items-center justify-center border border-[var(--outline-variant)]">
                <span className="material-symbols-outlined text-[var(--primary)] text-[24px]">person</span>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm">{inv.entity}</div>
                <div className="font-body-md text-body-md text-[var(--on-surface-variant)]">{inv.department}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-sm mt-xs">
              <div>
                <div className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">First Seen</div>
                <div className="font-body-md text-body-md">{inv.firstSeen}</div>
              </div>
              <div>
                <div className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Location</div>
                <div className="font-body-md text-body-md">{inv.location}</div>
              </div>
            </div>
          </div>

          {/* Explanation Card */}
          <div className="bg-[var(--surface-container)] rounded-lg p-md border border-[var(--outline-variant)] flex flex-col gap-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[var(--primary)]">psychiatry</span>
              <h2 className="font-headline-sm text-headline-sm">Model Explanation</h2>
            </div>
            <p className="font-body-lg text-body-lg text-[var(--on-surface)] leading-relaxed">{inv.explanation}</p>
            <div className="flex flex-wrap gap-xs">
              {inv.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-sm py-base rounded-full bg-[var(--surface-variant)] text-[var(--on-surface-variant)] font-label-caps text-label-caps border border-[var(--outline-variant)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-[var(--surface-container)] rounded-lg p-md border border-[var(--outline-variant)] flex flex-col gap-md">
            <h3 className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Feature Contributions</h3>
            <div className="flex flex-col gap-sm">
              {inv.features.map((feature: any) => (
                <div key={feature.name} className="flex flex-col gap-base">
                  <div className="flex justify-between font-code-sm text-code-sm">
                    <span>{feature.name}</span>
                    <span className={feature.severity === 'error' ? 'text-[var(--error)]' : 'text-[var(--tertiary-container)]'}>
                      {feature.value}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-variant)] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        feature.severity === 'error' ? 'bg-[var(--error)] glow-error' : 'bg-[var(--tertiary-container)]'
                      }`}
                      style={{ width: `${feature.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 8 col */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {/* Graph View Placeholder */}
          <div className="bg-[var(--surface-container-low)] rounded-lg border border-[var(--outline-variant)] flex flex-col h-[400px] relative overflow-hidden group">
            <div className="absolute top-md left-md z-10 flex items-center gap-sm">
              <span className="material-symbols-outlined text-[var(--on-surface-variant)]">hub</span>
              <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Entity Graph</span>
            </div>
            {/* Graph Canvas */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Dot Grid Background */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle, var(--outline-variant) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.15,
                  }}
                />
                {/* SVG Connections */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                  {/* Edge: user_12 -> ws-882 (dashed) */}
                  <line
                    x1="180"
                    y1="200"
                    x2="380"
                    y2="100"
                    stroke="var(--outline-variant)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  {/* Edge: ws-882 -> finance_bucket (red, anomalous) */}
                  <line
                    x1="420"
                    y1="100"
                    x2="620"
                    y2="200"
                    stroke="var(--error)"
                    strokeWidth="2"
                    filter="drop-shadow(0 0 4px rgba(255,180,171,0.4))"
                  />
                </svg>
                {/* Nodes */}
                {/* Node: user_12 */}
                <div className="absolute left-[15%] top-[40%] flex flex-col items-center gap-xs z-10">
                  <div className="w-14 h-14 rounded-full bg-[var(--surface-container)] border-2 border-[var(--primary)] flex items-center justify-center glow-primary">
                    <span className="material-symbols-outlined text-[var(--primary)] text-[24px]">person</span>
                  </div>
                  <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">{inv.entity}</span>
                </div>
                {/* Node: ws-882 */}
                <div className="absolute left-[45%] top-[12%] flex flex-col items-center gap-xs z-10">
                  <div className="w-10 h-10 rounded bg-[var(--surface-container)] border border-[var(--outline-variant)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-[18px]">laptop_mac</span>
                  </div>
                  <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">ws-882</span>
                </div>
                {/* Node: finance_bucket */}
                <div className="absolute right-[15%] top-[40%] flex flex-col items-center gap-xs z-10">
                  <div className="w-14 h-14 rounded-lg bg-[var(--error-container)]/10 border-2 border-[var(--error)] flex items-center justify-center glow-error">
                    <span className="material-symbols-outlined text-[var(--error)] text-[24px]">folder_special</span>
                  </div>
                  <span className="font-code-sm text-code-sm text-[var(--error)]">finance_bucket</span>
                </div>
              </div>
            </div>
            {/* Graph Controls */}
            <div className="absolute bottom-md right-md flex gap-sm bg-[var(--surface)]/50 backdrop-blur rounded p-1 border border-[var(--outline-variant)] z-10">
              <button className="p-xs text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-variant)] rounded">
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>
              <button className="p-xs text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-variant)] rounded">
                <span className="material-symbols-outlined text-[18px]">zoom_out</span>
              </button>
            </div>
          </div>

          {/* Event Sequence Timeline */}
          <div className="bg-[var(--surface-container)] rounded-lg border border-[var(--outline-variant)] p-md flex flex-col gap-lg">
            <h3 className="font-headline-sm text-headline-sm border-b border-[var(--outline-variant)] pb-sm">Sequence of Events</h3>
            <div className="relative flex flex-col gap-0 pl-sm">
              {/* Vertical Line */}
              <div className="absolute left-[23px] top-4 bottom-4 w-px bg-[var(--outline-variant)]" />
              {inv.events.map((event: any, index: number) => (
                <div key={index} className={`flex gap-md relative group ${index < inv.events.length - 1 ? 'pb-lg' : ''}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      event.anomaly
                        ? 'bg-[var(--error-container)]/20 border-2 border-[var(--error)] text-[var(--error)] glow-error'
                        : 'bg-[var(--surface)] border border-[var(--outline-variant)] text-[var(--on-surface-variant)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{event.icon}</span>
                  </div>
                  <div className={`flex flex-col pt-xs ${event.anomaly ? 'w-full' : ''}`}>
                    <div className={`flex items-center ${event.anomaly ? 'justify-between' : 'gap-sm'} mb-xs`}>
                      <div className="flex items-center gap-sm">
                        <span
                          className={`font-code-sm text-code-sm ${event.anomaly ? 'text-[var(--error)]' : 'text-[var(--on-surface-variant)]'}`}
                        >
                          {event.time}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            event.anomaly
                              ? 'bg-[var(--error)] text-[var(--on-error)] font-bold tracking-wide'
                              : 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
                          }`}
                        >
                          {event.type}
                        </span>
                      </div>
                      {event.delta && (
                        <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">{event.delta}</span>
                      )}
                    </div>
                    <div
                      className={`font-body-lg text-body-lg ${
                        event.anomaly ? 'text-[var(--error)] font-semibold' : 'text-[var(--on-surface)]'
                      }`}
                    >
                      {event.title}
                    </div>
                    {event.detail && (
                      <div className="bg-[var(--surface-variant)] p-sm rounded mt-2 font-code-sm text-code-sm border-l-2 border-[var(--error)]">
                        {event.detail}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestigationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[var(--on-surface-variant)]">Loading investigation...</div>}>
      <InvestigationContent />
    </Suspense>
  );
}
