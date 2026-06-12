/**
 * Lists or deletes roomdetails documents on the TARGET project using the
 * Admin SDK (bypasses security rules — owner-only restrictions don't apply).
 *
 * Two-phase safety design:
 *   node scripts/cleanup-listings.js <service-account.json> --list
 *     -> prints every listing with id, name, price, location, owner
 *   node scripts/cleanup-listings.js <service-account.json> --delete id1 id2 ...
 *     -> deletes ONLY the explicitly given document ids
 *
 * Never deletes anything it wasn't explicitly told to delete.
 */
const keyPath = process.argv[2];
const mode = process.argv[3];
const ids = process.argv.slice(4);

if (!keyPath || !["--list", "--delete"].includes(mode)) {
  console.error(
    "Usage:\n  node scripts/cleanup-listings.js <service-account.json> --list\n  node scripts/cleanup-listings.js <service-account.json> --delete <id> [<id> ...]"
  );
  process.exit(1);
}

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { resolve } = require("node:path");

const serviceAccount = require(resolve(keyPath));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function list() {
  const snap = await db.collection("roomdetails").get();
  console.log(`${snap.size} listings in project '${serviceAccount.project_id}':\n`);
  const rows = [];
  snap.forEach((doc) => {
    const d = doc.data();
    rows.push({
      id: doc.id,
      name: String(d.name || "").slice(0, 30),
      price: `${d.price || "?"} ${d.currency || ""}`.trim(),
      location: String(d.location || "").slice(0, 40),
      owner: String(d.ownerEmail || d.ownerId || "").slice(0, 30),
      images: Array.isArray(d.images) ? d.images.length : 0,
    });
  });
  console.table(rows);
  console.log(
    "\nTo delete, pass ids explicitly:\n  node scripts/cleanup-listings.js <key.json> --delete <id> <id> ..."
  );
}

async function del() {
  if (!ids.length) {
    console.error("No ids given — nothing deleted.");
    process.exit(1);
  }
  for (const id of ids) {
    const ref = db.collection("roomdetails").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      console.log(`SKIP ${id} — does not exist`);
      continue;
    }
    await ref.delete();
    console.log(`DELETED ${id} — "${doc.data().name || "?"}"`);
  }
  console.log("Done.");
}

(mode === "--list" ? list() : del())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Failed:", e.message);
    process.exit(1);
  });
