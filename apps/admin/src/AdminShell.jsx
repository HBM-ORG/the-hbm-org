import { Outlet } from "react-router-dom";

export default function AdminShell() {
  return (
    <div className="min-h-screen bg-[#f4f6fb] text-gray-900">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
