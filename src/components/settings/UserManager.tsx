"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { User, NewUserInput, UpdateUserInput } from "@/lib/users-queries";

const ROLES = [
  { value: "ADMIN", label: "ຜູ້ບໍລິຫານ" },
  { value: "CASHIER", label: "ພະນັກງານຂາຍ" },
  { value: "STOCK", label: "ພະນັກງານສາງ" },
];

function roleLabel(role: string) {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

interface UserFormState {
  username: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const EMPTY_FORM: UserFormState = {
  username: "",
  password: "",
  role: "CASHIER",
  firstName: "",
  lastName: "",
  phone: "",
};

interface UserManagerProps {
  users: User[];
  currentUserId: string | null;
  onCreate: (input: NewUserInput) => Promise<void>;
  onUpdate: (id: string, input: UpdateUserInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function UserManager({ users, currentUserId, onCreate, onUpdate, onDelete }: UserManagerProps) {
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<UserFormState>(EMPTY_FORM);
  const [addError, setAddError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UserFormState>(EMPTY_FORM);
  const [editError, setEditError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openAdd() {
    setAddForm(EMPTY_FORM);
    setAddError(null);
    setAdding(true);
  }

  async function handleAddSubmit() {
    setSaving(true);
    setAddError(null);
    try {
      await onCreate(addForm);
      setAdding(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "ບໍ່ສາມາດເພີ່ມຜູ້ໃຊ້ໄດ້");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setEditForm({
      username: user.username,
      password: "",
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    });
    setEditError(null);
  }

  async function handleEditSubmit(id: string) {
    setSaving(true);
    setEditError(null);
    try {
      await onUpdate(id, {
        role: editForm.role,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
      });
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "ບໍ່ສາມາດແກ້ໄຂໄດ້");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user: User) {
    await onUpdate(user.id, { status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">ຈັດການຜູ້ໃຊ້</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            ເພີ່ມ ແກ້ໄຂ ຫຼື ປິດການໃຊ້ງານບັນຊີພະນັກງານ
          </p>
        </div>
        <Button type="button" onClick={openAdd} icon={<span className="text-lg leading-none">+</span>}>
          ເພີ່ມຜູ້ໃຊ້
        </Button>
      </div>

      {adding && (
        <div className="flex flex-col gap-3 rounded-card border border-primary bg-surface p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="ຊື່"
              value={addForm.firstName}
              onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
              required
            />
            <Input
              label="ນາມສະກຸນ"
              value={addForm.lastName}
              onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
              required
            />
            <Input
              label="ຊື່ຜູ້ໃຊ້ (username)"
              value={addForm.username}
              onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))}
              autoComplete="off"
              required
            />
            <Input
              label="ລະຫັດຜ່ານ"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
              required
            />
            <Input
              label="ເບີໂທ"
              value={addForm.phone}
              onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">ສິດນຳໃຊ້</label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                className="h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {addError && (
            <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">{addError}</div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setAdding(false)} disabled={saving}>
              ຍົກເລີກ
            </Button>
            <Button
              type="button"
              onClick={handleAddSubmit}
              disabled={
                saving ||
                !addForm.firstName.trim() ||
                !addForm.lastName.trim() ||
                !addForm.username.trim() ||
                !addForm.password.trim() ||
                !addForm.phone.trim()
              }
            >
              {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </Button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <EmptyState title="ຍັງບໍ່ມີຜູ້ໃຊ້" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-200 text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3 font-medium">ຊື່</th>
                <th className="px-4 py-3 font-medium">ຊື່ຜູ້ໃຊ້</th>
                <th className="px-4 py-3 font-medium">ເບີໂທ</th>
                <th className="px-4 py-3 font-medium">ສິດນຳໃຊ້</th>
                <th className="px-4 py-3 font-medium">ສະຖານະ</th>
                <th className="px-4 py-3 font-medium text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isEditing = editingId === user.id;
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    {isEditing ? (
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Input
                              label="ຊື່"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                              required
                            />
                            <Input
                              label="ນາມສະກຸນ"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                              required
                            />
                            <Input
                              label="ເບີໂທ"
                              value={editForm.phone}
                              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                              required
                            />
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-medium text-text-secondary">ສິດນຳໃຊ້</label>
                              <select
                                value={editForm.role}
                                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                                disabled={isSelf}
                                className="h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
                              >
                                {ROLES.map((r) => (
                                  <option key={r.value} value={r.value}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                              {isSelf && (
                                <span className="text-xs text-text-secondary">
                                  ບໍ່ສາມາດປ່ຽນສິດຂອງຕົນເອງໄດ້
                                </span>
                              )}
                            </div>
                          </div>

                          {editError && (
                            <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
                              {editError}
                            </div>
                          )}

                          <div className="flex justify-end gap-3">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => setEditingId(null)}
                              disabled={saving}
                            >
                              ຍົກເລີກ
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleEditSubmit(user.id)}
                              disabled={saving || !editForm.firstName.trim() || !editForm.lastName.trim()}
                            >
                              {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
                            </Button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {user.firstName} {user.lastName}
                          {isSelf && <span className="ml-2 text-xs text-text-secondary">(ທ່ານ)</span>}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{user.username}</td>
                        <td className="px-4 py-3 text-text-secondary">{user.phone}</td>
                        <td className="px-4 py-3 text-text-secondary">{roleLabel(user.role)}</td>
                        <td className="px-4 py-3">
                          {user.status === "ACTIVE" ? (
                            <Badge tone="success">ເປີດໃຊ້ງານ</Badge>
                          ) : (
                            <Badge tone="neutral">ປິດການໃຊ້ງານ</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(user)}
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
                              onClick={() => toggleStatus(user)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "ບໍ່ສາມາດປິດການໃຊ້ງານຕົນເອງໄດ້"
                                  : user.status === "ACTIVE"
                                    ? "ປິດການໃຊ້ງານ"
                                    : "ເປີດການໃຊ້ງານ"
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-warning-bg hover:text-warning disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
                            >
                              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setToDelete(user)}
                              disabled={isSelf}
                              title={isSelf ? "ບໍ່ສາມາດລຶບຕົນເອງໄດ້" : "ລຶບ"}
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
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="ລຶບຜູ້ໃຊ້"
        description={
          toDelete ? `ທ່ານຕ້ອງການລຶບ "${toDelete.firstName} ${toDelete.lastName}" ແທ້ບໍ່? ບໍ່ສາມາດກູ້ຄືນໄດ້.` : undefined
        }
        confirmLabel="ລຶບ"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
