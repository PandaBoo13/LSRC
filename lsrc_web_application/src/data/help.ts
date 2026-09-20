export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  articleCount: number;
};

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Account setup, first course, and dashboard basics.',
    icon: 'rocket',
    articleCount: 12,
  },
  {
    id: 'courses',
    title: 'Courses & Learning',
    description: 'Enrollment, progress, quizzes, and certificates.',
    icon: 'book',
    articleCount: 18,
  },
  {
    id: 'billing',
    title: 'Billing & Payments',
    description: 'Invoices, refunds, coupons, and subscriptions.',
    icon: 'card',
    articleCount: 9,
  },
  {
    id: 'instructor',
    title: 'Instructor Hub',
    description: 'Publishing courses, students, and revenue.',
    icon: 'users',
    articleCount: 14,
  },
];

export const faqItems: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'getting-started',
    question: 'How do I enroll in a course?',
    answer:
      'Browse the course catalog, open a course detail page, and click Add to Cart or Enroll Now. Complete checkout to unlock lessons in My Courses.',
  },
  {
    id: 'faq-2',
    category: 'courses',
    question: 'Can I download lessons for offline viewing?',
    answer:
      'Selected courses support downloadable resources from the lesson sidebar. Video offline mode is available on Professional and Team plans.',
  },
  {
    id: 'faq-3',
    category: 'courses',
    question: 'How do certificates work?',
    answer:
      'Complete all required lessons and pass the final quiz with at least 80%. Certificates appear on your Certificates page and can be shared via link.',
  },
  {
    id: 'faq-4',
    category: 'billing',
    question: 'What payment methods are accepted?',
    answer:
      'We accept major credit cards, PayPal, and bank transfer for Team plans. All transactions appear under Billing in your dashboard.',
  },
  {
    id: 'faq-5',
    category: 'billing',
    question: 'How do I request a refund?',
    answer:
      'Refunds are available within 14 days of purchase if less than 20% of the course has been completed. Contact support with your invoice ID.',
  },
  {
    id: 'faq-6',
    category: 'instructor',
    question: 'How do I become an instructor?',
    answer:
      'Apply via the Careers page or contact our partnerships team. Approved instructors get access to the Instructor Hub to publish courses.',
  },
  {
    id: 'faq-7',
    category: 'getting-started',
    question: 'Is there a mobile app?',
    answer:
      'LSRC works in mobile browsers today. Native iOS and Android apps are on the roadmap for late 2026.',
  },
  {
    id: 'faq-8',
    category: 'courses',
    question: 'How long do I keep access to a course?',
    answer:
      'Individual course purchases include lifetime access. Subscription plans include access while your subscription is active.',
  },
];
