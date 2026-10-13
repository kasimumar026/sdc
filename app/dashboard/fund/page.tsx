"use client";

import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { cn } from "@/lib/utils";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import ApiClient from "@/lib/API";
import { toast } from "react-toastify";
import Link from "next/link";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  ArrowLeft,
  Building2,
  Check,
  CircleAlert,
  Copy,
  LoaderCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

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
        const profile = res.data || null;
        setData(profile);

        if (profile?.wallet?.account_number) {
          setTextToCopy(profile.wallet.account_number);
        } else {
          setIsGeneratingAccount(true);
          const accountRes = await ApiClient.post("wallet/billstack/create");
          const wallet = accountRes.data?.wallet;
          setData({ ...profile, wallet });
          setTextToCopy(wallet?.account_number || "");
        }
      } catch (err: any) {
        console.error(err);
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
            err?.message ||
          "Failed to load account details";
        setError(message);
        toast.error(message);
      } finally {
        setIsGeneratingAccount(false);
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const [textToCopy, setTextToCopy] = React.useState("");
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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-7 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary">
            <WalletCards className="size-3.5" />
            WALLET FUNDING
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Fund your wallet
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Transfer funds to your dedicated account number from any Nigerian bank.
          </p>
        </div>
        {data?.wallet?.account_number && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Check className="size-4" />
            Ready to receive funds
          </div>
        )}
      </div>

      {data?.wallet?.account_number ? (
        <div className="grid gap-5 lg:grid-cols-[1.55fr_0.85fr] lg:gap-6">
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-[#12386b] to-[#285c9b] px-6 py-7 text-white sm:px-9 sm:py-9">
              <div className="absolute -right-16 -top-24 -z-10 size-72 rounded-full border border-white/10" />
              <div className="absolute -right-4 -top-12 -z-10 size-48 rounded-full border border-white/10" />
              <div className="mb-10 flex items-center justify-between gap-3 sm:mb-14">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dedicated account</p>
                    <p className="mt-0.5 text-xs text-blue-100/75">For your wallet</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-50">
                  NGN
                </span>
              </div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-100/75">
                Account name
              </p>
              <p className="mt-1.5 text-base font-semibold sm:text-lg">
                {data?.wallet?.account_name}
              </p>
              <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-blue-100/75">
                Account number
              </p>
              <p className="mt-2 break-all font-mono text-3xl font-bold tracking-[0.08em] sm:text-4xl">
                {data?.wallet?.account_number}
              </p>
            </div>

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bank</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {data?.wallet?.bank_name || "9PSB Bank"}
                  </p>
                </div>
              </div>
              <CopyToClipboard text={textToCopy} onCopy={() => {}}>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto",
                  )}
                >
                  <Copy className="size-4" />
                  Copy account number
                </button>
              </CopyToClipboard>
            </div>
          </section>

          <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              How to add funds
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Make a bank transfer using the account details shown here. Your wallet will be credited after the payment is confirmed.
            </p>
            <div className="mt-6 space-y-4 border-t border-border pt-5">
              <div className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                <p className="text-sm leading-6 text-foreground">Open your bank app or visit a bank.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                <p className="text-sm leading-6 text-foreground">Transfer to your dedicated account number.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                <p className="text-sm leading-6 text-foreground">Your wallet updates once the payment is confirmed.</p>
              </div>
            </div>
          </aside>
        </div>
      ) : isGeneratingAccount ? (
        <section className="rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm sm:py-16">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
            <LoaderCircle className="size-6 animate-spin" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">Preparing your account</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            We’re setting up your dedicated account so you can fund your wallet by bank transfer.
          </p>
        </section>
      ) : loading ? (
        <section className="rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <LoaderCircle className="mx-auto size-6 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your wallet details…</p>
        </section>
      ) : error ? (
        <section className="rounded-3xl border border-red-200 bg-red-50/70 px-6 py-10 text-center dark:border-red-900 dark:bg-red-950/20">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            <CircleAlert className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">We couldn’t load your account</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{error}</p>
        </section>
      ) : (
        <section className="rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
            <Building2 className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No virtual account available</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your dedicated account details will appear here when available.</p>
        </section>
      )}

      <div className="hidden rounded-lg bg-card p-6 shadow">
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
