import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const client = await clerkClient();
  const subscriberId = request.url.split("?subscriberId=")[1];

  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });

  await client.users.updateUserMetadata(subscriberId, {
    publicMetadata: {
      subscription: [],
    },
  });

  const clientsList = (await client.users.getUser(userId)).publicMetadata
    ?.clients as string[];

  const filteredClients = clientsList.filter(
    (client) => client !== subscriberId,
  );

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscription: filteredClients,
    },
  });

  return Response.json({ status: "success" });
}
