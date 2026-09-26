"use client";
import { Button } from "@/components/ui/button";
import ApiClient from "@/lib/API";
import { CheckCircle, CreditCard, Hash, Lock, Mail, Phone, Copy } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

function SingleTransaction() {
  const router = useRouter();

  const [transactionData, setTransactionData] = React.useState<any>(null);
  const [copied, setCopied] = React.useState(false);

  const getTransactionDetails = async () => {
    const data = await ApiClient.get("transactions/" + transaction)
      .then(async (response) => {
        setTransactionData(response.data);

        const userId = response.data?.userId;


        const user = await ApiClient.get("account/"+userId).then((res) => {
          setTransactionData((prev: any) => ({ ...prev, userId: res.data.user }));
        }).catch((err) => console.log("Error fetching user data:", err));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getTransactionDetails();
  }, []);

  const { transaction } = useParams();

  const formatCurrency = (val?: number) => {
    if (typeof val !== "number") return "—";
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(val);
    } catch (e) {
      return String(val);
    }
  };
  return (
    <div>
      <main className="p-3 md:p-8">
        <div className="max-w-2xl mx-auto">
          <img src="/white.png" className="w-25 mx-auto mb-2" alt="" />
          <header className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {(transactionData?.type || "Transaction").toUpperCase()}
                </h1>
                <div className="text-sm text-slate-500">
                  {transactionData?.transactionData?.Ref} ·{" "}
                  {transactionData?.createdAt
                    ? new Date(transactionData?.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Amount</div>
              <div className="text-xl font-semibold">
                {formatCurrency(transactionData?.amount)}
              </div>
              <div
                className={`mt-2 inline-block px-3 py-1 rounded-full text-xs ${transactionData?.status === "success" ? "bg-emerald-50 text-emerald-700" : transactionData?.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}
              >
                {transactionData?.status}
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1  gap-4 mb-6">
            <div className="bg-card p-4 rounded">
              <h3 className="font-semibold mb-3">Details</h3>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Network</dt>
                  <dd className="capitalize">
                    {transactionData?.network ||
                      transactionData?.meta?.provider ||
                      "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Phone</dt>
                  <dd>
                    {transactionData?.phone_number ||
                      transactionData?.meta?.phone ||
                      "—"}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-slate-500">Trans ID</dt>
                  <dd>
                    {transactionData?._id || transactionData?.trans_id || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Message</dt>
                  <dd className="max-w-[12rem] text-right">
                    {transactionData?.providerResponse.message ||
                      transactionData?.providerResponse?.data?.msg?.split(
                        ".",
                      )[0] ||
                      "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <h1 className="text-xs mt-4 text-center text-primary">
              Thanks for your purchase! We hope you enjoy your new data plan.
            </h1>

            {/* user data */}
            <div className="px-4 pt-6">
              <div className="flex items-center justify-between ">
                <div>
                  <h1 className="text-xl font-bold">Account Used</h1>
                      
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard/transactions"
                    className="hidden md:flex"
                  >
                    <Button variant="ghost">Transactions</Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: profile card */}
                <div className="bg-card p-6 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
                      {(transactionData?.userId?.name || "?")
                        .split(" ")[0]?.[0]
                        ?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-lg font-semibold capitalize">
                        {transactionData?.userId?.name || "Unnamed"}
                      </div>
                      <div className="text-sm text-slate-500 uppercase">
                        {transactionData?.userId?.role || "user"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-slate-500 text-xs">Email</div>
                        <div className="font-medium">
                          {transactionData?.userId?.email || "—"}{" "}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-slate-500 text-xs">Phone</div>
                          <div className="font-medium">{transactionData?.userId?.phone || "—"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            const phone = transactionData?.userId?.phone;
                            if (!phone) return;
                            try {
                              await navigator.clipboard.writeText(phone);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (e) {
                              // fallback: select text by prompting user (no-op here)
                              console.error("Clipboard copy failed", e);
                            }
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {copied && <span className="text-sm text-emerald-600">Copied</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-slate-500 text-xs">
                          Account status
                        </div>
                        <div className="font-medium">
                          {transactionData?.userId?.isBlocked
                            ? "Blocked"
                            : "Active"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className=""></div> */}

            {/* go BACK TO PREVIOUS PAGE */}
            <div className="text-center mt-2">
              <button
                onClick={() => router.back()}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors"
              >
                Go Back
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SingleTransaction;
