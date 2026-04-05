import { Message, dbConnect } from "@/lib/db";
import { Message as MessageType } from "@/lib/types";

const MAX_DOCS = 15;

export async function POST(request: Request) {
  await dbConnect();

  const message: MessageType = await request.json();

  try {
    await Message.create(message);

    const entries_to_delete = await Message.find({
      connectionString: message.connectionString,
    })
      .sort({ time: -1 })
      .skip(MAX_DOCS)
      .select("_id");

    if (entries_to_delete.length > 0) {
      const ids_to_delete = entries_to_delete.map((entry) => entry._id);
      Message.deleteMany({ _id: { $in: ids_to_delete } }).exec();
    }

    return Response.json({ status: "success" });
  } catch (error) {
    console.error("Error saving message: ", error);
    return Response.json({ status: "error", error: "Failed to save message" });
  }
}
