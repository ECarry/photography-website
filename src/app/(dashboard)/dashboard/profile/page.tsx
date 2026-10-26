import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SecurityAccessCard from "@/modules/auth/ui/components/security-access-card";

export const metadata = {
  title: "Security & Access",
};

const ProfilePage = async () => {
  const requestHeaders = await headers();
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: requestHeaders,
    }),
    auth.api.listSessions({
      headers: requestHeaders,
    }),
  ]).catch(() => {
    throw redirect("/sign-in");
  });

  if (!session) redirect("/sign-in");

  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-7 md:px-6 md:py-8 xl:px-8">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
              ACCOUNT
            </p>
            <h1 className="mt-2 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
              Profile & security
            </h1>
            <p className="mt-1 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
              Manage your identity, password, and signed-in devices.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#398E4A]"
            />
            Signed in as {session.user.email}
          </div>
        </header>
        <SecurityAccessCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
      </div>
    </main>
  );
};

export default ProfilePage;
