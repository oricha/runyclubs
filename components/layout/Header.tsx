import { auth } from "@/auth";

import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const session = await auth();
  return <HeaderClient session={session} />;
}
