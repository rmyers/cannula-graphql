import { html, fixture, expect, waitUntil } from "@open-wc/testing";
import UILibrary from "../../src/index";

describe("toast-element", async () => {
  beforeEach(async () => {
    await UILibrary.initialize();
  });

  it("renders with default properties", async () => {
    const el = await fixture(html`<toast-element></toast-element>`);
    expect(el).to.exist;
  });

  it("shows and hides toast", async () => {
    const el = await fixture(
      html`<toast-element message="Test Message"></toast-element>`,
    );

    // Initially hidden
    expect(el.classList.contains("visible")).to.be.false;

    // Show the toast
    el.show();
    expect(el.classList.contains("visible")).to.be.true;

    // Hide the toast
    el.hide();
    expect(el.classList.contains("visible")).to.be.false;
  });

  it("auto-hides after duration", async () => {
    const el = await fixture(html`
      <toast-element message="Auto Hide Test" duration="100" auto-hide="true">
      </toast-element>
    `);

    el.show();
    expect(el.classList.contains("visible")).to.be.true;

    // Wait for auto-hide
    await waitUntil(
      () => !el.classList.contains("visible"),
      "Toast should auto-hide",
    );
  });

  it("displays correct message", async () => {
    const testMessage = "Hello World";
    const el = await fixture(html`
      <toast-element message="${testMessage}"></toast-element>
    `);

    const messageEl = el.shadowRoot.querySelector(".message");
    expect(messageEl.textContent).to.equal(testMessage);
  });

  it("applies the correct type class", async () => {
    const el = await fixture(
      html`<toast-element type="success"></toast-element>`,
    );
    expect(el.classList.contains("success")).to.be.true;
  });
});
