'use client';

import Link from 'next/link';

export default function AnomalousSequencesPage() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md glass-panel p-lg rounded-xl">
        <div className="flex items-center gap-md">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-container-high)] flex items-center justify-center border-2 border-[var(--primary-container)] overflow-hidden">
              <span className="text-3xl font-bold text-[var(--primary)]">JD</span>
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--primary-container)] rounded-full border-2 border-[var(--surface)] glow-safe" />
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-[var(--on-surface)] flex items-center gap-sm">
              Jonathan Doe
              <span className="px-2 py-0.5 rounded-full bg-[var(--surface-variant)] border border-[var(--outline-variant)] font-label-caps text-label-caps text-[var(--on-surface-variant)] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--primary-container)]" /> Active
              </span>
            </h2>
            <p className="font-body-lg text-body-lg text-[var(--on-surface-variant)] mt-1">Senior Data Engineer • Cloud Infrastructure</p>
          </div>
        </div>
        <div className="flex items-center gap-lg">
          <div className="text-right">
            <p className="font-label-caps text-label-caps text-[var(--on-surface-variant)] mb-1 uppercase">Entity Risk Score</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-[var(--error)] font-bold glow-error">78</span>
              <span className="font-code-md text-code-md text-[var(--on-surface-variant)]">/ 100</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-[var(--surface-variant)] border-t-[var(--error)] border-r-[var(--error)] border-b-[var(--tertiary)] transform rotate-45 glow-error relative">
            <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
              <span className="material-symbols-outlined text-[var(--error)]">trending_up</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left Column: Identity & Context (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-lg">
          {/* Profile Details */}
          <div className="bg-[var(--surface-container)] rounded-xl p-md border border-[var(--outline-variant)]">
            <h3 className="font-headline-sm text-headline-sm text-[var(--on-surface)] mb-md pb-sm border-b border-[var(--outline-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">badge</span> Identity Context
            </h3>
            <ul className="flex flex-col gap-sm">
              <li className="flex flex-col">
                <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">FIRST SEEN</span>
                <span className="font-code-md text-code-md text-[var(--on-surface)]">2021-04-12 08:30 UTC</span>
              </li>
              <li className="flex flex-col mt-2">
                <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">PRIMARY LOCATION</span>
                <span className="font-body-md text-body-md text-[var(--on-surface)] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-[16px]">location_on</span> Seattle, WA (US-WEST-2)
                </span>
              </li>
              <li className="flex flex-col mt-2">
                <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">MANAGER</span>
                <span className="font-body-md text-body-md text-[var(--on-surface)] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--surface-container-high)] flex items-center justify-center border border-[var(--outline-variant)]">
                    <span className="text-[10px] font-bold text-[var(--on-surface-variant)]">SC</span>
                  </div>
                  Sarah Connor
                </span>
              </li>
            </ul>
          </div>

          {/* Devices */}
          <div className="bg-[var(--surface-container)] rounded-xl p-md border border-[var(--outline-variant)]">
            <h3 className="font-headline-sm text-headline-sm text-[var(--on-surface)] mb-md pb-sm border-b border-[var(--outline-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">devices</span> Known Devices
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between p-sm bg-[var(--surface-container-high)] rounded-lg border border-[var(--outline-variant)]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--on-surface-variant)]">laptop_mac</span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm text-[var(--on-surface)]">MBP-JDOE-2023</span>
                    <span className="font-label-caps text-label-caps text-[var(--primary)]">TRUSTED</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-sm bg-[var(--surface-container-high)] rounded-lg border border-[var(--error-container)] glow-error">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--error)]">smartphone</span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm text-[var(--on-surface)]">Unknown iOS Device</span>
                    <span className="font-label-caps text-label-caps text-[var(--error)]">UNVERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Column (9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-lg">
          {/* Top: Key Behavioral Indicators (KBIs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {/* KBI 1: After-hours Activity */}
            <div className="bg-[var(--surface-container)] rounded-xl p-md border border-[var(--outline-variant)] hover:border-[#334155] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--error-container)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)] uppercase">After-hours Activity</span>
                <span className="material-symbols-outlined text-[var(--error)]">schedule</span>
              </div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="font-headline-md text-headline-md text-[var(--error)] font-bold">14 hrs</span>
                <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)] pb-1">past 7 days</span>
              </div>
              <div className="mt-4 h-8 w-full bg-[var(--surface-variant)] rounded flex items-end px-1 relative z-10">
                <div className="w-1/6 h-1/4 bg-[var(--error-container)] rounded-t" />
                <div className="w-1/6 h-2/4 bg-[var(--error-container)] rounded-t ml-1" />
                <div className="w-1/6 h-1/4 bg-[var(--error-container)] rounded-t ml-1" />
                <div className="w-1/6 h-full bg-[var(--error)] rounded-t ml-1 glow-error" />
                <div className="w-1/6 h-3/4 bg-[var(--error-container)] rounded-t ml-1" />
                <div className="w-1/6 h-2/4 bg-[var(--error-container)] rounded-t ml-1" />
              </div>
            </div>

            {/* KBI 2: Resource Access Volume */}
            <div className="bg-[var(--surface-container)] rounded-xl p-md border border-[var(--outline-variant)] hover:border-[#334155] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--tertiary-container)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)] uppercase">Resource Access Vol</span>
                <span className="material-symbols-outlined text-[var(--tertiary)]">storage</span>
              </div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="font-headline-md text-headline-md text-[var(--tertiary)] font-bold">+340%</span>
                <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)] pb-1">vs baseline</span>
              </div>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <span className="px-2 py-1 bg-[var(--surface-variant)] rounded text-[var(--on-surface)] font-code-sm">S3: arn:aws:s3:::prod-data</span>
              </div>
            </div>

            {/* KBI 3: Geo-Velocity */}
            <div className="bg-[var(--surface-container)] rounded-xl p-md border border-[var(--outline-variant)] hover:border-[#334155] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-container)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)] uppercase">Geo-Velocity</span>
                <span className="material-symbols-outlined text-[var(--primary)]">public</span>
              </div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="font-headline-md text-headline-md text-[var(--on-surface)] font-bold">Normal</span>
              </div>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <div className="flex items-center gap-1 font-code-sm text-[var(--on-surface-variant)]">
                  <span>US-W2</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                  <span>US-E1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Baseline Chart */}
          <div className="bg-[var(--surface-container)] rounded-xl p-md border border-[var(--outline-variant)] flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-md border-b border-[var(--outline-variant)] pb-sm">
              <h3 className="font-headline-sm text-headline-sm text-[var(--on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">timeline</span> Activity Baseline (Typical Day)
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 font-label-caps text-label-caps text-[var(--on-surface-variant)]">
                  <div className="w-3 h-3 bg-[var(--primary-container)] rounded-full opacity-50" /> 30d Avg
                </span>
                <span className="flex items-center gap-1 font-label-caps text-label-caps text-[var(--on-surface)]">
                  <div className="w-3 h-3 bg-[var(--error)] rounded-full" /> Current 24h
                </span>
              </div>
            </div>
            <div className="flex-1 relative border-l border-b border-[var(--outline-variant)] mx-4 mb-4 mt-2">
              <div className="absolute -left-6 top-0 font-code-sm text-[var(--on-surface-variant)]">High</div>
              <div className="absolute -left-6 bottom-0 font-code-sm text-[var(--on-surface-variant)]">Low</div>
              <div className="absolute -bottom-6 left-0 font-code-sm text-[var(--on-surface-variant)]">00:00</div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-code-sm text-[var(--on-surface-variant)]">12:00</div>
              <div className="absolute -bottom-6 right-0 font-code-sm text-[var(--on-surface-variant)]">23:59</div>
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="w-full h-px bg-[var(--outline-variant)] opacity-20" />
                <div className="w-full h-px bg-[var(--outline-variant)] opacity-20" />
                <div className="w-full h-px bg-[var(--outline-variant)] opacity-20" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--primary-container)]/20 to-transparent border-t border-[var(--primary-container)]/50" style={{ clipPath: 'polygon(0 100%, 0 40%, 20% 35%, 40% 60%, 60% 55%, 80% 30%, 100% 40%, 100% 100%)' }} />
              <div className="absolute bottom-0 left-[60%] w-[30%] h-3/4 bg-gradient-to-t from-[var(--error)]/30 to-transparent border-t-2 border-[var(--error)] glow-error rounded-t" style={{ clipPath: 'polygon(0 100%, 20% 10%, 40% 0, 60% 20%, 80% 80%, 100% 100%)' }} />
            </div>
          </div>

          {/* Peer Group Comparison */}
          <div className="bg-[var(--surface-container)] rounded-xl p-md border border-[var(--outline-variant)]">
            <div className="flex justify-between items-center mb-md border-b border-[var(--outline-variant)] pb-sm">
              <h3 className="font-headline-sm text-headline-sm text-[var(--on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">groups</span> Peer Group Comparison (Data Engineering Team)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Data Exfiltration vs. Peers */}
              <div className="space-y-4">
                <h4 className="font-label-caps text-label-caps text-[var(--on-surface-variant)] uppercase">Data Exfiltration vs. Peers</h4>
                <div className="space-y-md">
                  <div className="space-y-1">
                    <div className="flex justify-between font-code-sm text-[var(--on-surface)]">
                      <span>Jonathan Doe (User)</span>
                      <span className="text-[var(--error)]">8.4 GB</span>
                    </div>
                    <div className="h-4 w-full bg-[var(--surface-variant)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--error)] glow-error" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-code-sm text-[var(--on-surface)]">
                      <span>Team Maximum</span>
                      <span>2.5 GB</span>
                    </div>
                    <div className="h-4 w-full bg-[var(--surface-variant)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--tertiary-container)]" style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-code-sm text-[var(--on-surface)]">
                      <span>Team Average</span>
                      <span className="text-[var(--primary)]">1.2 GB</span>
                    </div>
                    <div className="h-4 w-full bg-[var(--surface-variant)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary-container)]" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensitive Command Usage Profile */}
              <div className="space-y-4">
                <h4 className="font-label-caps text-label-caps text-[var(--on-surface-variant)] uppercase">Sensitive Command Usage Profile</h4>
                <div className="space-y-sm">
                  <div className="flex items-center justify-between p-sm bg-[var(--surface-container-high)] rounded-lg border border-[var(--outline-variant)]">
                    <span className="font-code-sm text-[var(--on-surface)]">s3:ListBucket</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--error)] font-bold">+800%</span>
                      <span className="material-symbols-outlined text-[var(--error)] text-[18px]">trending_up</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-sm bg-[var(--surface-container-high)] rounded-lg border border-[var(--outline-variant)]">
                    <span className="font-code-sm text-[var(--on-surface)]">iam:AssumeRole</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--tertiary)] font-bold">+150%</span>
                      <span className="material-symbols-outlined text-[var(--tertiary)] text-[18px]">trending_up</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-sm bg-[var(--surface-container-high)] rounded-lg border border-[var(--outline-variant)]">
                    <span className="font-code-sm text-[var(--on-surface-variant)]">ec2:DescribeInstances</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--primary)] font-bold">Normal</span>
                      <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">check_circle</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Anomalous Sequences */}
          <div className="bg-[var(--surface-container)] rounded-2xl p-6 border border-[var(--outline-variant)]">
            <div className="flex justify-between items-center mb-md border-b border-[var(--outline-variant)] pb-sm">
              <h3 className="font-headline-sm text-headline-sm text-[var(--on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">account_tree</span> Recent Anomalous Sequences
              </h3>
            </div>
            <div className="flex flex-col gap-md">
              {/* Sequence Item 1 */}
              <div className="p-md bg-[var(--surface-container-high)] rounded-xl border border-[var(--outline-variant)] flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">SEQ-042</span>
                    <span className="text-[var(--error)] font-bold font-code-md underline">CRITICAL PATH</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface)] font-code-sm border border-[var(--outline-variant)]">Console Login</span>
                    <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-sm">arrow_forward</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface)] font-code-sm border border-[var(--outline-variant)]">IAM:AssumeRole</span>
                    <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-sm">arrow_forward</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--error-container)] text-[var(--error)] font-code-sm border border-[var(--error)]">S3:BulkDownload</span>
                  </div>
                </div>
                <div className="flex items-center gap-lg">
                  <div className="text-right">
                    <p className="font-label-caps text-label-caps text-[var(--on-surface-variant)] mb-1">SEQ RISK</p>
                    <span className="font-headline-md text-[var(--error)] font-bold glow-error">84</span>
                  </div>
                  <Link href="/investigation?id=A-102" className="px-4 py-2 bg-[var(--surface-variant)] text-[var(--on-surface)] font-label-caps rounded-lg border border-[var(--outline-variant)] hover:bg-[var(--outline-variant)] transition-colors">
                    VIEW DETAILS
                  </Link>
                </div>
              </div>

              {/* Sequence Item 2 */}
              <div className="p-md bg-[var(--surface-container-high)] rounded-xl border border-[var(--outline-variant)] flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">SEQ-038</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface)] font-code-sm border border-[var(--outline-variant)]">VPN Connection</span>
                    <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-sm">arrow_forward</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface)] font-code-sm border border-[var(--outline-variant)]">EC2:DescribeInstances</span>
                    <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-sm">arrow_forward</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface)] font-code-sm border border-[var(--outline-variant)]">RDS:DataExport</span>
                  </div>
                </div>
                <div className="flex items-center gap-lg">
                  <div className="text-right">
                    <p className="font-label-caps text-label-caps text-[var(--on-surface-variant)] mb-1">SEQ RISK</p>
                    <span className="font-headline-md text-[var(--tertiary)] font-bold">52</span>
                  </div>
                  <button className="px-4 py-2 bg-[var(--surface-variant)] text-[var(--on-surface)] font-label-caps rounded-lg border border-[var(--outline-variant)] hover:bg-[var(--outline-variant)] transition-colors">
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
