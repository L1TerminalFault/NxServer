import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  const client = await clerkClient();

  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });

  const clientsList = (await client.users.getUser(userId)).publicMetadata
    ?.clients as string[];

  const { data } = await client.users.getUserList({
    userId: clientsList,
  });

  const usersList = data.map((user) => ({
    userId: user.id,
    userName: user.fullName,
    profileImage: user.imageUrl,
  }));

  return Response.json({ status: "success", users: usersList });
}
