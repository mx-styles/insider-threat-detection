'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Filter, Download, ChevronRight, Clock } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--on-surface)]">Alert Center</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Monitor and investigate security alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {['all', 'critical', 'warning', 'safe'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30'
                : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] border border-transparent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && (
              <span className="ml-2 text-xs">({alerts.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts table */}
      <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--outline-variant)]">
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Alert ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Severity
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  AWS Service
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Time
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-[var(--surface-container-high)]/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-[var(--on-surface)]">{alert.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-[var(--on-surface-variant)]">
                      {alert.user}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-[var(--on-surface)]">{alert.action}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-[var(--on-surface-variant)]">
                      {alert.awsService}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={alert.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-semibold text-sm ${
                        alert.score >= 70
                          ? 'bg-[var(--secondary-container)]/20 text-[var(--secondary)]'
                          : alert.score >= 40
                          ? 'bg-[var(--tertiary-container)]/20 text-[var(--tertiary)]'
                          : 'bg-[var(--primary-container)]/20 text-[var(--primary)]'
                      }`}
                    >
                      {alert.score}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm text-[var(--on-surface-variant)]">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href="/investigation"
                      className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-[var(--on-surface-variant)] hover:text-[var(--primary)]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
