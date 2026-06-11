/**
 * Seeds the dev Firestore with demo listings so the marketplace has content.
 * Uses the client SDK + a demo account, so it also exercises the deployed
 * security rules end to end.
 *
 * Usage: node scripts/seed-dev-data.js
 */
const fs = require("node:fs");
const path = require("node:path");

// Minimal .env.local parser (no dotenv dependency)
const envFile = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} = require("firebase/auth");
const {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} = require("firebase/firestore");

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

const SEED_EMAIL = "demo.owner@kamerlark.dev";
const SEED_PASSWORD = "kamerlark-demo-2026";

const img = (seed, n) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}${i}/900/620`);

const LISTINGS = [
  {
    name: "Sunny Studio near University of Buea",
    price: "45000", currency: "XAF", capacity: "1",
    description: "Bright self-contained studio 5 minutes' walk from UB main gate. Tiled floors, private kitchenette and reliable water supply. Quiet compound with a resident caretaker.",
    bedType: "Double", washrooms: "1", uni: "University of Buea",
    amenities: ["WiFi", "Private kitchen", "Wardrobe", "Water tank"],
    rules: ["No smoking", "Visitors until 10pm"],
    images: img("buea-studio", 4), roomSize: "18 m²",
    utilitiesIncluded: ["Water"], furnishedStatus: "Furnished",
    safetyFeatures: ["Gated compound", "Caretaker on site"],
    publicTransportAccess: "Taxis on Malingo street, 2 min walk",
    neighborhoodInfo: "Molyko — student area with shops and snack bars",
    leaseTerms: "6 or 12 months, 2 months deposit",
    latitude: 4.1527, longitude: 9.2920, location: "Molyko, Buea",
  },
  {
    name: "Shared 2-Bedroom Apartment, Yaoundé (Ngoa-Ekellé)",
    price: "60000", currency: "XAF", capacity: "2",
    description: "Room in a shared modern apartment opposite the University of Yaoundé I campus. Shared living room and kitchen, balcony with city view. Ideal for serious students.",
    bedType: "Single", washrooms: "1", uni: "University of Yaoundé I",
    amenities: ["WiFi", "Shared kitchen", "Balcony", "Washing machine"],
    rules: ["No pets", "Keep common areas clean"],
    images: img("yaounde-flat", 5), roomSize: "14 m²",
    utilitiesIncluded: ["Water", "Electricity"], furnishedStatus: "Furnished",
    safetyFeatures: ["Security guard", "CCTV at entrance"],
    publicTransportAccess: "Bus stop in front of the building",
    neighborhoodInfo: "Ngoa-Ekellé, walking distance to lecture halls",
    leaseTerms: "Minimum 6 months",
    latitude: 3.8612, longitude: 11.4980, location: "Ngoa-Ekellé, Yaoundé",
  },
  {
    name: "Budget Single Room, Douala (Ndogbong)",
    price: "30000", currency: "XAF", capacity: "1",
    description: "Affordable single room in a calm family compound, 10 minutes by bike from University of Douala. Shared washroom, prepaid electricity meter.",
    bedType: "Single", washrooms: "1", uni: "University of Douala",
    amenities: ["Wardrobe", "Study desk"],
    rules: ["No loud music after 9pm"],
    images: img("douala-room", 3), roomSize: "12 m²",
    utilitiesIncluded: [], furnishedStatus: "Semi-furnished",
    safetyFeatures: ["Fenced compound"],
    publicTransportAccess: "Bendskins and shared taxis nearby",
    neighborhoodInfo: "Ndogbong — markets and cheap eateries close by",
    leaseTerms: "Flexible, monthly possible",
    latitude: 4.0721, longitude: 9.7530, location: "Ndogbong, Douala",
  },
  {
    name: "Modern En-suite Room with WiFi, Buea (Bonduma)",
    price: "75000", currency: "XAF", capacity: "1",
    description: "Newly built en-suite room with private bathroom, hot shower and fibre internet included. Backup water tank and standby generator for outages.",
    bedType: "Queen", washrooms: "1", uni: "University of Buea",
    amenities: ["Fibre WiFi", "Hot shower", "Private bathroom", "Generator backup"],
    rules: ["No smoking", "No subletting"],
    images: img("bonduma-ensuite", 5), roomSize: "20 m²",
    utilitiesIncluded: ["Water", "Internet"], furnishedStatus: "Furnished",
    safetyFeatures: ["Gated compound", "CCTV"],
    publicTransportAccess: "5 min to UB junction by taxi",
    neighborhoodInfo: "Bonduma — quiet residential area",
    leaseTerms: "12 months, 1 month deposit",
    latitude: 4.1612, longitude: 9.2861, location: "Bonduma, Buea",
  },
  {
    name: "Female-Only Hostel Room, Yaoundé (Obili)",
    price: "40000", currency: "XAF", capacity: "1",
    description: "Secure female-only hostel near Obili junction. Individual rooms with shared kitchen per floor, on-site laundry service, and a study room open 24/7.",
    bedType: "Single", washrooms: "2", uni: "University of Yaoundé I",
    amenities: ["WiFi", "Laundry service", "Study room", "Shared kitchen"],
    rules: ["Female tenants only", "Guests in common areas only"],
    images: img("obili-hostel", 4), roomSize: "13 m²",
    utilitiesIncluded: ["Water", "Electricity"], furnishedStatus: "Furnished",
    safetyFeatures: ["24/7 security", "Key-card entrance"],
    publicTransportAccess: "Obili junction taxis, 3 min walk",
    neighborhoodInfo: "Obili — lively student quarter",
    leaseTerms: "Per academic year",
    latitude: 3.8550, longitude: 11.4925, location: "Obili, Yaoundé",
  },
  {
    name: "Spacious 1-Bedroom Apartment, Douala (Logbessou)",
    price: "90000", currency: "XAF", capacity: "2",
    description: "Full one-bedroom apartment with living room and kitchen — perfect for sharing. Close to IUC and other private institutes in Logbessou. Parking available.",
    bedType: "Double", washrooms: "1", uni: "University of Douala",
    amenities: ["WiFi", "Full kitchen", "Living room", "Parking"],
    rules: ["No pets"],
    images: img("logbessou-apt", 5), roomSize: "45 m²",
    utilitiesIncluded: ["Water"], furnishedStatus: "Semi-furnished",
    safetyFeatures: ["Gated residence", "Night guard"],
    publicTransportAccess: "Logbessou carrefour, moto taxis all day",
    neighborhoodInfo: "Logbessou — growing student area near IUC",
    leaseTerms: "12 months",
    latitude: 4.0911, longitude: 9.7861, location: "Logbessou, Douala",
  },
];

async function main() {
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    console.log("Created demo owner:", cred.user.uid);
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      cred = await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
      console.log("Signed in existing demo owner:", cred.user.uid);
    } else {
      throw e;
    }
  }
  const uid = cred.user.uid;
  await updateProfile(cred.user, { displayName: "Demo Owner" }).catch(() => {});
  await setDoc(
    doc(db, "Users", uid),
    {
      userName: "Demo Owner",
      email: SEED_EMAIL,
      phoneNumber: "+237 670 00 00 00",
      photoURL: `https://picsum.photos/seed/demo-owner/200/200`,
    },
    { merge: true }
  );

  const existing = await getDocs(
    query(collection(db, "roomdetails"), where("ownerId", "==", uid))
  );
  if (!existing.empty) {
    console.log(`Demo owner already has ${existing.size} listings — skipping (delete them to re-seed).`);
    process.exit(0);
  }

  for (const listing of LISTINGS) {
    const docRef = await addDoc(collection(db, "roomdetails"), {
      ...listing,
      phno: "+237 670 00 00 00",
      ownerFirstName: "Demo",
      ownerLastName: "Owner",
      ownerEmail: SEED_EMAIL,
      ownerId: uid,
      energyEfficiencyRating: "",
      accessibilityFeatures: [],
      locationSource: "seed",
      createdAt: serverTimestamp(),
    });
    console.log("Created listing:", docRef.id, "-", listing.name);
  }
  console.log("Done — 6 demo listings created.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
