import mongoose from "mongoose";

// Define the Message schema
const userSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
});

export default mongoose.models["Message"] ||
  mongoose.model("Message", userSchema);
