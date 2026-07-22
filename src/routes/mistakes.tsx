import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Star } from "lucide-react";
import type { MistakeStatus, MistakeType } from "@/lib/jee/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mistakes")({
  component: MistakesPage,
  head: () => ({ meta: [{ title: "Mistake Vault — JEE OS" }] }),
});

const TYPES: { k: MistakeType; label: string }[] = [
  { k: "concept", label: "Concept" },
  { k: "calculation", label: "Calculation" },
  { k: "silly", label: "Silly" },
  { k: "guess", label: "Guess" },
  { k: "formula", label: "Forgot formula" },
  { k: "time", label: "Time pressure" },
];

function MistakesPage() {
  const mistakes = useJeeStore((s) => s.mistakes);
  const chapters = useJeeStore((s) => s.chapters);
  const addMistake = useJeeStore((s) => s.addMistake);
  const updateMistake = useJeeStore((s) => s.updateMistake);
  const removeMistake = useJeeStore((s) => s.removeMistake);

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | MistakeStatus>("all");
  const [filterType, setFilterType] = useState<"all" | MistakeType>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [filterChapterId, setFilterChapterId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "importance" | "revisions">("recent");

  const [chapterId, setChapterId] = useState(
    Object.keys(chapters)[0] || "default"
  );
  const [resource, setResource] = useState("");
  const [qNum, setQNum] = useState("");
  const [type, setType] = useState<MistakeType>("concept");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [method, setMethod] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [importance, setImportance] = useState("3");

  const filtered = useMemo(() => {
    let result = mistakes;
    const query = q.toLowerCase();

    if (query) {
      result = result.filter((m) =>
        (m.concept + m.explanation + m.correctMethod + m.resource + m.qNumber)
          .toLowerCase()
          .includes(query)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((m) => m.status === filterStatus);
    }

    if (filterType !== "all") {
      result = result.filter((m) => m.type === filterType);
    }

    if (filterDifficulty !== "all") {
      result = result.filter((m) => m.difficulty === filterDifficulty);
    }

    if (filterChapterId !== "all") {
      result = result.filter((m) => m.chapterId === filterChapterId);
    }

    // Sort
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "importance") {
      result.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    } else if (sortBy === "revisions") {
      result.sort((a, b) => (b.revisionCount ?? 0) - (a.revisionCount ?? 0));
    }

    return result;
  }, [mistakes, q, filterStatus, filterType, filterDifficulty, filterChapterId, sortBy]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    const ch = chapters[chapterId];
    if (!ch) return;

    addMistake({
      subjectId: ch.subjectId,
      chapterId,
      resource: resource || "—",
      qNumber: qNum || "—",
      difficulty,
      type,
      concept,
      explanation,
      correctMethod: method,
      image,
      status: "pending",
      importance: Math.max(1, Math.min(5, parseInt(importance) || 3)),
      revisionCount: 0,
    });

    setResource("");
    setQNum("");
    setConcept("");
    setExplanation("");
    setMethod("");
    setImage(undefined);
    setImportance("3");
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  const stats = {
    total: mistakes.length,
    pending: mistakes.filter((m) => m.status === "pending").length,
    revised: mistakes.filter((m) => m.status === "revised").length,
    mastered: mistakes.filter((m) => m.status === "mastered").length,
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Vault
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Mistake Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every mistake logged is a mark saved. {stats.mastered} mastered, {stats.pending} pending.
          </p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} tone="text-red-400" />
          <StatCard label="Revised" value={stats.revised} tone="text-amber-400" />
          <StatCard label="Mastered" value={stats.mastered} tone="text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Form */}
          <form
            onSubmit={submit}
            className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 space-y-3 h-fit sticky top-20"
          >
            <h2 className="text-sm font-semibold">Log mistake</h2>

            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger>
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {Object.values(chapters).map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.chapterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Resource"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              />
              <Input
                placeholder="Q #"
                value={qNum}
                onChange={(e) => setQNum(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={type} onValueChange={(v) => setType(v as MistakeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.k} value={t.k}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Importance"
                type="number"
                min="1"
                max="5"
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
              />
            </div>

            <Input
              placeholder="Concept / Topic"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
            />
            <Textarea
              placeholder="Where I went wrong"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
            />
            <Textarea
              placeholder="Correct method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              rows={2}
            />

            <div>
              <label className="text-xs text-muted-foreground">Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files?.[0])}
                className="block w-full text-xs mt-1 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:text-foreground file:text-xs file:font-medium cursor-pointer"
              />
              {image && (
                <img
                  src={image}
                  alt="preview"
                  className="mt-2 rounded-md max-h-32 border border-border"
                />
              )}
            </div>
            <Button type="submit" className="w-full">
              Log mistake
            </Button>
          </form>

          {/* List */}
          <div className="lg:col-span-3 space-y-3">
            {/* Filters */}
            <div className="space-y-2">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search mistakes…"
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="revised">Revised</SelectItem>
                    <SelectItem value="mastered">Mastered</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {TYPES.map((t) => (
                      <SelectItem key={t.k} value={t.k}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterDifficulty}
                  onValueChange={(v) => setFilterDifficulty(v as any)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="importance">Importance</SelectItem>
                    <SelectItem value="revisions">Revisions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mistakes List */}
            <div className="space-y-2">
              {filtered.map((m) => {
                const ch = chapters[m.chapterId];
                return (
                  <div key={m.id} className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-start gap-3">
                      {m.image && (
                        <img
                          src={m.image}
                          alt=""
                          className="size-16 rounded-md object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            {ch?.subjectId}
                          </span>
                          <span className="text-sm font-medium">{m.concept}</span>
                          {m.starred && <Star className="size-3.5 text-amber-400" fill="currentColor" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 font-mono flex gap-2 flex-wrap">
                          <Link
                            to={`/c/${m.chapterId}`}
                            className="hover:text-primary"
                          >
                            {ch?.chapterName}
                          </Link>
                          <span>·</span>
                          <span>{m.resource} Q{m.qNumber}</span>
                          <span>·</span>
                          <span className="capitalize">{m.difficulty}</span>
                          <span>·</span>
                          <span>{m.type}</span>
                          <span>·</span>
                          <span>⭐ {m.importance}</span>
                        </div>
                        {m.explanation && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Wrong:</strong> {m.explanation}
                          </p>
                        )}
                        {m.correctMethod && (
                          <p className="text-xs text-emerald-300 mt-1">
                            <strong>Correct:</strong> {m.correctMethod}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <Select
                          value={m.status}
                          onValueChange={(v) =>
                            updateMistake(m.id, { status: v as MistakeStatus })
                          }
                        >
                          <SelectTrigger className="h-7 text-[11px] w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="revised">Revised</SelectItem>
                            <SelectItem value="mastered">Mastered</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => removeMistake(m.id)}
                          className="text-muted-foreground/50 hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
                  {q || filterStatus !== "all" || filterType !== "all"
                    ? "No mistakes match your filters."
                    : "No mistakes logged yet. Add one from the left."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={cn("text-2xl font-mono font-semibold mt-1", tone || "text-foreground")}>
        {value}
      </div>
    </div>
  );
}
