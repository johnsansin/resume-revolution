import AdminLayout from '@/components/admin/AdminLayout';
import Settings from '@/views/Settings';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <Settings embedded />
    </AdminLayout>
  );
}
