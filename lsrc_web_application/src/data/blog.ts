

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: string;
  image: string;
  tags: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'master-react-typescript-2026',
    title: 'How to Master React with TypeScript in 2026',
    excerpt:
      'A practical roadmap for building type-safe React apps with modern tooling, component patterns, and real project workflows.',
    content: [
      'React and TypeScript have become the default stack for modern frontend teams. The combination gives you predictable props, safer refactors, and better editor support across large codebases.',
      'Start with a Vite + React + TypeScript template, then focus on component composition before reaching for global state. Most learning dashboards can be built with local state, URL params, and a thin data layer.',
      'Use discriminated unions for UI states (loading, error, success), keep API types near your fetch layer, and extract reusable layout shells early. That keeps pages consistent as the product grows.',
      'Finally, ship small vertical slices: one route, one data fetch, one polished screen. Iterating in slices beats designing the entire platform upfront.',
    ],
    category: 'Frontend',
    author: 'Lina Tran',
    authorAvatar: 'https://i.pravatar.cc/80?img=12',
    publishedAt: 'Jun 02, 2026',
    readTime: '8 min read',
    image:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1400&auto=format&fit=crop',
    tags: ['React', 'TypeScript', 'Vite'],
  },
  {
    slug: 'ux-research-for-elearning',
    title: 'UX Research Patterns for E-Learning Products',
    excerpt:
      'Learn how to run lightweight research that improves course discovery, lesson completion, and learner retention.',
    content: [
      'E-learning products fail when navigation hides progress and when learners cannot tell what to do next. Research should focus on those moments first.',
      'Run five-session interview loops with new learners and instructors. Map the first 10 minutes of onboarding and the return visit after 48 hours.',
      'Turn findings into dashboard cards, progress bars, and notification copy. Small UX wins compound when learners study weekly.',
      'Measure completion rate per module, not just sign-ups. That metric aligns product, content, and support teams.',
    ],
    category: 'Design',
    author: 'Maya Nguyen',
    authorAvatar: 'https://i.pravatar.cc/80?img=32',
    publishedAt: 'May 21, 2026',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1400&auto=format&fit=crop',
    tags: ['UX', 'Research', 'Product'],
  },
  {
    slug: 'build-learning-analytics-dashboard',
    title: 'Building a Learning Analytics Dashboard',
    excerpt:
      'Design KPI cards, cohort views, and instructor reports that help teams act on learner data.',
    content: [
      'Analytics dashboards should answer one question per screen. For admins, start with active learners, completion rate, and revenue.',
      'Use consistent metric cards with a label, primary value, and short note. Avoid cramming twelve charts above the fold.',
      'Segment learners by cohort and course category to spot content that needs improvement. Pair charts with a table of flagged accounts.',
      'Export CSV for finance and PDF summaries for leadership. Static prototypes can still demonstrate the workflow clearly.',
    ],
    category: 'Data',
    author: 'Chris Le',
    authorAvatar: 'https://i.pravatar.cc/80?img=52',
    publishedAt: 'May 08, 2026',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop',
    tags: ['Analytics', 'Dashboard', 'Data'],
  },
  {
    slug: 'launch-self-paced-course',
    title: 'Launch Checklist for a Self-Paced Course',
    excerpt:
      'From curriculum outline to certificate delivery — a step-by-step guide for first-time instructors.',
    content: [
      'Define three measurable outcomes before filming. Every lesson should map to one outcome so learners feel progress.',
      'Structure modules in 5–12 minute videos with one quiz per section. Shorter beats polished but overwhelming.',
      'Prepare a welcome announcement, a mid-course check-in, and a completion email. Communication drives completion.',
      'Publish a sample lesson publicly, collect feedback, then open enrollment. Iteration beats perfect launches.',
    ],
    category: 'Teaching',
    author: 'Alex Pham',
    authorAvatar: 'https://i.pravatar.cc/80?img=15',
    publishedAt: 'Apr 19, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1400&auto=format&fit=crop',
    tags: ['Instructor', 'Course', 'Launch'],
  },
];
