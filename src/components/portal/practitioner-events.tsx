"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Video, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CoreEvent {
  id: number;
  title: string;
  slug: string;
  duration: string;
  description: string | null;
  location: "zoom" | "video_call";
  price: string | null;
  status: boolean;
  practitioner: { id: number; name: string };
}

const DURATIONS = [
  "15 min",
  "30 min",
  "45 min",
  "60 min",
  "90 min",
  "120 min",
  "150 min",
  "180 min",
  "240 min",
] as const;
type Duration = (typeof DURATIONS)[number];

const LOCATIONS = ["video_call", "zoom"] as const;
type Location = (typeof LOCATIONS)[number];

const LOCATION_LABELS: Record<Location, string> = {
  video_call: "Consentz Video Call",
  zoom: "Zoom",
};

function LocationBadge({ location }: { location: Location }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        location === "zoom"
          ? "bg-blue-50 text-blue-700"
          : "bg-purple-50 text-purple-700",
      )}
    >
      <Video className="h-3 w-3" />
      {LOCATION_LABELS[location] ?? "Video"}
    </span>
  );
}

interface EventFormState {
  title: string;
  duration: Duration;
  description: string;
  location: Location;
  price: string;
  status: boolean;
}

const DEFAULT_FORM: EventFormState = {
  title: "",
  duration: "30 min",
  description: "",
  location: "video_call",
  price: "",
  status: true,
};

interface EventModalProps {
  event: CoreEvent | null;
  onClose: () => void;
  onSaved: (event: CoreEvent) => void;
}

function EventModal({ event, onClose, onSaved }: EventModalProps) {
  const isEdit = event !== null;
  const [form, setForm] = useState<EventFormState>(
    event
      ? {
          title: event.title,
          duration: (DURATIONS.includes(event.duration as Duration)
            ? event.duration
            : "30 min") as Duration,
          description: event.description ?? "",
          location: event.location,
          price: event.price ?? "",
          status: event.status,
        }
      : DEFAULT_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  function set<K extends keyof EventFormState>(k: K, v: EventFormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFieldError("Event name is required");
      return;
    }

    setSaving(true);
    setFieldError(null);
    try {
      const body = {
        title: form.title.trim(),
        duration: form.duration,
        description: form.description.trim() || null,
        location: form.location,
        price: form.price.trim() || null,
        status: form.status,
      };

      const url = isEdit
        ? `/directory/api/portal/events/${event!.id}`
        : "/directory/api/portal/events";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setFieldError(data.error ?? "Failed to save event");
        return;
      }

      const saved = (data.event ?? data) as CoreEvent;
      onSaved(saved);
      toast.success(isEdit ? "Event updated" : "Event created");
    } catch {
      setFieldError("Failed to save event — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            {isEdit ? "Edit Event" : "New Event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="px-5 py-4 space-y-4"
        >
          {/* Event name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Initial Consultation"
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none",
                fieldError
                  ? "border-red-400"
                  : "border-gray-200 focus:border-gray-400",
              )}
            />
            {fieldError && (
              <p className="mt-1 text-xs text-red-600">{fieldError}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              value={form.duration}
              onChange={(e) => set("duration", e.target.value as Duration)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none bg-white"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description shown to patients"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-3">
              {LOCATIONS.map((loc) => (
                <label
                  key={loc}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="location"
                    value={loc}
                    checked={form.location === loc}
                    onChange={() => set("location", loc)}
                    className="accent-gray-900"
                  />
                  <span className="text-sm text-gray-700">
                    {LOCATION_LABELS[loc]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Price (£){" "}
              <span className="text-gray-600">(leave blank = Free)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="e.g. 75.00"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Active</p>
              <p className="text-xs text-gray-600">
                Visible to patients on your profile
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.status}
              onClick={() => set("status", !form.status)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                form.status ? "bg-gray-900" : "bg-gray-200",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform",
                  form.status ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmProps {
  event: CoreEvent;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

function DeleteConfirm({ event, onClose, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/directory/api/portal/events/${event.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(
          (data as { error?: string }).error ?? "Failed to delete event",
        );
        return;
      }
      onDeleted(event.id);
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Delete Event</h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-medium">&ldquo;{event.title}&rdquo;</span>? This
          cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PractitionerEvents() {
  const [events, setEvents] = useState<CoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState<CoreEvent | "new" | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<CoreEvent | null>(null);

  useEffect(() => {
    fetch("/directory/api/portal/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleStatus(event: CoreEvent) {
    const updated = { ...event, status: !event.status };
    setEvents((ev) => ev.map((e) => (e.id === event.id ? updated : e)));
    try {
      const res = await fetch(`/directory/api/portal/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updated.status }),
      });
      if (!res.ok) {
        setEvents((ev) => ev.map((e) => (e.id === event.id ? event : e)));
        toast.error("Failed to update status");
      }
    } catch {
      setEvents((ev) => ev.map((e) => (e.id === event.id ? event : e)));
      toast.error("Failed to update status");
    }
  }

  function handleSaved(saved: CoreEvent) {
    setEvents((ev) => {
      const idx = ev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...ev];
        next[idx] = saved;
        return next;
      }
      return [...ev, saved];
    });
    setModalEvent(null);
  }

  function handleDeleted(id: number) {
    setEvents((ev) => ev.filter((e) => e.id !== id));
    setDeleteEvent(null);
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Events</h1>
            <p className="mt-0.5 text-sm text-gray-600">
              Manage consultation events visible to patients on your profile.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalEvent("new")}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-200 py-16 text-center">
            <Video className="mx-auto h-8 w-8 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-700">No events yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Add your first consultation event to let patients book online.
            </p>
            <button
              type="button"
              onClick={() => setModalEvent("new")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add your first event
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">
                    Price
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className={cn(
                      "transition-colors hover:bg-gray-50/50",
                      !event.status && "opacity-60",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-900">
                          {event.title}
                        </span>
                        {event.description && (
                          <span className="text-xs text-gray-600 line-clamp-1">
                            {event.description}
                          </span>
                        )}
                        {!event.status && (
                          <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      {event.duration}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <LocationBadge location={event.location} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">
                      {event.price ? (
                        `£${event.price}`
                      ) : (
                        <span className="text-gray-600 font-normal">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={event.status}
                        aria-label={
                          event.status ? "Deactivate event" : "Activate event"
                        }
                        onClick={() => handleToggleStatus(event)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                          event.status ? "bg-gray-900" : "bg-gray-200",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform",
                            event.status ? "translate-x-4" : "translate-x-0",
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setModalEvent(event)}
                          aria-label="Edit event"
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteEvent(event)}
                          aria-label="Delete event"
                          className="rounded p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalEvent !== null && (
        <EventModal
          event={modalEvent === "new" ? null : modalEvent}
          onClose={() => setModalEvent(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteEvent !== null && (
        <DeleteConfirm
          event={deleteEvent}
          onClose={() => setDeleteEvent(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
