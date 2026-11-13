import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearInFlight,
  flush,
  listWaiting,
  markInFlight,
  putChunk,
  recoverInterruptedChunks,
  saveRecording,
} from "../outbox";

/**
 * The offline queue against a real (in-memory) IndexedDB. These are the three promises the
 * connection bar makes: a recording killed mid-sentence is recovered on the next open, nothing
 * is ever sent twice, and the queue is still there after a refresh.
 */

const meta = { kind: "bedside" as const, url: "/api/entries/voice", label: "Bedside note", patientId: "p1", mimeType: "audio/mp4" };
const second = () => new Blob([new Uint8Array(600)], { type: "audio/mp4" });

const fetchMock = vi.fn();

beforeEach(() => {
  // The outbox announces changes to the connection bar; there is no window in node.
  vi.stubGlobal("window", { dispatchEvent: () => true });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  indexedDB = new IDBFactory();
});
afterEach(() => vi.unstubAllGlobals());

const ok = () => fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

describe("record offline → app killed → reopened → sync on reconnect", () => {
  it("reassembles the live chunks into one queued recording and sends it once the signal is back", async () => {
    // Three seconds spoken, written a second at a time; the recorder dies before saveRecording.
    await putChunk("r1", 0, second(), meta);
    await putChunk("r1", 1, second(), meta);
    await putChunk("r1", 2, second(), meta);

    // Next open: the connection bar recovers.
    const recovered = await recoverInterruptedChunks();
    expect(recovered.map((r) => r.id)).toEqual(["r1"]);
    expect(recovered[0].audio?.size).toBe(1800);
    expect((await listWaiting()).map((w) => w.id)).toEqual(["r1"]);
    // Recovering twice does not queue it twice: the chunks were cleared.
    expect(await recoverInterruptedChunks()).toEqual([]);

    // No signal: the flush stops, nothing is marked refused.
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await flush()).toEqual({ sent: 0, failed: 1, reviews: [], late: [], patients: [] });
    expect((await listWaiting())[0].attempts).toBe(0);

    // Signal back: sent, with the recording's own id for the server's duplicate check.
    ok();
    expect(await flush()).toEqual({ sent: 1, failed: 0, reviews: [], late: [], patients: [] });
    const form = fetchMock.mock.calls[1][1].body as FormData;
    expect(form.get("client_uuid")).toBe("r1");
    expect(form.get("patient_id")).toBe("p1");
    expect(await listWaiting()).toEqual([]);
  });

  it("drops leftover chunks of a recording that did finish, instead of queuing it a second time", async () => {
    await putChunk("r2", 0, second(), meta);
    await putChunk("r2", 1, second(), meta);
    await saveRecording("r2", { ...meta, audio: new Blob([new Uint8Array(1200)]) });
    expect(await recoverInterruptedChunks()).toEqual([]);
    expect((await listWaiting()).map((w) => w.id)).toEqual(["r2"]);
  });

  it("throws away a fragment too short to hold a word", async () => {
    await putChunk("r3", 0, new Blob([new Uint8Array(100)]), meta);
    expect(await recoverInterruptedChunks()).toEqual([]);
    expect(await listWaiting()).toEqual([]);
  });
});

describe("duplicate-sync protection", () => {
  it("the queue never sends a recording its recorder is uploading right now", async () => {
    await saveRecording("r4", { ...meta, audio: new Blob([new Uint8Array(1200)]) });
    markInFlight("r4");
    ok();
    expect(await flush()).toEqual({ sent: 0, failed: 0, reviews: [], late: [], patients: [] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await listWaiting())[0].sending).toBe(true);

    // The upload gave up: the row is the queue's to send — once.
    clearInFlight("r4");
    expect(await flush()).toEqual({ sent: 1, failed: 0, reviews: [], late: [], patients: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await listWaiting()).toEqual([]);
  });

  it("a recording the server refused is kept but not retried until the resident asks", async () => {
    await saveRecording("r5", { ...meta, audio: new Blob([new Uint8Array(1200)]) });
    fetchMock.mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "No audio" }) });
    expect(await flush()).toEqual({ sent: 0, failed: 1, reviews: [], late: [], patients: [] });
    expect((await listWaiting())[0].attempts).toBe(1);
    expect(await flush()).toEqual({ sent: 0, failed: 0, reviews: [], late: [], patients: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    ok();
    expect(await flush({ retryRefused: true })).toEqual({ sent: 1, failed: 0, reviews: [], late: [], patients: [] });
  });
});

describe("the queue survives a refresh", () => {
  it("a fresh connection to the database still lists what was saved, oldest first", async () => {
    await saveRecording("late", { ...meta, audio: new Blob([new Uint8Array(1200)]) });
    await new Promise((r) => setTimeout(r, 5));
    await saveRecording("early", { ...meta, audio: new Blob([new Uint8Array(1200)]) });
    // Every call opens the database afresh and closes it — exactly what a reloaded tab does.
    const ids = (await listWaiting()).map((w) => w.id);
    expect(ids).toEqual(["late", "early"]);
    // Saving under the same id again replaces, never duplicates (the pagehide salvage case).
    await saveRecording("late", { ...meta, audio: new Blob([new Uint8Array(1500)]) });
    expect((await listWaiting()).length).toBe(2);
  });
});
