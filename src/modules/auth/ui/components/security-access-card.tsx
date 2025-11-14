"use client";

// External dependencies
import { useState } from "react";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";

// Internal dependencies - UI Components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dot,
  Laptop,
  Loader2,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Types
import { Session } from "../../lib/auth-types";

import ChangePassword from "./dialogs/change-password";
import EditUserDialog from "./dialogs/edit-user";
import { authClient } from "../../lib/auth-client";

const SecurityAccessCard = (props: {
  session: Session | null;
  activeSessions: Session["session"][];
}) => {
  const router = useRouter();
  const [isTerminating, setIsTerminating] = useState<string>();

  const formatLastActive = (createdAt: string) => {
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

  const getDeviceIcon = (
    userAgent: UAParser.IResult,
    deviceType: string | undefined
  ) => {
    const os = userAgent.getOS().name?.toLowerCase();

    if (deviceType === "mobile" || deviceType === "tablet") {
      return deviceType === "tablet" ? Tablet : Smartphone;
    }

    if (os?.includes("mac")) return Laptop;
    if (os?.includes("windows")) return Monitor;

    return Laptop;
  };

  const getDeviceDescription = (
    userAgent: UAParser.IResult,
    deviceType: string | undefined
  ) => {
    const browser = userAgent.getBrowser();
    const os = userAgent.getOS();
    const device = userAgent.getDevice();

    if (deviceType === "mobile") {
      return `${device.vendor || "Mobile"} ${device.model || "Device"}`;
    }

    if (deviceType === "tablet") {
      return `${device.vendor || "Tablet"} ${device.model || "Device"}`;
    }

    return `${browser.name || "Browser"} on ${os.name || "Desktop"}`;
  };

  return (
    <div className="space-y-8">
      {/* Active Sessions Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-1">
            Active Sessions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage devices signed into your account
          </p>
        </div>

        <div className="space-y-2">
          {props.activeSessions
            .filter((session) => session.userAgent)
            .map((session) => {
              const userAgent = new UAParser(session.userAgent || "");
              const isCurrentSession = session.id === props.session?.session.id;
              const deviceType = userAgent.getDevice().type;
              const DeviceIcon = getDeviceIcon(userAgent, deviceType);
              const deviceDescription = getDeviceDescription(
                userAgent,
                deviceType
              );
              const browser = userAgent.getBrowser();
              const os = userAgent.getOS();

              return (
                <Card
                  key={session.id}
                  className={`overflow-hidden transition-all duration-200 hover:shadow-sm ${
                    isCurrentSession
                      ? "ring-1 ring-primary/30 border-primary/40 bg-primary/5"
                      : "border hover:border-primary/20"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Device Icon */}
                      <div
                        className={`p-2 rounded-lg flex items-center justify-center ${
                          isCurrentSession
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <DeviceIcon size={18} />
                      </div>

                      {/* Device Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {deviceDescription}
                          </h3>
                          {isCurrentSession && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700 border-green-200 px-1.5 py-0.5"
                            >
                              <Dot className="w-2 h-2 mr-0.5 fill-current" />
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {browser.name && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span className="truncate">
                                {browser.name} {browser.version?.split(".")[0]}
                              </span>
                            </div>
                          )}

                          {os.name && (
                            <div className="flex items-center gap-1">
                              <Monitor className="w-3 h-3" />
                              <span className="truncate">{os.name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastActive(session.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant={isCurrentSession ? "default" : "outline"}
                        size="sm"
                        className="h-8 px-3 text-xs min-w-[80px]"
                        onClick={async () => {
                          setIsTerminating(session.id);
                          const res = await authClient.revokeSession({
                            token: session.token,
                          });

                          if (res.error) {
                            toast.error(res.error.message);
                          } else {
                            toast.success(
                              isCurrentSession
                                ? "Signed out successfully"
                                : "Session terminated successfully"
                            );
                          }
                          router.refresh();
                          setIsTerminating(undefined);
                        }}
                      >
                        {isTerminating === session.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isCurrentSession ? (
                          "Sign Out"
                        ) : (
                          "Terminate"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Account Management */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-1">
            Account Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your account settings and security preferences
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ChangePassword />
              <EditUserDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityAccessCard;
