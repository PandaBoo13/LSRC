import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Hero from '../../components/homepage/Hero';
import Statistics from '../../components/homepage/Statistics';
import Services from '../../components/homepage/Services';
// import About from '../../components/homepage/About';
import Features from '../../components/homepage/Features';
import Course from '../../components/homepage/Courses';
import StudyAbroadSection from '../../components/homepage/StudyAbroadSection';
import StudyInVietnamSection from '../../components/homepage/StudyInVietnamSection';
import Testimonials from '../../components/homepage/Testimonials';
import Blog from '../../components/homepage/Blog';
import CTA from '../../components/homepage/CTA';
import Footer from '../../components/Footer';
import FloatingMenu from '../../components/button/FloatingMenu';

export default function HomePage() {
  const location = useLocation();

  // Xử lý scroll khi URL có hash #courses
  useEffect(() => {
    if (location.hash === '#courses') {
      // Xóa hash khỏi URL
      window.history.replaceState(null, '', '/');

      const tryScroll = () => {
        const el = document.getElementById('courses');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          setTimeout(tryScroll, 200);
        }
      };
      setTimeout(tryScroll, 300);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div id="hero"><Hero /></div>
        {/* <div id="statistics"><Statistics /></div> */}
        <div id="services"><Services /></div>
        {/* <div id="study-abroad"><StudyAbroadSection /></div> */}
        {/* <div id="about"><About /></div> */}
        {/* <div id="study-vietnam"><StudyInVietnamSection /></div> */}
        {/* <div id="features"><Features /></div> */}
        <div id="courses"><Course /></div>
        <div id="testimonials"><Testimonials /></div>
        {/* <div id="blog"><Blog /></div> */}
        <div id="cta"><CTA /></div>
      </main>
      <Footer />
      <FloatingMenu />
    </div>
  );
}