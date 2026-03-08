import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  const client = await clerkClient();

  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });

  const userInfo = await client.users.getUser(userId);
  const { subscription } = userInfo.publicMetadata as {
    subscription: string[];
  };
  const sourceUserId = subscription[0];

  const sourceUserClients = (await client.users.getUser(sourceUserId))
    .publicMetadata?.clients as string[] | undefined;

  const filteredSourceClients =
    sourceUserClients?.filter((clientId: string) => clientId !== userId) || [];

  await client.users.updateUserMetadata(sourceUserId, {
    publicMetadata: {
      clients: filteredSourceClients,
    },
  });

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscription: [],
    },
  });

  return Response.json({ status: "success" });
}
