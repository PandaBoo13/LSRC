export type Course = {
  id: string;
  slug: string;
  title: string;
  category: string;
  instructor: string;
  avatar: string;
  image: string;
  level: string;
  duration: string;
  lessons: number;
  students: string;
  rating: number;
  price: number;
  oldPrice: number;
  progress: number;
  description: string;
  outcomes: string[];
  curriculum: {
    section: string;
    lessons: string[];
  }[];
};

export type NavItem = {
  label: string;
  to: string;
  icon: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
};


export const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$19',
    description: 'For students building weekly learning habits.',
    features: ['20 courses', 'Course notes', 'Community access', 'Basic certificates'],
  },
  {
    name: 'Professional',
    price: '$49',
    description: 'For active learners who want guided growth.',
    features: ['All courses', 'Quizzes and projects', 'Priority certificates', 'Mentor Q&A'],
    highlight: true,
  },
  {
    name: 'Team',
    price: '$129',
    description: 'For companies training a small team.',
    features: ['Team dashboard', 'Learning reports', 'Role management', 'Invoice billing'],
  },
];

export const catalogCourses: Course[] = [
  {
    id: 'react-foundations',
    slug: 'react-foundations',
    title: 'React Foundations with TypeScript',
    category: 'Frontend',
    instructor: 'Lina Tran',
    avatar: 'https://i.pravatar.cc/80?img=12',
    image:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1400&auto=format&fit=crop',
    level: 'Beginner',
    duration: '8 weeks',
    lessons: 42,
    students: '18.2k',
    rating: 4.9,
    price: 69,
    oldPrice: 120,
    progress: 72,
    description:
      'Build reusable React interfaces with TypeScript, component thinking, routing, forms, and clean state patterns.',
    outcomes: [
      'Create modern React components with strong TypeScript props.',
      'Build routed learning pages using React Router.',
      'Handle forms, state, and reusable UI patterns with confidence.',
      'Ship a polished Vite application with Tailwind CSS.',
    ],
    curriculum: [
      {
        section: 'Getting Started',
        lessons: ['Project setup', 'JSX and component basics', 'Props and composition'],
      },
      {
        section: 'Real App Patterns',
        lessons: ['Routing with layouts', 'Reusable cards and lists', 'Form states'],
      },
      {
        section: 'Final Project',
        lessons: ['Dashboard UI', 'Course detail page', 'Build and deploy checklist'],
      },
    ],
  },
  {
    id: 'ux-product-design',
    slug: 'ux-product-design',
    title: 'UX Product Design Masterclass',
    category: 'Design',
    instructor: 'Maya Nguyen',
    avatar: 'https://i.pravatar.cc/80?img=32',
    image:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1400&auto=format&fit=crop',
    level: 'Intermediate',
    duration: '6 weeks',
    lessons: 35,
    students: '12.4k',
    rating: 4.8,
    price: 59,
    oldPrice: 96,
    progress: 54,
    description:
      'Learn research, wireframing, prototyping, usability testing, and design handoff for digital products.',
    outcomes: [
      'Run lightweight product research and turn findings into flows.',
      'Design wireframes, prototypes, and design system primitives.',
      'Evaluate interfaces with practical usability testing.',
      'Present product decisions clearly to stakeholders.',
    ],
    curriculum: [
      {
        section: 'Discovery',
        lessons: ['User interviews', 'Persona mapping', 'Problem framing'],
      },
      {
        section: 'Design Sprint',
        lessons: ['Wireframes', 'Interactive prototypes', 'Design critique'],
      },
      {
        section: 'Delivery',
        lessons: ['Handoff specs', 'Design QA', 'Portfolio case study'],
      },
    ],
  },
  {
    id: 'digital-marketing',
    slug: 'digital-marketing',
    title: 'Digital Marketing Bootcamp',
    category: 'Marketing',
    instructor: 'Alex Pham',
    avatar: 'https://i.pravatar.cc/80?img=15',
    image:
      'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=1400&auto=format&fit=crop',
    level: 'All levels',
    duration: '5 weeks',
    lessons: 28,
    students: '9.7k',
    rating: 4.7,
    price: 49,
    oldPrice: 88,
    progress: 31,
    description:
      'Plan campaigns across SEO, email, paid ads, analytics, landing pages, and lifecycle messaging.',
    outcomes: [
      'Build a channel strategy for a real business objective.',
      'Read acquisition metrics and optimize campaign performance.',
      'Create high-converting landing page content.',
      'Design email journeys for retention and activation.',
    ],
    curriculum: [
      {
        section: 'Strategy',
        lessons: ['Market positioning', 'Campaign goals', 'Audience segments'],
      },
      {
        section: 'Channels',
        lessons: ['SEO basics', 'Paid media', 'Email automation'],
      },
      {
        section: 'Optimization',
        lessons: ['Analytics dashboard', 'A/B testing', 'Final campaign plan'],
      },
    ],
  },
  {
    id: 'data-analytics',
    slug: 'data-analytics',
    title: 'Data Analytics for Business',
    category: 'Data',
    instructor: 'Chris Le',
    avatar: 'https://i.pravatar.cc/80?img=52',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop',
    level: 'Intermediate',
    duration: '7 weeks',
    lessons: 39,
    students: '15.1k',
    rating: 4.9,
    price: 79,
    oldPrice: 132,
    progress: 86,
    description:
      'Turn raw business data into dashboards, insights, narratives, and decisions that teams can act on.',
    outcomes: [
      'Clean and model practical business datasets.',
      'Create clear dashboards and performance stories.',
      'Use statistical thinking for better decisions.',
      'Present findings with concise executive narratives.',
    ],
    curriculum: [
      {
        section: 'Data Thinking',
        lessons: ['Metrics that matter', 'Data quality', 'Exploratory analysis'],
      },
      {
        section: 'Dashboards',
        lessons: ['KPI cards', 'Trend analysis', 'Cohort views'],
      },
      {
        section: 'Storytelling',
        lessons: ['Insight writing', 'Executive summary', 'Final dashboard'],
      },
    ],
  },
];

export const studentNav: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { label: 'My Courses', to: '/my-courses', icon: 'book' },
  { label: 'Wishlist', to: '/wishlist', icon: 'heart' },
  { label: 'Notifications', to: '/notifications', icon: 'bell' },
  { label: 'Certificates', to: '/certificates', icon: 'award' },
  { label: 'Billing', to: '/billing', icon: 'card' },
  { label: 'Profile', to: '/profile', icon: 'user' },
  { label: 'Settings', to: '/settings', icon: 'settings' },
];
export const wishlistCourseIds = ['ux-product-design', 'data-analytics'];

export const instructorNav: NavItem[] = [
  { label: 'Overview', to: '/instructor', icon: 'grid' },
  { label: 'Courses', to: '/instructor/courses', icon: 'book' },
  { label: 'Profile', to: '/instructor/profile', icon: 'user' },        // ← Thêm
  { label: 'Announcements', to: '/instructor/announcements', icon: 'bell' },
  { label: 'Messages', to: '/instructor/messages', icon: 'mail' },
  { label: 'Revenue', to: '/instructor/revenue', icon: 'chart' },
];
export const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: 'grid' },
  { label: 'Users', to: '/admin/users', icon: 'users' },
  { label: 'Instructors', to: '/admin/instructors', icon: 'user' },
  { label: 'Courses', to: '/admin/courses', icon: 'book' },
  { label: 'Categories', to: '/admin/categories', icon: 'layers' },
  { label: 'Orders', to: '/admin/orders', icon: 'card' },
  { label: 'Reviews', to: '/admin/reviews', icon: 'star' },
  { label: 'Coupons', to: '/admin/coupons', icon: 'tag' },
  { label: 'Roles', to: '/admin/roles', icon: 'shield' },
  { label: 'Permissions', to: '/admin/permissions', icon: 'key' },
  { label: 'User Roles', to: '/admin/user-roles', icon: 'user-check' },
  { label: 'Reports', to: '/admin/reports', icon: 'chart' },
  { label: 'Audit Log', to: '/admin/audit-log', icon: 'clock' },
  { label: 'Settings', to: '/admin/settings', icon: 'settings' },
];

export const learningLessons = [
  {
    id: 'intro',
    title: 'Welcome and project overview',
    duration: '08:24',
    status: 'completed',
  },
  {
    id: 'components',
    title: 'Component thinking',
    duration: '14:12',
    status: 'completed',
  },
  {
    id: 'props',
    title: 'TypeScript props and reusable cards',
    duration: '18:45',
    status: 'active',
  },
  {
    id: 'routing',
    title: 'Routes, layouts, and page shells',
    duration: '21:03',
    status: 'locked',
  },
  {
    id: 'project',
    title: 'Final dashboard project',
    duration: '32:18',
    status: 'locked',
  },
];

export const quizQuestions = [
  {
    question: 'Which React pattern keeps card components reusable?',
    options: ['Hard-code every label', 'Pass content through props', 'Use global variables', 'Duplicate each card'],
    answer: 'Pass content through props',
  },
  {
    question: 'What does Vite mainly improve during development?',
    options: ['Static image size', 'Dev server startup and HMR', 'Database schema', 'Email delivery'],
    answer: 'Dev server startup and HMR',
  },
  {
    question: 'Why use Tailwind utility classes in this project?',
    options: ['To avoid routing', 'To style quickly with consistent tokens', 'To replace TypeScript', 'To store API data'],
    answer: 'To style quickly with consistent tokens',
  },
];

export const certificates = [
  {
    id: 'CERT-REACT-2026',
    title: 'React Foundations with TypeScript',
    issued: 'May 18, 2026',
    grade: 'A',
  },
  {
    id: 'CERT-UX-2026',
    title: 'UX Product Design Masterclass',
    issued: 'Apr 02, 2026',
    grade: 'A-',
  },
];

export const transactions = [
  {
    id: 'INV-2048',
    course: 'React Foundations with TypeScript',
    date: 'Jun 08, 2026',
    amount: '$69.00',
    status: 'Paid',
  },
  {
    id: 'INV-2031',
    course: 'UX Product Design Masterclass',
    date: 'May 19, 2026',
    amount: '$59.00',
    status: 'Paid',
  },
  {
    id: 'INV-1996',
    course: 'Digital Marketing Bootcamp',
    date: 'Apr 27, 2026',
    amount: '$49.00',
    status: 'Refunded',
  },
];

export const learners = [
  {
    name: 'Minh Hoang',
    email: 'minh@example.com',
    course: 'React Foundations',
    progress: 72,
    status: 'Active',
  },
  {
    name: 'Sara Nguyen',
    email: 'sara@example.com',
    course: 'UX Product Design',
    progress: 91,
    status: 'Active',
  },
  {
    name: 'Duc Anh',
    email: 'duc@example.com',
    course: 'Data Analytics',
    progress: 45,
    status: 'Needs support',
  },
];

export const adminUsers = [
  {
    name: 'Lina Tran',
    role: 'Instructor',
    email: 'lina@totc.edu',
    status: 'Verified',
  },
  {
    name: 'Minh Hoang',
    role: 'Student',
    email: 'minh@example.com',
    status: 'Active',
  },
  {
    name: 'Alex Pham',
    role: 'Instructor',
    email: 'alex@totc.edu',
    status: 'Pending',
  },
  {
    name: 'Bao Nguyen',
    role: 'Admin',
    email: 'bao@totc.edu',
    status: 'Active',
  },
];
