import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    ledgerBalance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    pin: {
      type: String,
      required: false,
    },

    account_number: {
      type: String,
      required: false,
    },
    bank_name: {
      type: String,
      required: false,
    },
    account_name: {
      type: String,
      required: false,
    },
    dvaStatus: {
      type: String,
      required: false,
    },
    dvaErrorReason: {
      type: String,
      required: false,
    },

    paystackCustomerCode: {
      type: String,
      required: false,
    },

    paymentPoint: {
      type: Object,
      required: false,
    },
    billstack: {
      type: Object,
      required: false,
    },
      
        
  },

  { timestamps: true },
);

// Replace an older compiled model during development after schema changes.
// Mongoose otherwise keeps the first registered schema (which may still
// require a PIN during account registration).
const existingWalletModel = mongoose.models["Wallet"];
if (existingWalletModel?.schema.path("pin")?.isRequired) {
  mongoose.deleteModel("Wallet");
}

export default mongoose.models["Wallet"] ||
  mongoose.model("Wallet", walletSchema);
