"use client";

import { CheckSquare, Plus, Square, StickyNote, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_DEAL_TASKS, type DealTask } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

type DealTasksPanelProps = {
  tasks: DealTask[];
  notlar: string | null;
  onTasksChange: (tasks: DealTask[]) => void;
  onNotlarChange: (notlar: string) => void;
};

export function DealTasksPanel({
  tasks,
  notlar,
  onTasksChange,
  onNotlarChange,
}: DealTasksPanelProps) {
  const [newTask, setNewTask] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(notlar ?? "");

  const activeTasks =
    tasks.length > 0 ? tasks : DEFAULT_DEAL_TASKS;

  function toggleTask(id: string) {
    onTasksChange(
      activeTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  }

  function addTask() {
    const label = newTask.trim();
    if (!label) return;
    onTasksChange([
      ...activeTasks,
      { id: `task-${Date.now()}`, label, completed: false },
    ]);
    setNewTask("");
  }

  function removeTask(id: string) {
    onTasksChange(activeTasks.filter((t) => t.id !== id));
  }

  function saveNotes() {
    onNotlarChange(notesDraft.trim());
    setEditingNotes(false);
  }

  return (
    <Tabs defaultValue="tasks" className="gap-3">
      <TabsList
        variant="line"
        className="h-9 w-full justify-start gap-0 border-b border-border/60 bg-transparent p-0"
      >
        <TabsTrigger
          value="tasks"
          className="rounded-none border-0 px-3 data-active:text-parsel-gold"
        >
          <CheckSquare className="size-3.5" />
          Görevler
        </TabsTrigger>
        <TabsTrigger
          value="notes"
          className="rounded-none border-0 px-3 data-active:text-parsel-gold"
        >
          <StickyNote className="size-3.5" />
          Notlar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tasks" className="space-y-2">
        <ul className="space-y-1">
          {activeTasks.map((task) => (
            <li key={task.id}>
              <div className="group flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border/40 hover:bg-foreground/[0.02]">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 text-foreground0 transition-colors hover:text-parsel-gold"
                >
                  {task.completed ? (
                    <CheckSquare className="size-4 text-parsel-gold" />
                  ) : (
                    <Square className="size-4" />
                  )}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm text-foreground/90",
                    task.completed && "text-muted-foreground line-through",
                  )}
                >
                  {task.label}
                </span>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="shrink-0 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 pt-1">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Yeni görev ekle..."
            className="h-8 border-border bg-parsel-sunken text-sm"
          />
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={addTask}
            className="shrink-0 border-border"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="notes">
        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={5}
              placeholder="Fırsat notları..."
              className="w-full resize-none rounded-lg border border-border bg-parsel-sunken px-3 py-2 text-sm text-foreground outline-none focus:border-[#b38c56]/40 focus:ring-2 focus:ring-[#b38c56]/20"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={saveNotes}
                className="bg-parsel-gold text-[#09090b] hover:bg-[#c9a06a]"
              >
                Kaydet
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNotesDraft(notlar ?? "");
                  setEditingNotes(false);
                }}
              >
                İptal
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNotesDraft(notlar ?? "");
              setEditingNotes(true);
            }}
            className="w-full rounded-lg border border-border/60 bg-parsel-panel p-3 text-left transition-colors hover:border-parsel-gold/20"
          >
            {notlar ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{notlar}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not eklemek için tıklayın...
              </p>
            )}
          </button>
        )}
      </TabsContent>
    </Tabs>
  );
}
