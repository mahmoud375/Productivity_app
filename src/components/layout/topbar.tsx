import { auth } from "@/lib/auth/auth";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function Topbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
      <MobileNav />
      <div className="flex-1 lg:flex-none" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}
