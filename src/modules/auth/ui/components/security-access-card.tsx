"use client";

// External dependencies
import { useState } from "react";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";

// Internal dependencies - UI Components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dot, Laptop, Loader2, Smartphone } from "lucide-react";
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

  return (
    <div className="mt-6 space-y-8">
      {/* Active Sessions Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Active sessions</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Manage devices logged into your account
        </p>

        <div className="space-y-4">
          {props.activeSessions
            .filter((session) => session.userAgent)
            .map((session) => {
              const userAgent = new UAParser(session.userAgent || "");
              const isCurrentSession = session.id === props.session?.session.id;
              const deviceType = userAgent.getDevice().type;
              const isMobile = deviceType === "mobile";

              return (
                <Card
                  key={session.id}
                  className="overflow-hidden border border-border"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                        {isMobile ? (
                          <Smartphone
                            size={24}
                            className="text-gray-700 dark:text-gray-300"
                          />
                        ) : (
                          <Laptop
                            size={24}
                            className="text-gray-700 dark:text-gray-300"
                          />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">
                            {isMobile ? "Mobile app" : "Desktop app on macOS"}
                          </h3>
                          {isCurrentSession && (
                            <span className="ml-2 text-xs text-green-600 flex items-center">
                              <Dot size={20} className="text-green-500" />
                              Current session
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
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
                          <Loader2 size={15} className="animate-spin" />
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
      <div>
        <h2 className="text-xl font-semibold mb-2">Account Management</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Manage your account information
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <ChangePassword />
            <EditUserDialog />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAccessCard;
