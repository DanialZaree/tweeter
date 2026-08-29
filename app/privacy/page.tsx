import Navbar from '../components/Navbar';
import Frame from '../components/Frame';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Boblo',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <Frame>
        <main className="flex flex-col gap-6 py-12 px-4 max-w-2xl mx-auto text-neutral-300">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm text-text-muted">Last Updated: August 2026</p>

          <section className="flex flex-col gap-3 mt-4">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>
              When you use Boblo, we collect information you provide directly to us, such as when
              you create or modify your account, post content, or interact with other users. This
              may include your username, email address, profile picture, and the content of your
              posts.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services,
              including to personalize the content you see. We also use it to communicate with you
              about updates, security alerts, and support messages.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information as described in
              this policy, such as when you direct us to share information with third parties, or
              when required by law or to protect the safety of our users.
            </p>
            <p>
              By default, your posts and profile information are public and can be viewed by anyone
              on or off Boblo.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft,
              misuse, unauthorized access, disclosure, alteration, and destruction. However, no
              security system is impenetrable, and we cannot guarantee the security of our systems
              100%.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white">5. Your Choices</h2>
            <p>
              You can access, update, or delete your account information at any time by logging into
              your account settings. If you delete your account, your profile and posts will be
              removed from the platform.
            </p>
          </section>
        </main>
      </Frame>
    </>
  );
}
