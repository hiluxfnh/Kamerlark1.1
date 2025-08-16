// Simple API client for interacting with the Express server (Supabase backend)
// Adjust BASE_URL if your server runs on a different host/port

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function http(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Houses
export async function getHouses(params = {}) {
  const query = new URLSearchParams(params).toString();
  const q = query ? `?${query}` : "";
  return http("GET", `/houses${q}`);
}

export async function createHouse(data) {
  return http("POST", "/houses", data);
}

// Placeholder for update/delete when server supports them
export async function updateHouse(id, data) {
  // Implement on server and update here accordingly
  throw new Error("updateHouse not implemented on server");
}

export async function deleteHouse(id) {
  // Implement on server and update here accordingly
  throw new Error("deleteHouse not implemented on server");
}

export default { getHouses, createHouse, updateHouse, deleteHouse };
