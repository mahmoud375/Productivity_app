import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile | TaskFlow",
  description: "View and manage your TaskFlow profile.",
};

export default async function ProfilePage() {
  const session = await auth();

  // Guard: the layout already redirects, but defensive re-check prevents
  // a crash if this page is ever rendered outside the layout context.
  if (!session?.user) {
    redirect("/login");
  }

  const { name, email, image } = session.user;

  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Your account information and preferences.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold select-none overflow-hidden">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name ?? "User avatar"} className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <p className="text-xl font-semibold">{name ?? "Unknown User"}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow icon={User} label="Display name" value={name ?? "—"} />
        <InfoRow icon={Mail} label="Email address" value={email ?? "—"} />
        <InfoRow
          icon={Shield}
          label="Account type"
          value="Standard account"
        />
        <InfoRow
          icon={Calendar}
          label="Member since"
          value="Profile sync coming soon"
        />
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
