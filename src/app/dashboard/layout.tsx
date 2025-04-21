import AuthGuard from '@/components/layout/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        {/* You can add your Sidebar and Header components here */}
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
