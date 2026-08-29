import Navbar from '../components/Navbar';
import Frame from '../components/Frame';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Boblo',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <Frame>
        <main className="flex flex-col gap-6 py-12 px-4 max-w-2xl mx-auto text-neutral-300">
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="text-sm text-text-muted">Last Updated: August 2026</p>

          <section className="flex flex-col gap-3 mt-4">
            <h2 className="text-xl font-semibold text-white">1. Welcome to Boblo</h2>
            <p>
              By accessing or using Boblo, you agree to be bound by these Terms of Service. If you
              do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">2. Your Account</h2>
            <p>
              You are responsible for safeguarding your account, so use a strong password and limit
              its use to this account. We cannot and will not be liable for any loss or damage
              arising from your failure to comply with the above.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">3. Content on the Services</h2>
            <p>
              You are responsible for your use of the Services and for any Content you provide,
              including compliance with applicable laws, rules, and regulations. You should only
              provide Content that you are comfortable sharing with others.
            </p>
            <p>
              We reserve the right to remove Content that violates our User Agreement, including,
              for example, copyright or trademark violations or other intellectual property
              misappropriation, impersonation, unlawful conduct, or harassment.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">4. Using the Services</h2>
            <p>
              Our Services evolve constantly. As such, the Services may change from time to time, at
              our discretion. We may stop (permanently or temporarily) providing the Services or any
              features within the Services to you or to users generally.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">5. Termination</h2>
            <p>
              We may suspend or terminate your account or cease providing you with all or part of
              the Services at any time for any or no reason, including, but not limited to, if we
              reasonably believe you have violated these Terms.
            </p>
          </section>
        </main>
      </Frame>
    </>
  );
}
