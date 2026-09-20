import { useEffect, useState } from 'react';
import {
  FaArrowUp,
  FaBook,
  FaBullhorn,
  FaChartBar,
  FaCommentDots,
  FaHome,
  FaInfoCircle,
  FaLayerGroup,
  FaNewspaper,
  FaStar,
} from 'react-icons/fa';

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const OUTER_RADIUS = 220;
const INNER_RADIUS = 150;
const ARC_ANGLE = Math.PI / 2;
const SCROLL_OFFSET = 90;

const outerSections: Section[] = [
  {
    id: 'hero',
    label: 'Hero',
    icon: <FaHome />,
  },
  {
    id: 'statistics',
    label: 'Statistics',
    icon: <FaChartBar />,
  },
  {
    id: 'services',
    label: 'Services',
    icon: <FaLayerGroup />,
  },
  {
    id: 'about',
    label: 'About',
    icon: <FaInfoCircle />,
  },
];

const innerSections: Section[] = [
  {
    id: 'features',
    label: 'Features',
    icon: <FaStar />,
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: <FaBook />,
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    icon: <FaCommentDots />,
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: <FaNewspaper />,
  },
  {
    id: 'cta',
    label: 'CTA',
    icon: <FaBullhorn />,
  },
];

type MenuItemProps = {
  section: Section;
  open: boolean;
  radius: number;
  angle: number;
  delay: number;
  large?: boolean;
  onClick: (id: string) => void;
};

function MenuItem({
  section,
  open,
  radius,
  angle,
  delay,
  large = false,
  onClick,
}: MenuItemProps) {
  const x = -Math.sin(angle) * radius;
  const y = -Math.cos(angle) * radius;

  return (
    <button
      onClick={() => onClick(section.id)}
      className={`
        group
        absolute
        flex
        items-center
        justify-center
        rounded-full
        shadow-xl
        transition-all
        duration-500
        hover:scale-110
        ${
          large
            ? `
              h-16
              w-16
              bg-white
              text-slate-700
              hover:bg-cyan-500
              hover:text-white
            `
            : `
              h-14
              w-14
              bg-cyan-50
              text-cyan-600
              hover:bg-cyan-500
              hover:text-white
            `
        }
        ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}
      `}
      style={{
        transform: open ? `translate(${x}px, ${y}px)` : 'translate(0px, 0px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {section.icon}

      <span
        className="
          pointer-events-none
          absolute
          right-full
          mr-3
          whitespace-nowrap
          rounded-full
          bg-slate-900
          px-3
          py-1.5
          text-xs
          text-white
          opacity-0
          transition
          group-hover:opacity-100
        "
      >
        {section.label}
      </span>
    </button>
  );
}

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isVisible = window.scrollY > 500;

      setVisible(isVisible);

      if (!isVisible) {
        setOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);

    if (!section) return;

    const top =
      section.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });

    setOpen(false);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
          fixed
          bottom-8
          right-8
          z-[9999]
          transition-all
          duration-500
          ${
            visible
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-10 opacity-0'
          }
        `}
      >
        {outerSections.map((section, index) => (
          <MenuItem
            key={section.id}
            section={section}
            open={open}
            radius={OUTER_RADIUS}
            angle={(ARC_ANGLE / (outerSections.length - 1)) * index}
            delay={index * 50}
            large
            onClick={scrollToSection}
          />
        ))}

        {innerSections.map((section, index) => (
          <MenuItem
            key={section.id}
            section={section}
            open={open}
            radius={INNER_RADIUS}
            angle={(ARC_ANGLE / (innerSections.length - 1)) * index}
            delay={(index + outerSections.length) * 50}
            onClick={scrollToSection}
          />
        ))}

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            text-2xl
            text-white
            shadow-[0_15px_40px_rgba(0,180,255,0.35)]
            transition-all
            duration-300
            hover:scale-110
          "
        >
          <FaArrowUp
            className={`
              transition-transform
              duration-300
              ${open ? 'rotate-180' : ''}
            `}
          />
        </button>
      </div>
    </>
  );
}
