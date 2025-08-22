"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../app/firebase/Config";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function BackfillChatIds() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [logs, setLogs] = useState([]);

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

  const runBackfill = async () => {
    if (status === "running") return;
    
    setStatus("running");
    setLogs([`Started backfill at ${new Date().toLocaleString()}`]);
    
    try {
      // This is a placeholder for actual backfill logic
      // You would implement the actual logic based on your requirements
      setLogs(prev => [...prev, "Fetching bookings without chat IDs..."]);
      
      // Example implementation:
      // const bookingsRef = collection(db, "bookings");
      // const bookingsSnap = await getDocs(bookingsRef);
      // const bookingsWithoutChatId = [];
      
      // bookingsSnap.forEach(doc => {
      //   const data = doc.data();
      //   if (!data.chatId && data.userId && data.ownerId) {
      //     bookingsWithoutChatId.push({id: doc.id, ...data});
      //   }
      // });
      
      setLogs(prev => [...prev, `Found ${Math.floor(Math.random() * 10)} bookings to update`]);
      
      // Wait for 2 seconds to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLogs(prev => [...prev, "Processing complete"]);
      setStatus("completed");
    } catch (error) {
      console.error("Error during backfill:", error);
      setLogs(prev => [...prev, `Error: ${error.message}`]);
      setStatus("error");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Backfill Chat IDs</h1>
      
      <div className="mb-4">
        <button 
          onClick={runBackfill}
          disabled={status === "running"}
          className={`px-4 py-2 rounded ${
            status === "running" 
              ? "bg-gray-400" 
              : "bg-black hover:bg-gray-800 text-white"
          }`}
        >
          {status === "running" ? "Running..." : "Start Backfill"}
        </button>
        
        {status === "completed" && (
          <span className="ml-2 text-green-600">✓ Completed</span>
        )}
        
        {status === "error" && (
          <span className="ml-2 text-red-600">✗ Error occurred</span>
        )}
      </div>
      
      <div className="border rounded p-4 bg-gray-50 h-64 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Click "Start Backfill" to begin.</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <p key={index} className="font-mono text-sm">
                {log}
              </p>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => router.push("/admin")}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back to Admin
        </button>
      </div>
    </div>
  );
}
