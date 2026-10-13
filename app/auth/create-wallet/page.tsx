"use client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import ApiClient from "@/lib/API";
// import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const CreateWallet = () => {
  const [code, setCode] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createWallet = async () => {
    if (code.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    setLoading(true);
    try {
      await ApiClient.post("/wallet/create", { pin: code });
      toast.success("Wallet created successfully");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Could not save your wallet PIN. Please try again.",
      );
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center py-5 md:py-8 lg:py-12 gap-3 mx-auto  w-full md:w-1/3 lg:w-1/4 px-5 md:px-10">
      <img src="/mail.svg" alt="" className="w-[100px] md:w-[150px]" />
      <h1 className="text-2xl font-semibold text-primary">Create Your Wallet</h1>
      <p className="text-gray-700 text-sm">Choose a 4-digit PIN for your wallet</p>
      <div className=" ">
        <InputOTP
          value={code}
          onChange={(e: string) => setCode(e)}
          maxLength={4}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <button
        className={` px-4 py-2 w-[220px] rounded-md cursor-pointer text-sm bg-primary text-white`}
        onClick={() => createWallet()}
        disabled={loading || code.length !== 4}
      >
        {loading ? "Setting up wallet..." : "Create Wallet"}
      </button>

     
    </div>
  );
};

export default CreateWallet;
