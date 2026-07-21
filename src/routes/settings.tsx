import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — JEE OS" }] }),
});

function SettingsPage() {
  const settings = useJeeStore((s) => s.settings);
  const setSettings = useJeeStore((s) => s.setSettings);
  const reset = useJeeStore((s) => s.reset);
  const [name, setName] = useState(settings.name);
  const [year, setYear] = useState(String(settings.targetYear));

  const handleSave = () => {
    setSettings({
      name: name || "Aspirant",
      targetYear: parseInt(year) || new Date().getFullYear() + 1,
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will delete all your data.")) {
      reset();
      setName("Aspirant");
      setYear(String(new Date().getFullYear() + 1));
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Settings</h1>
        </header>

        {/* Profile */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm">Profile</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Target JEE year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2024"
              max="2030"
            />
          </div>
          <Button onClick={handleSave} className="w-full">Save changes</Button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-4">
          <h2 className="font-semibold text-sm text-red-400">Danger zone</h2>
          <p className="text-xs text-muted-foreground">
            Once you delete all data, there is no going back. Please be certain.
          </p>
          <Button
            variant="destructive"
            onClick={handleReset}
            className="w-full"
          >
            Delete all data
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
