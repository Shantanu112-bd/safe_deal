import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
}
