import {
  POST,
  CDVCommandRequest,
  CDVCommandResponse,
} from "@/app/api/cdv/route";

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

  it("returns 200 with program, curried number & parameter", async () => {
    // Arrange
    const body: Partial<CDVCommandRequest> = {
      program: "(mod (a b) (* a b))",
      curry: [2],
      solution: [23],
    }; // Missing 'program'
    const req = new Request("http://localhost/api/cdv", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    // Act
    const res = await POST(req);
    const json = (await res.json()) as CDVCommandResponse;

    // Assert
    expect(res.status).toBe(200);
    expect(json.errormessage).toBe("");
    expect(json.output).toBe("46");
    expect(json.curriedBytecode).toBe("(a (q 18 2 5) (c (q . 2) 1))");
  });

  //currying a string parameter
  //currying an integer parameter
  //currying a byte
  //passing in string parameter & curried parameter
  //passing in number parameter & curried parameter
  //passing in byte[] parameter & curried parameter
  //assert a few puzzle bytecodes
});
