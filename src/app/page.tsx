import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginRoleSwitchView } from "@/components/auth/LoginRoleSwitchView";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ANALYST") {
      redirect("/queue");
    } else {
      redirect("/dashboard");
    }
  }

  return <LoginRoleSwitchView />;
}
