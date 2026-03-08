import { /* auth, */ clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  // const { userId } = await auth();
  const client = await clerkClient();
  const userId = request.url.split("?userId=")[1];

  console.log("user ", userId);
  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });

  const clientsList = (await client.users.getUser(userId)).publicMetadata
    ?.clients as string[];

  if (!clientsList || !clientsList?.length)
    return Response.json({ status: "success", users: [] });

  const { data } = await client.users.getUserList({
    userId: clientsList,
  });

  const usersList = data.map((user) => ({
    userId: user.id,
    userName: user.fullName,
    profileImage: user.imageUrl,
  }));

  console.log("users list ", usersList);
  return Response.json({ status: "success", users: usersList });
}
