import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/goals")({
  component: GoalsPage,
  head: () => ({ meta: [{ title: "Goals — JEE OS" }] }),
});

function GoalsPage() {
  const goals = useJeeStore((s) => s.goals);
  const addGoal = useJeeStore((s) => s.addGoal);
  const updateGoal = useJeeStore((s) => s.updateGoal);
  const removeGoal = useJeeStore((s) => s.removeGoal);
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("questions");
  const [target, setTarget] = useState("100");

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      unit,
      target: parseInt(target) || 0,
      current: 0,
    });
    setTitle("");
    setTarget("100");
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-1">Track your weekly and monthly targets.</p>
        </header>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <h2 className="font-semibold text-sm">New goal</h2>
          <Input
            placeholder="Goal title (e.g., Complete Mechanics)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Input
              placeholder="Unit (e.g., questions)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} className="w-full">Add goal</Button>
        </div>

        <div className="space-y-2">
          {goals.map((goal) => {
            const percent = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            return (
              <div
                key={goal.id}
                className="rounded-lg border border-border/60 bg-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-muted-foreground/50 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <div className="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <span className="font-mono">{Math.round(percent)}%</span>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No goals yet. Create one to track progress.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
