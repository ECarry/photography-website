import { redirect } from "next/navigation";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { getSession } from "@/modules/auth/lib/get-session";
import { isFirstUserRegistrationAvailable } from "@/modules/auth/lib/registration";

const page = async () => {
  const session = await getSession();

  if (!!session) {
    redirect("/dashboard");
  }

  const canRegister = await isFirstUserRegistrationAvailable();

  return <SignInView canRegister={canRegister} />;
};

export default page;
