import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — JEE OS" }] }),
});

function SettingsPage() {
  const settings = useJeeStore((s) => s.settings);
  const setSettings = useJeeStore((s) => s.setSettings);
  const destination = useJeeStore((s) => s.destination);
  const setDestination = useJeeStore((s) => s.setDestination);
  const exportData = useJeeStore((s) => s.exportData);
  const importData = useJeeStore((s) => s.importData);
  const reset = useJeeStore((s) => s.reset);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jee-os-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    try {
      const data = JSON.parse(text);
      importData(data);
      alert("Imported.");
    } catch { alert("Invalid file"); }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Config</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
        </header>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Profile</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <Input value={settings.name} onChange={(e)=>setSettings({ name: e.target.value })}/>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Target JEE year</label>
              <Input type="number" value={settings.targetYear} onChange={(e)=>setSettings({ targetYear: Number(e.target.value)||new Date().getFullYear()+1 })}/>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Destination</h2>
          <p className="text-xs text-muted-foreground">The dream on your dashboard. Change it whenever it changes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Dream college"><Input value={destination.college} onChange={(e)=>setDestination({ college: e.target.value })}/></Field>
            <Field label="Exam date (optional)"><Input type="date" value={destination.examDate ?? ""} onChange={(e)=>setDestination({ examDate: e.target.value || undefined })}/></Field>
            <Field label="Target rank"><Input type="number" value={destination.targetRank} onChange={(e)=>setDestination({ targetRank: Number(e.target.value)||0 })}/></Field>
            <Field label="Target percentile"><Input type="number" step="0.01" value={destination.targetPercentile} onChange={(e)=>setDestination({ targetPercentile: Number(e.target.value)||0 })}/></Field>
            <Field label="Target marks — Jan"><Input type="number" value={destination.targetMarksJan} onChange={(e)=>setDestination({ targetMarksJan: Number(e.target.value)||0 })}/></Field>
            <Field label="Target marks — Apr"><Input type="number" value={destination.targetMarksApr} onChange={(e)=>setDestination({ targetMarksApr: Number(e.target.value)||0 })}/></Field>
            <div className="md:col-span-2">
              <Field label="Motivation quote (optional)"><Input value={destination.quote ?? ""} onChange={(e)=>setDestination({ quote: e.target.value })}/></Field>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Backup</h2>
          <p className="text-xs text-muted-foreground">All data is stored locally on this device. Export a JSON backup regularly.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={doExport}>Export JSON</Button>
            <Button variant="secondary" onClick={()=>fileRef.current?.click()}>Import JSON</Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e)=>doImport(e.target.files?.[0])}/>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-red-400">Danger zone</h2>
          <p className="text-xs text-muted-foreground">Reset wipes chapters, mistakes, revisions, goals, and daily logs on this device.</p>
          <Button variant="destructive" onClick={()=>{ if(confirm("Wipe all JEE OS data?")) reset(); }}>Reset everything</Button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}