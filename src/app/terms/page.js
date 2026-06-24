"use client";
import Header from "../components/Header";
import Link from "next/link";
import { useI18n } from "../lib/i18n";

const UPDATED = "August 18, 2025";

// Legal copy is kept inline per language. Legal pages are long-form and benefit
// from human-reviewed wording, so we render the whole document by language
// rather than threading every clause through the key-based dictionary.
const CONTENT = {
  en: {
    title: "Terms of Service",
    updated: "Last updated:",
    intro:
      'These Terms of Service ("Terms") govern your use of KamerLark (the "Service"). By accessing or using the Service you agree to these Terms. If you do not agree, do not use the Service.',
    sections: [
      {
        h: "1. Eligibility",
        p: [
          "You must be at least 18 years old (or the age of majority in your jurisdiction) to use KamerLark, and able to form a binding contract.",
        ],
      },
      {
        h: "2. Accounts",
        ul: [
          "Provide accurate information and keep your account secure.",
          "You are responsible for activities that occur under your account.",
          "Notify us immediately of any unauthorized use or security breach.",
        ],
      },
      {
        h: "3. Listings and bookings",
        ul: [
          "Hosts are responsible for the accuracy, legality, and availability of their listings.",
          "Guests are responsible for reading terms and rules of each listing before booking.",
          "Bookings and appointments may be subject to cancellation policies and house rules specified by hosts.",
        ],
      },
      {
        h: "4. Acceptable use",
        ul: [
          "No fraud, harassment, or illegal activity.",
          "No scraping, reverse engineering, or abusive automated access.",
          "No content that violates rights or applicable laws.",
        ],
      },
      {
        h: "5. Fees and payments",
        p: [
          "Fees, if applicable, will be disclosed before you commit to a transaction. You authorize us or our payment partners to charge your payment method for amounts due. Taxes may apply.",
        ],
      },
      {
        h: "6. Termination",
        p: [
          "We may suspend or terminate access for any violation of these Terms or to protect the Service and its users. You may stop using the Service at any time.",
        ],
      },
      {
        h: "7. Disclaimers",
        p: [
          'KamerLark is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation of the Service.',
        ],
      },
      {
        h: "8. Limitation of liability",
        p: [
          "To the maximum extent permitted by law, KamerLark and its affiliates are not liable for indirect, incidental, special, or consequential damages, or any loss of profits or data.",
        ],
      },
      {
        h: "9. Changes to the Terms",
        p: [
          'We may update these Terms from time to time. We’ll post the new version here and update the “Last updated” date. If changes are material, we may provide additional notice.',
        ],
      },
    ],
    contactH: "10. Contact",
    contactPre: "Questions about these Terms? Email us at",
    contactMid: "or message us on WhatsApp",
    alsoSee: "Also see our",
    privacyPolicy: "Privacy Policy",
  },
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour :",
    intro:
      "Les présentes Conditions d'utilisation (« Conditions ») régissent votre utilisation de KamerLark (le « Service »). En accédant au Service ou en l'utilisant, vous acceptez ces Conditions. Si vous n'êtes pas d'accord, n'utilisez pas le Service.",
    sections: [
      {
        h: "1. Admissibilité",
        p: [
          "Vous devez avoir au moins 18 ans (ou l'âge de la majorité dans votre juridiction) pour utiliser KamerLark, et être en mesure de conclure un contrat contraignant.",
        ],
      },
      {
        h: "2. Comptes",
        ul: [
          "Fournissez des informations exactes et gardez votre compte sécurisé.",
          "Vous êtes responsable des activités effectuées sous votre compte.",
          "Avertissez-nous immédiatement de toute utilisation non autorisée ou faille de sécurité.",
        ],
      },
      {
        h: "3. Annonces et réservations",
        ul: [
          "Les propriétaires sont responsables de l'exactitude, de la légalité et de la disponibilité de leurs annonces.",
          "Les locataires doivent lire les conditions et règles de chaque annonce avant de réserver.",
          "Les réservations et rendez-vous peuvent être soumis aux politiques d'annulation et au règlement définis par les propriétaires.",
        ],
      },
      {
        h: "4. Utilisation acceptable",
        ul: [
          "Aucune fraude, aucun harcèlement, aucune activité illégale.",
          "Aucun extraction de données, rétro-ingénierie ou accès automatisé abusif.",
          "Aucun contenu qui viole des droits ou les lois applicables.",
        ],
      },
      {
        h: "5. Frais et paiements",
        p: [
          "Les frais, le cas échéant, seront communiqués avant que vous ne vous engagiez dans une transaction. Vous nous autorisez, ou autorisez nos partenaires de paiement, à débiter votre moyen de paiement des montants dus. Des taxes peuvent s'appliquer.",
        ],
      },
      {
        h: "6. Résiliation",
        p: [
          "Nous pouvons suspendre ou résilier l'accès en cas de violation des présentes Conditions ou pour protéger le Service et ses utilisateurs. Vous pouvez cesser d'utiliser le Service à tout moment.",
        ],
      },
      {
        h: "7. Avertissements",
        p: [
          "KamerLark est fourni « tel quel », sans garantie d'aucune sorte. Nous ne garantissons pas un fonctionnement ininterrompu ou sans erreur du Service.",
        ],
      },
      {
        h: "8. Limitation de responsabilité",
        p: [
          "Dans la mesure maximale permise par la loi, KamerLark et ses affiliés ne sont pas responsables des dommages indirects, accessoires, spéciaux ou consécutifs, ni d'une quelconque perte de profits ou de données.",
        ],
      },
      {
        h: "9. Modifications des Conditions",
        p: [
          "Nous pouvons mettre à jour ces Conditions de temps à autre. Nous publierons la nouvelle version ici et mettrons à jour la date de « Dernière mise à jour ». En cas de modifications importantes, nous pourrons fournir un avis supplémentaire.",
        ],
      },
    ],
    contactH: "10. Contact",
    contactPre: "Des questions sur ces Conditions ? Écrivez-nous à",
    contactMid: "ou contactez-nous sur WhatsApp",
    alsoSee: "Consultez aussi notre",
    privacyPolicy: "Politique de confidentialité",
  },
};

export default function TermsPage() {
  const { lang } = useI18n();
  const c = CONTENT[lang] || CONTENT.en;
  return (
    <>
      <Header />
      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 theme-surface">
        <h1 className="text-2xl md:text-3xl font-bold">{c.title}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {c.updated} {UPDATED}
        </p>

        <section className="mt-6 space-y-4 text-sm leading-6">
          <p>{c.intro}</p>

          {c.sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-lg font-semibold mt-6">{s.h}</h2>
              {s.p
                ? s.p.map((para, i) => <p key={i}>{para}</p>)
                : null}
              {s.ul ? (
                <ul className="list-disc pl-5 space-y-1">
                  {s.ul.map((li, i) => (
                    <li key={i}>{li}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}

          <h2 className="text-lg font-semibold mt-6">{c.contactH}</h2>
          <p>
            {c.contactPre}{" "}
            <a className="underline" href="mailto:info.kamerlark@gmail.com">
              info.kamerlark@gmail.com
            </a>{" "}
            {c.contactMid}{" "}
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
              {c.alsoSee}{" "}
              <Link className="underline" href="/privacy">
                {c.privacyPolicy}
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
