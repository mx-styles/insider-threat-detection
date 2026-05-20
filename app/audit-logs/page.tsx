'use client';

import { useState } from 'react';
import { Search, Filter, Download, Clock } from 'lucide-react';

const logs = [
  {
    id: 'LOG-45892',
    timestamp: '2026-05-19 17:28:45',
    user: 'j.smith@company.com',
    action: 's3:GetObject',
    resource: 'arn:aws:s3:::confidential-data/report.pdf',
    sourceIP: '192.168.1.45',
    region: 'us-east-1',
    status: 'success',
    severity: 'warning',
  },
  {
    id: 'LOG-45891',
    timestamp: '2026-05-19 17:27:32',
    user: 'm.johnson@company.com',
    action: 'iam:AssumeRole',
    resource: 'arn:aws:iam::123456789012:role/Admin',
    sourceIP: '10.0.2.18',
    region: 'us-west-2',
    status: 'success',
    severity: 'critical',
  },
  {
    id: 'LOG-45890',
    timestamp: '2026-05-19 17:25:18',
    user: 'r.williams@company.com',
    action: 'ec2:RunInstances',
    resource: 'arn:aws:ec2:us-east-1:123456789012:instance/*',
    sourceIP: '172.16.0.5',
    region: 'us-east-1',
    status: 'success',
    severity: 'warning',
  },
  {
    id: 'LOG-45889',
    timestamp: '2026-05-19 17:23:05',
    user: 'k.brown@company.com',
    action: 'console:Login',
    resource: 'AWS Management Console',
    sourceIP: '203.0.113.42',
    region: 'global',
    status: 'success',
    severity: 'safe',
  },
  {
    id: 'LOG-45888',
    timestamp: '2026-05-19 17:20:51',
    user: 'a.davis@company.com',
    action: 'dynamodb:Scan',
    resource: 'arn:aws:dynamodb:us-east-1:123456789012:table/prod-users',
    sourceIP: '10.0.1.23',
    region: 'us-east-1',
    status: 'success',
    severity: 'critical',
  },
  {
    id: 'LOG-45887',
    timestamp: '2026-05-19 17:18:33',
    user: 't.wilson@company.com',
    action: 'ec2:AuthorizeSecurityGroupIngress',
    resource: 'arn:aws:ec2:us-east-1:123456789012:security-group/sg-0abc123',
    sourceIP: '10.0.3.8',
    region: 'us-east-1',
    status: 'success',
    severity: 'warning',
  },
];

function SeverityBadge({ severity }: { severity: string }) {
  const styles: any = {
    critical: 'bg-[var(--secondary-container)]/20 border-[var(--secondary-container)] text-[var(--secondary)]',
    warning: 'bg-[var(--tertiary-container)]/20 border-[var(--tertiary-container)] text-[var(--tertiary)]',
    safe: 'bg-[var(--primary-container)]/20 border-[var(--primary-container)] text-[var(--primary)]',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-mono font-semibold border ${styles[severity]}`}>
      {severity.toUpperCase()}
    </span>
  );
}

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--on-surface)]">Audit Logs</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Raw activity logs from AWS CloudTrail
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
        <input
          type="text"
          placeholder="Search logs by user, action, resource, or IP..."
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm font-mono text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Logs table */}
      <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--outline-variant)]">
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Resource
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Source IP
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Region
                </th>
                <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-container-high)]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 text-xs font-mono text-[var(--on-surface-variant)]">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-[var(--on-surface)]">{log.user}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-[var(--primary)]">{log.action}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-[var(--on-surface-variant)] truncate block max-w-[200px]">
                      {log.resource}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-[var(--on-surface-variant)]">{log.sourceIP}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-[var(--on-surface-variant)]">{log.region}</span>
                  </td>
                  <td className="px-5 py-3">
                    <SeverityBadge severity={log.severity} />
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
