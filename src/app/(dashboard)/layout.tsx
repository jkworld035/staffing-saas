import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-canvas">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
