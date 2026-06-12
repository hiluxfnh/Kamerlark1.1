/**
 * One-time repair of the 9 legacy kamerlark1 listings (June 2026):
 *  - every stored Firebase-Storage image returns 402 (legacy free buckets
 *    were pay-walled by Google) -> replace with seeded picsum images
 *  - gibberish/test data (names like "rty", Bengaluru/Brooklyn locations,
 *    USD prices) -> coherent Cameroon student-housing data
 * Owners are preserved. Run:
 *   node scripts/fix-listings.js <service-account.json>
 */
const keyPath = process.argv[2];
if (!keyPath) {
  console.error("Usage: node scripts/fix-listings.js <service-account.json>");
  process.exit(1);
}
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { resolve } = require("node:path");
initializeApp({ credential: cert(require(resolve(keyPath))) });
const db = getFirestore();

const img = (seed, n) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}${i}/900/620`);

const FIXES = {
  BWSUmbZWf7AsnK8TT7nb: {
    name: "Carrefour Boys Hostel, Dschang",
    price: "35000", currency: "XAF",
    uni: "University of Dschang",
    location: "Carrefour Marché B, Dschang",
    latitude: 5.4437, longitude: 10.0686,
    bedType: "Single", capacity: "2", roomSize: "23",
    furnishedStatus: "Semi-furnished",
    amenities: ["Bedding", "Study desk", "Water tank", "Common TV room"],
    description:
      "Male hostel five minutes from the University of Dschang. Rooms for one or two students with shared washrooms per floor, steady water supply and a common TV room.",
    images: img("dschang-hostel", 5),
  },
  EdO5vXDkMpnQKPXcpIGq: {
    name: "Dorm 19 — Bambili Campus Residence",
    price: "45000", currency: "XAF",
    uni: "University of Bamenda",
    location: "Bambili, Bamenda",
    latitude: 6.0083, longitude: 10.2533,
    bedType: "Double", capacity: "2", roomSize: "18",
    furnishedStatus: "Furnished",
    amenities: ["Balcony", "Bedding", "Wardrobe"],
    description:
      "Furnished double room in a student residence at Bambili, walking distance from the University of Bamenda campus. Balcony with a view over the hills.",
    images: img("bambili-dorm", 4),
  },
  F8JCbE8nxRqPjl0MGc38: {
    name: "Cosy Single Room, Biyem-Assi",
    price: "30000", currency: "XAF",
    uni: "University of Yaounde I",
    location: "Rue 7.488, Biyem-Assi, Yaoundé VI",
    bedType: "Single", capacity: "1", roomSize: "12",
    furnishedStatus: "Semi-furnished",
    amenities: ["Wardrobe", "Study desk"],
    description:
      "Affordable single room in a calm family compound in Biyem-Assi, with quick taxi access to the University of Yaoundé I. Prepaid electricity meter, shared washroom.",
    images: img("biyemassi-room", 4),
  },
  KT051z5ZNwevAwlHUJUv: {
    name: "Mingo Residence, Foto",
    price: "40000", currency: "XAF",
    uni: "University of Dschang",
    location: "Foto, Dschang",
    latitude: 5.45, longitude: 10.059,
    bedType: "Double", capacity: "2", roomSize: "20",
    furnishedStatus: "Semi-furnished",
    amenities: ["Balcony", "Bedding", "Shared kitchen"],
    description:
      "Quiet double room in the Foto neighbourhood of Dschang, ten minutes from campus by bike. Shared kitchen per floor and a sunny balcony.",
    images: img("foto-residence", 4),
  },
  SdztlNqpjACs9BNXmez0: {
    name: "Shared Twin Room, Bonamoussadi",
    price: "35000", currency: "XAF",
    uni: "University of Douala",
    location: "Bonamoussadi, Douala",
    latitude: 4.0944, longitude: 9.7404,
    bedType: "Double", capacity: "2", roomSize: "16",
    furnishedStatus: "Furnished",
    amenities: ["WiFi", "Shared kitchen", "Wardrobe"],
    description:
      "Twin room to share in a modern apartment at Bonamoussadi, with WiFi included and a fully equipped shared kitchen. Direct bus line to the University of Douala.",
    images: img("bonamoussadi-twin", 4),
  },
  UcXKJb14M25NA7KhJRQy: {
    name: "Nkwen Premium Suites",
    price: "80000", currency: "XAF",
    uni: "University of Bamenda",
    location: "Nkwen, Bamenda",
    latitude: 5.9772, longitude: 10.1656,
    bedType: "Queen", capacity: "2", roomSize: "40",
    furnishedStatus: "Furnished",
    amenities: ["Air conditioning", "Balcony", "Bedding", "Cable TV", "Parking"],
    description:
      "Upmarket furnished suite in Nkwen with air conditioning, cable TV and secure parking. Suits postgraduate students or young professionals.",
    images: img("nkwen-suites", 5),
  },
  cdCtQqCwZa1oJ3g0Yj7U: {
    name: "Sunrise Student Apartments, Molyko",
    price: "60000", currency: "XAF",
    uni: "University of Buea",
    location: "Molyko, Buea",
    latitude: 4.1527, longitude: 9.292,
    bedType: "Double", capacity: "2", roomSize: "25",
    furnishedStatus: "Furnished",
    amenities: ["WiFi", "Private kitchen", "Water tank", "Generator backup"],
    description:
      "Self-contained apartment along the Molyko stretch, minutes from the University of Buea. Fibre internet, backup water tank and generator for outages.",
    images: img("molyko-sunrise", 5),
  },
  kt3SxR7LwUFEuaNGt15e: {
    name: "Excalibur Residence, Bertoua",
    price: "38000", currency: "XAF",
    uni: "University of Bertoua",
    location: "Tindamba, Bertoua",
    latitude: 4.5772, longitude: 13.6846,
    bedType: "Single", capacity: "1", roomSize: "15",
    furnishedStatus: "Semi-furnished",
    amenities: ["Bedding", "Study desk", "Fenced compound"],
    description:
      "Single room in a fenced compound at Tindamba, a short moto ride from the University of Bertoua. Calm area, ideal for focused study.",
    images: img("bertoua-excalibur", 5),
  },
  nXOKNyXRsJq48hRuRzJ5: {
    name: "Tradex Junction Rooms, Maroua",
    price: "28000", currency: "XAF",
    uni: "University of Maroua",
    location: "Domayo, Maroua",
    latitude: 10.591, longitude: 14.3158,
    bedType: "Single", capacity: "1", roomSize: "14",
    furnishedStatus: "Semi-furnished",
    amenities: ["Wardrobe", "Fan", "Borehole water"],
    description:
      "Budget-friendly room near Tradex Domayo in Maroua, with borehole water and a ceiling fan. Ten minutes from the University of Maroua by moto.",
    images: img("maroua-tradex", 4),
  },
};

(async () => {
  for (const [id, fix] of Object.entries(FIXES)) {
    const ref = db.collection("roomdetails").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      console.log(`SKIP ${id} — not found`);
      continue;
    }
    await ref.update({ ...fix, updatedAt: FieldValue.serverTimestamp() });
    console.log(`FIXED ${id} — "${doc.data().name}" -> "${fix.name}"`);
  }
  console.log("Done.");
  process.exit(0);
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
