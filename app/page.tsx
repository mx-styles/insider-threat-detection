'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import Link from 'next/link';
import { fetchJson } from '@/lib/client-api';

type AnalyticsResponse = {
  analytics: {
    lastUpdated: string;
    kpis: Array<{
      title: string;
      value: string;
      change: string;
      changeType: 'increase' | 'decrease';
      color: 'primary' | 'secondary' | 'tertiary';
    }>;
    threatData: Array<{ time: string; threats: number; normal: number }>;
    distribution: { critical: number; warning: number; safe: number; total: number };
    recentAlerts: Array<{
      id: string;
      severity: string;
      userName: string;
      action: string;
      resource: string;
      timeAgo: string;
      score: number;
    }>;
  };
};

function KPICard({ title, value, change, changeType, icon: Icon, color }: any) {
  const colorMap: any = {
    primary: 'text-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    tertiary: 'text-[var(--tertiary)]',
  };

  const bgColorMap: any = {
    primary: 'bg-[var(--primary)]/10',
    secondary: 'bg-[var(--secondary)]/10',
    tertiary: 'bg-[var(--tertiary)]/10',
  };

  return (
    <div className="bg-[var(--surface-container)] rounded-xl p-5 border border-[var(--outline-variant)] hover:border-[var(--primary)]/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--on-surface-variant)]">{title}</p>
          <p className="text-3xl font-semibold text-[var(--on-surface)] mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColorMap[color]}`}>
          <Icon className={`w-5 h-5 ${colorMap[color]}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        {changeType === 'increase' ? (
          <ArrowUpRight className="w-4 h-4 text-[var(--secondary)]" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-[var(--primary)]" />
        )}
        <span
          className={`text-sm font-medium ${
            changeType === 'increase' && color === 'secondary'
              ? 'text-[var(--secondary)]'
              : 'text-[var(--primary)]'
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-[var(--on-surface-variant)]">vs last hour</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: Readonly<{ severity: string }>) {
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

const getAlertLabels = (severity: string) => {
  if (severity === 'critical') {
    return { severityLabel: 'CRITICAL', statusLabel: 'Triage', actionLabel: 'INVESTIGATE' };
  }
  if (severity === 'warning') {
    return { severityLabel: 'HIGH', statusLabel: 'Active', actionLabel: 'VIEW GRAPH' };
  }
  return { severityLabel: 'LOW', statusLabel: 'New', actionLabel: 'VIEW ALERTS' };
};

const getScoreStyles = (score: number) => {
  if (score >= 70) {
    return {
      textClass: 'text-[var(--error)] drop-shadow-critical',
      barClass: 'bg-[var(--error)]',
    };
  }
  if (score >= 40) {
    return {
      textClass: 'text-[var(--tertiary-fixed-dim)]',
      barClass: 'bg-[var(--tertiary-fixed-dim)]',
    };
  }
  return {
    textClass: 'text-[var(--outline)]',
    barClass: 'bg-[var(--outline)]',
  };
};

const getSeverityBadgeClass = (severity: string) => {
  if (severity === 'critical') {
    return 'bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/50';
  }
  if (severity === 'warning') {
    return 'bg-[var(--tertiary-fixed-dim)]/20 text-[var(--tertiary-fixed-dim)] border border-[var(--tertiary-fixed-dim)]/50';
  }
  return 'bg-[var(--outline)]/20 text-[var(--outline)] border border-[var(--outline)]/50';
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse['analytics'] | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchJson<AnalyticsResponse>('/api/analytics')
      .then((data) => {
        if (isMounted) {
          setAnalytics(data.analytics);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  const kpiCards = useMemo(() => {
    if (!analytics) return [];
    const iconMap = {
      'Active Threats': AlertTriangle,
      'Users Monitored': Users,
      'Avg Risk Score': Activity,
      'Protected Resources': Shield,
    } as const;

    return analytics.kpis.map((card) => ({
      ...card,
      icon: iconMap[card.title as keyof typeof iconMap] ?? Shield,
    }));
  }, [analytics]);

  const threatData = analytics?.threatData ?? [];
  const recentAlerts = analytics?.recentAlerts ?? [];
  const distribution = analytics?.distribution ?? { critical: 0, warning: 0, safe: 0, total: 0 };
  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutTotal = Math.max(distribution.total, 1);
  const safeArc = (distribution.safe / donutTotal) * donutCircumference;
  const warningArc = (distribution.warning / donutTotal) * donutCircumference;
  const criticalArc = (distribution.critical / donutTotal) * donutCircumference;
  const warningOffset = -safeArc;
  const criticalOffset = -(safeArc + warningArc);

  const getAlertHref = (alert: AnalyticsResponse['analytics']['recentAlerts'][number]) => {
    if (alert.severity === 'critical') {
      return `/investigation?id=${alert.id.replace('ALT-', 'A-')}`;
    }
    if (alert.severity === 'warning') {
      return '/analytics';
    }
    return `/alerts?severity=safe&user=${encodeURIComponent(alert.userName)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--on-surface)]">Security Dashboard</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Real-time monitoring and threat detection
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <Clock className="w-4 h-4" />
          <span className="font-mono">
            Last updated: {analytics?.lastUpdated ?? 'Loading...'} UTC
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat activity chart */}
        <div className="lg:col-span-2 bg-[var(--surface-container)] rounded-xl p-5 border border-[var(--outline-variant)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--on-surface)]">Threat Activity</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--secondary)]" />
                <span className="text-[var(--on-surface-variant)]">Threats</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                <span className="text-[var(--on-surface-variant)]">Normal</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={threatData}>
              <defs>
                <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
              <XAxis dataKey="time" stroke="var(--on-surface-variant)" fontSize={12} />
              <YAxis stroke="var(--on-surface-variant)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-container-high)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '8px',
                  color: 'var(--on-surface)',
                }}
              />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="var(--secondary)"
                fill="url(#threatGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="normal"
                stroke="var(--primary)"
                fill="url(#normalGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Threat distribution */}
        <div className="bg-[var(--surface-container)] rounded-xl p-5 border border-[var(--outline-variant)] flex flex-col">
          <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-4">Threat Distribution</h2>
          <div className="flex-1 flex flex-col justify-center items-center relative">
            {/* Donut chart */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle cx="50" cy="50" fill="none" r="40" stroke="var(--surface-container-highest)" strokeWidth="12" />
                {/* Safe (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="var(--primary)"
                  strokeDasharray={`${safeArc} ${donutCircumference}`}
                  strokeDashoffset="0"
                  strokeWidth="12"
                />
                {/* Warning (Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="var(--tertiary)"
                  strokeDasharray={`${warningArc} ${donutCircumference}`}
                  strokeDashoffset={`${warningOffset}`}
                  strokeWidth="12"
                />
                {/* Critical (Red) */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="var(--secondary)"
                  strokeDasharray={`${criticalArc} ${donutCircumference}`}
                  strokeDashoffset={`${criticalOffset}`}
                  strokeWidth="12"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[var(--on-surface)] leading-none">
                  {distribution.total}
                </span>
                <span className="text-xs font-mono text-[var(--on-surface-variant)]">TOTAL</span>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-6 w-full flex flex-col gap-2">
              <div className="flex justify-between items-center px-3 py-1 rounded bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--secondary)]" />
                  <span className="text-sm text-[var(--on-surface)]">Critical</span>
                </div>
                <span className="text-xs font-mono text-[var(--on-surface)]">{distribution.critical}</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--tertiary)]" />
                  <span className="text-sm text-[var(--on-surface-variant)]">Warning</span>
                </div>
                <span className="text-xs font-mono text-[var(--on-surface-variant)]">{distribution.warning}</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--primary)]" />
                  <span className="text-sm text-[var(--on-surface-variant)]">Safe</span>
                </div>
                <span className="text-xs font-mono text-[var(--on-surface-variant)]">{distribution.safe}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-[var(--surface-container)] rounded-lg border border-[var(--outline-variant)] flex flex-col overflow-hidden">
        <div className="p-md border-b border-[var(--outline-variant)] flex justify-between items-center bg-[var(--surface-container-high)]">
          <h2 className="font-headline-sm text-headline-sm text-[var(--on-surface)] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
            Recent Alerts
          </h2>
          <Link
            href="/alerts"
            className="font-label-caps text-label-caps text-[var(--primary)] hover:text-[var(--primary-fixed)] transition-colors"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container)] text-[var(--on-surface-variant)]">
                <th className="font-label-caps text-label-caps py-sm px-md font-normal">ALERT ID</th>
                <th className="font-label-caps text-label-caps py-sm px-md font-normal">USER / ENTITY</th>
                <th className="font-label-caps text-label-caps py-sm px-md font-normal">RISK SCORE</th>
                <th className="font-label-caps text-label-caps py-sm px-md font-normal">SEVERITY</th>
                <th className="font-label-caps text-label-caps py-sm px-md font-normal">STATUS</th>
                <th className="font-label-caps text-label-caps py-sm px-md font-normal text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="font-code-md text-code-md text-[var(--on-surface)]">
              {recentAlerts.map((alert) => {
                const { severityLabel, statusLabel, actionLabel } = getAlertLabels(alert.severity);
                const scoreDecimal = (alert.score / 100).toFixed(2);
                const initials = alert.userName
                  .split(/\s|\./)
                  .map((n: string) => n[0]?.toUpperCase())
                  .join('');
                const scoreStyles = getScoreStyles(alert.score);
                const severityBadgeClass = getSeverityBadgeClass(alert.severity);

                return (
                  <tr
                    key={alert.id}
                    className="border-b border-[var(--outline-variant)] hover:bg-[var(--surface-variant)]/50 transition-colors group"
                  >
                    <td className="py-3 px-md text-[var(--primary)]">{alert.id}</td>
                    <td className="py-3 px-md">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--surface-bright)] flex items-center justify-center text-xs">
                          {initials}
                        </div>
                        <span>{alert.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-md">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${scoreStyles.textClass}`}
                        >
                          {scoreDecimal}
                        </span>
                        <div className="w-16 h-1.5 bg-[var(--surface-bright)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreStyles.barClass}`}
                            style={{ width: `${alert.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-md">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${severityBadgeClass}`}
                      >
                        {severityLabel}
                      </span>
                    </td>
                    <td className="py-3 px-md">
                      {alert.severity === 'warning' ? (
                        <span className="text-[var(--tertiary-fixed-dim)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tertiary-fixed-dim)] inline-block animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-[var(--on-surface-variant)]">{statusLabel}</span>
                      )}
                    </td>
                    <td className="py-3 px-md text-right">
                      <Link
                        href={getAlertHref(alert)}
                        className={`px-3 py-1 text-sm font-bold rounded transition-colors ${
                          alert.severity === 'critical'
                            ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] hover:bg-[var(--primary-fixed)]'
                            : 'bg-transparent border border-[var(--outline-variant)] text-[var(--on-surface)] hover:bg-[var(--surface-variant)]'
                        }`}
                      >
                        {actionLabel}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
