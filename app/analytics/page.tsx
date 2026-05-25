'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { downloadJson, fetchJson } from '@/lib/client-api';

type WatchlistItem = {
  userId: string;
  name: string;
  detail: string;
  score: number;
  severity: string;
  riskLabel: string;
  riskLevel: string;
  riskPercent: number;
};

const heatmapDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const heatmapHours = Array.from({ length: 24 }, (_, index) => index);

const getRiskValue = (dayIndex: number, hour: number) => {
  const hash = ((dayIndex * 17 + hour * 31 + dayIndex * hour * 7 + 13) % 97) / 97;
  let riskValue = hash * 0.3;

  const isNight = hour >= 20 || hour <= 6;
  const isLateNight = hour >= 0 && hour <= 4;
  const isBusiness = dayIndex < 5 && hour >= 8 && hour <= 17;
  const isWeekend = dayIndex >= 5;

  if (isNight) {
    riskValue += 0.25 + hash * 0.5;
  }

  if (isLateNight) {
    riskValue += 0.15 + hash * 0.2;
  }

  if (isBusiness) {
    riskValue -= 0.2;
    if (hash > 0.6) {
      riskValue += 0.35 + (hash - 0.6) * 2.5;
    }
  }

  if (isWeekend && isNight) {
    riskValue += 0.05 + hash * 0.15;
  }

  return Math.max(0, Math.min(1, riskValue));
};

type HeatmapRisk = 'safe' | 'warning' | 'critical';

type WatchlistTone = 'critical' | 'warning' | 'safe';

type GraphNode = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isCompromised: boolean;
  color: string;
  scale: number;
};

type GraphEdge = {
  source: number;
  target: number;
};

const heatmapCellCount = heatmapDays.length * heatmapHours.length;
const heatmapSafeCount = Math.round(heatmapCellCount * 0.69);
const heatmapWarningCount = Math.round(heatmapCellCount * 0.23);
const heatmapCriticalCount = heatmapCellCount - heatmapSafeCount - heatmapWarningCount;

const heatmapCells = heatmapDays.flatMap((day, dayIndex) =>
  heatmapHours.map((hour) => ({
    key: `${dayIndex}-${hour}`,
    dayIndex,
    hour,
    score: getRiskValue(dayIndex, hour),
  }))
);

const heatmapCellRanks = [...heatmapCells].sort((a, b) => b.score - a.score);
const heatmapRiskByKey = new Map<string, HeatmapRisk>();

heatmapCellRanks.forEach((cell, index) => {
  if (index < heatmapCriticalCount) {
    heatmapRiskByKey.set(cell.key, 'critical');
  } else if (index < heatmapCriticalCount + heatmapWarningCount) {
    heatmapRiskByKey.set(cell.key, 'warning');
  } else {
    heatmapRiskByKey.set(cell.key, 'safe');
  }
});

const getRiskStyles = (risk: HeatmapRisk) => {
  if (risk === 'safe') {
    return { backgroundColor: 'var(--primary)', opacity: 0.45 };
  }

  if (risk === 'warning') {
    return { backgroundColor: 'var(--tertiary)', opacity: 0.7 };
  }

  return {
    backgroundColor: 'var(--secondary)',
    opacity: 1,
    boxShadow: '0 0 6px rgba(255, 179, 176, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.2)',
  };
};

const getWatchlistTone = (score: number): WatchlistTone => {
  if (score >= 75) return 'critical';
  if (score >= 45) return 'warning';
  return 'safe';
};

const watchlistToneStyles: Record<WatchlistTone, { card: string; badge: string; bar: string; text: string }> = {
  critical: {
    card: 'bg-[var(--surface-container-high)] border-[var(--error)]/50 glow-error hover:border-[var(--error)]',
    badge: 'bg-[var(--error)]/20 border-[var(--error)] text-[var(--error)]',
    bar: 'bg-[var(--error)]',
    text: 'text-[var(--error)]',
  },
  warning: {
    card: 'bg-[var(--surface-container)] border-[var(--tertiary)]/40 hover:border-[var(--tertiary)]',
    badge: 'bg-[var(--tertiary)]/20 border-[var(--tertiary)] text-[var(--tertiary)]',
    bar: 'bg-[var(--tertiary)]',
    text: 'text-[var(--tertiary)]',
  },
  safe: {
    card: 'bg-[var(--surface-container)] border-[var(--outline-variant)] hover:border-[var(--outline)]',
    badge: 'bg-[var(--surface-variant)] border-[var(--outline)] text-[var(--on-surface-variant)]',
    bar: 'bg-[var(--outline)]',
    text: 'text-[var(--on-surface)]',
  },
};

export default function AnalyticsPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [metrics, setMetrics] = useState({
    globalRiskIndex: 0,
    activeBaselines: 0,
    anomalousSequences: 0,
    entityCount: 0,
  });
  const [distribution, setDistribution] = useState({ critical: 0, warning: 0, safe: 0, total: 0 });
  const [threatData, setThreatData] = useState<Array<{ time: string; threats: number; normal: number }>>([]);
  const [users, setUsers] = useState<Array<{
    id: string; name: string; department: string; role: string;
    riskScore: number; status: string; isInsiderThreat: boolean;
  }>>([]);
  const [graphScale, setGraphScale] = useState(1);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodesGroupRef = useRef<SVGGElement | null>(null);
  const edgesGroupRef = useRef<SVGGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const nodeIdRef = useRef<HTMLParagraphElement | null>(null);
  const nodeStatusRef = useRef<HTMLParagraphElement | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animationRef = useRef<number | null>(null);

  const avgUserRisk = users.length
    ? Math.round(users.reduce((sum, u) => sum + u.riskScore, 0) / users.length)
    : 0;

  const computedGlobalRisk = users.length && distribution.total
    ? Math.min(100, Math.round(
        (users.reduce((sum, u) => sum + u.riskScore, 0) / users.length) *
        (1 + (distribution.critical / distribution.total) * 3)
      ))
    : 0;

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchJson<{
        analytics: {
          watchlist: WatchlistItem[];
          globalRiskIndex: number;
          activeBaselines: number;
          anomalousSequences: number;
          entityCount: number;
          distribution: { critical: number; warning: number; safe: number; total: number };
          threatData: Array<{ time: string; threats: number; normal: number }>;
        };
      }>('/api/analytics'),
      fetchJson<{ users: typeof users }>('/api/users'),
    ])
      .then(([analyticsData, usersData]) => {
        if (isMounted) {
          setWatchlist(analyticsData.analytics.watchlist);
          setMetrics({
            globalRiskIndex: analyticsData.analytics.globalRiskIndex,
            activeBaselines: analyticsData.analytics.activeBaselines,
            anomalousSequences: analyticsData.analytics.anomalousSequences,
            entityCount: analyticsData.analytics.entityCount,
          });
          setDistribution(analyticsData.analytics.distribution);
          setThreatData(analyticsData.analytics.threatData);
          setUsers(usersData.users);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  const getWatchlistHref = (index: number) => {
    const userId = watchlist[index]?.userId;
    if (!userId) return '/users';
    return `/users/anomalous-sequences?id=${userId}`;
  };

  useEffect(() => {
    if (users.length === 0) return undefined;

    const svg = svgRef.current;
    const nodesGroup = nodesGroupRef.current;
    const edgesGroup = edgesGroupRef.current;
    const tooltip = tooltipRef.current;
    const nodeIdEl = nodeIdRef.current;
    const nodeStatusEl = nodeStatusRef.current;
    const container = graphContainerRef.current;

    if (!svg || !nodesGroup || !edgesGroup || !tooltip || !nodeIdEl || !nodeStatusEl || !container) {
      return undefined;
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const width = 800;
    const height = 400;
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    const getNodeColor = (user: typeof users[number]) => {
      if (user.isInsiderThreat || user.riskScore >= 75) return 'var(--secondary)';
      if (user.riskScore >= 45) return 'var(--tertiary)';
      return 'var(--primary)';
    };

    const getNodeRadius = (user: typeof users[number]) => {
      if (user.isInsiderThreat || user.riskScore >= 75) return 7;
      if (user.riskScore >= 45) return 5;
      return 4;
    };

    users.forEach((user, index) => {
      const isCompromised = user.isInsiderThreat || user.riskScore >= 75;
      nodes.push({
        id: user.name,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        isCompromised,
        color: getNodeColor(user),
        scale: 1,
      });
    });

    const deptGroups = new Map<string, number[]>();
    users.forEach((user, index) => {
      const group = deptGroups.get(user.department) || [];
      group.push(index);
      deptGroups.set(user.department, group);
    });

    deptGroups.forEach((indices) => {
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          edges.push({ source: indices[i], target: indices[j] });
        }
      }
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;

    const createElements = () => {
      edgesGroup.innerHTML = '';
      nodesGroup.innerHTML = '';

      edges.forEach((edge, edgeIndex) => {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('class', 'graph-edge');
        line.setAttribute('stroke', 'var(--outline)');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-opacity', '0.15');
        line.setAttribute('id', `edge-${edgeIndex}`);
        edgesGroup.appendChild(line);
      });

      nodes.forEach((node, nodeIndex) => {
        const user = users[nodeIndex];
        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('class', 'graph-node');
        group.setAttribute('id', `node-group-${nodeIndex}`);

        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('r', String(getNodeRadius(user)));
        circle.setAttribute('fill', node.color);
        circle.setAttribute('filter', node.isCompromised ? 'url(#node-glow)' : '');

        group.appendChild(circle);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('dy', String(getNodeRadius(user) + 12));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'var(--on-surface-variant)');
        label.setAttribute('font-size', '7');
        label.setAttribute('font-family', 'var(--font-code)');
        label.textContent = user.name;
        group.appendChild(label);

        group.addEventListener('mouseenter', () => {
          node.scale = 1.6;
          nodeIdEl.innerText = `${user.name}  ·  ${user.department}`;
          nodeStatusEl.innerText = `Score: ${user.riskScore}  ·  ${user.isInsiderThreat ? 'INSIDER THREAT' : user.riskScore >= 75 ? 'HIGH RISK' : user.riskScore >= 45 ? 'MEDIUM RISK' : 'LOW RISK'}`;
          nodeStatusEl.className = `font-code-sm ${node.isCompromised ? 'text-[var(--secondary)]' : 'text-[var(--on-surface-variant)]'}`;

          const rect = svg.getBoundingClientRect();
          tooltip.style.left = `${(node.x / width) * rect.width + 15}px`;
          tooltip.style.top = `${(node.y / height) * rect.height - 40}px`;
          tooltip.classList.remove('hidden');

          edges.forEach((edge, edgeIndex) => {
            if (edge.source === nodeIndex || edge.target === nodeIndex) {
              const line = document.getElementById(`edge-${edgeIndex}`);
              line?.setAttribute('stroke-opacity', '0.6');
              line?.setAttribute('stroke', node.color);
            }
          });
        });

        group.addEventListener('mouseleave', () => {
          node.scale = 1;
          tooltip.classList.add('hidden');
          edges.forEach((edge, edgeIndex) => {
            const line = document.getElementById(`edge-${edgeIndex}`);
            line?.setAttribute('stroke-opacity', '0.15');
            line?.setAttribute('stroke', 'var(--outline)');
          });
        });

        nodesGroup.appendChild(group);
      });
    };

    const updatePositions = () => {
      nodes.forEach((node, nodeIndex) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 50 || node.x > width - 50) node.vx *= -1;
        if (node.y < 50 || node.y > height - 50) node.vy *= -1;

        const group = document.getElementById(`node-group-${nodeIndex}`);
        if (group) {
          group.setAttribute('transform', `translate(${node.x},${node.y}) scale(${node.scale})`);
        }
      });

      edges.forEach((edge, edgeIndex) => {
        const line = document.getElementById(`edge-${edgeIndex}`);
        if (line) {
          line.setAttribute('x1', nodes[edge.source].x.toString());
          line.setAttribute('y1', nodes[edge.source].y.toString());
          line.setAttribute('x2', nodes[edge.target].x.toString());
          line.setAttribute('y2', nodes[edge.target].y.toString());
        }
      });

      animationRef.current = requestAnimationFrame(updatePositions);
    };

    createElements();
    updatePositions();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [users.length]);

  const handleGraphReset = () => {
    nodesRef.current.forEach((node) => {
      node.vx = (Math.random() - 0.5) * 0.4;
      node.vy = (Math.random() - 0.5) * 0.4;
    });
    setGraphScale(1);
  };

  const handleZoomIn = () => {
    setGraphScale((current) => Math.min(1.6, Number((current + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setGraphScale((current) => Math.max(0.7, Number((current - 0.1).toFixed(2))));
  };

  const handleExportReport = () => {
    downloadJson('analytics-report.json', { metrics, watchlist });
  };

  const visibleWatchlist = watchlist.slice(0, 3);

  return (
    <div className="flex flex-col gap-gutter">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display-lg text-display-lg text-[var(--on-surface)] mb-2">Behavioral Analytics</h1>
          <p className="font-body-lg text-body-lg text-[var(--on-surface-variant)]">
            Continuous evaluation of entity risk trajectories and peer-group deviations.
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            className="px-4 py-2 rounded border border-[var(--outline-variant)] text-[var(--on-surface)] font-body-md text-body-md hover:bg-[var(--surface-variant)] transition-colors flex items-center gap-2"
            onClick={handleExportReport}
          >
            <span className="material-symbols-outlined text-sm">download</span> Export Report
          </button>
          <Link
            href="/settings"
            className="px-4 py-2 rounded bg-[var(--primary-container)] text-[var(--on-primary-container)] font-body-md text-body-md hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">tune</span> Tune Baselines
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
        {/* Metric Card 1: Global Risk Index */}
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md relative overflow-hidden group fade-in-up delay-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--error)] opacity-10 rounded-bl-full transform -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Global Risk Index</h3>
            <span className="material-symbols-outlined text-[var(--error)] animate-breathe">trending_up</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-[var(--on-surface)] animate-breathe inline-block">{computedGlobalRisk}</span>
            <span className="font-code-md text-code-md text-[var(--error)]">+{Math.round((computedGlobalRisk / Math.max(avgUserRisk, 1) - 1) * 100)}% vs avg user</span>
          </div>
          <div className="mt-4 h-1 w-full bg-[var(--surface-variant)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--error)] glow-error" style={{ width: `${computedGlobalRisk}%` }} />
          </div>
        </div>

        {/* Metric Card 2: Entity Distribution */}
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md relative overflow-hidden group fade-in-up delay-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)] opacity-10 rounded-bl-full transform -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Entity Risk Distribution</h3>
            <span className="material-symbols-outlined text-[var(--primary)]">model_training</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-[var(--on-surface)]">{metrics.entityCount}</span>
            <span className="font-body-md text-body-md text-[var(--on-surface-variant)]">entities tracked</span>
          </div>
          <div className="mt-4 flex items-center gap-3 font-code-sm text-code-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--secondary)]" />
              <span className="text-[var(--secondary)]">{distribution.critical}</span>
              <span className="text-[var(--on-surface-variant)]">critical</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--tertiary)]" />
              <span className="text-[var(--tertiary)]">{distribution.warning}</span>
              <span className="text-[var(--on-surface-variant)]">warning</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              <span className="text-[var(--primary)]">{distribution.safe}</span>
              <span className="text-[var(--on-surface-variant)]">safe</span>
            </span>
          </div>
        </div>

        {/* Metric Card 3: Anomalous Sequences */}
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md relative overflow-hidden group fade-in-up delay-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--tertiary)] opacity-10 rounded-bl-full transform -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Anomalous Sequences</h3>
            <span className="material-symbols-outlined text-[var(--tertiary)]">pattern</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-[var(--on-surface)]">{metrics.anomalousSequences}</span>
            <span className="font-code-md text-code-md text-[var(--tertiary)]">last 24h</span>
          </div>
          <div className="mt-4 flex gap-1 h-6 items-end">
            {threatData.length > 0 ? (
              threatData.map((point, index) => {
                const maxThreat = Math.max(...threatData.map((p) => p.threats), 1);
                const heightPct = (point.threats / maxThreat) * 100;
                const isPeak = point.threats === maxThreat;
                return (
                  <div
                    key={point.time}
                    className={`flex-1 rounded-t transition-all duration-300 hover:brightness-125 ${isPeak ? 'bg-[var(--tertiary)]' : 'bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/60'}`}
                    style={{
                      height: `${Math.max(heightPct, 5)}%`,
                      boxShadow: isPeak ? '0 0 8px rgba(255,218,178,0.4)' : undefined,
                    }}
                    title={`${point.time}: ${point.threats} threats`}
                  />
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--on-surface-variant)] font-code-sm">
                No data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
        {/* Left Column: Entity Watchlist */}
        <div className="xl:col-span-1 flex flex-col gap-gutter">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline-md text-headline-md text-[var(--on-surface)]">Entity Watchlist</h2>
          </div>

          <div className="flex flex-col gap-md">
            {visibleWatchlist.map((item, index) => {
              const tone = getWatchlistTone(item.score);
              const styles = watchlistToneStyles[tone];

              return (
                <Link key={item.userId} href={getWatchlistHref(index)} className="block">
                  <div className={`border rounded-lg p-md relative group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:brightness-110 ${styles.card}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[var(--surface-container)] flex items-center justify-center border border-[var(--outline-variant)]">
                          <span className="material-symbols-outlined text-[var(--on-surface-variant)]">person</span>
                        </div>
                        <div>
                          <h4 className="font-headline-sm text-headline-sm text-[var(--on-surface)]">{item.name}</h4>
                          <p className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">{item.detail}</p>
                        </div>
                      </div>
                      <div className={`border px-2 py-1 rounded font-code-md text-code-md ${styles.badge}`}>
                        {item.score}
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between font-code-sm text-code-sm">
                        <span className="text-[var(--on-surface-variant)]">{item.riskLabel}</span>
                        <span className={styles.text}>{item.riskLevel}</span>
                      </div>
                      <div className="w-full bg-[var(--surface-variant)] h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${item.riskPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visualizations */}
        <div className="xl:col-span-2 flex flex-col gap-gutter">
          {/* Behavioral Heatmap */}
          <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-[var(--on-surface)]">Temporal Risk Heatmap</h2>
                  <p className="font-body-md text-body-md text-[var(--on-surface-variant)]">
                    Aggregated risk score by hour (X) and day of week (Y).
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[var(--primary)] shadow-[0_0_6px_rgba(77,224,130,0.45)]" />
                  <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[var(--tertiary)] shadow-[0_0_6px_rgba(255,218,178,0.45)]" />
                  <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[var(--secondary)] border border-white/20 shadow-[0_0_6px_rgba(255,179,176,0.55)]" />
                  <span className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">Critical</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col justify-between h-[220px] py-1 text-[var(--on-surface-variant)]/70 font-label-caps text-label-caps w-10">
                {heatmapDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div
                  className="rounded-lg overflow-hidden border border-[var(--outline-variant)]"
                  style={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(7, 1fr)',
                    gridTemplateColumns: 'repeat(24, 1fr)',
                    height: '220px',
                  }}
                >
                  {heatmapDays.map((day, dayIndex) =>
                    heatmapHours.map((hour) => {
                      const riskValue = getRiskValue(dayIndex, hour);
                      const riskBucket = heatmapRiskByKey.get(`${dayIndex}-${hour}`) ?? 'safe';
                      const labelHour = `${hour.toString().padStart(2, '0')}:00`;
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className="transition-all duration-200 border border-[rgba(61,74,62,0.3)] hover:scale-110 hover:z-10 hover:border-[var(--primary)] hover:shadow-[0_0_10px_rgba(107,251,154,0.4)]"
                          style={getRiskStyles(riskBucket)}
                          title={`Day: ${day} | Time: ${labelHour} | Risk: ${Math.floor(riskValue * 100)}%`}
                        />
                      );
                    })
                  )}
                </div>
                <div className="flex justify-between px-2 font-label-caps text-label-caps text-[var(--on-surface-variant)]/70">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>23:59</span>
                </div>
              </div>
            </div>
          </div>

          {/* Entity Relationship Graph */}
          <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md flex-grow min-h-chart flex flex-col relative">
            <div className="flex justify-between items-center mb-4 z-10">
              <h2 className="font-headline-sm text-headline-sm text-[var(--on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--tertiary)]">hub</span>
                Entity Relationship Graph (Global)
              </h2>
              <div className="flex gap-2">
                <button
                  className="p-1.5 rounded border border-[var(--outline-variant)] hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
                  title="Zoom In"
                  onClick={handleZoomIn}
                >
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </button>
                <button
                  className="p-1.5 rounded border border-[var(--outline-variant)] hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
                  title="Zoom Out"
                  onClick={handleZoomOut}
                >
                  <span className="material-symbols-outlined text-sm">zoom_out</span>
                </button>
                <button
                  className="p-1.5 rounded border border-[var(--outline-variant)] hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
                  title="Reset View"
                  onClick={handleGraphReset}
                >
                  <span className="material-symbols-outlined text-sm">my_location</span>
                </button>
              </div>
            </div>
            <div
              ref={graphContainerRef}
              className="flex-grow rounded border border-[var(--outline-variant)]/50 relative bg-[var(--surface-container-lowest)] overflow-hidden flex items-center justify-center group"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  opacity: 0.1,
                }}
              />
              <svg
                ref={svgRef}
                className="w-full h-full"
                viewBox="0 0 800 400"
                style={{ transform: `scale(${graphScale})`, transformOrigin: 'center' }}
              >
                <defs>
                  <filter id="node-glow">
                    <feGaussianBlur result="blur" stdDeviation="2" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <g ref={edgesGroupRef} />
                <g ref={nodesGroupRef} />
              </svg>
              <div
                ref={tooltipRef}
                className="absolute z-30 bg-[var(--surface-container-highest)]/90 backdrop-blur border border-[var(--outline-variant)] rounded p-2 text-xs shadow-xl pointer-events-none hidden transition-opacity duration-200"
              >
                <p ref={nodeIdRef} className="font-bold text-[var(--on-surface)] mb-0.5">
                  user · Department
                </p>
                <p ref={nodeStatusRef} className="font-code-sm text-[var(--on-surface-variant)]">
                  Score: 0 · Status
                </p>
              </div>
              <div className="absolute top-4 left-4 bg-[var(--surface)]/80 backdrop-blur border border-[var(--outline-variant)] rounded p-3 text-xs z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--secondary)] shadow-[0_0_8px_rgba(255,179,176,0.6)]" />
                  <span className="font-code-sm text-[var(--on-surface)]">High Risk / Insider Threat</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] shadow-[0_0_6px_rgba(255,218,178,0.5)]" />
                  <span className="font-code-sm text-[var(--on-surface)]">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(77,224,130,0.4)]" />
                  <span className="font-code-sm text-[var(--on-surface)]">Low Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
