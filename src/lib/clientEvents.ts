// src/lib/clientEvents.ts
// Central event bus for client data changes.
// Emits "zentap_clients_updated" on window whenever clients are mutated
// so any component (PageEditor, OwnerAccessModal, etc.) can react without
// polling or prop-drilling.

import { ClientRecord } from "@/lib/adminPlatformStore";

const EVENT_KEY = "zentap_clients_updated";

/** Dispatch a window event carrying the latest client array */
export function emitClientsUpdated(clients: ClientRecord[]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ClientRecord[]>(EVENT_KEY, { detail: clients })
  );
}

/** Subscribe to client updates. Returns an unsubscribe function. */
export function onClientsUpdated(
  handler: (clients: ClientRecord[]) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (e: Event) => {
    const ev = e as CustomEvent<ClientRecord[]>;
    handler(ev.detail ?? []);
  };

  window.addEventListener(EVENT_KEY, listener);
  return () => window.removeEventListener(EVENT_KEY, listener);
}

/** Resolve the best available value from a ClientRecord for a given field,
 *  checking both top-level props and custom_fields. */
export function resolveClientField(
  client: ClientRecord,
  ...keys: string[]
): string {
  const cf = client.custom_fields || {};
  for (const key of keys) {
    const top = (client as Record<string, any>)[key];
    if (top && typeof top === "string" && top.trim()) return top.trim();
    const cust = cf[key];
    if (cust && typeof cust === "string" && cust.trim()) return cust.trim();
  }
  return "";
}

