import { afterEach, describe, expect, it, vi } from "vitest";
import { SarvamTranscriber } from "../sarvam";

describe("SarvamTranscriber", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends Indian-English audio to Sarvam and returns its transcript", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ transcript: "Bed five is afebrile." }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new SarvamTranscriber("sarvam-test-key").transcribe(
      new Blob(["audio"], { type: "audio/webm" }),
      "medical words"
    );

    expect(result).toEqual({
      text: "Bed five is afebrile.",
      provider: "sarvam",
      model: "saaras:v3",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.sarvam.ai/speech-to-text",
      expect.objectContaining({
        method: "POST",
        headers: { "api-subscription-key": "sarvam-test-key" },
      })
    );

    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const form = request.body as FormData;
    expect(form.get("model")).toBe("saaras:v3");
    expect(form.get("mode")).toBe("transcribe");
    expect(form.get("language_code")).toBe("en-IN");
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("keeps Sarvam's response detail when a request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response('{"error":{"message":"audio over 30 seconds"}}', { status: 422 }))
    );

    await expect(
      new SarvamTranscriber("sarvam-test-key").transcribe(new Blob(["audio"]), "medical words")
    ).rejects.toThrow(/Sarvam speech-to-text failed \(422\).*audio over 30 seconds/);
  });
});
