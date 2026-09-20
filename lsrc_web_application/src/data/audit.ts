export type AuditLogEntry = {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
};

export const auditLogs: AuditLogEntry[] = [
  {
    id: 'log-001',
    actor: 'Bao Nguyen',
    action: 'Updated platform settings',
    target: 'Email templates',
    ip: '103.**.**.42',
    timestamp: 'Jun 12, 2026 09:14',
    severity: 'info',
  },
  {
    id: 'log-002',
    actor: 'System',
    action: 'Failed login attempt blocked',
    target: 'admin@lsrc.edu',
    ip: '185.**.**.91',
    timestamp: 'Jun 12, 2026 08:52',
    severity: 'warning',
  },
  {
    id: 'log-003',
    actor: 'Lina Tran',
    action: 'Published course',
    target: 'React Foundations with TypeScript',
    ip: '103.**.**.18',
    timestamp: 'Jun 11, 2026 17:30',
    severity: 'info',
  },
  {
    id: 'log-004',
    actor: 'Bao Nguyen',
    action: 'Issued refund',
    target: 'INV-1996',
    ip: '103.**.**.42',
    timestamp: 'Jun 11, 2026 14:02',
    severity: 'info',
  },
  {
    id: 'log-005',
    actor: 'System',
    action: 'Rate limit triggered',
    target: 'API /auth/login',
    ip: '91.**.**.77',
    timestamp: 'Jun 10, 2026 23:18',
    severity: 'critical',
  },
  {
    id: 'log-006',
    actor: 'Alex Pham',
    action: 'Submitted course for review',
    target: 'Digital Marketing Bootcamp v2',
    ip: '113.**.**.05',
    timestamp: 'Jun 10, 2026 11:45',
    severity: 'info',
  },
];

export type InstructorProfile = {
  id: string;
  name: string;
  email: string;
  courses: number;
  students: string;
  revenue: string;
  rating: number;
  status: 'Active' | 'Pending' | 'Suspended';
  joined: string;
};

export const instructorProfiles: InstructorProfile[] = [
  {
    id: 'inst-1',
    name: 'Lina Tran',
    email: 'lina@lsrc.edu',
    courses: 4,
    students: '18.2k',
    revenue: '$42,800',
    rating: 4.9,
    status: 'Active',
    joined: 'Jan 2024',
  },
  {
    id: 'inst-2',
    name: 'Maya Nguyen',
    email: 'maya@lsrc.edu',
    courses: 3,
    students: '12.4k',
    revenue: '$31,200',
    rating: 4.8,
    status: 'Active',
    joined: 'Mar 2024',
  },
  {
    id: 'inst-3',
    name: 'Alex Pham',
    email: 'alex@lsrc.edu',
    courses: 2,
    students: '9.7k',
    revenue: '$18,600',
    rating: 4.7,
    status: 'Active',
    joined: 'Aug 2024',
  },
  {
    id: 'inst-4',
    name: 'Chris Le',
    email: 'chris@lsrc.edu',
    courses: 1,
    students: '15.1k',
    revenue: '$28,400',
    rating: 4.9,
    status: 'Pending',
    joined: 'May 2026',
  },
];
