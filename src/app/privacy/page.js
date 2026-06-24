"use client";
import Header from "../components/Header";
import { useI18n } from "../lib/i18n";

const UPDATED = "August 18, 2025";

// Inline per-language legal copy (see note in terms/page.js).
const CONTENT = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated:",
    intro:
      'KamerLark ("we", "us", or "our") provides an online platform for discovering, listing, and booking accommodation. This Privacy Policy explains what information we collect, how we use it, and your choices.',
    sections: [
      {
        h: "1. Information we collect",
        ul: [
          "Account data: name, email, profile details you provide, and account activity.",
          "Listing and booking data: property information, availability, appointments, messages metadata.",
          "Technical data: device, browser, IP address, and usage analytics.",
          "Optional media: photos and documents you upload to your profile or listings.",
        ],
      },
      {
        h: "2. How we use information",
        ul: [
          "Provide and improve core features (search, listings, bookings).",
          "Operate messaging and appointment scheduling.",
          "Prevent fraud, secure the service, and comply with law.",
          "Send service updates and important notifications.",
        ],
      },
      {
        h: "3. Cookies and analytics",
        p: [
          "We use cookies and similar technologies to keep you signed in, remember preferences, measure traffic, and improve performance. You can control cookies at the browser level; disabling some may impact functionality.",
        ],
      },
      {
        h: "4. Sharing",
        p: [
          "We do not sell your personal information. We share limited data with service providers (e.g., hosting, storage, analytics) under contracts requiring confidentiality and security. We may disclose information to comply with legal requests or to protect rights and safety.",
        ],
      },
      {
        h: "5. Data retention",
        p: [
          "We retain information for as long as needed to provide the service and meet legal obligations. You may request deletion of your account and associated data, subject to lawful retention requirements.",
        ],
      },
      {
        h: "6. Your choices",
        ul: [
          "Access and update your profile in the Profile page.",
          "Adjust appearance and notification settings in Settings.",
          "Contact support to request data export or deletion.",
        ],
      },
      {
        h: "7. Children",
        p: [
          "KamerLark is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.",
        ],
      },
      {
        h: "8. International",
        p: [
          "Your information may be transferred to and processed in locations where our service providers operate. We take steps to protect your data in accordance with this policy.",
        ],
      },
      {
        h: "9. Changes",
        p: [
          'We may update this policy from time to time. We’ll post the new version here and update the “Last updated” date.',
        ],
      },
    ],
    contactH: "10. Contact",
    contactPre: "Questions? Contact us at",
    contactMid: "or WhatsApp",
  },
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour :",
    intro:
      "KamerLark (« nous », « notre ») fournit une plateforme en ligne pour découvrir, publier et réserver des logements. La présente Politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons et vos choix.",
    sections: [
      {
        h: "1. Informations que nous collectons",
        ul: [
          "Données de compte : nom, e-mail, informations de profil que vous fournissez et activité du compte.",
          "Données d'annonce et de réservation : informations sur le logement, disponibilité, rendez-vous, métadonnées des messages.",
          "Données techniques : appareil, navigateur, adresse IP et statistiques d'utilisation.",
          "Médias facultatifs : photos et documents que vous téléversez sur votre profil ou vos annonces.",
        ],
      },
      {
        h: "2. Comment nous utilisons les informations",
        ul: [
          "Fournir et améliorer les fonctionnalités principales (recherche, annonces, réservations).",
          "Faire fonctionner la messagerie et la prise de rendez-vous.",
          "Prévenir la fraude, sécuriser le service et respecter la loi.",
          "Envoyer des mises à jour du service et des notifications importantes.",
        ],
      },
      {
        h: "3. Cookies et statistiques",
        p: [
          "Nous utilisons des cookies et technologies similaires pour vous garder connecté, mémoriser vos préférences, mesurer le trafic et améliorer les performances. Vous pouvez contrôler les cookies au niveau du navigateur ; en désactiver certains peut affecter le fonctionnement.",
        ],
      },
      {
        h: "4. Partage",
        p: [
          "Nous ne vendons pas vos informations personnelles. Nous partageons des données limitées avec des prestataires (hébergement, stockage, statistiques) dans le cadre de contrats imposant confidentialité et sécurité. Nous pouvons divulguer des informations pour répondre à des demandes légales ou protéger des droits et la sécurité.",
        ],
      },
      {
        h: "5. Conservation des données",
        p: [
          "Nous conservons les informations aussi longtemps que nécessaire pour fournir le service et respecter nos obligations légales. Vous pouvez demander la suppression de votre compte et des données associées, sous réserve des obligations légales de conservation.",
        ],
      },
      {
        h: "6. Vos choix",
        ul: [
          "Accédez à votre profil et mettez-le à jour depuis la page Profil.",
          "Réglez l'apparence et les notifications dans les Paramètres.",
          "Contactez le support pour demander l'export ou la suppression de vos données.",
        ],
      },
      {
        h: "7. Enfants",
        p: [
          "KamerLark n'est pas destiné aux enfants de moins de 13 ans. Nous ne collectons pas sciemment d'informations personnelles d'enfants de moins de 13 ans.",
        ],
      },
      {
        h: "8. International",
        p: [
          "Vos informations peuvent être transférées et traitées dans les lieux où opèrent nos prestataires. Nous prenons des mesures pour protéger vos données conformément à la présente politique.",
        ],
      },
      {
        h: "9. Modifications",
        p: [
          "Nous pouvons mettre à jour cette politique de temps à autre. Nous publierons la nouvelle version ici et mettrons à jour la date de « Dernière mise à jour ».",
        ],
      },
    ],
    contactH: "10. Contact",
    contactPre: "Des questions ? Contactez-nous à",
    contactMid: "ou sur WhatsApp",
  },
};

export default function PrivacyPage() {
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
              {s.p ? s.p.map((para, i) => <p key={i}>{para}</p>) : null}
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
        </section>
      </main>
    </>
  );
}
