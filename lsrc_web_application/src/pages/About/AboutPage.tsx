import Header from '../../components/Header';
import Footer from '../../components/Footer';

import AboutHero from '../../components/about/AboutHero';
import AboutCompany from '../../components/about/AboutCompany';
import CompanyTimeline from '../../components/about/CompanyTimeline';
import MissionVision from '../../components/about/MissionVision';

import CoreValues from '../../components/about/CoreValues';
import AboutStatistics from '../../components/about/AboutStatistics';
import TeamSection from '../../components/about/TeamSection';

import WhyChooseUs from '../../components/about/WhyChooseUs';
import Partners from '../../components/about/Partners';
import AwardsRecognitions from '../../components/about/AwardsRecognitions';

import Testimonials from '../../components/homepage/Testimonials';

import AboutCTA from '../../components/about/AboutCTA';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <AboutHero />
        <AboutCompany />
        <CompanyTimeline />
        <MissionVision />
        <CoreValues />
        {/* <AboutStatistics /> */}
        <TeamSection />
        <WhyChooseUs />
        <Partners />
        <AwardsRecognitions />
        <Testimonials />
        <AboutCTA />
      </main>

      <Footer />
    </div>
  );
}