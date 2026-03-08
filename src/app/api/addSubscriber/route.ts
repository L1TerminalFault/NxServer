import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  // const { userId } = await auth();
  const client = await clerkClient();
  const [subscriberId, userId] = request.url.split("?subscriber=")[1].split("&userId=");

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
      clients: clientsList ? [...clientsList, subscriberId] : [subscriberId],
    },
  });

  console.log("successfully added user ", clientsList, userId)
  return Response.json({ status: "success" });
}
