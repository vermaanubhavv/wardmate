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

// Deliberately still the old name. A phone may be holding recordings that were made offline
// and never sent; renaming the database would orphan them somewhere nobody would ever look.
// A rebrand is not worth losing a round.
const DB_NAME = "coreresident-outbox";
const STORE = "pending";
/** Live chunks of a recording still in progress — written a second at a time as it is spoken,
 *  so a hard kill that fires no pagehide (an out-of-memory kill, a force-quit) still leaves
 *  every second but the last on the phone. Assembled into a normal `pending` item on next
 *  open. Cleared the moment the finished recording is saved the ordinary way. */
const CHUNKS = "chunks";
const VERSION = 2;

export type PendingKind = "round" | "bedside" | "case-history";

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
      // Never dropped or recreated: a phone upgrading from v1 may be holding recordings made
      // offline and not yet sent.
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(CHUNKS)) {
        const s = db.createObjectStore(CHUNKS, { keyPath: ["recId", "seq"] });
        s.createIndex("recId", "recId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
  store: string = STORE
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      })
  );
}

function chunkStoreTx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const t = db.transaction(CHUNKS, mode);
        const req = run(t.objectStore(CHUNKS));
        t.oncomplete = () => {
          db.close();
          resolve(req ? req.result : undefined);
        };
        t.onerror = () => reject(t.error);
      })
  );
}

type ChunkRow = {
  recId: string;
  seq: number;
  blob: Blob;
  meta: Omit<Pending, "id" | "queuedAt" | "attempts" | "audio">;
};

/** Append one timeslice of a recording still in progress. */
export async function putChunk(
  recId: string,
  seq: number,
  blob: Blob,
  meta: ChunkRow["meta"]
): Promise<void> {
  try {
    await chunkStoreTx("readwrite", (s) => {
      s.put({ recId, seq, blob, meta } satisfies ChunkRow);
    });
  } catch {
    // Storage full or unavailable — the in-memory chunks and the save-on-stop path still hold.
  }
}

/** Drop a recording's live chunks — called once it has been saved the ordinary way. */
export async function clearChunks(recId: string): Promise<void> {
  try {
    await chunkStoreTx("readwrite", (s) => {
      const idx = s.index("recId");
      const cur = idx.openCursor(IDBKeyRange.only(recId));
      cur.onsuccess = () => {
        const c = cur.result;
        if (c) {
          c.delete();
          c.continue();
        }
      };
    });
  } catch {
    // Nothing to clear, or no database.
  }
}

/**
 * Recordings that have live chunks but never finished — the recorder was killed before it
 * could save. Each is assembled into a Pending so the ordinary queue can send it. Excludes
 * any recId already in `pending` (that one finished; its chunks are just not cleared yet).
 */
export async function recoverInterruptedChunks(): Promise<Pending[]> {
  let rows: ChunkRow[];
  try {
    rows = (await chunkStoreTx<ChunkRow[]>("readonly", (s) => s.getAll() as IDBRequest<ChunkRow[]>)) ?? [];
  } catch {
    return [];
  }
  if (rows.length === 0) return [];

  const pendingIds = new Set((await listPending()).map((p) => p.id));
  const byRec = new Map<string, ChunkRow[]>();
  const staleRecs = new Set<string>();
  for (const r of rows) {
    if (pendingIds.has(r.recId)) {
      // That recording finished and is already queued the ordinary way — its chunks are just
      // leftovers.
      staleRecs.add(r.recId);
      continue;
    }
    const group = byRec.get(r.recId);
    if (group) group.push(r);
    else byRec.set(r.recId, [r]);
  }
  for (const recId of staleRecs) await clearChunks(recId);

  const recovered: Pending[] = [];
  for (const [recId, group] of byRec) {
    group.sort((a, b) => a.seq - b.seq);
    const mime = group[0].meta.mimeType;
    const blob = new Blob(group.map((g) => g.blob), { type: mime });
    if (blob.size < 1000) {
      await clearChunks(recId);
      continue;
    }
    const item = await saveRecording(recId, { ...group[0].meta, audio: blob });
    recovered.push(item);
    await clearChunks(recId);
  }
  return recovered;
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

/**
 * Save a recording under a caller-chosen id, replacing any earlier save of the same id.
 *
 * A recorder writes its audio here BEFORE it tries to upload — so a phone that is locked,
 * backgrounded and killed mid-upload has already kept the words — and deletes it again with
 * dropRecording() once the server has confirmed receipt. Using put() (not add()) means a
 * salvage on pagehide followed by a normal save is one row, not two.
 */
export async function saveRecording(
  id: string,
  item: Omit<Pending, "id" | "queuedAt" | "attempts">
) {
  const full: Pending = { ...item, id, queuedAt: new Date().toISOString(), attempts: 0 };
  await tx("readwrite", (s) => s.put(full));
  return full;
}

/** Drop a recording once the server has it — the counterpart to saveRecording(). Silent if
 *  it was already sent and removed. */
export async function dropRecording(id: string) {
  try {
    await remove(id);
  } catch {
    // Already gone, or no database. Nothing waiting to send is the outcome either way.
  }
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

/**
 * Recordings a recorder is uploading itself, right now, in this tab.
 *
 * A recorder saves its audio here before it uploads (so a crash mid-upload loses nothing) and
 * drops it on success. In the gap between, flush() must not also send it — that is how one
 * recording becomes two observations. This set is that interlock. It is in-memory and
 * per-tab: after a reload the inline upload is gone too, so the row is genuinely flush's to
 * send.
 */
const inFlight = new Set<string>();
export function markInFlight(id: string) {
  inFlight.add(id);
}
export function clearInFlight(id: string) {
  inFlight.delete(id);
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
  // Skip anything a recorder is uploading itself right now — it will drop it on success.
  const items = (await listPending()).filter((i) => !inFlight.has(i.id));

  for (const item of items) {
    // The transcriber picks its decoder from the file extension, so a queued recording has to
    // carry one — an extensionless "audio" is how a webm gets fed to an mp4 decoder and comes
    // back blank.
    const ext = item.mimeType.includes("mp4")
      ? "m4a"
      : item.mimeType.includes("mpeg")
        ? "mp3"
        : item.mimeType.includes("ogg")
          ? "ogg"
          : "webm";
    const form = new FormData();
    form.append("audio", new File([item.audio], `audio.${ext}`, { type: item.mimeType }));
    if (item.patientId) form.append("patient_id", item.patientId);
    // The item id is the recording's id, chosen when it was recorded. Sent so the server can
    // recognise a recording it already processed — the queue and a recorder's own upload can
    // both reach it, and a kill between "server has it" and "row deleted" sends it again.
    form.append("client_uuid", item.id);

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
