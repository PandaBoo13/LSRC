export type CommunityTopic = {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  pinned?: boolean;
  tags: string[];
};

export type CommunityReply = {
  id: string;
  topicId: string;
  author: string;
  authorAvatar: string;
  role: string;
  content: string;
  time: string;
  likes: number;
};

export const communityTopics: CommunityTopic[] = [
  {
    id: 't-1',
    title: 'Best practices for TypeScript props in reusable cards?',
    author: 'Minh Hoang',
    authorAvatar: 'https://i.pravatar.cc/80?img=8',
    category: 'Frontend',
    replies: 14,
    views: 328,
    lastActivity: '2 hours ago',
    pinned: true,
    tags: ['React', 'TypeScript'],
  },
  {
    id: 't-2',
    title: 'How do you structure a UX case study for job applications?',
    author: 'Sara Nguyen',
    authorAvatar: 'https://i.pravatar.cc/80?img=25',
    category: 'Design',
    replies: 22,
    views: 541,
    lastActivity: '5 hours ago',
    tags: ['UX', 'Career'],
  },
  {
    id: 't-3',
    title: 'Dashboard KPI ideas for admin analytics module',
    author: 'Duc Anh',
    authorAvatar: 'https://i.pravatar.cc/80?img=33',
    category: 'Data',
    replies: 9,
    views: 187,
    lastActivity: 'Yesterday',
    tags: ['Analytics', 'Admin'],
  },
  {
    id: 't-4',
    title: 'Launching my first course — feedback welcome!',
    author: 'Alex Pham',
    authorAvatar: 'https://i.pravatar.cc/80?img=15',
    category: 'Teaching',
    replies: 17,
    views: 412,
    lastActivity: 'Yesterday',
    tags: ['Instructor', 'Launch'],
  },
  {
    id: 't-5',
    title: 'Study group for Data Analytics cohort — June 2026',
    author: 'Chris Le',
    authorAvatar: 'https://i.pravatar.cc/80?img=52',
    category: 'Study Groups',
    replies: 31,
    views: 892,
    lastActivity: '2 days ago',
    tags: ['Data', 'Group'],
  },
];

export const communityReplies: CommunityReply[] = [
  {
    id: 'r-1',
    topicId: 't-1',
    author: 'Lina Tran',
    authorAvatar: 'https://i.pravatar.cc/80?img=12',
    role: 'Instructor',
    content:
      'Define a narrow props interface and compose children for flexible layouts. Avoid optional props that change card structure dramatically.',
    time: '1 hour ago',
    likes: 12,
  },
  {
    id: 'r-2',
    topicId: 't-1',
    author: 'Minh Hoang',
    authorAvatar: 'https://i.pravatar.cc/80?img=8',
    role: 'Student',
    content: 'Thanks! Should I use generics for list items or keep props explicit per card type?',
    time: '45 min ago',
    likes: 3,
  },
];
