import { LandingHero } from '@/components/landing/hero-simple';
import { LandingFeatures } from '@/components/landing/features-simple';
import { SocialProof } from '@/components/landing/social-proof';
import { LandingFAQ } from '@/components/landing/faq';
import { LandingNewsletter } from '@/components/landing/newsletter-simple';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen">
        <LandingHero />
        <LandingFeatures />
        <SocialProof />
        <LandingFAQ />
        <LandingNewsletter />
      </main>
      <Footer />
    </>
  );
}
