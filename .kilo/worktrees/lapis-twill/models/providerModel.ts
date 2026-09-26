import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },

    service: {
      type: String,
      required: true,
    },

    mtn: {
      type: Number,
      required: false,
      default: 1,
    },
    glo: {
      type: Number,
      required: false,
      default: 3,
    },
    airtel: {
      type: Number,
      required: false,
      default: 2,
    },
    nineMobile: {
      type: Number,
      required: false,
      default: 4,
    },
  },

  { timestamps: true },
);

if (mongoose.models && mongoose.models.Provider) {
  try {
    // delete the cached model so the new schema is used
    delete mongoose.models.Provider;
  } catch (err) {
    // ignore
  }
}

export default mongoose.models["Provider"] ||
  mongoose.model("Provider", providerSchema);
