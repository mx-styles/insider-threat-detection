'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const entities = [
  {
    name: 'J. Doe (DevOps)',
    detail: 'IAM Role Assumption Spike',
    score: 98,
    severity: 'critical',
    riskLabel: 'Data Exfiltration Risk',
    riskLevel: 'High',
    riskPercent: 95,
  },
  {
    name: 'A. Smith (Finance)',
    detail: 'Off-hours S3 Access',
    score: 74,
    severity: 'elevated',
    riskLabel: 'Access Anomaly',
    riskLevel: 'Medium',
    riskPercent: 74,
  },
  {
    name: 'Service_Acct_Prod',
    detail: 'API Rate Limit Approaching',
    score: 42,
    severity: 'monitoring',
    riskLabel: 'Volume Deviation',
    riskLevel: 'Low',
    riskPercent: 42,
  },
];

const heatmapDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const heatmapHours = Array.from({ length: 24 }, (_, index) => index);

const getRiskValue = (dayIndex: number, hour: number) => {
  let riskValue = (((dayIndex * 13 + hour * 7) % 100) / 100) * 0.7;

  if (dayIndex < 5 && hour >= 9 && hour <= 17) {
    riskValue += 0.2;
  }

  if (dayIndex === 3 && hour >= 12 && hour <= 15) {
    riskValue += 0.35;
  }

  if (dayIndex >= 5) {
    riskValue -= 0.2;
  }

  return Math.max(0, Math.min(1, riskValue));
};

type HeatmapRisk = 'safe' | 'warning' | 'critical';

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

export default function AnalyticsPage() {
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

  useEffect(() => {
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
    const nodeCount = 22;
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (let index = 0; index < nodeCount; index += 1) {
      const isCompromised = index < 6;
      nodes.push({
        id: index < 12 ? `usr-${100 + index}` : `ip-172.16.0.${index}`,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        isCompromised,
        color: isCompromised ? 'var(--secondary)' : 'var(--primary)',
        scale: 1,
      });
    }

    for (let index = 0; index < nodes.length; index += 1) {
      const connectionCount = Math.floor(Math.random() * 2) + 1;
      for (let connection = 0; connection < connectionCount; connection += 1) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== index) {
          edges.push({ source: index, target });
        }
      }
    }

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
        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('class', 'graph-node');
        group.setAttribute('id', `node-group-${nodeIndex}`);

        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('r', node.isCompromised ? '6' : '4');
        circle.setAttribute('fill', node.color);
        circle.setAttribute('filter', node.isCompromised ? 'url(#node-glow)' : '');

        group.appendChild(circle);

        group.addEventListener('mouseenter', () => {
          node.scale = 1.6;
          nodeIdEl.innerText = node.id;
          nodeStatusEl.innerText = node.isCompromised ? 'Status: ANOMALOUS' : 'Status: Verified';
          nodeStatusEl.className = `font-code-sm ${node.isCompromised ? 'text-[var(--secondary)]' : 'text-[var(--primary)]'}`;

          const rect = svg.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
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
  }, []);

  const handleGraphReset = () => {
    nodesRef.current.forEach((node) => {
      node.vx = (Math.random() - 0.5) * 0.4;
      node.vy = (Math.random() - 0.5) * 0.4;
    });
  };

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
          <button className="px-4 py-2 rounded border border-[var(--outline-variant)] text-[var(--on-surface)] font-body-md text-body-md hover:bg-[var(--surface-variant)] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Export Report
          </button>
          <button className="px-4 py-2 rounded bg-[var(--primary-container)] text-[var(--on-primary-container)] font-body-md text-body-md hover:brightness-110 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">tune</span> Tune Baselines
          </button>
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
            <span className="font-display-lg text-display-lg text-[var(--on-surface)] animate-breathe inline-block">84.2</span>
            <span className="font-code-md text-code-md text-[var(--error)]">+4.1%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-[var(--surface-variant)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--error)] w-[84%] glow-error" />
          </div>
        </div>

        {/* Metric Card 2: Active Baselines */}
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md relative overflow-hidden group fade-in-up delay-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)] opacity-10 rounded-bl-full transform -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Active Baselines</h3>
            <span className="material-symbols-outlined text-[var(--primary)]">model_training</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-[var(--on-surface)]">1,492</span>
            <span className="font-body-md text-body-md text-[var(--on-surface-variant)]">entities tracked</span>
          </div>
          <p className="font-code-sm text-code-sm text-[var(--primary)] mt-4 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] glow-primary inline-block" />
            Models converged
          </p>
        </div>

        {/* Metric Card 3: Anomalous Sequences */}
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md relative overflow-hidden group fade-in-up delay-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--tertiary)] opacity-10 rounded-bl-full transform -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-[var(--on-surface-variant)]">Anomalous Sequences</h3>
            <span className="material-symbols-outlined text-[var(--tertiary)]">pattern</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-[var(--on-surface)]">38</span>
            <span className="font-code-md text-code-md text-[var(--tertiary)]">last 24h</span>
          </div>
          <div className="mt-4 flex gap-1 h-6 items-end">
            <div className="w-1/6 bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/60 rounded-t h-[20%] hover:bg-[var(--tertiary)]/40 transition-colors" />
            <div className="w-1/6 bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/60 rounded-t h-[40%] hover:bg-[var(--tertiary)]/40 transition-colors" />
            <div className="w-1/6 bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/60 rounded-t h-[30%] hover:bg-[var(--tertiary)]/40 transition-colors" />
            <div className="w-1/6 bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/60 rounded-t h-[80%] hover:bg-[var(--tertiary)]/40 transition-colors" />
            <div className="w-1/6 bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/60 rounded-t h-[50%] hover:bg-[var(--tertiary)]/40 transition-colors" />
            <div className="w-1/6 bg-[var(--tertiary)] rounded-t h-[100%]" style={{ boxShadow: '0 0 8px rgba(255,218,178,0.4)' }} />
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
        {/* Left Column: Entity Watchlist */}
        <div className="xl:col-span-1 flex flex-col gap-gutter">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline-md text-headline-md text-[var(--on-surface)]">Entity Watchlist</h2>
            <Link href="/users/peer-analysis" className="text-[var(--primary)] font-code-sm text-code-sm hover:underline">View All</Link>
          </div>

          <Link href="/users/anomalous-sequences" className="block">
            <div className="bg-[var(--surface-container-high)] border border-[var(--error)]/50 rounded-lg p-md relative glow-error group cursor-pointer hover:border-[var(--error)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[var(--surface-container)] flex items-center justify-center border border-[var(--outline-variant)]">
                    <span className="material-symbols-outlined text-[var(--on-surface-variant)]">person</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-[var(--on-surface)]">{entities[0].name}</h4>
                    <p className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">{entities[0].detail}</p>
                  </div>
                </div>
                <div className="bg-[var(--error)]/20 border border-[var(--error)] text-[var(--error)] px-2 py-1 rounded font-code-md text-code-md">
                  {entities[0].score}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between font-code-sm text-code-sm">
                  <span className="text-[var(--on-surface-variant)]">{entities[0].riskLabel}</span>
                  <span className="text-[var(--error)]">{entities[0].riskLevel}</span>
                </div>
                <div className="w-full bg-[var(--surface-variant)] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--error)] rounded-full" style={{ width: `${entities[0].riskPercent}%` }} />
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md group cursor-pointer hover:border-[var(--tertiary)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[var(--surface-container)] flex items-center justify-center border border-[var(--outline-variant)]">
                  <span className="material-symbols-outlined text-[var(--on-surface-variant)]">person</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-[var(--on-surface)]">{entities[1].name}</h4>
                  <p className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">{entities[1].detail}</p>
                </div>
              </div>
              <div className="bg-[var(--tertiary)]/20 border border-[var(--tertiary)] text-[var(--tertiary)] px-2 py-1 rounded font-code-md text-code-md">
                {entities[1].score}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between font-code-sm text-code-sm">
                <span className="text-[var(--on-surface-variant)]">{entities[1].riskLabel}</span>
                <span className="text-[var(--tertiary)]">{entities[1].riskLevel}</span>
              </div>
              <div className="w-full bg-[var(--surface-variant)] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--tertiary)] rounded-full" style={{ width: `${entities[1].riskPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-md group cursor-pointer hover:border-[var(--outline)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[var(--surface-container)] flex items-center justify-center border border-[var(--outline-variant)]">
                  <span className="material-symbols-outlined text-[var(--on-surface-variant)]">person</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-[var(--on-surface)]">{entities[2].name}</h4>
                  <p className="font-code-sm text-code-sm text-[var(--on-surface-variant)]">{entities[2].detail}</p>
                </div>
              </div>
              <div className="bg-[var(--surface-variant)] border border-[var(--outline)] text-[var(--on-surface-variant)] px-2 py-1 rounded font-code-md text-code-md">
                {entities[2].score}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between font-code-sm text-code-sm">
                <span className="text-[var(--on-surface-variant)]">{entities[2].riskLabel}</span>
                <span className="text-[var(--on-surface)]">{entities[2].riskLevel}</span>
              </div>
              <div className="w-full bg-[var(--surface-variant)] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--outline)] rounded-full" style={{ width: `${entities[2].riskPercent}%` }} />
              </div>
            </div>
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
                >
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
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
              <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 400">
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
                  usr-unknown
                </p>
                <p ref={nodeStatusRef} className="font-code-sm text-[var(--on-surface-variant)]">
                  Status: Normal
                </p>
              </div>
              <div className="absolute top-4 left-4 bg-[var(--surface)]/80 backdrop-blur border border-[var(--outline-variant)] rounded p-3 text-xs z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--secondary)] shadow-[0_0_8px_rgba(255,179,176,0.6)]" />
                  <span className="font-code-sm text-[var(--on-surface)]">Compromised Cluster</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(77,224,130,0.4)]" />
                  <span className="font-code-sm text-[var(--on-surface)]">Verified Baseline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
