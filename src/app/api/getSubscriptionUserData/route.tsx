import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  const client = await clerkClient();

  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });

  const subscriptionId = (await client.users.getUser(userId)).publicMetadata
    .subscription as string[];

  const userData = await client.users.getUser(subscriptionId[0]);

  const data = {
    fullName: `${userData.firstName} ${userData.lastName}`,
    profileImage: userData.imageUrl,
  };

  return Response.json({ status: "success", data });
}
