// src/pages/elearning/StudentPages/components/CourseDetail/CourseTabNav.tsx
export type CourseTabType = 'overview' | 'outcomes' | 'prerequisites' | 'reviews';

interface CourseTabNavProps {
  activeTab: CourseTabType;
  onChangeTab: (tab: CourseTabType) => void;
}

export function CourseTabNav({ activeTab, onChangeTab }: CourseTabNavProps) {
  const tabs: { id: CourseTabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'outcomes', label: 'Outcomes' },
    { id: 'prerequisites', label: 'Prerequisites' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChangeTab(tab.id)}
          className={`px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition ${
            activeTab === tab.id
              ? 'text-white bg-[#49BBBD] shadow-sm'
              : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}