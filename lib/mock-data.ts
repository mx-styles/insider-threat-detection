type Severity = 'critical' | 'warning' | 'safe';
type AlertStatus = 'new' | 'investigating' | 'resolved';
type RiskStatus = 'high-risk' | 'medium-risk' | 'low-risk';

type UserSummary = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  riskScore: number;
  status: RiskStatus;
  lastActive: string;
  alerts: number;
  isInsiderThreat: boolean;
};

type AlertItem = {
  id: string;
  severity: Severity;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  createdAt: string;
  timeAgo: string;
  score: number;
  status: AlertStatus;
  awsService: string;
};

type AuditLogItem = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  sourceIP: string;
  region: string;
  status: 'success' | 'blocked';
  severity: Severity;
};

type InvestigationFeature = {
  name: string;
  value: number;
  severity: 'error' | 'tertiary' | 'primary';
};

type InvestigationEvent = {
  time: string;
  delta?: string;
  type: 'NORMAL' | 'ANOMALY';
  title: string;
  detailLines?: string[];
  icon: string;
  anomaly: boolean;
};

type InvestigationDetail = {
  id: string;
  severity: Severity;
  riskScore: number;
  entity: string;
  department: string;
  firstSeen: string;
  location: string;
  explanation: string;
  tags: string[];
  features: InvestigationFeature[];
  events: InvestigationEvent[];
  graph: {
    nodes: Array<{
      id: string;
      label: string;
      kind: 'entity' | 'workstation' | 'resource' | 'account' | 'external';
      x: number;
      y: number;
      status: 'normal' | 'anomalous' | 'suspicious';
    }>;
    edges: Array<{
      source: string;
      target: string;
      dashed?: boolean;
      anomalous?: boolean;
    }>;
  };
};

type UserDetail = {
  profile: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    statusLabel: string;
    riskScore: number;
    firstSeen: string;
    location: string;
    manager: string;
    managerInitials: string;
    devices: Array<{ name: string; status: 'trusted' | 'unverified'; type: 'laptop' | 'mobile' }>;
  };
  kbis: {
    afterHoursHours: number;
    afterHoursWindow: string;
    resourceAccessDelta: number;
    resourceLabel: string;
    geoVelocityLabel: string;
    geoRoute: { from: string; to: string };
  };
  peerComparison: {
    userLabel: string;
    exfilGb: number;
    teamMaxGb: number;
    teamAvgGb: number;
  };
  sensitiveCommands: Array<{ command: string; change: string; severity: 'error' | 'warning' | 'ok' }>;
  sequences: Array<{
    id: string;
    severity: Severity;
    risk: number;
    steps: string[];
    alertId?: string;
  }>;
};

type AnalyticsOverview = {
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
  recentAlerts: AlertItem[];
  watchlist: Array<{
    userId: string;
    name: string;
    detail: string;
    score: number;
    severity: Severity;
    riskLabel: string;
    riskLevel: string;
    riskPercent: number;
  }>;
  globalRiskIndex: number;
  activeBaselines: number;
  anomalousSequences: number;
  entityCount: number;
};

const NOW = new Date('2025-12-30T18:30:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const THREAT_USERS = new Set([7, 13, 20]);

const departments = ['Engineering', 'Security', 'Finance', 'Data', 'IT', 'Operations', 'Product', 'HR'];
const roles = [
  'Cloud Engineer',
  'Security Analyst',
  'Data Engineer',
  'DevOps Specialist',
  'Infrastructure Admin',
  'Backend Developer',
  'Software Engineer',
  'Platform Engineer',
];
const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'global'];
const locations = ['Seattle, WA', 'Austin, TX', 'Dublin, IE', 'Berlin, DE', 'Sydney, AU'];
const managers = ['A. Rivera', 'L. Chen', 'S. Patel', 'M. Osei', 'R. Kim'];

const alertTemplates = [
  { action: 'Unauthorized S3 bucket access', resource: 's3://confidential-data', awsService: 'S3' },
  { action: 'Unusual IAM role assumption', resource: 'arn:aws:iam::123456789012:role/Admin', awsService: 'IAM' },
  { action: 'Data exfiltration attempt detected', resource: 'ec2:i-0abc123def456', awsService: 'EC2' },
  { action: 'Mass download from DynamoDB', resource: 'dynamodb:prod-users-table', awsService: 'DynamoDB' },
  { action: 'Security group modification', resource: 'sg-0abc123def456', awsService: 'VPC' },
  { action: 'Console login from new geo', resource: 'AWS Console Login', awsService: 'Console' },
];

const auditActions = [
  { action: 's3:GetObject', resource: 'arn:aws:s3:::confidential-data/report.pdf' },
  { action: 'iam:AssumeRole', resource: 'arn:aws:iam::123456789012:role/Admin' },
  { action: 'ec2:RunInstances', resource: 'arn:aws:ec2:us-east-1:123456789012:instance/*' },
  { action: 'console:Login', resource: 'AWS Management Console' },
  { action: 'dynamodb:Scan', resource: 'arn:aws:dynamodb:us-east-1:123456789012:table/prod-users' },
  { action: 'ec2:AuthorizeSecurityGroupIngress', resource: 'arn:aws:ec2:us-east-1:123456789012:security-group/sg-0abc123' },
];

const pickFrom = <T,>(list: T[], index: number) => list[index % list.length];

const pad = (value: number, size: number) => value.toString().padStart(size, '0');

const formatTimestamp = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1, 2);
  const day = pad(date.getUTCDate(), 2);
  const hour = pad(date.getUTCHours(), 2);
  const minute = pad(date.getUTCMinutes(), 2);
  const second = pad(date.getUTCSeconds(), 2);
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const timeAgo = (date: Date) => {
  const diffMs = Math.max(0, NOW.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const getRiskLabel = (score: number) => {
  if (score >= 75) return { severity: 'critical' as const, riskLevel: 'High' };
  if (score >= 45) return { severity: 'warning' as const, riskLevel: 'Medium' };
  return { severity: 'safe' as const, riskLevel: 'Low' };
};

const users: UserSummary[] = Array.from({ length: 20 }, (_, index) => {
  const userIndex = index + 1;
  const isInsiderThreat = THREAT_USERS.has(userIndex);
  const riskScore = isInsiderThreat ? 82 + ((userIndex * 3) % 14) : 18 + ((userIndex * 7) % 55);
  const status: RiskStatus = riskScore >= 75 ? 'high-risk' : riskScore >= 45 ? 'medium-risk' : 'low-risk';
  const alerts = isInsiderThreat ? 4 + (userIndex % 2) : riskScore >= 60 ? 2 : riskScore >= 40 ? 1 : 0;
  return {
    id: `USR-${pad(userIndex, 3)}`,
    name: `user${userIndex}`,
    email: `user${userIndex}@company.com`,
    department: pickFrom(departments, userIndex),
    role: pickFrom(roles, userIndex + 2),
    riskScore,
    status,
    lastActive: `${(userIndex * 7) % 55 + 2} min ago`,
    alerts,
    isInsiderThreat,
  };
});

const alerts: AlertItem[] = [];
let alertCounter = 1024;

const addAlert = (user: UserSummary, severity: Severity, templateIndex: number, offsetHours: number, status: AlertStatus) => {
  const template = pickFrom(alertTemplates, templateIndex);
  const createdAtDate = new Date(NOW.getTime() - offsetHours * 60 * 60 * 1000);
  const scoreBase = severity === 'critical' ? 86 : severity === 'warning' ? 62 : 28;
  const score = Math.min(98, scoreBase + (templateIndex * 4) + (user.riskScore % 6));
  alerts.push({
    id: `ALT-${alertCounter}`,
    severity,
    userId: user.id,
    userName: user.name,
    action: template.action,
    resource: template.resource,
    createdAt: createdAtDate.toISOString(),
    timeAgo: timeAgo(createdAtDate),
    score,
    status,
    awsService: template.awsService,
  });
  alertCounter -= 1;
};

users.forEach((user, index) => {
  if (user.isInsiderThreat) {
    addAlert(user, 'critical', index, 1 + index, 'new');
    addAlert(user, 'critical', index + 1, 4 + index, 'investigating');
    addAlert(user, 'warning', index + 2, 7 + index, 'investigating');
    addAlert(user, 'warning', index + 3, 12 + index, 'resolved');
  } else if (user.riskScore >= 55) {
    addAlert(user, 'warning', index + 2, 10 + index, 'resolved');
  } else if (user.riskScore >= 35) {
    addAlert(user, 'safe', index + 3, 14 + index, 'resolved');
  }
});

const criticalAlertIdsByUser = new Map<string, string>();

alerts.forEach((alert) => {
  if (alert.severity !== 'critical') return;
  if (criticalAlertIdsByUser.has(alert.userId)) return;
  criticalAlertIdsByUser.set(alert.userId, alert.id.replace('ALT-', 'A-'));
});

const auditLogs: AuditLogItem[] = [];
let logCounter = 45920;

for (let dayOffset = 0; dayOffset < 90; dayOffset += 1) {
  const dayStart = new Date(NOW.getTime() - dayOffset * DAY_MS);
  const entriesPerDay = 6 + (dayOffset % 5);
  for (let entryIndex = 0; entryIndex < entriesPerDay; entryIndex += 1) {
    const user = users[(dayOffset + entryIndex * 3) % users.length];
    const action = pickFrom(auditActions, dayOffset + entryIndex * 7);
    const timestamp = new Date(dayStart.getTime() - entryIndex * 47 * 60 * 1000 - (dayOffset % 3) * 13 * 60 * 1000);
    const severity: Severity = user.isInsiderThreat
      ? entryIndex % 3 === 0
        ? 'critical'
        : 'warning'
      : user.riskScore >= 60
      ? 'warning'
      : 'safe';
    const statusRoll = (dayOffset + entryIndex) % 10;
    auditLogs.push({
      id: `LOG-${logCounter}`,
      timestamp: formatTimestamp(timestamp),
      userId: user.id,
      userName: user.name,
      action: action.action,
      resource: action.resource,
      sourceIP: `192.168.${(dayOffset + entryIndex * 7 + 10) % 255}.${(entryIndex * 13 + 20) % 255}`,
      region: pickFrom(regions, dayOffset + entryIndex * 3),
      status: statusRoll < 8 ? 'success' : 'blocked',
      severity,
    });
    logCounter -= 1;
  }
}

const investigations: Record<string, InvestigationDetail> = {};

const investigationTemplates: Record<string, Omit<InvestigationDetail, 'id' | 'severity' | 'riskScore' | 'entity' | 'department'>> = {
  'USR-007': {
    firstSeen: '2025-12-04 01:45 AM',
    location: 'Seattle, WA, us-west-2 (VPN)',
    explanation: 'Repeated access to production finance buckets followed a privilege escalation path and a bulk download burst outside normal working hours.',
    tags: ['AFTER HOURS', 'IAM ESCALATION', 'S3 EXFILTRATION'],
    features: [
      { name: 'S3 Exposure', value: 95, severity: 'error' },
      { name: 'After-Hours Activity', value: 88, severity: 'error' },
      { name: 'Role Chaining', value: 71, severity: 'tertiary' },
    ],
    events: [
      {
        time: '11:18 PM',
        type: 'NORMAL',
        title: 'Standard SSO Login',
        detailLines: ['Console login via SSO from trusted workstation'],
        icon: 'login',
        anomaly: false,
      },
      {
        time: '11:31 PM',
        delta: 'T +13m',
        type: 'ANOMALY',
        title: 'Unexpected Role Pivot',
        detailLines: ['Assumed Role: arn:aws:iam::123456789012:role/FinanceDataAdmin'],
        icon: 'admin_panel_settings',
        anomaly: true,
      },
      {
        time: '11:44 PM',
        delta: 'T +26m',
        type: 'ANOMALY',
        title: 'Bulk Finance Bucket Listing',
        detailLines: ['Action: s3:ListBucket', 'Resource: s3://finance_bucket'],
        icon: 'folder_open',
        anomaly: true,
      },
      {
        time: '11:52 PM',
        delta: 'T +34m',
        type: 'ANOMALY',
        title: 'Bulk Object Retrieval',
        detailLines: ['Action: s3:GetObject', 'Volume: 4.2 GB'],
        icon: 'download',
        anomaly: true,
      },
    ],
    graph: {
      nodes: [
        { id: 'user', label: 'user7', kind: 'entity', x: 150, y: 200, status: 'anomalous' },
        { id: 'ws', label: 'ws-914', kind: 'workstation', x: 340, y: 118, status: 'normal' },
        { id: 'role', label: 'FinanceDataAdmin', kind: 'account', x: 395, y: 92, status: 'suspicious' },
        { id: 'bucket', label: 'finance_bucket', kind: 'resource', x: 610, y: 205, status: 'anomalous' },
        { id: 'export', label: 's3-export-job', kind: 'external', x: 710, y: 120, status: 'anomalous' },
      ],
      edges: [
        { source: 'user', target: 'ws', dashed: true },
        { source: 'ws', target: 'role', dashed: true },
        { source: 'role', target: 'bucket', anomalous: true },
        { source: 'bucket', target: 'export', anomalous: true },
      ],
    },
  },
  'USR-013': {
    firstSeen: '2025-12-11 03:20 AM',
    location: 'Berlin, DE, eu-west-1 (VPN)',
    explanation: 'The user moved through administrative APIs in quick succession, then touched sensitive DynamoDB exports after an unusual geo shift.',
    tags: ['PRIVILEGE ABUSE', 'GEO VELOCITY', 'DYNAMODB EXPORT'],
    features: [
      { name: 'Geo Velocity', value: 91, severity: 'error' },
      { name: 'API Sequence Anomaly', value: 84, severity: 'error' },
      { name: 'Data Volume Spike', value: 68, severity: 'tertiary' },
    ],
    events: [
      {
        time: '03:20 AM',
        type: 'NORMAL',
        title: 'Trusted Mobile Login',
        detailLines: ['Console login from registered device'],
        icon: 'smartphone',
        anomaly: false,
      },
      {
        time: '03:28 AM',
        delta: 'T +8m',
        type: 'ANOMALY',
        title: 'Rapid IAM Enumeration',
        detailLines: ['Action: iam:AssumeRole', 'Multiple roles enumerated in 90 seconds'],
        icon: 'admin_panel_settings',
        anomaly: true,
      },
      {
        time: '03:34 AM',
        delta: 'T +14m',
        type: 'ANOMALY',
        title: 'DynamoDB Table Scan',
        detailLines: ['Action: dynamodb:Scan', 'Resource: prod-users-table'],
        icon: 'database',
        anomaly: true,
      },
      {
        time: '03:41 AM',
        delta: 'T +21m',
        type: 'ANOMALY',
        title: 'Unusual Export Activity',
        detailLines: ['Action: export-job:Start', 'Volume: 3.1 GB'],
        icon: 'download',
        anomaly: true,
      },
    ],
    graph: {
      nodes: [
        { id: 'user', label: 'user13', kind: 'entity', x: 140, y: 210, status: 'anomalous' },
        { id: 'phone', label: 'mobile-22', kind: 'workstation', x: 315, y: 110, status: 'normal' },
        { id: 'iam', label: 'iam:AssumeRole', kind: 'account', x: 410, y: 90, status: 'suspicious' },
        { id: 'dynamo', label: 'prod-users-table', kind: 'resource', x: 595, y: 180, status: 'anomalous' },
        { id: 'download', label: 'export-job', kind: 'external', x: 725, y: 250, status: 'anomalous' },
      ],
      edges: [
        { source: 'user', target: 'phone', dashed: true },
        { source: 'phone', target: 'iam', dashed: true },
        { source: 'iam', target: 'dynamo', anomalous: true },
        { source: 'dynamo', target: 'download', anomalous: true },
      ],
    },
  },
  'USR-020': {
    firstSeen: '2025-12-18 01:05 AM',
    location: 'Sydney, AU, ap-southeast-1 (VPN)',
    explanation: 'The account showed persistence-style activity around security controls and a late-night data movement pattern inconsistent with peer behavior.',
    tags: ['PERSISTENCE', 'SECURITY CONTROL TAMPERING', 'LATE-NIGHT ACCESS'],
    features: [
      { name: 'Security Group Change', value: 94, severity: 'error' },
      { name: 'After-Hours Window', value: 87, severity: 'error' },
      { name: 'Peer Deviation', value: 75, severity: 'tertiary' },
    ],
    events: [
      {
        time: '01:05 AM',
        type: 'NORMAL',
        title: 'Login from Known Device',
        detailLines: ['SSO authenticated using registered laptop'],
        icon: 'login',
        anomaly: false,
      },
      {
        time: '01:19 AM',
        delta: 'T +14m',
        type: 'ANOMALY',
        title: 'Security Group Modification',
        detailLines: ['Action: ec2:AuthorizeSecurityGroupIngress', 'Rule: 0.0.0.0/0:22'],
        icon: 'security',
        anomaly: true,
      },
      {
        time: '01:27 AM',
        delta: 'T +22m',
        type: 'ANOMALY',
        title: 'Console Session Extension',
        detailLines: ['Session duration extended beyond policy'],
        icon: 'schedule',
        anomaly: true,
      },
      {
        time: '01:36 AM',
        delta: 'T +31m',
        type: 'ANOMALY',
        title: 'Outbound Object Transfer',
        detailLines: ['Action: s3:GetObject', 'Target: unknown external endpoint'],
        icon: 'upload',
        anomaly: true,
      },
    ],
    graph: {
      nodes: [
        { id: 'user', label: 'user20', kind: 'entity', x: 150, y: 190, status: 'anomalous' },
        { id: 'laptop', label: 'trusted-ltp', kind: 'workstation', x: 325, y: 120, status: 'normal' },
        { id: 'sg', label: 'sg-0abc123', kind: 'resource', x: 500, y: 95, status: 'suspicious' },
        { id: 'instance', label: 'ec2-prod-17', kind: 'resource', x: 620, y: 205, status: 'anomalous' },
        { id: 'endpoint', label: 'unknown-endpoint', kind: 'external', x: 720, y: 125, status: 'anomalous' },
      ],
      edges: [
        { source: 'user', target: 'laptop', dashed: true },
        { source: 'laptop', target: 'sg', dashed: true },
        { source: 'sg', target: 'instance', anomalous: true },
        { source: 'instance', target: 'endpoint', anomalous: true },
      ],
    },
  },
};

alerts
  .filter((alert) => alert.severity === 'critical')
  .forEach((alert, index) => {
    const user = users.find((u) => u.id === alert.userId) ?? users[0];
    const template = investigationTemplates[user.id];
    if (!template) return;

    investigations[alert.id.replace('ALT-', 'A-')] = {
      id: alert.id.replace('ALT-', 'A-'),
      severity: alert.severity,
      riskScore: Number((alert.score / 100).toFixed(2)),
      entity: user.name,
      department: user.department,
      ...template,
    };
  });

const userDetails: Record<string, UserDetail> = {};

users.forEach((user, index) => {
  const manager = pickFrom(managers, index);
  const managerInitials = manager.split(' ').map((part) => part[0]).join('');
  const sensitiveCommands = buildSensitiveCommands(user, index);
  const [primarySteps, secondarySteps] = buildSequenceSteps(index);
  userDetails[user.id] = {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      statusLabel: 'Active',
      riskScore: user.riskScore,
      firstSeen: `202${(index % 3) + 1}-0${(index % 8) + 1}-12 08:30 UTC`,
      location: `${pickFrom(locations, index)} (${pickFrom(regions, index)})`,
      manager,
      managerInitials,
      devices: [
        { name: `LTP-${user.name.toUpperCase()}-2025`, status: 'trusted', type: 'laptop' },
        { name: 'Unknown iOS Device', status: user.isInsiderThreat ? 'unverified' : 'trusted', type: 'mobile' },
      ],
    },
    kbis: {
      afterHoursHours: user.isInsiderThreat ? 14 + (index % 6) : 4 + (index % 4),
      afterHoursWindow: 'past 7 days',
      resourceAccessDelta: user.isInsiderThreat ? 320 + (index % 40) : 40 + (index % 20),
      resourceLabel: 'S3: arn:aws:s3:::prod-data',
      geoVelocityLabel: user.isInsiderThreat ? 'Elevated' : 'Normal',
      geoRoute: { from: 'US-W2', to: 'US-E1' },
    },
    peerComparison: {
      userLabel: user.name,
      exfilGb: user.isInsiderThreat ? 7.8 + (index % 3) * 0.6 : 1 + (index % 3) * 0.4,
      teamMaxGb: 2.2 + (index % 4) * 0.2,
      teamAvgGb: 1 + (index % 3) * 0.15,
    },
    sensitiveCommands,
    sequences: [
      {
        id: `SEQ-${pad(40 + index, 3)}`,
        severity: user.isInsiderThreat ? 'critical' : 'warning',
        risk: user.isInsiderThreat ? 84 : 52,
        steps: primarySteps,
        alertId: user.isInsiderThreat ? criticalAlertIdsByUser.get(user.id) : undefined,
      },
      {
        id: `SEQ-${pad(35 + index, 3)}`,
        severity: 'warning',
        risk: 52,
        steps: secondarySteps,
      },
    ],
  };
});

const usersByRisk = users.reduce(
  (acc, user) => {
    if (user.status === 'high-risk') acc.critical += 1;
    else if (user.status === 'medium-risk') acc.warning += 1;
    else acc.safe += 1;
    acc.total += 1;
    return acc;
  },
  { critical: 0, warning: 0, safe: 0, total: 0 }
);

const activeThreatCount = users.filter((user) => user.isInsiderThreat).length;
const threatSignalSeries = [2, 3, 1, 0, 1, 2, 3].map((value) => Math.min(activeThreatCount + 1, value));
const normalBaselineSeries = [18, 20, 21, 22, 21, 19, 18];

const threatUserIds = new Set(users.filter((user) => user.isInsiderThreat).map((user) => user.id));

const recentThreatAlerts = alerts
  .filter((alert) => threatUserIds.has(alert.userId))
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 6);

function buildSensitiveCommands(user: UserSummary, index: number) {
  const resourceTarget = pickFrom(['prod-data', 'finance-ledger', 'hr-archive', 'analytics-cluster', 'ops-backups'], index);
  const roleTarget = pickFrom(['FinanceDataAdmin', 'AuditReader', 'OpsRunner', 'IncidentResponder', 'DataExporter'], index + 1);
  const endpointTarget = pickFrom(['bastion-01', 'jumpbox-02', 'etl-node-03', 'vpn-gateway-04', 'reporting-node-05'], index + 2);

  return [
    {
      command: `s3:ListBucket ${resourceTarget}`,
      change: user.isInsiderThreat ? `+${720 + (index % 4) * 20}%` : `+${95 + (index % 5) * 6}%`,
      severity: user.isInsiderThreat ? ('error' as const) : ('warning' as const),
    },
    {
      command: `iam:AssumeRole ${roleTarget}`,
      change: user.isInsiderThreat ? `+${145 + (index % 5) * 5}%` : `+${28 + (index % 4) * 4}%`,
      severity: 'warning' as const,
    },
    {
      command: `ec2:DescribeInstances ${endpointTarget}`,
      change: user.isInsiderThreat ? 'Burst' : 'Normal',
      severity: 'ok' as const,
    },
  ];
}

function buildSequenceSteps(index: number) {
  const resourceTarget = pickFrom(['prod-data', 'finance-ledger', 'hr-archive', 'analytics-cluster', 'ops-backups'], index + 1);
  const roleTarget = pickFrom(['FinanceDataAdmin', 'AuditReader', 'OpsRunner', 'IncidentResponder', 'DataExporter'], index + 2);
  const endpointTarget = pickFrom(['bastion-01', 'jumpbox-02', 'etl-node-03', 'vpn-gateway-04', 'reporting-node-05'], index + 3);

  return [
    [
      `Console Login from ${endpointTarget}`,
      `IAM:AssumeRole ${roleTarget}`,
      `S3:BulkDownload ${resourceTarget}`,
    ],
    [
      `VPN Connection via ${endpointTarget}`,
      `EC2:DescribeInstances ${roleTarget}`,
      `RDS:DataExport ${resourceTarget}`,
    ],
  ];
}

const analyticsOverview: AnalyticsOverview = {
  lastUpdated: formatTimestamp(new Date(NOW.getTime() - 12 * 60 * 1000)),
  kpis: [
    { title: 'Active Threats', value: String(activeThreatCount), change: '+0', changeType: 'increase', color: 'secondary' },
    { title: 'Users Monitored', value: String(users.length), change: '+0', changeType: 'increase', color: 'primary' },
    { title: 'Avg Risk Score', value: Math.round(users.reduce((sum, user) => sum + user.riskScore, 0) / users.length).toString(), change: '-5', changeType: 'decrease', color: 'tertiary' },
    { title: 'Protected Resources', value: '456', change: '+12', changeType: 'increase', color: 'primary' },
  ],
  threatData: [
    { time: '00:00', threats: threatSignalSeries[0], normal: normalBaselineSeries[0] },
    { time: '04:00', threats: threatSignalSeries[1], normal: normalBaselineSeries[1] },
    { time: '08:00', threats: threatSignalSeries[2], normal: normalBaselineSeries[2] },
    { time: '12:00', threats: threatSignalSeries[3], normal: normalBaselineSeries[3] },
    { time: '16:00', threats: threatSignalSeries[4], normal: normalBaselineSeries[4] },
    { time: '20:00', threats: threatSignalSeries[5], normal: normalBaselineSeries[5] },
    { time: '24:00', threats: threatSignalSeries[6], normal: normalBaselineSeries[6] },
  ],
  distribution: usersByRisk,
  recentAlerts: recentThreatAlerts,
  watchlist: users
    .filter((user) => user.isInsiderThreat)
    .slice(0, 3)
    .map((user) => {
      const risk = getRiskLabel(user.riskScore);

      return {
      userId: user.id,
      name: `${user.name} (${user.department})`,
      detail: 'Anomalous access sequence',
      score: user.riskScore,
      severity: risk.severity,
      riskLabel: 'Data Exfiltration Risk',
      riskLevel: risk.riskLevel,
      riskPercent: Math.min(95, user.riskScore),
    };
    }),
  globalRiskIndex: 84.2,
  activeBaselines: 1492,
  anomalousSequences: 38,
  entityCount: 20,
};

export const mockData = {
  users,
  alerts,
  auditLogs,
  investigations,
  userDetails,
  analyticsOverview,
};

export type { UserSummary, AlertItem, AuditLogItem, InvestigationDetail, UserDetail, AnalyticsOverview };
