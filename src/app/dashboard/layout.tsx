import Sidebar from '@/components/dashboard/Sidebar';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'rgb(250,250,249)',
      fontFamily: "'DM Sans', 'DM Sans Fallback', system-ui, -apple-system, sans-serif",
    }}>
      <Sidebar />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
