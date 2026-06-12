/**
 * Grants (or revokes) the `admin` custom claim on a Firebase user.
 *
 * Admin access across the app (admin pages, supportTickets reads in
 * firestore.rules) is driven exclusively by this claim — NOT by any
 * field on the Users document.
 *
 * Usage:
 *   1. Download a service-account key from
 *      Firebase Console -> Project settings -> Service accounts.
 *      Keep it OUTSIDE the repo; never commit it.
 *   2. npm install --no-save firebase-admin
 *   3. node scripts/set-admin-claim.js <path-to-service-account.json> <uid> [--revoke]
 */
const keyPath = process.argv[2];
const uid = process.argv[3];
const revoke = process.argv.includes("--revoke");

if (!keyPath || !uid) {
  console.error(
    "Usage: node scripts/set-admin-claim.js <service-account.json> <uid> [--revoke]"
  );
  process.exit(1);
}

// Modular API — works on firebase-admin v12 and later (the legacy
// `admin.credential.cert` namespace was removed in newer releases).
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { resolve } = require("node:path");

const serviceAccount = require(resolve(keyPath));
initializeApp({ credential: cert(serviceAccount) });

getAuth()
  .setCustomUserClaims(uid, revoke ? { admin: null } : { admin: true })
  .then(() => {
    console.log(`${revoke ? "Revoked" : "Granted"} admin claim for ${uid}.`);
    console.log(
      "The user must sign out/in (or refresh their ID token) for it to take effect."
    );
    process.exit(0);
  })
  .catch((e) => {
    console.error("Failed:", e.message);
    process.exit(1);
  });
