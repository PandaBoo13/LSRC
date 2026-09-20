import { catalogCourses } from '../data/elearning';
import type { Course } from '../data/elearning';

export function getCourse(slug?: string): Course {
  return (
    catalogCourses.find((course) => course.slug === slug || course.id === slug) ??
    catalogCourses[0]
  );
}

export function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}
