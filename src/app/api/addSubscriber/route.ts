import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const client = await clerkClient();
  const subscriberId = request.url.split("?subscriberId=")[1];

  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });

  await client.users.updateUserMetadata(subscriberId, {
    publicMetadata: {
      subscription: [userId],
    },
  });

  const clientsList = (await client.users.getUser(userId)).publicMetadata
    ?.clients as string[];

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      clients: [...clientsList, userId],
    },
  });

  return Response.json({ status: "success" });
}
