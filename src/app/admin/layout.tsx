import AdminShell from "@/components/admin/AdminShell";
import { SITE_NAME } from "@/lib/site";

export const metadata = {
  title: `Admin | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
