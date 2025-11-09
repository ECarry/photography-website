import { auth } from "@/modules/auth/lib/auth";
import SecurityAccessCard from "@/modules/auth/ui/components/security-access-card";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Security & Access",
};

const ProfilePage = async () => {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]).catch(() => {
    throw redirect("/sign-in");
  });

  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Access & Security</h1>
        <p className="text-xs text-muted-foreground">
          Manage the devices logged in your account & Profile information
        </p>
        <SecurityAccessCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
