"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase/Config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Simple allowlist to protect this page; replace with your admin UID(s)
const ADMIN_UIDS = new Set<string>([
  // "your-admin-uid-here"
]);

export default function BackfillChatUserIds() {
  const [status, setStatus] = useState<string>('Idle');
  const [logs, setLogs] = useState<string[]>([]);
  const append = (s: string) => setLogs((prev) => [...prev, s]);
  useEffect(() => {
    const run = async () => {
      try {
        setStatus('Checking admin...');
        const uid = auth.currentUser?.uid;
  // Require explicit allowlist match; if allowlist empty, deny
  if (!uid || (ADMIN_UIDS.size === 0 || !ADMIN_UIDS.has(uid))) {
          setStatus('Forbidden: sign in as admin to run this migration.');
          return;
        }
        setStatus('Fetching mappings...');
        const mapSnap = await getDocs(collection(db, 'chatRoomMapping'));
        const maps = mapSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        setStatus(`Found ${maps.length} mapping docs; updating chat rooms...`);
        let updated = 0;
        for (const m of maps) {
          if (!m?.roomId || !Array.isArray(m?.userIds) || m.userIds.length < 1) continue;
          await setDoc(doc(db, 'chatRoom', m.roomId), { userIds: m.userIds }, { merge: true });
          updated++;
          if (updated % 20 === 0) append(`Updated ${updated} rooms...`);
        }
        setStatus(`Done. Updated ${updated} chatRoom documents.`);
      } catch (e: any) {
        setStatus(`Error: ${e?.message || 'unknown error'}`);
      }
    };
    run();
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Backfill chatRoom.userIds</h1>
      <p className="mt-2 text-sm text-gray-600">{status}</p>
      <div className="mt-4 text-xs whitespace-pre-wrap">
        {logs.join('\n')}
      </div>
    </div>
  );
}
