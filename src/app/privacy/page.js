export const metadata = {
  title: "Privacy Policy | KamerLark",
  description: "How KamerLark collects, uses, and protects your information.",
};

import Header from "../components/Header";

const UPDATED = "August 18, 2025";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 theme-surface">
        <h1 className="text-2xl md:text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mt-1">Last updated: {UPDATED}</p>

        <section className="mt-6 space-y-4 text-sm leading-6">
          <p>
            KamerLark ("we", "us", or "our") provides an online platform for
            discovering, listing, and booking accommodation. This Privacy Policy
            explains what information we collect, how we use it, and your
            choices.
          </p>

          <h2 className="text-lg font-semibold mt-6">
            1. Information we collect
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Account data: name, email, profile details you provide, and
              account activity.
            </li>
            <li>
              Listing and booking data: property information, availability,
              appointments, messages metadata.
            </li>
            <li>
              Technical data: device, browser, IP address, and usage analytics.
            </li>
            <li>
              Optional media: photos and documents you upload to your profile or
              listings.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">
            2. How we use information
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Provide and improve core features (search, listings, bookings).
            </li>
            <li>Operate messaging and appointment scheduling.</li>
            <li>Prevent fraud, secure the service, and comply with law.</li>
            <li>Send service updates and important notifications.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">
            3. Cookies and analytics
          </h2>
          <p>
            We use cookies and similar technologies to keep you signed in,
            remember preferences, measure traffic, and improve performance. You
            can control cookies at the browser level; disabling some may impact
            functionality.
          </p>

          <h2 className="text-lg font-semibold mt-6">4. Sharing</h2>
          <p>
            We do not sell your personal information. We share limited data with
            service providers (e.g., hosting, storage, analytics) under
            contracts requiring confidentiality and security. We may disclose
            information to comply with legal requests or to protect rights and
            safety.
          </p>

          <h2 className="text-lg font-semibold mt-6">5. Data retention</h2>
          <p>
            We retain information for as long as needed to provide the service
            and meet legal obligations. You may request deletion of your account
            and associated data, subject to lawful retention requirements.
          </p>

          <h2 className="text-lg font-semibold mt-6">6. Your choices</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access and update your profile in the Profile page.</li>
            <li>Adjust appearance and notification settings in Settings.</li>
            <li>Contact support to request data export or deletion.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">7. Children</h2>
          <p>
            KamerLark is not intended for children under the age of 13. We do
            not knowingly collect personal information from children under 13.
          </p>

          <h2 className="text-lg font-semibold mt-6">8. International</h2>
          <p>
            Your information may be transferred to and processed in locations
            where our service providers operate. We take steps to protect your
            data in accordance with this policy.
          </p>

          <h2 className="text-lg font-semibold mt-6">9. Changes</h2>
          <p>
            We may update this policy from time to time. We’ll post the new
            version here and update the “Last updated” date.
          </p>

          <h2 className="text-lg font-semibold mt-6">10. Contact</h2>
          <p>
            Questions? Contact us at{" "}
            <a className="underline" href="mailto:info.kamerlark@gmail.com">
              info.kamerlark@gmail.com
            </a>{" "}
            or WhatsApp{" "}
            <a
              className="underline"
              href="https://wa.me/919108553983"
              target="_blank"
              rel="noopener noreferrer"
            >
              +919108553983
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
