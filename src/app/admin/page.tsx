"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/Config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import "../config.js"; // Import global dynamic rendering config

export default function AdminPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        return;
      }
      
      try {
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().isAdmin) {
          setIsAdmin(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    
    checkAdmin();
  }, [user, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Tickets</h2>
          <p className="text-gray-600 mb-4">Manage user support tickets</p>
          <button 
            onClick={() => router.push("/admin/tickets")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            View Tickets
          </button>
        </div>
        
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Data Migrations</h2>
          <p className="text-gray-600 mb-4">Run data migrations and fixes</p>
          <button 
            onClick={() => router.push("/admin/migrations/backfill-chat-userids")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mr-2 mb-2"
          >
            Backfill Chat User IDs
          </button>
          <button 
            onClick={() => router.push("/admin/backfill-chat-ids")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mb-2"
          >
            Backfill Chat IDs
          </button>
        </div>
      </div>
    </div>
  );
}
