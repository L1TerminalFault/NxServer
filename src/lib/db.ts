import mongoose from "mongoose";

import { Message as MessageType } from "./types";

const messageSchema = new mongoose.Schema({
  connectionString: String,
  title: String,
  message: String,
  time: String,
});

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

await (async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");
  console.log("MongoDB connected");
})();

export const addMessage = async ({
  connectionString,
  title,
  message,
  time,
}: MessageType) => {
  const messageObj = new Message({ connectionString, title, message, time });
  await messageObj.save();
};
