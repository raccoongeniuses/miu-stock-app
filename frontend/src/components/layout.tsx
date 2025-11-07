'use client';

import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100" suppressHydrationWarning={true}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6" suppressHydrationWarning={true}>
          {children}
        </div>
      </main>
    </div>
  );
}