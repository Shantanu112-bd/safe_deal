import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#030712]">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-20 lg:pb-0">
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
}
