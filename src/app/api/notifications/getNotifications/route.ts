import { auth, clerkClient } from "@clerk/nextjs/server";
import { Message, dbConnect } from "@/lib/db";

export async function GET(request: Request) {
  await dbConnect();

  const client = await clerkClient();
  const { userId } = await auth();
  const channelId = request.url.split("?channelId=")[1];

  if (!userId)
    return Response.json({ status: "error", message: "You need to sign in" });

  const userMetadata = await client.users.getUser(userId);
  const subscription = userMetadata.publicMetadata.subscription as string[];

  // console.log("subscribed to ", subscription);
  if (!subscription.includes(channelId)) {
    // console.log("no permissions for channel ", channelId);
    return Response.json({
      status: "error",
      message: "You don't have permission. Reconfigure to access notifications",
    });
  }

  const messages = await Message.find({ connectionString: channelId }, null, {
    sort: { time: -1 },
    limit: 15,
  }).lean();

  // console.log(messages);
  return Response.json({ status: "success", messages });
}
