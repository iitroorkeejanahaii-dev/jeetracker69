import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJeeStore } from "@/lib/jee/store";
import { SUBJECTS } from "@/lib/jee/seed";

export function CreateChapterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createChapter = useJeeStore((s) => s.createChapter);
  const [subjectId, setSubjectId] = useState("phy");
  const [name, setName] = useState("");
  const [lectureCount, setLectureCount] = useState("5");
  const [sheetCount, setSheetCount] = useState("3");
  const [dppCount, setDppCount] = useState("2");
  const [pyqCount, setPyqCount] = useState("1");
  const [revisionTarget, setRevisionTarget] = useState("3");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      createChapter(
        subjectId,
        name.trim(),
        Math.max(1, parseInt(lectureCount) || 0),
        Math.max(0, parseInt(sheetCount) || 0),
        Math.max(0, parseInt(dppCount) || 0),
        Math.max(0, parseInt(pyqCount) || 0),
        Math.max(1, parseInt(revisionTarget) || 1)
      );
      setName("");
      setLectureCount("5");
      setSheetCount("3");
      setDppCount("2");
      setPyqCount("1");
      setRevisionTarget("3");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new chapter</DialogTitle>
          <DialogDescription>
            Lectures, sheets, DPPs, and PYQs will be auto-generated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Chapter name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Atomic Structure"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lectures">Lectures</Label>
              <Input
                id="lectures"
                type="number"
                min="1"
                value={lectureCount}
                onChange={(e) => setLectureCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sheets">Allen sheets</Label>
              <Input
                id="sheets"
                type="number"
                min="0"
                value={sheetCount}
                onChange={(e) => setSheetCount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dpps">DPPs</Label>
              <Input
                id="dpps"
                type="number"
                min="0"
                value={dppCount}
                onChange={(e) => setDppCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pyqs">PYQ sets</Label>
              <Input
                id="pyqs"
                type="number"
                min="0"
                value={pyqCount}
                onChange={(e) => setPyqCount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revisions">Revision target</Label>
            <Input
              id="revisions"
              type="number"
              min="1"
              value={revisionTarget}
              onChange={(e) => setRevisionTarget(e.target.value)}
              placeholder="3"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || loading}>
            {loading ? "Creating..." : "Create chapter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
