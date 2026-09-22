import Navbar from "@/features/landing/components/Navbar";
import HeroSection from "@/features/landing/components/HeroSection";
import LiveStatusSection from "@/features/landing/components/LiveStatusSection";
import ProblemSection from "@/features/landing/components/ProblemSection";
import GapSection from "@/features/landing/components/GapSection";
import SolutionSection from "@/features/landing/components/SolutionSection";
import TechSection from "@/features/landing/components/TechSection";
import HowItWorksSection from "@/features/landing/components/HowItWorksSection";
import DemoSection from "@/features/landing/components/DemoSection";
import OfflineSection from "@/features/landing/components/OfflineSection";
import ApplicationsSection from "@/features/landing/components/ApplicationsSection";
import ImpactSection from "@/features/landing/components/ImpactSection";
import FutureSection from "@/features/landing/components/FutureSection";
import AboutSection from "@/features/landing/components/AboutSection";
import FinalCtaSection from "@/features/landing/components/FinalCtaSection";
import Footer from "@/features/landing/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LiveStatusSection />
      <ProblemSection />
      <GapSection />
      <SolutionSection />
      <TechSection />
      <HowItWorksSection />
      <DemoSection />
      <OfflineSection />
      <ApplicationsSection />
      <ImpactSection />
      <FutureSection />
      <AboutSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
};

export default Index;
