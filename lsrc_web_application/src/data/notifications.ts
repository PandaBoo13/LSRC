export type Notification = {
  id: string;
  type: 'course' | 'quiz' | 'billing' | 'system' | 'community';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
};

export const notifications: Notification[] = [
  {
    id: 'n-1',
    type: 'course',
    title: 'New lesson available',
    message: 'Routing, layouts, and page shells is now unlocked in React Foundations.',
    time: '2 hours ago',
    read: false,
    link: '/learn/react-foundations/routing',
  },
  {
    id: 'n-2',
    type: 'quiz',
    title: 'Quiz reminder',
    message: 'You have an unfinished quiz in React Foundations. Due today at 6:00 PM.',
    time: '5 hours ago',
    read: false,
    link: '/learn/react-foundations/quiz/react-quiz-1',
  },
  {
    id: 'n-3',
    type: 'community',
    title: 'Reply to your question',
    message: 'Maya Nguyen replied to your thread about UX portfolio reviews.',
    time: 'Yesterday',
    read: true,
    link: '/community',
  },
  {
    id: 'n-4',
    type: 'billing',
    title: 'Payment confirmed',
    message: 'Invoice INV-2048 for React Foundations with TypeScript was paid successfully.',
    time: 'Jun 08, 2026',
    read: true,
    link: '/billing',
  },
  {
    id: 'n-5',
    type: 'system',
    title: 'Scheduled maintenance',
    message: 'Platform maintenance on Jun 15, 2026 from 1:00–3:00 AM UTC. Learning progress will be saved.',
    time: 'Jun 05, 2026',
    read: true,
  },
  {
    id: 'n-6',
    type: 'course',
    title: 'Certificate ready',
    message: 'Your certificate for UX Product Design Masterclass is ready to download.',
    time: 'Apr 02, 2026',
    read: true,
    link: '/certificates',
  },
];
