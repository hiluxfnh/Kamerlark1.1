"use client";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";

// Lightweight, dependency-free i18n. Language is a per-user preference
// (mirrored in localStorage for instant load and saved to the user's
// settings in Firestore). Strings are looked up by key; missing keys fall
// back to English, then to the key itself — so untranslated pages keep
// working and can be migrated to t() incrementally.
const translations = {
  en: {
    // Nav / shell
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.community": "Community",
    "nav.help": "Help",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.postListing": "Post a listing",
    "nav.post": "Post",
    "nav.addListing": "Add listing",
    "nav.chat": "Chat",
    "nav.profile": "Profile",
    "nav.overview": "Overview",
    "nav.account": "Account Management",
    "nav.dashboard": "Dashboard",
    "nav.notifications": "Notifications",
    "nav.calendar": "Calendar",
    "nav.settings": "Settings",
    "common.back": "Back",
    "common.menu": "Menu",
    "common.viewProfile": "View profile",
    "common.language": "Language",
    // Footer
    "footer.tagline":
      "Your trusted accommodation platform for students and young professionals.",
    "footer.search": "Search",
    "footer.community": "Community",
    "footer.helpFaq": "Help & FAQ",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
    "footer.rights": "All rights reserved.",
    "footer.backToTop": "Back to top",
    // Home
    "home.heroTitle": "Find your perfect student home",
    "home.heroSubtitle":
      "Rooms, studios and apartments near universities across Cameroon — verified owners, direct chat, no agency fees.",
    "home.searchPlaceholder": "Search by city, neighbourhood or university…",
    "home.search": "Search",
    "home.popularTitle": "Popular accommodations",
    "home.popularSubtitle": "Fresh listings near universities across Cameroon.",
    "home.seeMore": "See more accommodations",
    "home.ownerTitle": "Have a room to rent out?",
    "home.ownerSubtitle":
      "Post it on KamerLark for free and reach thousands of students looking for housing near their university.",
    "home.ownerCta": "Post a listing",
    // Settings
    "settings.title": "Settings",
    "settings.appearance": "Appearance",
    "settings.theme": "Theme",
    "settings.themeHint": "Theme preference is saved for your account.",
    "settings.notifications": "Notifications",
    "settings.bookingUpdates": "Booking updates",
    "settings.appointmentUpdates": "Appointment updates",
    "settings.weeklyDigest": "Weekly activity summary",
    "settings.notifHint":
      "Email delivery depends on your verified email and may require future configuration.",
    "settings.calendar": "Calendar",
    "settings.defaultExport": "Default export",
    "settings.reminder": "Reminder (min)",
    "settings.languageHint": "Your preferred language for the interface.",
    "settings.save": "Save changes",
    "settings.saving": "Saving…",
    "settings.saved": "Settings saved",
    "settings.saveError": "Failed to save settings",
    "theme.system": "System",
    "theme.light": "Light",
    "theme.dark": "Dark",
  },
  fr: {
    // Nav / shell
    "nav.home": "Accueil",
    "nav.explore": "Explorer",
    "nav.community": "Communauté",
    "nav.help": "Aide",
    "nav.login": "Connexion",
    "nav.logout": "Déconnexion",
    "nav.postListing": "Publier une annonce",
    "nav.post": "Publier",
    "nav.addListing": "Ajouter une annonce",
    "nav.chat": "Messages",
    "nav.profile": "Profil",
    "nav.overview": "Aperçu",
    "nav.account": "Gestion du compte",
    "nav.dashboard": "Tableau de bord",
    "nav.notifications": "Notifications",
    "nav.calendar": "Calendrier",
    "nav.settings": "Paramètres",
    "common.back": "Retour",
    "common.menu": "Menu",
    "common.viewProfile": "Voir le profil",
    "common.language": "Langue",
    // Footer
    "footer.tagline":
      "Votre plateforme de logement de confiance pour les étudiants et jeunes professionnels.",
    "footer.search": "Rechercher",
    "footer.community": "Communauté",
    "footer.helpFaq": "Aide & FAQ",
    "footer.terms": "Conditions",
    "footer.privacy": "Confidentialité",
    "footer.rights": "Tous droits réservés.",
    "footer.backToTop": "Haut de page",
    // Home
    "home.heroTitle": "Trouvez votre logement étudiant idéal",
    "home.heroSubtitle":
      "Chambres, studios et appartements près des universités au Cameroun — propriétaires vérifiés, discussion directe, sans frais d'agence.",
    "home.searchPlaceholder": "Rechercher par ville, quartier ou université…",
    "home.search": "Rechercher",
    "home.popularTitle": "Logements populaires",
    "home.popularSubtitle":
      "Nouvelles annonces près des universités au Cameroun.",
    "home.seeMore": "Voir plus de logements",
    "home.ownerTitle": "Une chambre à louer ?",
    "home.ownerSubtitle":
      "Publiez-la gratuitement sur KamerLark et touchez des milliers d'étudiants à la recherche d'un logement près de leur université.",
    "home.ownerCta": "Publier une annonce",
    // Settings
    "settings.title": "Paramètres",
    "settings.appearance": "Apparence",
    "settings.theme": "Thème",
    "settings.themeHint": "La préférence de thème est enregistrée sur votre compte.",
    "settings.notifications": "Notifications",
    "settings.bookingUpdates": "Mises à jour des réservations",
    "settings.appointmentUpdates": "Mises à jour des rendez-vous",
    "settings.weeklyDigest": "Résumé hebdomadaire d'activité",
    "settings.notifHint":
      "L'envoi des e-mails dépend de votre adresse vérifiée et peut nécessiter une configuration ultérieure.",
    "settings.calendar": "Calendrier",
    "settings.defaultExport": "Export par défaut",
    "settings.reminder": "Rappel (min)",
    "settings.languageHint": "Votre langue préférée pour l'interface.",
    "settings.save": "Enregistrer",
    "settings.saving": "Enregistrement…",
    "settings.saved": "Paramètres enregistrés",
    "settings.saveError": "Échec de l'enregistrement",
    "theme.system": "Système",
    "theme.light": "Clair",
    "theme.dark": "Sombre",
  },
};

const I18nContext = createContext({
  lang: "en",
  t: (k) => k,
  setLang: () => {},
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kl_lang");
      if (saved && translations[saved]) {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {}
  }, []);

  const setLang = useCallback((l) => {
    const next = translations[l] ? l : "en";
    setLangState(next);
    try {
      localStorage.setItem("kl_lang", next);
    } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key) =>
      (translations[lang] && translations[lang][key]) ||
      translations.en[key] ||
      key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
