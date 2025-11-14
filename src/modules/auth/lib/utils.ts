import { Laptop, Smartphone, Monitor, Tablet } from "lucide-react";
import { UAParser } from "ua-parser-js";

export const formatLastActive = (createdAt: Date) => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Active now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const getDeviceIcon = (
  parser: UAParser,
  deviceType: string | undefined
) => {
  const os = parser.getOS().name?.toLowerCase();

  if (deviceType === "mobile" || deviceType === "tablet") {
    return deviceType === "tablet" ? Tablet : Smartphone;
  }

  if (os?.includes("mac")) return Laptop;
  if (os?.includes("windows")) return Monitor;

  return Laptop;
};

export const getDeviceDescription = (
  parser: UAParser,
  deviceType: string | undefined
) => {
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  if (deviceType === "mobile") {
    return `${device.vendor || "Mobile"} ${device.model || "Device"}`;
  }

  if (deviceType === "tablet") {
    return `${device.vendor || "Tablet"} ${device.model || "Device"}`;
  }

  return `${browser.name || "Browser"} on ${os.name || "Desktop"}`;
};
