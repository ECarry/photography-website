"use client";

// External dependencies
import { useState } from "react";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";

// Internal dependencies - UI Components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Clock, Dot, Monitor, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/modules/auth/ui/components/profile-form";

// Types
import { Session } from "../../lib/auth-types";
import { authClient } from "../../lib/auth-client";

import {
  formatLastActive,
  getDeviceDescription,
  getDeviceIcon,
} from "../../lib/utils";

const SecurityAccessCard = (props: {
  session: Session | null;
  activeSessions: Session["session"][];
}) => {
  const router = useRouter();
  const [isTerminating, setIsTerminating] = useState<string>();

  return (
    <div className="space-y-8">
      {/* Account Management */}
      <div className="max-w-lg">
        <ProfileForm />
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {props.activeSessions
            .filter((session) => session.userAgent)
            .map((session) => {
              const parser = new UAParser(session.userAgent || "");
              const isCurrentSession = session.id === props.session?.session.id;
              const deviceType = parser.getDevice().type;
              const DeviceIcon = getDeviceIcon(parser, deviceType);
              const deviceDescription = getDeviceDescription(
                parser,
                deviceType
              );
              const browser = parser.getBrowser();
              const os = parser.getOS();

              return (
                <Card
                  key={session.id}
                  className={`overflow-hidden transition-all duration-200 hover:shadow-sm min-w-[400px] ${
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
    </div>
  );
};

export default SecurityAccessCard;
