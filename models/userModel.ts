import mongoose from "mongoose";

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },

  isBlocked: {
    type: Boolean,
    default: false,
  },
  referralCode: {
    type: String,
    unique: true,
    required: false,
  },
  code: {
    type: String,
    required: false,
  },
  referredBy: {
    type: String,
    required: false,
  },
  password: {
    type: String,
  },

 


  role: {
    type: String,
    enum: ["admin", "manager_", "user"],
    default: "user",
  },
});

export default mongoose.models["User"] || mongoose.model("User", userSchema);
