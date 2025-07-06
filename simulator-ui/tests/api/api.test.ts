import { POST, CDVCommandRequest } from "@/app/api/cdv/route";

describe("POST /api/cdv", () => {
  it("returns 400 if program is missing", async () => {
    // Arrange
    const body: Partial<CDVCommandRequest> = {}; // Missing 'program'
    const req = new Request("http://localhost/api/cdv", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    // Act
    const res = await POST(req);

    // Assert
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({
      error: "Missing or invalid 'program'",
    });
  });
});
