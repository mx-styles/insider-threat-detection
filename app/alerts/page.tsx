"use client";

import { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchJson } from '@/lib/client-api';

type AlertItem = {
  id: string;
  severity: string;
  userName: string;
  action: string;
  resource: string;
  timeAgo: string;
  createdAt: string;
  score: number;
  status: string;
  awsService: string;
};

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
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    let isMounted = true;
    fetchJson<{ alerts: AlertItem[] }>('/api/alerts')
      .then((data) => {
        if (isMounted) setAlerts(data.alerts);
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const severity = searchParams.get('severity');
    if (severity && ['all', 'critical', 'warning', 'safe'].includes(severity)) {
      setFilter(severity);
    }
    const user = searchParams.get('user');
    if (user) {
      setUserFilter(user);
    }
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
    const range = searchParams.get('range');
    if (range && ['1', '7', '30'].includes(range)) {
      setTimeRange(range);
    }
  }, [searchKey, searchParams]);

  useEffect(() => {
    setPage(1);
  }, [filter, searchTerm, userFilter, timeRange]);

  const latestAlertTime = useMemo(() => {
    if (alerts.length === 0) return Date.now();
    return Math.max(...alerts.map((alert) => new Date(alert.createdAt).getTime()));
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const rangeDays = Number(timeRange);
    const minDate = Number.isNaN(rangeDays)
      ? 0
      : latestAlertTime - rangeDays * 24 * 60 * 60 * 1000;
    return alerts.filter((alert) => {
      const matchSeverity = filter === 'all' || alert.severity === filter;
      const matchSearch = !searchTerm
        || `${alert.id} ${alert.action} ${alert.resource} ${alert.awsService}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchUser = !userFilter
        || alert.userName.toLowerCase().includes(userFilter.toLowerCase());
      const matchTime = !rangeDays || new Date(alert.createdAt).getTime() >= minDate;
      return matchSeverity && matchSearch && matchUser && matchTime;
    });
  }, [alerts, filter, latestAlertTime, searchTerm, timeRange, userFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filteredAlerts.slice(pageStart, pageStart + pageSize);
  const showingFrom = filteredAlerts.length === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(filteredAlerts.length, pageStart + pageSize);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <section className="bg-[#1e293b]/60 backdrop-blur-md border border-[var(--outline-variant)] rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="font-label-caps text-[var(--on-surface-variant)] mb-1 block">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]">search</span>
              <input
                className="w-full bg-[#0f172a] border border-[var(--outline-variant)] rounded-lg py-2 pl-10 pr-3 text-[var(--on-surface)]"
                placeholder="Search by User, ID, or IP..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
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
              <input
                className="w-full bg-[#0f172a] border border-[var(--outline-variant)] rounded-lg py-2 pl-10 pr-3 text-[var(--on-surface)]"
                placeholder="Filter user..."
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
              />
            </div>
          </div>

          <div className="w-56">
            <label className="font-label-caps text-[var(--on-surface-variant)] mb-1 block">Time Range</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]">calendar_month</span>
              <select
                className="w-full bg-[#0f172a] border border-[var(--outline-variant)] rounded-lg py-2 pl-10 pr-3 text-[var(--on-surface)]"
                value={timeRange}
                onChange={(event) => setTimeRange(event.target.value)}
              >
                <option value="1">Last 24 Hours</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
          </div>

          <button
            className="bg-[var(--surface-variant)] text-[var(--on-surface)] border border-[var(--outline-variant)] px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => {
              setFilter('all');
              setSearchTerm('');
              setUserFilter('');
              setTimeRange('30');
            }}
          >
            <Filter className="w-4 h-4" />
            Reset Filters
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
            {pageItems.map((a) => (
              <div key={a.id} className={`grid grid-cols-12 gap-2 px-6 py-4 data-table-row items-center group relative ${a.severity === 'critical' ? 'bg-error/5' : ''}`}>
                {a.severity === 'critical' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />}
                <div className="col-span-1 font-mono text-[var(--on-surface)]">{a.id.replace('ALT-', 'A-')}</div>
                <div className="col-span-2 text-[var(--on-surface-variant)] text-sm">{a.timeAgo}<br /><span className="text-xs opacity-70">Last 30 days</span></div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[var(--on-surface-variant)]">account_circle</span>
                  <span className="font-mono truncate">{a.userName}</span>
                </div>
                <div className="col-span-2 truncate">{a.action}</div>
                <div className="col-span-1 font-mono font-semibold">{a.score}</div>
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
                  {a.severity === 'critical' && (
                    <Link href={`/investigation?id=${a.id.replace('ALT-', 'A-')}`} className="bg-transparent border border-[var(--outline-variant)] text-[var(--on-surface)] hover:border-[var(--primary)] hover:text-[var(--primary)] px-3 py-1 rounded text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 inline-block text-center">Details</Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0b1326] border-t border-[var(--outline-variant)] px-6 py-3 flex justify-between items-center">
            <span className="text-[var(--on-surface-variant)] text-sm">Showing {showingFrom}-{showingTo} of {filteredAlerts.length} detections</span>
            <div className="flex items-center gap-2">
              <button
                className={`p-1 rounded text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="font-mono text-xs text-[var(--on-surface)]">Page {currentPage} of {totalPages}</span>
              <button
                className={`p-1 rounded text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] ${currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
