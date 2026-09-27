"use client";

import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import ApiClient from "@/lib/API";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { CopyToClipboard } from "react-copy-to-clipboard";

const fundValidationSchema = Yup.object().shape({
  amount: Yup.number()
    .required("Amount is required")
    .min(100, "Minimum amount is 100")
    .label("amount"),
});

type FundForm = {
  amount: number | "";
};

export default function FundWalletPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAccount, setIsGeneratingAccount] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ApiClient.get("me");
        setData(res.data || null);
        console.log("User data fetched:", res.data?.wallet?.account_number);

        let accountNumber = res.data?.wallet?.account_number;
        if (!accountNumber) {
          // If account number is not available, request it from the backend
          const accountRes = await ApiClient.post("account_number", {
            email: res.data?.user?.email,
            firstName: res.data?.user?.name.split(" ")[0] || "",
            lastName: res.data?.user?.name.split(" ")[1] || "",
            phone: res.data?.user?.phone,
          });
          accountNumber = accountRes.data?.account_number;
          startPolling();
          console.log("Account number generated:", accountNumber);
        }

        setTextToCopy(accountNumber || "No account number available");
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const [textToCopy, setTextToCopy]: any = React.useState("s;lsd;as");
  const handleCopy = () => {
    toast.success("Account number copied to clipboard");
  };

  const handleSubmit = async (values: FundForm, helpers: any) => {
    helpers.setSubmitting(true);
    try {
      const payload: any = { amount: Number(values.amount) };
      // Use Paystack as the only payment method
      const res: any = await ApiClient.post(
        "wallet/paystack/initiate",
        payload,
      ).then((res) => {
        console.log(res.data);
        const url =
          res?.data?.authorization_url ||
          res?.data?.authorizationUrl ||
          res?.data?.data?.authorization_url ||
          res?.data?.data?.authorization?.authorization_url;
        toast.success("Payment session created. Redirecting to Paystack...");
        window.location.href = url;
      });
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.error || "Failed to create payment session",
      );
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const res = await ApiClient.get("me");

        const wallet = res.data?.wallet;

        if (wallet?.account_number) {
          setData(res.data);
          setTextToCopy(wallet.account_number);

          setIsGeneratingAccount(false);

          clearInterval(interval);
        }

        if (wallet?.dvaStatus === "failed") {
          setIsGeneratingAccount(false);

          toast.error(wallet?.dvaErrorReason || "Failed to create account");

          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return interval;
  };

  return (
    <main className="p-5 md:p-6 w-full md:w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fund Wallet</h1>
        <p className="text-sm text-slate-600">
          Fund Using Your Own Account Number From Anywhere
        </p>
      </div>
      {data?.wallet?.account_number ? (
        <CopyToClipboard text={textToCopy} onCopy={() => {}}>
          <section>
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gradient-to-r from-primary to-primary-800 text-white p-6 rounded-lg shadow-lg relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm opacity-90">
                      Your Account Number
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      {data?.wallet?.account_name}
                    </div>
                    <div className="mt-2 text-3xl font-extrabold">
                      {data?.wallet?.account_number}
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      Bank Name: {data?.wallet?.bank_name || "PAYSTACK-TITAN"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs opacity-90">Currency</div>
                    <div className="font-medium">NG</div>
                    {/* <div className="text-xs opacity-80">Ledger: {formatCurrency(data.wallet?.ledgerBalance)}</div> */}
                  </div>
                </div>

                <svg
                  className="absolute right-0 bottom-0 -mb-8 -mr-8 w-48 h-48 opacity-10"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <circle cx="50" cy="50" r="50" fill="white" />
                </svg>
              </div>

              <button
                type="submit"
                onClick={handleCopy}
                className={cn(
                  "bg-primary text-white px-6 py-3 my-2 rounded-sm w-full hover:shadow-lg transition-all",
                )}
              >
                Copy Account Number
              </button>
            </div>
          </section>
        </CopyToClipboard>
      ) : isGeneratingAccount ? (
        <div className="bg-card p-6 rounded-lg text-center">
          <div className="animate-pulse">Creating your virtual account...</div>

          <p className="text-sm text-slate-500 mt-2">
            This usually takes a few seconds.
          </p>
        </div>
      ) : (
        <div className="bg-card p-6 rounded-lg text-center">Loading...</div>
      )}

      <Link href="/dashboard">
        <Button className="mx-auto w-1/2" variant="ghost">
          Back To Dashboard
        </Button>
      </Link>

      <div className="bg-card p-6 hidden rounded-lg shadow">
        <Formik
          initialValues={{ amount: "" }}
          validationSchema={fundValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Amount (NGN)</FieldLabel>
                  {/* Paystack is the only supported payment method */}
                  <Input
                    type="number"
                    name="amount"
                    placeholder="Enter amount to fund"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Field>

                <div className="flex flex-col md:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className={cn(
                      "bg-primary text-white px-6 py-2 rounded-sm w-full hover:shadow-lg transition-all",
                      isSubmitting ? "opacity-60 pointer-events-none" : "",
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Fund Wallet"}
                  </button>
                </div>
              </FieldGroup>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
