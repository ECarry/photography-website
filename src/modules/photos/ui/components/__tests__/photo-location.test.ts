import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UseFormProps, UseFormReturn } from "react-hook-form";
import type { MapboxProps } from "@/modules/mapbox/ui/components/map";
import { useGetAddress } from "@/modules/mapbox/hooks/use-get-address";
import { ThirdStep } from "../multi-step-form/steps/third-step";
import type { ThirdStepData } from "../multi-step-form/types";

const captured = vi.hoisted(() => ({
  map: undefined as MapboxProps | undefined,
  submit: undefined as (() => unknown) | undefined,
}));

vi.unmock("react");
vi.mock("next/dynamic", () => ({
  default: () => (props: MapboxProps) => {
    captured.map = props;
    return null;
  },
}));
vi.mock("@/modules/mapbox/hooks/use-get-address", () => ({
  useGetAddress: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}));
vi.mock("react-hook-form", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-hook-form")>();
  return {
    ...actual,
    useForm: (options: UseFormProps<ThirdStepData>) => {
      const form = actual.useForm<ThirdStepData>(options);
      const values = { ...options.defaultValues } as ThirdStepData;
      const setValue: UseFormReturn<ThirdStepData>["setValue"] = (name, value, config) => {
        values[name] = value;
        form.setValue(name, value, config);
      };
      const handleSubmit: UseFormReturn<ThirdStepData>["handleSubmit"] = (onValid, onInvalid) => {
        captured.submit = () => onValid(values);
        return form.handleSubmit(onValid, onInvalid);
      };
      return { ...form, handleSubmit, setValue };
    },
  };
});

beforeEach(() => {
  vi.stubGlobal("React", React);
  captured.map = undefined;
  captured.submit = undefined;
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllGlobals());

function render(initialData: ThirdStepData = {}) {
  const onNext = vi.fn();
  renderToStaticMarkup(React.createElement(ThirdStep, { initialData, onNext }));
  return onNext;
}

describe("photo location selection", () => {
  it("does not submit or reverse-geocode a default location for a photo without GPS", () => {
    const onNext = render();
    expect(captured.map?.draggableMarker).toBe(true);
    expect(useGetAddress).toHaveBeenCalledWith({ lat: null, lng: null });
    captured.submit?.();
    expect(onNext).toHaveBeenCalledWith({ latitude: undefined, longitude: undefined });
  });

  it.each([{ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 116 }, { latitude: 39, longitude: 0 }])(
    "preserves valid zero coordinates: %j",
    (location) => {
      const onNext = render(location);
      expect(captured.map?.markers).toEqual([{ id: "location", latitude: location.latitude, longitude: location.longitude }]);
      expect(captured.map?.initialViewState).toMatchObject(location);
      captured.submit?.();
      expect(onNext).toHaveBeenCalledWith(location);
    },
  );

  it("updates both submitted coordinates after dragging the temporary marker", () => {
    const onNext = render();
    captured.map?.onMarkerDragEnd?.("location", { lat: 0, lng: 120 });
    captured.submit?.();
    expect(onNext).toHaveBeenCalledWith({ latitude: 0, longitude: 120 });
  });
});
