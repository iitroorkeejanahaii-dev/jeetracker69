import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { ALL_CHAPTERS, SUBJECTS } from "@/lib/jee/seed";
import { readinessScore } from "@/lib/jee/readiness";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — JEE OS" }] }),
});

function AnalyticsPage() {
  const daily = useJeeStore((s) => s.daily);
  const mistakes = useJeeStore((s) => s.mistakes);
  const getCh = useJeeStore((s) => s.getChapter);

  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const log = daily[key];
    return {
      date: key.slice(5),
      hours: log?.hours ?? 0,
      questions: log?.questions ?? 0,
    };
  });

  const subjectData = SUBJECTS.map((s) => {
    const list = s.units.flatMap((u) => u.chapters).map((c) => readinessScore(getCh(c.id), mistakes.filter((m) => m.chapterId === c.id)));
    return { name: s.short, score: Math.round(list.reduce((a, b) => a + b, 0) / list.length) };
  });

  const chapterScores = ALL_CHAPTERS.map((c) => ({
    c,
    score: readinessScore(getCh(c.id), mistakes.filter((m) => m.chapterId === c.id)),
  }));

  const strong = [...chapterScores].sort((a, b) => b.score - a.score).slice(0, 5);
  const weak = [...chapterScores].sort((a, b) => a.score - b.score).slice(0, 5);
  const mostIgnored = [...chapterScores].filter((x) => x.score < 10).slice(0, 5);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Data</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Analytics</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Daily hours (30d)">
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={last30}>
                  <CartesianGrid stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #ffffff10", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Questions solved (30d)">
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={last30}>
                  <CartesianGrid stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #ffffff10", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="questions" fill="var(--primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Subject readiness">
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={subjectData}>
                  <CartesianGrid stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]}/>
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #ffffff10", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="score" fill="var(--primary)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Signals">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <MiniList title="Strongest" list={strong} tone="text-emerald-400"/>
              <MiniList title="Weakest" list={weak} tone="text-red-400"/>
              <MiniList title="Most ignored" list={mostIgnored} tone="text-amber-400"/>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-2">Mistake mix</div>
                <div className="space-y-1">
                  {["concept","calculation","silly","guess","formula","time"].map((t) => {
                    const n = mistakes.filter((m) => m.type === t).length;
                    return (
                      <div key={t} className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{t}</span>
                        <span className="font-mono">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-5">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function MiniList({ title, list, tone }: { title: string; list: { c: any; score: number }[]; tone: string }) {
  return (
    <div>
      <div className={`text-xs uppercase tracking-widest font-mono mb-2 ${tone}`}>{title}</div>
      <div className="space-y-1">
        {list.map((x) => (
          <div key={x.c.id} className="flex justify-between text-xs">
            <span className="truncate mr-2">{x.c.name}</span>
            <span className="font-mono text-muted-foreground">{x.score}</span>
          </div>
        ))}
        {!list.length && <div className="text-[11px] text-muted-foreground">—</div>}
      </div>
    </div>
  );
}