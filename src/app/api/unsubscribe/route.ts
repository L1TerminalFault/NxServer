import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  const client = await clerkClient();

  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });
  // const userInfo = await client.users.getUser(userId)

  // const {subscription} = userInfo.publicMetadata
  // const channelId = subscription[0]
  // const newSubscription = []
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscription: [],
    },
  });

  return Response.json({ status: "success" });
}
