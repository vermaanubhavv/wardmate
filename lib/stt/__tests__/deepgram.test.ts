import { afterEach, describe, expect, it, vi } from "vitest";
import { DeepgramTranscriber } from "../deepgram";
import { MEDICAL_KEYTERMS } from "../types";
import { MAX_KEYTERMS } from "@/lib/transcription/buildDeepgramUrl";

const OK_BODY = JSON.stringify({
  results: { channels: [{ alternatives: [{ transcript: "Bed five is afebrile." }] }] },
});

describe("DeepgramTranscriber", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends audio to Nova-3 Medical in en-IN, falling back to the ward keyterms", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(OK_BODY, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new DeepgramTranscriber("dg-test-key").transcribe(
      new Blob(["audio"], { type: "audio/webm" }),
      "prose hint the engine cannot use"
    );

    expect(result).toEqual({
      text: "Bed five is afebrile.",
      provider: "deepgram",
      model: "nova-3-medical",
    });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe("https://api.deepgram.com/v1/listen");
    expect(url.searchParams.get("model")).toBe("nova-3-medical");
    expect(url.searchParams.get("language")).toBe("en-IN");
    expect(url.searchParams.get("smart_format")).toBe("true");

    // The fallback list, deduped and held to the application safety cap.
    const sent = url.searchParams.getAll("keyterm");
    expect(sent.length).toBe(Math.min(MAX_KEYTERMS, MEDICAL_KEYTERMS.length));
    expect(sent).toEqual(MEDICAL_KEYTERMS.slice(0, sent.length));

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Token dg-test-key",
      "Content-Type": "audio/webm",
    });
  });

  it("uses the patient-selected keyterms when they are passed, as repeated params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(OK_BODY, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const keyterms = ["acute pancreatitis", "Ranson's criteria", "CECT abdomen"];
    await new DeepgramTranscriber("k").transcribe(new Blob(["a"], { type: "audio/webm" }), "hint", {
      keyterms,
    });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.getAll("keyterm")).toEqual(keyterms);
    // no comma-joined list, no legacy weights
    expect(url.search).not.toMatch(/keyterm=[^&]*(%2C|,)[^&]*(%2C|,)/);
    expect(url.search).not.toMatch(/keyterm=[^&]*%3A\d/);
  });

  it("falls back to audio/webm when the blob has no type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(OK_BODY, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await new DeepgramTranscriber("dg-test-key").transcribe(new Blob(["audio"]), "hint");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ "Content-Type": "audio/webm" });
  });

  it("keeps Deepgram's response detail when a request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response('{"err_msg":"bad audio"}', { status: 400 }))
    );

    await expect(
      new DeepgramTranscriber("dg-test-key").transcribe(new Blob(["audio"]), "hint")
    ).rejects.toThrow(/Deepgram speech-to-text failed \(400\).*bad audio/);
  });

  it("returns empty text when Deepgram hears nothing, without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ results: { channels: [{ alternatives: [{ transcript: "" }] }] } }),
          { status: 200 }
        )
      )
    );

    const result = await new DeepgramTranscriber("k").transcribe(new Blob(["a"]), "hint");
    expect(result.text).toBe("");
  });
});
