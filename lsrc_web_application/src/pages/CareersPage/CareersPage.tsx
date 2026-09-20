import Header from '../../components/Header';

import CareerHero from '../../components/careers/CareerHero';
import CareerStatistics from '../../components/careers/CareerStatistics';
import WhyJoinUs from '../../components/careers/WhyJoinUs';

import JobList from '../../components/careers/JobList';
import WorkCulture from '../../components/careers/WorkCulture';

import EmployeeStories from '../../components/careers/EmployeeStories';
import Benefits from '../../components/careers/Benefits';
import RecruitmentTimeline from '../../components/careers/RecruitmentTimeline';

import FAQ from '../../components/careers/FAQ';
import CareerNewsletter from '../../components/careers/CareerNewsletter';
import CareerCTA from '../../components/careers/CareerCTA';

import Footer from '../../components/Footer';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero */}
        <CareerHero />

        {/* Statistics */}
        <CareerStatistics />

        {/* Why Join Us */}
        <WhyJoinUs />

        {/* Open Positions */}
        <JobList />

        {/* Culture */}
        <WorkCulture />

        {/* Employee Stories */}
        <EmployeeStories />

        {/* Benefits */}
        <Benefits />

        {/* Recruitment Process */}
        <RecruitmentTimeline />

        {/* FAQ */}
        <FAQ />

        {/* Newsletter */}
        <CareerNewsletter />

        {/* CTA */}
        <CareerCTA />
      </main>

      <Footer />
    </div>
  );
}