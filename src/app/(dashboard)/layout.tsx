import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { KeyboardShortcutsProvider } from "@/components/shared/keyboard-shortcuts-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <KeyboardShortcutsProvider>
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </KeyboardShortcutsProvider>
      </div>
    </div>
  );
}
