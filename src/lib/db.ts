import mongoose from "mongoose";

import { Message as MessageType } from "./types";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

// await (async () => {
//   await mongoose.connect(MONGODB_URI);
//   console.log("MongoDB connected");
// })();

const messageSchema = new mongoose.Schema({
  connectionString: String,
  title: String,
  message: String,
  time: String,
});

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export const addMessage = async ({
  connectionString,
  title,
  message,
  time,
}: MessageType) => {
  const messageObj = new Message({ connectionString, title, message, time });
  await messageObj.save();
};
