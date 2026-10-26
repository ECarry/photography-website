"use client";

// External dependencies
import { useState } from "react";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";

// Internal dependencies - UI Components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Globe, Clock, Monitor, Loader2, ShieldCheck } from "lucide-react";
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
  const sessions = props.activeSessions.filter((session) => session.userAgent);

  return (
    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="min-w-0">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#8F8F8F]" />
          <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
            Account
          </h2>
        </div>
        <ProfileForm />
      </section>

      <section className="min-w-0 rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
              Active sessions
            </h2>
            <p className="mt-1 text-xs text-[#8F8F8F]">
              Devices currently signed in to your account.
            </p>
          </div>
          <span className="shrink-0 text-xs tabular-nums text-[#8F8F8F]">
            {sessions.length}
          </span>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => {
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
                <article
                  key={session.id}
                  className="flex min-w-0 items-start gap-3 rounded-lg bg-[#FAFAFA] p-3 dark:bg-[#0A0A0A] sm:items-center sm:p-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-[#4D4D4D] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] dark:text-[#B3B3B3]">
                    <DeviceIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="truncate text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
                        {deviceDescription}
                      </h3>
                      {isCurrentSession && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-[#398E4A]"
                          />
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8F8F8F]">
                      {browser.name && (
                        <span className="inline-flex items-center gap-1">
                          <Globe className="size-3.5" />
                          {browser.name} {browser.version?.split(".")[0]}
                        </span>
                      )}
                      {os.name && (
                        <span className="inline-flex items-center gap-1">
                          <Monitor className="size-3.5" />
                          {os.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatLastActive(session.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 rounded-md px-2 text-xs text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
                    disabled={isTerminating === session.id}
                    onClick={async () => {
                      setIsTerminating(session.id);
                      try {
                        const res = await authClient.revokeSession({
                          token: session.token,
                        });
                        if (res.error) {
                          toast.error(res.error.message);
                        } else {
                          toast.success(
                            isCurrentSession
                              ? "Signed out successfully"
                              : "Session terminated",
                          );
                          router.refresh();
                        }
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Could not terminate session",
                        );
                      } finally {
                        setIsTerminating(undefined);
                      }
                    }}
                  >
                    {isTerminating === session.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isCurrentSession ? (
                      "Sign out"
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg bg-[#FAFAFA] px-4 py-6 text-sm text-[#8F8F8F] dark:bg-[#0A0A0A]">
            No session details are available.
          </p>
        )}
      </section>
    </div>
  );
};

export default SecurityAccessCard;
