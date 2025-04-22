"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

interface RoadmapEditorProps {
  ideaId: string;
  initialRoadmap: string[];
}

export default function RoadmapEditor({ ideaId, initialRoadmap }: RoadmapEditorProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<{ text: string; done: boolean }[]>([]);
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTasks(initialRoadmap.map((text) => ({ text, done: false })));
  }, [initialRoadmap]);

  const handleToggle = (idx: number) => {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, done: !t.done } : t)));
  };

  const handleEdit = (idx: number, value: string) => {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, text: value } : t)));
  };

  const handleAdd = () => {
    if (newTask.trim()) {
      setTasks((prev) => [...prev, { text: newTask.trim(), done: false }]);
      setNewTask("");
    }
  };

  const handleRemove = (idx: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const roadmap = tasks.map((t) => t.text);
    const roadmapStatus = tasks.map((t) => t.done);
    await updateDoc(doc(db, "users", user.uid, "ideas", ideaId), {
      "gptOutput.roadmap": roadmap,
      "gptOutput.roadmapStatus": roadmapStatus,
    });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {tasks.map((task, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => handleToggle(idx)}
              className="accent-primary"
            />
            <Input
              value={task.text}
              onChange={(e) => handleEdit(idx, e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="destructive" size="sm" onClick={() => handleRemove(idx)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
        />
        <Button type="button" onClick={handleAdd}>
          Add
        </Button>
      </div>
      <Button type="button" onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Roadmap"}
      </Button>
    </div>
  );
}
