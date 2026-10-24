import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApertureSelector } from "../aperture-selector";
import { ShutterSpeedSelector } from "../shutter-speed-selector";
import { ISOSelector } from "../iso-selector";
import { ExposureCompensationSelector } from "../exposure-compensation-selector";

vi.unmock("react");

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

const selectors = [
  { name: "aperture", Component: ApertureSelector, value: 2.3 },
  { name: "shutter speed", Component: ShutterSpeedSelector, value: 0.7 },
  { name: "ISO", Component: ISOSelector, value: 123 },
  { name: "exposure compensation", Component: ExposureCompensationSelector, value: 0.5 },
];

describe.each(selectors)("$name layout", ({ Component, value }) => {
  it("fills its grid column without an intrinsic minimum width", () => {
    const html = renderToStaticMarkup(React.createElement(Component, { onChange: vi.fn() }));
    const trigger = html.match(/<button[^>]*role="combobox"[^>]*>/)?.[0];
    expect(trigger).toContain("w-full");
    expect(trigger).toContain("min-w-0");
  });

  it("places custom input actions on a separate row and preserves the value", () => {
    const onChange = vi.fn();
    const html = renderToStaticMarkup(React.createElement(Component, { value, onChange }));
    expect(html).toContain("grid-cols-");
    const cancel = html.match(/<button[^>]*>Cancel<\/button>/)?.[0];
    expect(cancel).toContain("col-span-2");
    expect(html).toContain(`value="${value}"`);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("ShutterSpeedSelector EXIF values", () => {
  it("recognizes a common 1/180s exposure value", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShutterSpeedSelector, {
        value: 1 / 180,
        onChange: vi.fn(),
      }),
    );

    expect(html).toContain("1/180");
    expect(html).not.toContain('aria-label="Custom shutter speed in seconds"');
  });

  it("rounds custom numeric display without changing the stored value", () => {
    const onChange = vi.fn();
    const exposureTime = 0.0054321987;
    const html = renderToStaticMarkup(
      React.createElement(ShutterSpeedSelector, {
        value: exposureTime,
        onChange,
      }),
    );

    expect(html).toContain('value="0.005432"');
    expect(onChange).not.toHaveBeenCalled();
  });
});
