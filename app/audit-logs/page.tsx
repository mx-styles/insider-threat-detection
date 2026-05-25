'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Download, Clock } from 'lucide-react';
import { downloadText, fetchJson } from '@/lib/client-api';

type AuditLogItem = {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  resource: string;
  sourceIP: string;
  region: string;
  status: string;
  severity: string;
};

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
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyRisky, setShowOnlyRisky] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    let isMounted = true;
    fetchJson<{ logs: AuditLogItem[] }>('/api/audit-logs')
      .then((data) => {
        if (isMounted) setLogs(data.logs);
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, showOnlyRisky]);

  const filteredLogs = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return logs.filter((log) => {
      const matchSearch = !searchTerm
        || `${log.userName} ${log.action} ${log.resource} ${log.sourceIP} ${log.region}`
          .toLowerCase()
          .includes(query);
      const matchRisk = !showOnlyRisky || log.severity !== 'safe';
      return matchSearch && matchRisk;
    });
  }, [logs, searchTerm, showOnlyRisky]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filteredLogs.slice(pageStart, pageStart + pageSize);
  const showingFrom = filteredLogs.length === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(filteredLogs.length, pageStart + pageSize);

  const handleExport = () => {
    const headers = ['id', 'timestamp', 'userName', 'action', 'resource', 'sourceIP', 'region', 'status', 'severity'];
    const escapeCsv = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
    const rows = filteredLogs.map((log) =>
      headers.map((key) => escapeCsv(String((log as Record<string, string>)[key] ?? ''))).join(',')
    );
    const content = [headers.join(','), ...rows].join('\n');
    downloadText('audit-logs.csv', content, 'text/csv');
  };

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
          <button
            className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors"
            onClick={() => setShowOnlyRisky((current) => !current)}
          >
            <Filter className="w-4 h-4" />
            {showOnlyRisky ? 'Filter: Risky' : 'Filter'}
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors"
            onClick={handleExport}
          >
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
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
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
              {pageItems.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-container-high)]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 text-xs font-mono text-[var(--on-surface-variant)]">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-[var(--on-surface)]">{log.userName}</span>
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
        <div className="border-t border-[var(--outline-variant)] px-5 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--on-surface-variant)]">
              Showing {showingFrom}–{showingTo} of {filteredLogs.length} entries
            </span>
            <select
              className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded text-xs font-mono text-[var(--on-surface)] px-2 py-1"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`p-1 rounded text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const pageNum = startPage + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  className={`w-7 h-7 rounded text-xs font-mono transition-colors ${
                    pageNum === currentPage
                      ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40'
                      : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] border border-transparent'
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className={`p-1 rounded text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] ${currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
