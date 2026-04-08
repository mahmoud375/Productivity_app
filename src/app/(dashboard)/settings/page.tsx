import type { Metadata } from "next";
import { Settings, Bell, Shield, Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | TaskFlow",
  description: "Manage your TaskFlow account and application settings.",
};

const sections = [
  {
    icon: Palette,
    title: "Appearance",
    description: "Customise theme, colour scheme, and display density.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Control email and in-app notification preferences.",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Manage password, two-factor authentication, and sessions.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Settings cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <h2 className="text-base font-semibold">{title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <span className="text-xs font-medium text-muted-foreground">
              Coming soon
            </span>
          </div>
        ))}
      </div>

      {/* Danger zone placeholder */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-5 w-5 text-destructive" />
          <h2 className="text-base font-semibold text-destructive">
            Danger Zone
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Irreversible account actions such as data export and account deletion
          will appear here.
        </p>
      </div>
    </div>
  );
}
