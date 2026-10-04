import { CONTACT_FORM_URL } from "../frontend/src/config";

describe("config", () => {
  it("CONTACT_FORM_URL is a published Google Form responder link", () => {
    expect(CONTACT_FORM_URL).toMatch(
      /^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform$/,
    );
  });
});
