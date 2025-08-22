export const metadata = {
  title: "Terms of Service | KamerLark",
  description: "The terms governing access to and use of KamerLark.",
};

import Header from "../components/Header";
import Link from "next/link";

const UPDATED = "August 18, 2025";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 theme-surface">
        <h1 className="text-2xl md:text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-gray-600 mt-1">Last updated: {UPDATED}</p>

        <section className="mt-6 space-y-4 text-sm leading-6">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of KamerLark (the
            &quot;Service&quot;). By accessing or using the Service you agree to these
            Terms. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-lg font-semibold mt-6">1. Eligibility</h2>
          <p>
            You must be at least 18 years old (or the age of majority in your
            jurisdiction) to use KamerLark, and able to form a binding contract.
          </p>

          <h2 className="text-lg font-semibold mt-6">2. Accounts</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate information and keep your account secure.</li>
            <li>
              You are responsible for activities that occur under your account.
            </li>
            <li>
              Notify us immediately of any unauthorized use or security breach.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">
            3. Listings and bookings
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Hosts are responsible for the accuracy, legality, and availability
              of their listings.
            </li>
            <li>
              Guests are responsible for reading terms and rules of each listing
              before booking.
            </li>
            <li>
              Bookings and appointments may be subject to cancellation policies
              and house rules specified by hosts.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">4. Acceptable use</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>No fraud, harassment, or illegal activity.</li>
            <li>
              No scraping, reverse engineering, or abusive automated access.
            </li>
            <li>No content that violates rights or applicable laws.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">5. Fees and payments</h2>
          <p>
            Fees, if applicable, will be disclosed before you commit to a
            transaction. You authorize us or our payment partners to charge your
            payment method for amounts due. Taxes may apply.
          </p>

          <h2 className="text-lg font-semibold mt-6">6. Termination</h2>
          <p>
            We may suspend or terminate access for any violation of these Terms
            or to protect the Service and its users. You may stop using the
            Service at any time.
          </p>

          <h2 className="text-lg font-semibold mt-6">7. Disclaimers</h2>
          <p>
            KamerLark is provided &quot;as is&quot; without warranties of any kind. We do
            not guarantee uninterrupted or error-free operation of the Service.
          </p>

          <h2 className="text-lg font-semibold mt-6">
            8. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, KamerLark and its affiliates
            are not liable for indirect, incidental, special, or consequential
            damages, or any loss of profits or data.
          </p>

          <h2 className="text-lg font-semibold mt-6">
            9. Changes to the Terms
          </h2>
          <p>
            We may update these Terms from time to time. We’ll post the new
            version here and update the “Last updated” date. If changes are
            material, we may provide additional notice.
          </p>

          <h2 className="text-lg font-semibold mt-6">10. Contact</h2>
          <p>
            Questions about these Terms? Email us at{" "}
            <a className="underline" href="mailto:info.kamerlark@gmail.com">
              info.kamerlark@gmail.com
            </a>{" "}
            or message us on WhatsApp{" "}
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

          <div className="mt-8 text-xs text-gray-600">
            <p>
              Also see our{" "}
              <Link className="underline" href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
