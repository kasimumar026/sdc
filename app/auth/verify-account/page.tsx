"use client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import ApiClient from "@/lib/API";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const VerifyAccount = () => {
  const [code, setCode] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const verify_code = async () => {
    if (code === "") return;
    setLoading(true);
    const response: any = await ApiClient.post("/verify-account", {
      code,
    })
      .then((responseData) => {
        setLoading(false);
        toast.success("Verified Successfully");
        router.push("/create-wallet");
      })
      .catch((error) => {
        setLoading(false);
        toast.error(response.data?.error);
        setCode("");
      });
  };

  return (
    <div className="h-screen flex flex-col items-center py-5 md:py-8 lg:py-12 gap-3 mx-auto  w-full md:w-1/3 lg:w-1/4 px-5 md:px-10">
      <img src="/mail.svg" alt="" className="w-[100px] md:w-[150px]" />
      <h1 className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Verify Your Account
      </h1>
      <p className="text-gray-700 text-sm">We sent you a verification code, please Check</p>
      <div className=" ">
        <InputOTP
          value={code}
          onChange={(e: string) => setCode(e)}
          maxLength={6}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <button
          className={` px-4 py-2 w-[220px] rounded-md cursor-pointer text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white`}
        onClick={() => verify_code()}
      >
        {loading ? "Loading..." : "Verify Account"}
      </button>

      <p className="text-gray-700 text-sm">
        Didn't receive the code?{" "}
        <span className="text-pink-600 cursor-pointer">Resend</span>
      </p>
    </div>
  );
};

export default VerifyAccount;
