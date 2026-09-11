import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { IMAGE_SIZE_LIMIT } from "@/constants";
import { UploadZone } from "../upload-zone";

vi.unmock("react");
vi.mock("react-dropzone", () => ({ useDropzone: vi.fn() }));

let options: DropzoneOptions;

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.mocked(useDropzone).mockImplementation((config) => {
    options = config!;
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      open: vi.fn(),
      isDragActive: false,
      isDragReject: false,
    } as unknown as ReturnType<typeof useDropzone>;
  });
});

afterEach(() => vi.unstubAllGlobals());

function render(isUploading = false, uploadProgress = 0) {
  return renderToStaticMarkup(
    React.createElement(UploadZone, {
      isUploading,
      uploadProgress,
      onUpload: vi.fn(),
    }),
  );
}

describe("UploadZone", () => {
  it("rejects oversized files before upload and only accepts one photo", () => {
    render();
    expect(options.maxSize).toBe(IMAGE_SIZE_LIMIT);
    expect(options.multiple).toBe(false);
    expect(options.onDropRejected).toBeTypeOf("function");
  });

  it("disables all dropzone interactions during upload", () => {
    render(true, 42);
    expect(options.disabled).toBe(true);
  });

  it("provides accessible upload progress", () => {
    const html = render(true, 42);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="42"');
    expect(html).toContain("42%");
  });
});
