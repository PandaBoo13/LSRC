import { FaVideo } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { inputClass } from "../../../components/elearning/styles";
import { catalogCourses, instructorNav } from "../../../data/elearning";

export function InstructorCourseEditorPage({ mode }: { mode: 'create' | 'edit' }) {
  const title = mode === 'create' ? 'Create course' : 'Edit course';

  return (
    <DashboardShell
      role="Instructor"
      title={title}
      subtitle="Static course editor with the core fields prepared."
      navItems={instructorNav}
    >
      <Panel>
        <form className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <input
              placeholder="Course title"
              defaultValue={mode === 'edit' ? catalogCourses[0].title : ''}
              className={inputClass}
            />
            <textarea
              rows={7}
              placeholder="Course description"
              defaultValue={mode === 'edit' ? catalogCourses[0].description : ''}
              className={inputClass}
            />
            <div className="grid gap-5 md:grid-cols-3">
              {['Category', 'Level', 'Price'].map((label) => (
                <input key={label} placeholder={label} className={inputClass} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50 p-6">
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-white text-cyan-600">
              <FaVideo size={28} />
            </div>
            <p className="mt-4 text-sm text-slate-600">Upload a cover image or intro video placeholder.</p>
            <button
              type="button"
              className="mt-5 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Save course
            </button>
          </div>
        </form>
      </Panel>
    </DashboardShell>
  );
}
