import { describe, it, expect } from "vitest";
import { buildBroadcastPayload } from "@/lib/newsletter/broadcast";
import issue002 from "./fixtures/sample-issue";

describe("buildBroadcastPayload", () => {
  const payload = buildBroadcastPayload(issue002, "<html>hi</html>", {
    audienceId: "aud_123",
    from: "The Build Log <newsletter@aibuilders.mx>",
    replyTo: "hola@aibuilders.mx",
  });

  it("maps issue + opts to Resend fields", () => {
    expect(payload.audienceId).toBe("aud_123");
    expect(payload.from).toBe("The Build Log <newsletter@aibuilders.mx>");
    expect(payload.subject).toBe(issue002.subject);
    expect(payload.html).toBe("<html>hi</html>");
    expect(payload.replyTo).toBe("hola@aibuilders.mx");
  });

  it("names the broadcast with a stable, issue-derived name", () => {
    expect(payload.name).toBe("The Build Log 002");
  });

  it("omits replyTo when not provided", () => {
    const p = buildBroadcastPayload(issue002, "x", {
      audienceId: "a",
      from: "f",
    });
    expect("replyTo" in p).toBe(false);
  });
});
