import { /* auth, */ clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  // const { userId } = await auth();
  const client = await clerkClient();
  const [subscriberId, userId] = request.url
    .split("?subscriberId=")[1]
    .split("&userId=");

  console.log("user ", userId);
  console.log("subscriber ", subscriberId);
  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in " });

  await client.users.updateUserMetadata(subscriberId, {
    publicMetadata: {
      subscription: [],
    },
  });

  const clientsList = (await client.users.getUser(userId)).publicMetadata
    ?.clients as string[];

  console.log(clientsList);

  let filteredClients;
  if (clientsList) {
    filteredClients = clientsList.filter((client) => client !== subscriberId);
  } else {
    return Response.json({ status: "success" });
  }
  console.log("filtered ", filteredClients);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      clients: filteredClients,
    },
  });

  return Response.json({ status: "success" });
}
