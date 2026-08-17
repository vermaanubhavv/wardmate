/**
 * Recordings waiting to be sent.
 *
 * The failure this exists to prevent: a resident speaks at a bedside, there is no signal, and
 * the words are gone. Everything else in the app can wait for a connection — a tick, a name,
 * a colour can all be redone from memory five minutes later. What was said at a bedside
 * cannot, because by then the resident has seen four more patients.
 *
 * So audio is written to IndexedDB the moment the upload fails, and sent later. IndexedDB
 * rather than memory because the tab will be backgrounded and killed; blobs rather than
 * base64 because a three-minute recording is megabytes and doubling that in a string is how
 * a phone runs out of room.
 *
 * Nothing here replays a write on its own in the background. iOS gives a web app no reliable
 * background execution, and a queue that silently re-sent could double-record a drug. The
 * flush runs while the app is open, and its progress is on screen.
 */

const DB_NAME = "coreresident-outbox";
const STORE = "pending";
const VERSION = 1;

export type PendingKind = "round" | "bedside";

export type Pending = {
  id: string;
  kind: PendingKind;
  /** Where it was going. Kept with the item so a future endpoint change cannot misroute old
   *  queued audio into the wrong handler. */
  url: string;
  /** For a bedside recording: whose bed it was. */
  patientId?: string;
  /** Shown in the queue so it is obvious what is waiting, without playing it back. */
  label: string;
  audio: Blob;
  mimeType: string;
  queuedAt: string;
  attempts: number;
};

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      })
  );
}

export async function enqueue(item: Omit<Pending, "id" | "queuedAt" | "attempts">) {
  const full: Pending = {
    ...item,
    id: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };
  await tx("readwrite", (s) => s.add(full));
  return full;
}

export async function listPending(): Promise<Pending[]> {
  const all = await tx<Pending[]>("readonly", (s) => s.getAll() as IDBRequest<Pending[]>);
  // Oldest first: a round is dictated in bed order, and it should arrive in that order.
  return all.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
}

export async function countPending(): Promise<number> {
  try {
    return await tx<number>("readonly", (s) => s.count());
  } catch {
    return 0;
  }
}

async function remove(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}

async function bumpAttempts(item: Pending) {
  await tx("readwrite", (s) => s.put({ ...item, attempts: item.attempts + 1 }));
}

export type FlushResult = {
  sent: number;
  failed: number;
  /** Round dictations that went through and now need reviewing, in the order they were said. */
  reviews: string[];
};

/**
 * Try to send everything waiting.
 *
 * Stops at the first network failure rather than grinding through the rest: if one upload
 * failed for want of signal the next will too, and each attempt spends battery and could
 * partially send a large blob. A failure that is NOT the network — a rejected file, an expired
 * session — is counted and left in place for the next try.
 */
export async function flush(): Promise<FlushResult> {
  const result: FlushResult = { sent: 0, failed: 0, reviews: [] };
  const items = await listPending();

  for (const item of items) {
    const form = new FormData();
    form.append("audio", new File([item.audio], "audio", { type: item.mimeType }));
    if (item.patientId) form.append("patient_id", item.patientId);

    let res: Response;
    try {
      res = await fetch(item.url, { method: "POST", body: form });
    } catch {
      // No connection. Leave this and everything after it for the next attempt.
      result.failed += items.length - result.sent;
      return result;
    }

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (item.kind === "round" && data?.dictation_id) result.reviews.push(data.dictation_id);
      await remove(item.id);
      result.sent += 1;
    } else {
      // The server heard it and refused it. Keep it — a resident may want to know it exists —
      // but stop retrying forever.
      await bumpAttempts(item);
      result.failed += 1;
    }
  }

  return result;
}
