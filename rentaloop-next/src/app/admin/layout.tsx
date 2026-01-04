import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Protect Admin Routes
    // Only allow if user is logged in AND has role 'admin'
    if (!session?.user || session.user.role !== 'admin') {
        // If not logged in -> Auth
        if (!session?.user) {
            redirect('/auth');
        }
        // If logged in but not admin -> Home
        redirect('/');
    }

    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
