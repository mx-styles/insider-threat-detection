"use client";

import { useState } from 'react';
import { Filter, Download, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

const alerts = [
  {
    id: 'ALT-1024',
    severity: 'critical',
    user: 'j.smith@company.com',
    action: 'Unauthorized S3 bucket access',
    resource: 's3://confidential-data',
    time: '2 min ago',
    score: 94,
    status: 'new',
    awsService: 'S3',
  },
  {
    id: 'ALT-1023',
    severity: 'warning',
    user: 'm.johnson@company.com',
    action: 'Unusual IAM role assumption',
    resource: 'arn:aws:iam::123456789012:role/Admin',
    time: '15 min ago',
    score: 72,
    status: 'investigating',
    awsService: 'IAM',
  },
  {
    id: 'ALT-1022',
    severity: 'warning',
    user: 'r.williams@company.com',
    action: 'Data exfiltration attempt detected',
    resource: 'ec2:i-0abc123def456',
    time: '28 min ago',
    score: 68,
    status: 'new',
    awsService: 'EC2',
  },
  {
    id: 'ALT-1021',
    severity: 'safe',
    user: 'k.brown@company.com',
    action: 'Login from new location',
    resource: 'Console Login',
    time: '45 min ago',
    score: 23,
    status: 'resolved',
    awsService: 'Console',
  },
  {
    id: 'ALT-1020',
    severity: 'critical',
    user: 'a.davis@company.com',
    action: 'Mass download from DynamoDB',
    resource: 'dynamodb:prod-users-table',
    time: '1 hr ago',
    score: 89,
    status: 'investigating',
    awsService: 'DynamoDB',
  },
  {
    id: 'ALT-1019',
    severity: 'warning',
    user: 't.wilson@company.com',
    action: 'Security group modification',
    resource: 'sg-0abc123def456',
    time: '2 hr ago',
    score: 56,
    status: 'resolved',
    awsService: 'VPC',
  },
];

function SeverityBadge({ severity }: { severity: string }) {
  const styles: any = {
    critical: 'bg-[var(--secondary-container)]/20 border-[var(--secondary-container)] text-[var(--secondary)]',
    warning: 'bg-[var(--tertiary-container)]/20 border-[var(--tertiary-container)] text-[var(--tertiary)]',
    safe: 'bg-[var(--primary-container)]/20 border-[var(--primary-container)] text-[var(--primary)]',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-mono font-semibold border ${styles[severity]}`}
    >
      {severity.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    new: 'bg-blue-500/20 border-blue-500 text-blue-400',
    investigating: 'bg-[var(--tertiary-container)]/20 border-[var(--tertiary-container)] text-[var(--tertiary)]',
    resolved: 'bg-[var(--primary-container)]/20 border-[var(--primary-container)] text-[var(--primary)]',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-mono font-semibold border ${styles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export default function AlertsPage() {
  const [filter, setFilter] = useState('all');

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <section className="bg-[#1e293b]/60 backdrop-blur-md border border-[var(--outline-variant)] rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="font-label-caps text-[var(--on-surface-variant)] mb-1 block">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]">search</span>
              <input className="w-full bg-[#0f172a] border border-[var(--outline-variant)] rounded-lg py-2 pl-10 pr-3 text-[var(--on-surface)]" placeholder="Search by User, ID, or IP..." />
            </div>
          </div>

          <div className="w-48">
            <label className="font-label-caps text-[var(--on-surface-variant)] mb-1 block">Severity</label>
            <select className="w-full bg-[#0f172a] border border-[var(--outline-variant)] rounded-lg py-2 px-3 text-[var(--on-surface)]" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">High</option>
              <option value="safe">Low</option>
            </select>
          </div>

          <div className="w-48">
            <label className="font-label-caps text-[var(--on-surface-variant)] mb-1 block">Target User</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]">person</span>
              <input className="w-full bg-[#0f172a] border border-[var(--outline-variant)] rounded-lg py-2 pl-10 pr-3 text-[var(--on-surface)]" placeholder="Filter user..." />
            </div>
          </div>

          <div className="w-56">
            <label className="font-label-caps text-[var(--on-surface-variant)] mb-1 block">Time Range</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]">calendar_month</span>
              <select className="w-full bg-[#0f172a] border border-[var(--outline-variant)] rounded-lg py-2 pl-10 pr-3 text-[var(--on-surface)]">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range...</option>
              </select>
            </div>
          </div>

          <button className="bg-[var(--surface-variant)] text-[var(--on-surface)] border border-[var(--outline-variant)] px-4 py-2 rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </section>

        <section className="bg-[#0f172a] border border-[var(--outline-variant)] rounded-xl overflow-hidden flex flex-col flex-1">
          <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-[#1e293b]/50 border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] font-semibold text-xs items-center">
            <div className="col-span-1">Alert ID</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2">User Context</div>
            <div className="col-span-2">Detection Type</div>
            <div className="col-span-1">Risk Score</div>
            <div className="col-span-1">Severity</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredAlerts.map((a) => (
              <div key={a.id} className={`grid grid-cols-12 gap-2 px-6 py-4 data-table-row items-center group relative ${a.severity === 'critical' ? 'bg-error/5' : ''}`}>
                {a.severity === 'critical' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />}
                <div className="col-span-1 font-mono text-[var(--on-surface)]">{a.id.replace('ALT-', 'A-')}</div>
                <div className="col-span-2 text-[var(--on-surface-variant)] text-sm">{a.time}<br /><span className="text-xs opacity-70">Today</span></div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[var(--on-surface-variant)]">account_circle</span>
                  <span className="font-mono truncate">{a.user.split('@')[0]}</span>
                </div>
                <div className="col-span-2 truncate">{a.action}</div>
                <div className="col-span-1 font-mono font-semibold">{a.score >= 0.7 ? a.score.toFixed(2) : (a.score * 100).toFixed(0)}</div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${a.severity === 'critical' ? 'bg-error/20 text-error border border-error/50 glow-critical' : a.severity === 'warning' ? 'bg-yellow-100/20 text-yellow-400 border border-yellow-300 glow-warning' : 'bg-green-100/20 text-green-400 border border-green-300 glow-safe'}`}>
                    {a.severity === 'critical' ? 'Critical' : a.severity === 'warning' ? 'High' : 'Low'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`flex items-center gap-2 text-sm ${a.status === 'resolved' ? 'text-primary' : a.status === 'investigating' ? 'text-yellow-300' : 'text-error'}`}>
                    <span className="material-symbols-outlined text-sm">{a.status === 'resolved' ? 'check_circle' : a.status === 'investigating' ? 'pending' : 'radio_button_unchecked'}</span>
                    {a.status === 'resolved' ? 'Resolved' : a.status === 'investigating' ? 'In Progress' : 'Unresolved'}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <Link href={`/investigation?id=${a.id.replace('ALT-', 'A-')}`} className="bg-transparent border border-[var(--outline-variant)] text-[var(--on-surface)] hover:border-[var(--primary)] hover:text-[var(--primary)] px-3 py-1 rounded text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 inline-block text-center">Details</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0b1326] border-t border-[var(--outline-variant)] px-6 py-3 flex justify-between items-center">
            <span className="text-[var(--on-surface-variant)] text-sm">Showing 1-{filteredAlerts.length} of {alerts.length} detections</span>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="font-mono text-xs text-[var(--on-surface)]">Page 1 of 12</span>
              <button className="p-1 rounded text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
