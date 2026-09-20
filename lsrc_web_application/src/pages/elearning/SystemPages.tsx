// src/pages/elearning/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { FaLock, FaHome, FaCode } from 'react-icons/fa';

import { Panel, PublicLayout } from '../../components/elearning';

export function NotFoundPage() {
  return (
    <PublicLayout>
      <main className="mx-auto flex max-w-4xl items-center justify-center px-6 py-32">
        <Panel className="text-center">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-6">
            <FaLock className="text-2xl" />
          </div>

          {/* Status Code */}
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">403</p>

          {/* Title */}
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900">
            Feature Under Development
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            This feature is currently under development or the page does not exist.
            Please check back later or contact our support team for assistance.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#49BBBD] px-6 py-3 font-semibold text-white transition hover:bg-[#3db0b2]"
            >
              <FaHome />
              Back Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
            >
              Go Back
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <FaCode className="text-[#49BBBD]" />
              We are working hard to bring you this feature soon!
            </p>
          </div>
        </Panel>
      </main>
    </PublicLayout>
  );
}