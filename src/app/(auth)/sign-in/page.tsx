import { redirect } from "next/navigation";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { getSession } from "@/modules/auth/lib/get-session";

const page = async () => {
  const session = await getSession();

  if (!!session) {
    redirect("/");
  }

  return <SignInView />;
};

export default page;
