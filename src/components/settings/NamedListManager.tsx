"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";

interface NamedItem {
  id: string;
  name: string;
}

interface NamedListManagerProps {
  title: string;
  description: string;
  addLabel: string;
  namePlaceholder: string;
  items: NamedItem[];
  /** Number of products referencing each item's id — blocks deletion when > 0. */
  usageCountById: Map<string, number>;
  onCreate: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NamedListManager({
  title,
  description,
  addLabel,
  namePlaceholder,
  items,
  usageCountById,
  onCreate,
  onRename,
  onDelete,
}: NamedListManagerProps) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<NamedItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      await onCreate(name);
      setNewName("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "ບໍ່ສາມາດເພີ່ມໄດ້");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item: NamedItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setRenameError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setRenameError(null);
  }

  async function handleRename(id: string) {
    const name = editName.trim();
    if (!name) return;
    setRenaming(true);
    setRenameError(null);
    try {
      await onRename(id, name);
      setEditingId(null);
      setEditName("");
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : "ບໍ່ສາມາດແກ້ໄຂໄດ້");
    } finally {
      setRenaming(false);
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await onDelete(toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder={namePlaceholder}
            error={createError ?? undefined}
          />
        </div>
        <Button
          type="button"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          icon={<span className="text-lg leading-none">+</span>}
        >
          {creating ? "ກຳລັງເພີ່ມ..." : addLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="ຍັງບໍ່ມີຂໍ້ມູນ" />
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          {items.map((item) => {
            const usageCount = usageCountById.get(item.id) ?? 0;
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
              >
                {isEditing ? (
                  <>
                    <div className="min-w-0 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleRename(item.id);
                          }
                          if (e.key === "Escape") cancelEdit();
                        }}
                        error={renameError ?? undefined}
                        autoFocus
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={cancelEdit}
                      disabled={renaming}
                    >
                      ຍົກເລີກ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleRename(item.id)}
                      disabled={renaming || !editName.trim()}
                    >
                      {renaming ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-text-primary">{item.name}</span>
                      {usageCount > 0 && (
                        <span className="ml-2 text-xs text-text-secondary">
                          ໃຊ້ໃນ {usageCount} ສິນຄ້າ
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                      title="ແກ້ໄຂ"
                    >
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(item)}
                      disabled={usageCount > 0}
                      title={usageCount > 0 ? "ບໍ່ສາມາດລຶບໄດ້ ເນື່ອງຈາກຍັງມີສິນຄ້າໃຊ້ຢູ່" : "ລຶບ"}
                      className="flex h-8 w-8 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
                    >
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="ລຶບຂໍ້ມູນ"
        description={toDelete ? `ທ່ານຕ້ອງການລຶບ "${toDelete.name}" ແທ້ບໍ່? ບໍ່ສາມາດກູ້ຄືນໄດ້.` : undefined}
        confirmLabel="ລຶບ"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
