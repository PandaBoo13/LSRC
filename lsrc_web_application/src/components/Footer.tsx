import {
  FaFacebookF,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaGraduationCap,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1d2939] text-white">
      {/* Top Part: Navigation */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 border-b border-slate-800">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white">
                <FaGraduationCap className="text-xl" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">LSRC</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400 max-w-md">
              Transforming online education with modern learning tools and interactive experiences.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-cyan-400 transition">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-cyan-400 transition">Careers</Link></li>
              <li><Link to="/pricing" className="hover:text-cyan-400 transition">Pricing</Link></li>
              <li><Link to="/blog" className="hover:text-cyan-400 transition">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Resources</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/courses" className="hover:text-cyan-400 transition">Courses</Link></li>
              <li><Link to="/community" className="hover:text-cyan-400 transition">Community</Link></li>
              <li><Link to="/help" className="hover:text-cyan-400 transition">Help Center</Link></li>
              <li><Link to="/instructor" className="hover:text-cyan-400 transition">Instructor</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Contact Section - 100% Exact Data From Image */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl font-extrabold uppercase tracking-wider text-white">
              LIÊN HỆ VỚI CHÚNG TÔI
            </h3>

            <div className="space-y-5 text-sm">
              {/* Tel */}
              <div className="flex items-start gap-4">
                <FaPhoneAlt className="text-xl text-white mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-white">Tel</p>
                  <p className="text-slate-300">+84 931 115 164</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <FaEnvelope className="text-xl text-white mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-white">Email</p>
                  <p className="text-slate-300">marketing@connect.birmingham.edu.sg</p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start gap-4">
                <FaGlobe className="text-xl text-white mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-white">Website</p>
                  <p className="text-slate-300">www.birmingham.edu.sg</p>
                </div>
              </div>

              {/* Facebook */}
              <div className="flex items-start gap-4">
                <FaFacebookF className="text-xl text-white mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-white">Facebook</p>
                  <p className="text-slate-300">Birmingham Academy VietNam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Campuses */}
          <div className="lg:col-span-7 space-y-6 text-sm">
            {/* Campus 1 */}
            <div>
              <h4 className="font-bold text-white text-base">Campus 1 (HQ)</h4>
              <p className="text-slate-300 leading-relaxed mt-1">
                116 Middle Road, #08-02 & #08-03/04, ICB Enterprise House, Singapore 188972
              </p>
            </div>

            {/* Campus 2 */}
            <div>
              <h4 className="font-bold text-white text-base">Campus 2 (School of Basic Education, K-12)</h4>
              <p className="text-slate-300 leading-relaxed mt-1">
                110 Middle Road, #06-01/02 & #06-03, Chiat Hong Building, Singapore 188968
              </p>
            </div>

            {/* Campus 3 */}
            <div>
              <h4 className="font-bold text-white text-base">Campus 3 (School of Higher Learning)</h4>
              <p className="text-slate-300 leading-relaxed mt-1">
                135 Middle Road, #01-01/02/03 & #04-12, Bylands Building, Singapore 188975
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-800 bg-[#16202c]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 text-xs text-slate-400 md:flex-row">
          <p>© 2026 LSRC. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-cyan-400 transition">Terms</Link>
            <Link to="/privacy" className="hover:text-cyan-400 transition">Privacy</Link>
            <Link to="/contact" className="hover:text-cyan-400 transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}