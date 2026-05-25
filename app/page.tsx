'use client';

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

const threatData = [
  { time: '00:00', threats: 12, normal: 45 },
  { time: '04:00', threats: 8, normal: 52 },
  { time: '08:00', threats: 23, normal: 78 },
  { time: '12:00', threats: 45, normal: 92 },
  { time: '16:00', threats: 38, normal: 85 },
  { time: '20:00', threats: 19, normal: 61 },
  { time: '24:00', threats: 15, normal: 48 },
];

const recentAlerts = [
  {
    id: 'ALT-1024',
    severity: 'critical',
    user: 'j.smith@company.com',
    action: 'Unauthorized S3 bucket access',
    resource: 's3://confidential-data',
    time: '2 min ago',
    score: 94,
  },
  {
    id: 'ALT-1023',
    severity: 'warning',
    user: 'm.johnson@company.com',
    action: 'Unusual IAM role assumption',
    resource: 'arn:aws:iam::123456789012:role/Admin',
    time: '15 min ago',
    score: 72,
  },
  {
    id: 'ALT-1022',
    severity: 'warning',
    user: 'r.williams@company.com',
    action: 'Data exfiltration attempt detected',
    resource: 'ec2:i-0abc123def456',
    time: '28 min ago',
    score: 68,
  },
  {
    id: 'ALT-1021',
    severity: 'safe',
    user: 'k.brown@company.com',
    action: 'Login from new location',
    resource: 'Console Login',
    time: '45 min ago',
    score: 23,
  },
];

const kpiCards = [
  {
    title: 'Active Threats',
    value: '12',
    change: '+3',
    changeType: 'increase',
    icon: AlertTriangle,
    color: 'secondary',
  },
  {
    title: 'Users Monitored',
    value: '1,284',
    change: '+24',
    changeType: 'increase',
    icon: Users,
    color: 'primary',
  },
  {
    title: 'Avg Risk Score',
    value: '67',
    change: '-5',
    changeType: 'decrease',
    icon: Activity,
    color: 'tertiary',
  },
  {
    title: 'Protected Resources',
    value: '456',
    change: '+12',
    changeType: 'increase',
    icon: Shield,
    color: 'primary',
  },
];

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
  return { severityLabel: 'LOW', statusLabel: 'New', actionLabel: 'ASSIGN' };
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
          <span className="font-mono">Last updated: 2026-05-19 17:28:45 UTC</span>
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
                {/* Safe (Green) 69% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="var(--primary)"
                  strokeDasharray="172.9 251.2"
                  strokeDashoffset="0"
                  strokeWidth="12"
                />
                {/* Warning (Amber) 23% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="var(--tertiary)"
                  strokeDasharray="57.8 251.2"
                  strokeDashoffset="-172.9"
                  strokeWidth="12"
                />
                {/* Critical (Red) 8% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="var(--secondary)"
                  strokeDasharray="20.1 251.2"
                  strokeDashoffset="-230.7"
                  strokeWidth="12"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[var(--on-surface)] leading-none">82</span>
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
                <span className="text-xs font-mono text-[var(--on-surface)]">8</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--tertiary)]" />
                  <span className="text-sm text-[var(--on-surface-variant)]">Warning</span>
                </div>
                <span className="text-xs font-mono text-[var(--on-surface-variant)]">23</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--primary)]" />
                  <span className="text-sm text-[var(--on-surface-variant)]">Safe</span>
                </div>
                <span className="text-xs font-mono text-[var(--on-surface-variant)]">69</span>
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
          <button className="font-label-caps text-label-caps text-[var(--primary)] hover:text-[var(--primary-fixed)] transition-colors">
            VIEW ALL IN INVESTIGATION
          </button>
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
                const initials = alert.user.split('@')[0].split('.').map((n: string) => n[0].toUpperCase()).join('');
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
                        <span>{alert.user}</span>
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
                      <button
                        className={`px-3 py-1 text-sm font-bold rounded transition-colors ${
                          alert.severity === 'critical'
                            ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] hover:bg-[var(--primary-fixed)]'
                            : 'bg-transparent border border-[var(--outline-variant)] text-[var(--on-surface)] hover:bg-[var(--surface-variant)]'
                        }`}
                      >
                        {actionLabel}
                      </button>
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
