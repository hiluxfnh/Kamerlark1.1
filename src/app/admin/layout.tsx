// Create a layout that forces all admin routes to be server-side rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {/* You can add admin-specific layout elements here */}
      {children}
    </div>
  );
}
