import { cookies } from "next/headers";
import prisma from "./db";

export async function getCurrentUser() {
  const userSession = cookies().get("user_session")?.value;

  if (!userSession) return null;

  const user = await prisma.user.findUnique({
    where: { id: userSession },
  });

  return user;
}
