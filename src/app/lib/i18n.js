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
    "common.all": "All",
    "common.other": "Other",
    "common.loadMore": "Load more",
    "common.submit": "Submit",
    "common.sending": "Sending…",
    // Search / Explore
    "search.placeholder": "Search city, area, university or property…",
    "search.clear": "Clear search",
    "search.sortBy": "Sort by",
    "search.sortDefault": "Default",
    "search.sortLowHigh": "Low to High",
    "search.sortHighLow": "High to Low",
    "search.sortNewest": "Newest",
    "search.university": "University",
    "search.specifyOtherUni": "Specify other university",
    "search.enterUniName": "Enter university name",
    "search.budget": "Budget",
    "search.min": "Min",
    "search.max": "Max",
    "search.roomType": "Room Type",
    "search.single": "Single",
    "search.double": "Double",
    "search.triple": "Triple",
    "search.quadruple": "Quadruple",
    "search.specifyOtherRoom": "Specify other room type",
    "search.enterRoomType": "Enter room type",
    "search.furnished": "Furnished",
    "search.unfurnished": "Unfurnished",
    "search.semiFurnished": "Semi-Furnished",
    "search.washroomType": "Washroom Type",
    "search.attached": "Attached",
    "search.commonWashroom": "Common",
    "search.specifyOtherWashroom": "Specify other washroom type",
    "search.enterWashroomType": "Enter washroom type",
    "search.clearAll": "Clear all",
    "search.grid": "Grid",
    "search.map": "Map",
    "search.switchToGrid": "Switch to grid view",
    "search.switchToMap": "Switch to map view",
    "search.allListings": "All listings",
    "search.originLocation": "Location",
    "search.originUniversity": "University",
    "search.originProperty": "Property",
    "search.noResults": "No accommodations found for the selected filters.",
    "search.clearAllFilters": "Clear all filters",
    // Room card
    "card.yourListing": "Your listing",
    "card.noLongerAvailable": "No longer available",
    "card.view": "View",
    "card.perMonth": "/month",
    // Room details
    "room.notFound": "Room not found",
    "room.views": "Views",
    "room.perMonthTaxes": "/month · taxes included",
    "room.notAvailable": "No longer available — this place has been booked.",
    "room.availableNow": "Available now",
    "room.notTakingBookings":
      "This place isn't taking new booking requests, but you can still message the owner.",
    "room.chatWithOwner": "Chat with owner",
    "room.bookNow": "Book now",
    "room.visitFirst": "Visit first",
    "room.chat": "Chat",
    "room.viewContractTerms": "View contract terms",
    "room.signInToBook": "Sign in to book or chat",
    "room.freeAccount": "Free account — book, visit, or message the owner directly.",
    "room.yourListingManage": "This is your listing. Manage it from",
    "room.myListings": "My Listings",
    "room.amenities": "Amenities",
    "room.included": "included",
    "room.description": "Description",
    "room.bed": "Bed",
    "room.people": "People",
    "room.washroom": "washroom",
    "room.safetyFeatures": "Safety Features",
    "room.accessibilityFeatures": "Accessibility Features",
    "room.rules": "Rules",
    "room.neighborhoodInfo": "Neighborhood Info",
    "room.location": "Location",
    "room.reviews": "Reviews",
    "room.addYourReview": "Add your review",
    "room.shareExperience": "Share your experience...",
    "room.submitReview": "Submit Review",
    "room.reviewError": "Couldn't submit your review. Please try again.",
    "room.agreeWarn":
      "Please agree to the leasing contract and KamerLark policies to continue.",
    "room.signInToBookErr": "You must be signed in to book.",
    "room.dupBooking":
      "You already have a booking request for this room. Check it in your profile.",
    "room.bookingSent": "Booking request sent! The owner will respond in your chat.",
    "room.permDenied":
      "Permission denied — please sign out and sign back in, then try again.",
    "room.bookingFailed": "Booking failed: ",
    "room.signInToVisit": "You must be signed in to request a visit.",
    "room.visitSent":
      "Visit request sent! Confirm the time with the owner in your chat.",
    "room.visitFailed": "Visit request failed: ",
    "room.bookingSuccessTitle": "Booking Successful",
    "room.bookingSuccessBody":
      "Your booking has been submitted for approval. Wait for the owner's response.",
    "room.addToGoogle": "Add to Google Calendar",
    "room.downloadIcs": "Download .ics",
    "room.goToMessages": "Go to Message center",
    "room.apptSentTitle": "Appointment Request Sent",
    "room.apptSentBody":
      "Your appointment request has been submitted. Wait for the owner's response.",
    "room.bookNowTitle": "Book Now",
    "room.bookNowSubtitle": "Fill in the details to book the room",
    "room.name": "Name",
    "room.email": "Email",
    "room.phone": "Phone",
    "room.moveInDate": "Move in date",
    "room.address": "Address",
    "room.notes": "Notes",
    "room.agreeTerms":
      "I agree to the terms of the leasing contract and policies of KamerLark.",
    "room.bookApptTitle": "Book an Appointment",
    "room.bookApptSubtitle": "Fill in the details to book an appointment",
    "room.preferredDate": "Preferred Date",
    "room.appointmentType": "Appointment Type",
    "room.inPerson": "In Person",
    "room.virtual": "Virtual",
    "room.message": "Message",
    "room.chatOwnerTitle": "Chat with Owner",
    "room.chatOwnerBody": "Fill in the details to start a chat with the owner:",
    "room.fullName": "Full Name:",
    "room.emailColon": "Email:",
    "room.mustChangeProfile": "(Must be changed via profile)",
    "room.phoneColon": "Phone:",
    "room.yourMessage": "Your Message:",
    "room.videoConfTitle": "Video Conferencing",
    "room.videoConfBody": "Fill in the details to schedule a video conference:",
    "room.preferredTime": "Preferred Time:",
    "room.contractTitle": "View Contract Terms",
    "room.leaseTerms": "Leasing Contract Terms",
    "room.forLabel": "for",
    "room.noLeaseTerms": "No lease terms provided by the owner.",
    "room.houseRules": "House Rules",
    "room.signature": "Signature",
    "room.owner": "Owner",
    "room.dateLabel": "Date:",
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
    "common.all": "Tous",
    "common.other": "Autre",
    "common.loadMore": "Voir plus",
    "common.submit": "Envoyer",
    "common.sending": "Envoi…",
    // Search / Explore
    "search.placeholder": "Rechercher ville, quartier, université ou logement…",
    "search.clear": "Effacer la recherche",
    "search.sortBy": "Trier par",
    "search.sortDefault": "Par défaut",
    "search.sortLowHigh": "Prix croissant",
    "search.sortHighLow": "Prix décroissant",
    "search.sortNewest": "Plus récent",
    "search.university": "Université",
    "search.specifyOtherUni": "Préciser une autre université",
    "search.enterUniName": "Saisir le nom de l'université",
    "search.budget": "Budget",
    "search.min": "Min",
    "search.max": "Max",
    "search.roomType": "Type de chambre",
    "search.single": "Simple",
    "search.double": "Double",
    "search.triple": "Triple",
    "search.quadruple": "Quadruple",
    "search.specifyOtherRoom": "Préciser un autre type de chambre",
    "search.enterRoomType": "Saisir le type de chambre",
    "search.furnished": "Meublé",
    "search.unfurnished": "Non meublé",
    "search.semiFurnished": "Semi-meublé",
    "search.washroomType": "Type de salle d'eau",
    "search.attached": "Privative",
    "search.commonWashroom": "Commune",
    "search.specifyOtherWashroom": "Préciser un autre type de salle d'eau",
    "search.enterWashroomType": "Saisir le type de salle d'eau",
    "search.clearAll": "Tout effacer",
    "search.grid": "Grille",
    "search.map": "Carte",
    "search.switchToGrid": "Passer en vue grille",
    "search.switchToMap": "Passer en vue carte",
    "search.allListings": "Toutes les annonces",
    "search.originLocation": "Lieu",
    "search.originUniversity": "Université",
    "search.originProperty": "Logement",
    "search.noResults": "Aucun logement trouvé pour les filtres sélectionnés.",
    "search.clearAllFilters": "Effacer tous les filtres",
    // Room card
    "card.yourListing": "Votre annonce",
    "card.noLongerAvailable": "Plus disponible",
    "card.view": "Voir",
    "card.perMonth": "/mois",
    // Room details
    "room.notFound": "Logement introuvable",
    "room.views": "Vues",
    "room.perMonthTaxes": "/mois · taxes comprises",
    "room.notAvailable": "Plus disponible — ce logement a été réservé.",
    "room.availableNow": "Disponible maintenant",
    "room.notTakingBookings":
      "Ce logement n'accepte plus de demandes de réservation, mais vous pouvez toujours contacter le propriétaire.",
    "room.chatWithOwner": "Discuter avec le propriétaire",
    "room.bookNow": "Réserver",
    "room.visitFirst": "Visiter d'abord",
    "room.chat": "Discuter",
    "room.viewContractTerms": "Voir les conditions du contrat",
    "room.signInToBook": "Connectez-vous pour réserver ou discuter",
    "room.freeAccount":
      "Compte gratuit — réservez, visitez ou contactez directement le propriétaire.",
    "room.yourListingManage": "Ceci est votre annonce. Gérez-la depuis",
    "room.myListings": "Mes annonces",
    "room.amenities": "Équipements",
    "room.included": "inclus",
    "room.description": "Description",
    "room.bed": "Lit",
    "room.people": "Personnes",
    "room.washroom": "salle d'eau",
    "room.safetyFeatures": "Sécurité",
    "room.accessibilityFeatures": "Accessibilité",
    "room.rules": "Règlement",
    "room.neighborhoodInfo": "Quartier",
    "room.location": "Emplacement",
    "room.reviews": "Avis",
    "room.addYourReview": "Ajoutez votre avis",
    "room.shareExperience": "Partagez votre expérience…",
    "room.submitReview": "Publier l'avis",
    "room.reviewError": "Impossible d'envoyer votre avis. Veuillez réessayer.",
    "room.agreeWarn":
      "Veuillez accepter le contrat de location et les règles de KamerLark pour continuer.",
    "room.signInToBookErr": "Vous devez être connecté pour réserver.",
    "room.dupBooking":
      "Vous avez déjà une demande de réservation pour ce logement. Consultez-la dans votre profil.",
    "room.bookingSent":
      "Demande de réservation envoyée ! Le propriétaire répondra dans votre messagerie.",
    "room.permDenied":
      "Permission refusée — déconnectez-vous puis reconnectez-vous, et réessayez.",
    "room.bookingFailed": "Échec de la réservation : ",
    "room.signInToVisit": "Vous devez être connecté pour demander une visite.",
    "room.visitSent":
      "Demande de visite envoyée ! Confirmez l'heure avec le propriétaire dans votre messagerie.",
    "room.visitFailed": "Échec de la demande de visite : ",
    "room.bookingSuccessTitle": "Réservation envoyée",
    "room.bookingSuccessBody":
      "Votre réservation a été soumise pour approbation. Attendez la réponse du propriétaire.",
    "room.addToGoogle": "Ajouter à Google Agenda",
    "room.downloadIcs": "Télécharger .ics",
    "room.goToMessages": "Aller à la messagerie",
    "room.apptSentTitle": "Demande de rendez-vous envoyée",
    "room.apptSentBody":
      "Votre demande de rendez-vous a été soumise. Attendez la réponse du propriétaire.",
    "room.bookNowTitle": "Réserver",
    "room.bookNowSubtitle": "Remplissez les informations pour réserver la chambre",
    "room.name": "Nom",
    "room.email": "E-mail",
    "room.phone": "Téléphone",
    "room.moveInDate": "Date d'emménagement",
    "room.address": "Adresse",
    "room.notes": "Notes",
    "room.agreeTerms":
      "J'accepte les termes du contrat de location et les règles de KamerLark.",
    "room.bookApptTitle": "Prendre un rendez-vous",
    "room.bookApptSubtitle": "Remplissez les informations pour prendre un rendez-vous",
    "room.preferredDate": "Date souhaitée",
    "room.appointmentType": "Type de rendez-vous",
    "room.inPerson": "En personne",
    "room.virtual": "Virtuel",
    "room.message": "Message",
    "room.chatOwnerTitle": "Discuter avec le propriétaire",
    "room.chatOwnerBody":
      "Remplissez les informations pour discuter avec le propriétaire :",
    "room.fullName": "Nom complet :",
    "room.emailColon": "E-mail :",
    "room.mustChangeProfile": "(Modifiable depuis le profil)",
    "room.phoneColon": "Téléphone :",
    "room.yourMessage": "Votre message :",
    "room.videoConfTitle": "Visioconférence",
    "room.videoConfBody": "Remplissez les informations pour planifier une visioconférence :",
    "room.preferredTime": "Heure souhaitée :",
    "room.contractTitle": "Conditions du contrat",
    "room.leaseTerms": "Conditions du contrat de location",
    "room.forLabel": "pour",
    "room.noLeaseTerms": "Aucune condition de location fournie par le propriétaire.",
    "room.houseRules": "Règlement intérieur",
    "room.signature": "Signature",
    "room.owner": "Propriétaire",
    "room.dateLabel": "Date :",
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
