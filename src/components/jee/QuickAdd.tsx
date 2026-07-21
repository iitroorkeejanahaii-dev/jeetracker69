import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useJeeStore } from "@/lib/jee/store";
import { SUBJECTS } from "@/lib/jee/seed";
import { BookOpen, FileText, XCircle, RotateCcw, Timer } from "lucide-react";

type Kind = "lecture" | "sheet" | "mistake" | "hours";

export function QuickAdd({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [kind, setKind] = useState<Kind>("lecture");
  const chapters = useJeeStore((s) => s.chapters);
  const [chapterId, setChapterId] = useState(
    Object.keys(chapters)[0] || ""
  );
  const [text, setText] = useState("");
  const [num, setNum] = useState("1");
  const addLecture = useJeeStore((s) => s.addLecture);
  const addSheet = useJeeStore((s) => s.addSheet);
  const addMistake = useJeeStore((s) => s.addMistake);
  const markActivity = useJeeStore((s) => s.markActivity);

  const submit = () => {
    if (kind === "lecture" && text.trim()) addLecture(chapterId, text.trim());
    if (kind === "sheet" && text.trim()) addSheet(chapterId, text.trim());
    if (kind === "mistake" && text.trim()) {
      const ch = chapters[chapterId];
      if (ch) {
        addMistake({
          subjectId: ch.subjectId,
          chapterId,
          resource: "Quick add",
          qNumber: num || "?",
          difficulty: "medium",
          type: "concept",
          concept: text.trim(),
          explanation: "",
          correctMethod: "",
          status: "pending",
          revisionCount: 0,
          importance: 3,
        });
      }
    }
    if (kind === "hours") {
      markActivity({ hours: Number(num) || 0, questions: 0 });
    }
    setText("");
    setNum("1");
    onOpenChange(false);
  };

  const kinds: { k: Kind; label: string; icon: React.ElementType }[] = [
    { k: "lecture", label: "Lecture", icon: BookOpen },
    { k: "sheet", label: "Sheet", icon: FileText },
    { k: "mistake", label: "Mistake", icon: XCircle },
    { k: "hours", label: "Log hours", icon: Timer },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Quick add</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-1.5">
          {kinds.map((k) => {
            const Icon = k.icon;
            const active = kind === k.k;
            return (
              <button
                key={k.k}
                onClick={() => setKind(k.k)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[10px] font-medium transition ${
                  active
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {k.label}
              </button>
            );
          })}
        </div>

        {kind !== "hours" && Object.keys(chapters).length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Chapter</label>
            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {Object.values(chapters).map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.chapterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {kind === "hours" ? (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Hours studied</label>
            <Input
              type="number"
              step="0.25"
              value={num}
              onChange={(e) => setNum(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              {kind === "mistake" ? "Concept / question" : "Title"}
            </label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            {kind === "mistake" && (
              <>
                <label className="text-xs text-muted-foreground">Question #</label>
                <Input
                  value={num}
                  onChange={(e) => setNum(e.target.value)}
                />
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={
              !text.trim() && kind !== "hours" ||
              (kind === "hours" && !num) ||
              (kind !== "hours" && Object.keys(chapters).length === 0)
            }
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
