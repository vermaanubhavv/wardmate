import { afterEach, describe, expect, it, vi } from "vitest";
import { DeepgramTranscriber } from "../deepgram";
import { MEDICAL_KEYTERMS } from "../types";

const OK_BODY = JSON.stringify({
  results: { channels: [{ alternatives: [{ transcript: "Bed five is afebrile." }] }] },
});

describe("DeepgramTranscriber", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends audio to Nova-3 Medical with the ward keyterms and returns its transcript", async () => {
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
    expect(url.searchParams.get("language")).toBe("en");
    expect(url.searchParams.getAll("keyterm")).toEqual(MEDICAL_KEYTERMS);

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Token dg-test-key",
      "Content-Type": "audio/webm",
    });
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
